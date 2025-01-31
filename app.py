import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from gradio_client import Client  # Importing the gradio client for API calls
from transformers import pipeline  # Import the Hugging Face pipeline for disease prediction
import psycopg2
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Required for flash messages

# Set the Hugging Face cache directory (optional)
# os.environ['TRANSFORMERS_CACHE'] = 'path_to_cache_directory'

# Initialize the Hugging Face Symptom-to-Diagnosis pipeline
classifier = pipeline("text-classification", model="Zabihin/Symptom_to_Diagnosis")

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        dbname="health_chatbot",
        user="postgres",
        password="123456",
        host="localhost",
        port="5432"
    )
    return conn

# Route for the home page
@app.route('/')
def home():
    return render_template("GPTindex.html")

# Route for the chatbot page
@app.route('/chatbot')
def chatbot():
    user_email = session.get('email')
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Query to get the patient's location based on their email
        cur.execute("SELECT full_name FROM patients WHERE email = %s", (user_email,))
        result = cur.fetchone()
        patient_name = result[0] if result else "User"
    except Exception as e:
        patient_name = "User"
        
    finally:
        cur.close()
        conn.close()
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

    if not full_name or not age or not gender or not contact or not location:
        return "Missing fields!", 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Insert the patient details into the database
        cur.execute(
            "INSERT INTO patients (full_name, age, gender, contact, location, email) VALUES (%s, %s, %s, %s, %s, %s)",
            (full_name, age, gender, contact, location, email)
        )
        conn.commit()
        return jsonify({"message": "Patient details submitted successfully"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cur.close()
        conn.close()

# Route for handling doctor details submission
@app.route('/submit-doctor-details', methods=['POST'])
def submit_doctor_details():
    # Get data from the incoming request
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

    # Validate required fields
    if not full_name or not specialization or not contact or not license_number or not hospital_name or not location or not experience or not consultation_fees or not available_timings:
        return "Missing fields!", 400

    try:
        # Convert 'experience' and 'consultation_fees' to proper data types
        experience = int(experience)
        consultation_fees = float(consultation_fees)

        # Database connection
        conn = get_db_connection()
        cur = conn.cursor()

        # Insert the doctor details into the database
        cur.execute("""
            INSERT INTO doctors (full_name, specialization, contact, license_number, hospital_name, location, experience, consultation_fees, available_timings, email) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (full_name, specialization, contact, license_number, hospital_name, location, experience, consultation_fees, available_timings, email))

        # Commit the transaction
        conn.commit()

        return jsonify({"message": "Doctor details submitted successfully"}), 200

    except Exception as e:
        # Log the error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        # Clean up and close the database connection
        cur.close()
        conn.close()


# Registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or not role:
        return "Missing fields!", 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Insert the user into the database
        cur.execute(
            "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
            (email, password, role)
        )
        conn.commit()
        session['email'] = email
        return "Registration successful", 200
    except psycopg2.errors.UniqueViolation:
        return "Email already exists", 409
    except Exception as e:
        print(f"Error: {e}")
        return "Internal server error", 500
    finally:
        cur.close()
        conn.close()

# Login form submission
@app.route('/login/submit', methods=['POST'])
def login_submit():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Verify credentials and role
        cur.execute("SELECT * FROM users WHERE email = %s AND password = %s AND role = %s", 
                    (email, password, role))
        user = cur.fetchone()
        if user:
            # Redirect URL based on role
            redirect_url = '/chatbot' if role == 'patient' else '/doctordashboard'
            session['email'] = email
            return jsonify({"redirect_url": redirect_url}), 200
            
        else:
            return "Invalid email, password, or role", 401
    finally:
        cur.close()
        conn.close()

# Route to handle model interactions (chatbot interaction)
@app.route('/ask_model', methods=['POST'])
def ask_model():
    # Get the user's input
    data = request.get_json()
    user_input = data.get("prompt")

    if not user_input:
        return jsonify({"error": "Input cannot be empty"}), 400

    # Call the Hugging Face API for the model response
    try:
        result = classifier(user_input)
        predicted_label = result[0]['label']
        
        # Craft a more conversational response
        response = (
            f"Based on the symptoms you provided, the most likely diagnosis is '{predicted_label}'. "
            "Please note that this is a preliminary prediction based on the information you have shared. "
            "For an accurate diagnosis, it's always recommended to consult with a healthcare professional."
        )
        
        return jsonify({"answer": response})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"Error interacting with the model: {str(e)}"}), 500

@app.route('/appointmentbooking')
def appointmentbooking():
    return render_template('appointmentbooking.html')

@app.route('/get-doctors', methods=['GET'])
def get_doctors():
    user_email = session.get('email')
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Query to get the patient's location based on their email
        cur.execute("SELECT location FROM patients WHERE email = %s", (user_email,))
        patient_location = cur.fetchone()

        if patient_location:
            # Retrieve doctors in the same location as the patient
            cur.execute("""
                SELECT full_name, specialization, experience, hospital_name, location , doctor_id
                FROM doctors
                WHERE location = %s
            """, (patient_location[0],))
            doctors = cur.fetchall()

            # Format doctors' data for the frontend
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

            response = jsonify(doctors_list), 200
        else:
            response = jsonify({"error": "Patient location not found"}), 404
    except Exception as e:
        print(f"Error fetching doctors: {e}")
        response = jsonify({"error": "Internal server error"}), 500
    finally:
        cur.close()
        conn.close()

    return response


@app.route('/book-appointment', methods=['POST'])
def book_appointment():
    data = request.get_json()
    patient_email = session.get('email')
    
    if not patient_email:
        return jsonify({"error": "User not logged in or session expired"}), 400
    
    try:
        doctor_id = int(data.get('doctor_id'))
        date = data.get('date')
        time = data.get('time')
        status = "Pending"

        if not doctor_id or not date or not time:
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Insert the appointment into the database
        cur.execute("""
            INSERT INTO appointments (patient_email, doctor_id, date, time, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (patient_email, doctor_id, date, time, status))
        conn.commit()
        return jsonify({"message": "Appointment booked successfully"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/view-booked-appointments')
def view_booked_appointments():
    user_email = session.get('email')  # Retrieve the logged-in user's email
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Fetch the user's booked appointments from the database
        cur.execute("""
            SELECT a.date, a.time, d.full_name, d.specialization, d.hospital_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.patient_email = %s
            ORDER BY a.date, a.time
        """, (user_email,))
        appointments = cur.fetchall()
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        appointments = []
    finally:
        cur.close()
        conn.close()

    return render_template('viewbookings.html', appointments=appointments)

@app.route('/doctordashboard')
def doctordashboard():
    user_email = session.get('email')
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Query to get the patient's location based on their email
        cur.execute("SELECT full_name FROM doctors WHERE email = %s", (user_email,))
        result = cur.fetchone()
        doctor_name = result[0] if result else "User"
    except Exception as e:
        doctor_name = "User"
        
    finally:
        cur.close()
        conn.close()
    return render_template("doctordashboard.html",doctor_name=doctor_name) 

@app.route('/get-appointments', methods=['GET'])
def get_appointments():
    doctor_email = session.get('email')  # Assuming doctor's email is in session
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Fetch doctor_id based on the logged-in email
        cur.execute("SELECT doctor_id FROM doctors WHERE email = %s", (doctor_email,))
        doctor_id_row = cur.fetchone()

        if not doctor_id_row:
            return jsonify({"error": "Doctor not found."}), 404

        doctor_id = doctor_id_row[0]

        # Query to fetch appointments with patient details and status
        cur.execute("""
            SELECT p.full_name, p.age, p.gender, a.date, a.time, a.status, a.appointment_id
            FROM appointments a
            JOIN patients p ON a.patient_email = p.email
            WHERE a.doctor_id = %s
            ORDER BY a.date, a.time
        """, (doctor_id,))
        appointments = cur.fetchall()

        # Format response
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

        return jsonify({"appointments": appointments_list})
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return jsonify({"error": "Unable to fetch appointments."}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/save-diagnosis', methods=['POST'])
def save_diagnosis():
    data = request.json
    appointment_id = data.get('appointment_id')
    print(appointment_id)
    diagnosis = data['diagnosis']
    symptoms = data['symptoms']
    conn = get_db_connection()
    cur = conn.cursor()
    # Insert into consultations table
    insert_query = """
    INSERT INTO consultations (appointment_id, diagnosis, symptoms)
    VALUES (%s, %s, %s)
    """
    update_query = """
    UPDATE appointments SET status = 'Completed'
    WHERE appointment_id = %s
    """
    try:
        cur.execute(insert_query, (appointment_id, diagnosis, symptoms))
        cur.execute(update_query, (appointment_id,))
        conn.commit()
        return jsonify({'message': 'Consultation notes saved successfully!'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
