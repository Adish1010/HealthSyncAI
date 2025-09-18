# HealthSyncAI - AI Health Diagnostic Chatbot

HealthSyncAI is an AI-powered health diagnostic chatbot application designed to provide preliminary diagnoses, facilitate doctor consultations, and manage appointments. This platform aims to offer users quick insights into their symptoms and streamline the process of connecting with healthcare professionals.

## Features

- **User Authentication**: Secure registration and login for both patients and doctors.
- **Patient Details Management**: Patients can submit and manage their personal and health-related details.
- **Doctor Details Management**: Doctors can register with their specialization, experience, hospital details, and availability.
- **AI Chatbot**: An interactive chatbot integrated with a Hugging Face symptom-to-diagnosis model to provide preliminary health assessments based on user-input symptoms.
- **Doctor Search & Appointment Booking**: Patients can search for doctors based on location and specialization, and book appointments.
- **Doctor Dashboard**: Doctors can view their upcoming appointments and add consultation notes (symptoms and diagnosis) for completed appointments.
- **Patient Appointment Viewing**: Patients can view their booked appointments.
- **Responsive Frontend**: A user-friendly and responsive interface built with modern CSS practices.
- **Centralized Database**: PostgreSQL database integration for managing user, doctor, patient, and appointment data.

## Technologies Used

**Backend:**
- Flask (Python web framework)
- `psycopg2` (PostgreSQL adapter for Python)
- `transformers` (Hugging Face library for AI model integration)
- `Werkzeug` (for password hashing)
- `python-dotenv` (for environment variable management)

**Frontend:**
- HTML5
- CSS3 (with `open-props` for design tokens and consistency)
- JavaScript (Vanilla JS for interactive elements and API communication)

**Database:**
- PostgreSQL

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/HealthSyncAI.git
cd HealthSyncAI
```

### 2. Set up a Virtual Environment

It is highly recommended to use a virtual environment.

```bash
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

HealthSyncAI uses PostgreSQL. You need to have a PostgreSQL server running.

- **Create a Database**: Create a new database, for example, `health_chatbot`.
- **Create Tables**: You will need to create the necessary tables (`users`, `patients`, `doctors`, `appointments`, `consultations`). The schema for these tables is not provided in the repository, but you can infer them from `app.py` or create a migration script.

### 5. Environment Variables

Create a `.env` file in the root directory of your project and add the following:

```env
SECRET_KEY='your_very_secret_key_here'
DB_NAME='health_chatbot'
DB_USER='your_db_username'
DB_PASSWORD='your_strong_db_password'
DB_HOST='localhost'
DB_PORT='5432'
```

**Important**: The values above are *placeholders*. You **must** replace them with your actual, secure credentials. For `SECRET_KEY`, generate a strong, random key using `python -c "import secrets; print(secrets.token_hex())"`. For `DB_USER` and `DB_PASSWORD`, use strong, unique values that are specific to your PostgreSQL setup and not reused elsewhere. Never use default or easily guessable passwords in a production environment.

### 6. Run the Application

```bash
flask run
# or
python app.py
```

The application will typically run on `http://127.0.0.1:5000/`.

## Usage

1.  **Register**: Sign up as a patient or a doctor.
2.  **Login**: Log in with your registered credentials.
3.  **Complete Details**: Fill in your patient or doctor details.
4.  **Chat with AI**: Patients can use the AI chatbot for preliminary diagnoses.
5.  **Book Appointments**: Patients can find and book appointments with available doctors.
6.  **Doctor Dashboard**: Doctors can view their appointments and add consultation notes.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details. (Note: A `LICENSE.md` file is not currently provided in the repository and should be added.)
