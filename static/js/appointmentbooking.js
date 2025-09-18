// Global variable to store doctors
let doctors = [];

//Fetch doctors dynamically from the backend
async function fetchDoctors() {
    try {
        const response = await fetch('/get-doctors');
        if (!response.ok) {
            throw new Error("Failed to fetch doctors.");
        }
        doctors = await response.json(); // Store doctors in the global variable

        if (doctors.length === 0) {
            displayMessage("No doctors available in your location.", "info");
            return;
        }

        populateDoctors(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        displayMessage("Unable to load doctors at the moment. Please try again later.", "error");
    }
}

function populateDoctors(doctors) {
    const doctorSelection = document.getElementById("doctor-selection");
    const doctorDropdown = document.getElementById("doctor");
    doctorDropdown.innerHTML = '<option value="" disabled selected>Select a doctor</option>';
    doctorSelection.innerHTML = "";

    doctors.forEach((doctor) => {
        
        const doctorOption = document.createElement("option");
        doctorOption.value = doctor.doctor_id; // Use doctor.id directly
        doctorOption.textContent = `${doctor.name} - ${doctor.speciality}`;
        doctorDropdown.appendChild(doctorOption);

        const doctorItem = document.createElement("div");
        doctorItem.classList.add("doctor-item");
        doctorItem.innerHTML = `
            <strong>${doctor.name}</strong>
            <p>${doctor.speciality} - ${doctor.experience}</p>
            <p>${doctor.hospital}, ${doctor.location}</p>
        `;
        doctorSelection.appendChild(doctorItem);
    });
}

async function bookAppointment() {
    const doctorDropdown = document.getElementById("doctor");
    const selectedDoctorId = doctorDropdown.value; 
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const patientEmail = document.getElementById("patient-email").value; // Get patient email from hidden input

    if (!selectedDoctorId || !date || !time) {
        displayMessage("Please select a doctor, date, and time slot.", "error");
        return;
    }

    const appointmentData = {
        patient_email: patientEmail, 
        doctor_id: parseInt(selectedDoctorId), // Ensure doctor_id is an integer
        date,
        time,
    };

    try {
        const response = await fetch("/book-appointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
        });

        const result = await response.json();
        if (response.ok) {
            displayMessage(result.message, "success");
        } else {
            displayMessage(result.error || "Unknown error.", "error");
        }
    } catch (error) {
        console.error("Error booking appointment:", error);
        displayMessage("Unable to confirm appointment. Please try again later.", "error");
    }
}

// Function to display messages to the user
function displayMessage(message, type) {
    const messageDiv = document.getElementById("appointment-message");
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`; // Add a class for styling (e.g., 'success', 'error', 'info')
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Close modal function (if applicable, though I removed the modal in previous steps, this might be a remnant)
function closeModal() {
    const confirmationModal = document.getElementById("confirmation-modal");
    if (confirmationModal) {
        confirmationModal.style.display = "none";
    }
}

// Back button function
function goBack() {
    window.history.back();
}

// Initialize the page
fetchDoctors();
