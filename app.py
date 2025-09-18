import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from gradio_client import Client  # Importing the gradio client for API calls
from transformers import pipeline  # Import the Hugging Face pipeline for disease prediction
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from database import get_db_connection
import logging
import psycopg2

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'super_secret_key')  # Required for flash messages

# Set the Hugging Face cache directory (optional)
# os.environ['TRANSFORMERS_CACHE'] = 'path_to_cache_directory'

# Initialize the Hugging Face Symptom-to-Diagnosis pipeline
classifier = pipeline("text-classification", model="Zabihin/Symptom_to_Diagnosis")

# Database connection
# Removed old get_db_connection function, now using database.py

# Route for the home page
@app.route('/')
def home():
    return render_template("GPTindex.html")

# Route for the chatbot page
@app.route('/chatbot')
def chatbot():
    user_email = session.get('email')
    patient_name = "User"
    if user_email:
        with get_db_connection() as cur:
            try:
                cur.execute("SELECT full_name FROM patients WHERE email = %s", (user_email,))
                result = cur.fetchone()
                patient_name = result[0] if result else "User"
            except Exception as e:
                logging.error(f"Error fetching patient name for chatbot: {e}")
    return render_template("chatbotindex.html",patient_name=patient_name)

# Route for the login page
@app.route('/login')
def login():
    return render_template("GPTlogin.html")

# Route for the sign-in page
@app.route('/signin')
def signin():
    return render_template("GPTsignin.html")

# Route for patient user details page
@app.route('/userdetails-patient')
def user_details_patient():
    if 'email' in session:
        print(f"Session email: {session['email']}")  # Debugging
    else:
        print("Session email is not set.")  # Debugging
    return render_template('userdetails-patient.html')

# Route for doctor user details page
@app.route('/userdetails-doctor')
def user_details_doctor():
    return render_template('userdetails-doctor.html')

# Route for handling patient details submission
@app.route('/submit-patient-details', methods=['POST'])
def submit_patient_details():
    data = request.get_json()
    full_name = data.get('full_name')
    age = data.get('age')
    gender = data.get('gender')
    contact = data.get('contact')
    location = data.get('location')
    email = data.get('email')

    if not all([full_name, age, gender, contact, location, email]):
        logging.warning("Missing fields for patient details submission.")
        return jsonify({"error": "Missing fields!"}), 400

    try:
        with get_db_connection() as cur:
            cur.execute(
                "INSERT INTO patients (full_name, age, gender, contact, location, email) VALUES (%s, %s, %s, %s, %s, %s)",
                (full_name, age, gender, contact, location, email)
            )
        logging.info(f"Patient details submitted successfully for {email}")
        return jsonify({"message": "Patient details submitted successfully"}), 200
    except Exception as e:
        logging.error(f"Error submitting patient details for {email}: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Route for handling doctor details submission
@app.route('/submit-doctor-details', methods=['POST'])
def submit_doctor_details():
    data = request.get_json()

    full_name = data.get('full_name')
    specialization = data.get('specialization')
    contact = data.get('contact')
    license_number = data.get('license_number')
    hospital_name = data.get('hospital_name')
    location = data.get('location')
    experience = data.get('experience')
    consultation_fees = data.get('consultation_fees')
    available_timings = data.get('available_timings')
    email = data.get('email')

    if not all([full_name, specialization, contact, license_number, hospital_name, location, experience, consultation_fees, available_timings, email]):
        logging.warning("Missing fields for doctor details submission.")
        return jsonify({"error": "Missing fields!"}), 400

    try:
        experience = int(experience)
        consultation_fees = float(consultation_fees)

        with get_db_connection() as cur:
            cur.execute("""
                INSERT INTO doctors (full_name, specialization, contact, license_number, hospital_name, location, experience, consultation_fees, available_timings, email) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (full_name, specialization, contact, license_number, hospital_name, location, experience, consultation_fees, available_timings, email))

        logging.info(f"Doctor details submitted successfully for {email}")
        return jsonify({"message": "Doctor details submitted successfully"}), 200

    except ValueError:
        logging.error(f"Invalid data type for experience or consultation fees for {email}")
        return jsonify({"error": "Invalid data type for experience or consultation fees"}), 400
    except Exception as e:
        logging.error(f"Error submitting doctor details for {email}: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([email, password, role]):
        logging.warning("Missing fields for registration.")
        return jsonify({"error": "Missing fields!"}), 400

    hashed_password = generate_password_hash(password)

    try:
        with get_db_connection() as cur:
            cur.execute(
                "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
                (email, hashed_password, role)
            )
        session['email'] = email
        logging.info(f"User {email} registered successfully with role {role}")
        return jsonify({"message": "Registration successful"}), 200
    except psycopg2.errors.UniqueViolation:
        logging.warning(f"Registration failed: Email {email} already exists.")
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        logging.error(f"Error during registration for {email}: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Login form submission
@app.route('/login/submit', methods=['POST'])
def login_submit():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    if not all([email, password, role]):
        logging.warning("Missing fields for login.")
        return jsonify({"error": "Missing fields!"}), 400

    try:
        with get_db_connection() as cur:
            cur.execute("SELECT password, role FROM users WHERE email = %s", (email,))
            user_data = cur.fetchone()

            if user_data and check_password_hash(user_data[0], password) and user_data[1] == role:
                redirect_url = '/chatbot' if role == 'patient' else '/doctordashboard'
                session['email'] = email
                logging.info(f"User {email} logged in successfully as {role}. Redirecting to {redirect_url}")
                return jsonify({"redirect_url": redirect_url}), 200
            else:
                logging.warning(f"Login failed for {email}: Invalid credentials or role.")
                return jsonify({"error": "Invalid email, password, or role"}), 401
    except Exception as e:
        logging.error(f"Error during login for {email}: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Route to handle model interactions (chatbot interaction)
@app.route('/ask_model', methods=['POST'])
def ask_model():
    data = request.get_json()
    user_input = data.get("prompt")

    if not user_input:
        logging.warning("Chatbot input cannot be empty.")
        return jsonify({"error": "Input cannot be empty"}), 400

    try:
        result = classifier(user_input)
        predicted_label = result[0]['label']
        
        response = (
            f"Based on the symptoms you provided, the most likely diagnosis is '{predicted_label}'. "
            "Please note that this is a preliminary prediction based on the information you have shared. "
            "For an accurate diagnosis, it's always recommended to consult with a healthcare professional."
        )
        logging.info(f"Chatbot responded to '{user_input}' with diagnosis '{predicted_label}'")
        return jsonify({"answer": response})
    except Exception as e:
        logging.error(f"Error interacting with the model for input '{user_input}': {e}")
        return jsonify({"error": f"Error interacting with the model: {str(e)}"}), 500

@app.route('/appointmentbooking')
def appointmentbooking():
    return render_template('appointmentbooking.html')

@app.route('/get-doctors', methods=['GET'])
def get_doctors():
    user_email = session.get('email')
    if not user_email:
        logging.warning("Unauthorized attempt to get doctors: User not logged in.")
        return jsonify({"error": "User not logged in or session expired"}), 401

    try:
        with get_db_connection() as cur:
            cur.execute("SELECT location FROM patients WHERE email = %s", (user_email,))
            patient_location = cur.fetchone()

            if patient_location:
                cur.execute("""
                    SELECT full_name, specialization, experience, hospital_name, location , doctor_id
                    FROM doctors
                    WHERE location = %s
                """, (patient_location[0],))
                doctors = cur.fetchall()

                doctors_list = [
                    {
                        "name": doctor[0],
                        "speciality": doctor[1],
                        "experience": f"{doctor[2]} years",
                        "hospital": doctor[3],
                        "location": doctor[4],
                        "doctor_id":doctor[5]
                    }
                    for doctor in doctors
                ]
                logging.info(f"Fetched {len(doctors_list)} doctors for patient {user_email} in {patient_location[0]}")
                return jsonify(doctors_list), 200
            else:
                logging.warning(f"Patient location not found for {user_email}.")
                return jsonify({"error": "Patient location not found"}), 404
    except Exception as e:
        logging.error(f"Error fetching doctors for {user_email}: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/book-appointment', methods=['POST'])
def book_appointment():
    data = request.get_json()
    patient_email = session.get('email')
    
    if not patient_email:
        logging.warning("Unauthorized attempt to book appointment: User not logged in.")
        return jsonify({"error": "User not logged in or session expired"}), 401
    
    try:
        doctor_id = int(data.get('doctor_id'))
        date = data.get('date')
        time = data.get('time')
        status = "Pending"

        if not all([doctor_id, date, time]):
            logging.warning("Missing required fields for appointment booking.")
            return jsonify({"error": "Missing required fields"}), 400

        with get_db_connection() as cur:
            cur.execute("""
                INSERT INTO appointments (patient_email, doctor_id, date, time, status)
                VALUES (%s, %s, %s, %s, %s)
            """, (patient_email, doctor_id, date, time, status))
        logging.info(f"Appointment booked successfully for patient {patient_email} with doctor {doctor_id} on {date} at {time}")
        return jsonify({"message": "Appointment booked successfully"}), 200
    except ValueError:
        logging.error(f"Invalid doctor_id provided for appointment booking by {patient_email}.")
        return jsonify({"error": "Invalid doctor ID"}), 400
    except Exception as e:
        logging.error(f"Error booking appointment for {patient_email}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/view-booked-appointments')
def view_booked_appointments():
    user_email = session.get('email')
    if not user_email:
        logging.warning("Unauthorized attempt to view appointments: User not logged in.")
        return redirect(url_for('login')) # Redirect to login if not logged in

    appointments = []
    try:
        with get_db_connection() as cur:
            cur.execute("""
                SELECT a.date, a.time, d.full_name, d.specialization, d.hospital_name
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.doctor_id
                WHERE a.patient_email = %s
                ORDER BY a.date, a.time
            """, (user_email,))
            appointments = cur.fetchall()
        logging.info(f"Fetched {len(appointments)} booked appointments for patient {user_email}.")
    except Exception as e:
        logging.error(f"Error fetching appointments for {user_email}: {e}")
        flash("Error fetching your appointments.")

    return render_template('viewbookings.html', appointments=appointments)

@app.route('/doctordashboard')
def doctordashboard():
    user_email = session.get('email')
    doctor_name = "User"
    if user_email:
        with get_db_connection() as cur:
            try:
                cur.execute("SELECT full_name FROM doctors WHERE email = %s", (user_email,))
                result = cur.fetchone()
                doctor_name = result[0] if result else "User"
            except Exception as e:
                logging.error(f"Error fetching doctor name for dashboard: {e}")
    return render_template("doctordashboard.html",doctor_name=doctor_name) 

@app.route('/get-appointments', methods=['GET'])
def get_appointments():
    doctor_email = session.get('email')
    if not doctor_email:
        logging.warning("Unauthorized attempt to get doctor's appointments: Doctor not logged in.")
        return jsonify({"error": "Doctor not logged in or session expired"}), 401

    try:
        with get_db_connection() as cur:
            cur.execute("SELECT doctor_id FROM doctors WHERE email = %s", (doctor_email,))
            doctor_id_row = cur.fetchone()

            if not doctor_id_row:
                logging.warning(f"Doctor not found for email {doctor_email}.")
                return jsonify({"error": "Doctor not found."}), 404

            doctor_id = doctor_id_row[0]

            cur.execute("""
                SELECT p.full_name, p.age, p.gender, a.date, a.time, a.status, a.appointment_id
                FROM appointments a
                JOIN patients p ON a.patient_email = p.email
                WHERE a.doctor_id = %s
                ORDER BY a.date, a.time
            """, (doctor_id,))
            appointments = cur.fetchall()

            appointments_list = [
                {
                    "patient_name": row[0],
                    "age": row[1],
                    "gender": row[2],
                    "appointment_date": row[3].strftime('%Y-%m-%d'),
                    "appointment_time": row[4].strftime('%H:%M'),
                    "status": row[5],
                    "appointment_id": row[6],
                }
                for row in appointments
            ]
            logging.info(f"Fetched {len(appointments_list)} appointments for doctor {doctor_email}.")
            return jsonify({"appointments": appointments_list})
    except Exception as e:
        logging.error(f"Error fetching appointments for doctor {doctor_email}: {e}")
        return jsonify({"error": "Unable to fetch appointments."}), 500


@app.route('/save-diagnosis', methods=['POST'])
def save_diagnosis():
    data = request.json
    appointment_id = data.get('appointment_id')
    diagnosis = data['diagnosis']
    symptoms = data['symptoms']
    
    if not all([appointment_id, diagnosis, symptoms]):
        logging.warning("Missing fields for saving diagnosis.")
        return jsonify({"error": "Missing fields for diagnosis"}), 400

    try:
        with get_db_connection() as cur:
            insert_query = """
            INSERT INTO consultations (appointment_id, diagnosis, symptoms)
            VALUES (%s, %s, %s)
            """
            update_query = """
            UPDATE appointments SET status = 'Completed'
            WHERE appointment_id = %s
            """
            cur.execute(insert_query, (appointment_id, diagnosis, symptoms))
            cur.execute(update_query, (appointment_id,))
        logging.info(f"Diagnosis saved for appointment {appointment_id}.")
        return jsonify({'message': 'Consultation notes saved successfully!'}), 200
    except Exception as e:
        logging.error(f"Error saving diagnosis for appointment {appointment_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/logout')
def logout():
    session.pop('email', None)
    flash('You have been logged out.', 'info')
    logging.info("User logged out.")
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
