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
            alert("No doctors available in your location.");
            return;
        }

        populateDoctors(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        alert("Unable to load doctors at the moment. Please try again later.");
    }
}

// Populate the doctors dynamically into the UI
// function populateDoctors(doctors) {
//     const doctorSelection = document.getElementById("doctor-selection");
//     const doctorDropdown = document.getElementById("doctor");

//     // Clear any existing data
//     doctorSelection.innerHTML = "";
//     doctorDropdown.innerHTML = '<option value="" disabled selected>Select a doctor</option>';

//     // Populate doctor cards and dropdown
//     doctors.forEach((doctor, index) => {
//         // Add to doctor list
//         const doctorItem = document.createElement("div");
//         doctorItem.classList.add("doctor-item");
//         doctorItem.innerHTML = `
//             <strong>${doctor.name}</strong>
//             <p>${doctor.speciality} - ${doctor.experience}</p>
//             <p>${doctor.hospital}, ${doctor.location}</p>
//         `;
//         doctorSelection.appendChild(doctorItem);

//         // Add to doctor dropdown
//         const doctorOption = document.createElement("option");
//         doctorOption.value = index;
//         doctorOption.textContent = `${doctor.name} - ${doctor.speciality}`;
//         doctorDropdown.appendChild(doctorOption);
//     });
// }

// // Booking function
// function bookAppointment() {
//     const doctorDropdown = document.getElementById("doctor");
//     const selectedDoctorIndex = doctorDropdown.value;
//     const date = document.getElementById("date").value;
//     const time = document.getElementById("time").value;

//     if (selectedDoctorIndex && date && time) {
//         const selectedDoctor = document.getElementById("doctor-selection").children[selectedDoctorIndex];

//         const confirmationDetails = `
//             <p><strong>Doctor:</strong> ${selectedDoctor.querySelector("strong").textContent}</p>
//             <p><strong>Speciality:</strong> ${selectedDoctor.querySelectorAll("p")[0].textContent}</p>
//             <p><strong>Hospital:</strong> ${selectedDoctor.querySelectorAll("p")[1].textContent}</p>
//             <p><strong>Date:</strong> ${date}</p>
//             <p><strong>Time:</strong> ${time}</p>
//         `;
//         document.getElementById("confirmation-details").innerHTML = confirmationDetails;
//         document.getElementById("confirmation-modal").style.display = "flex";
//     } else {
//         alert("Please select a doctor, date, and time slot.");
//     }
// }

// // Confirm booking function
// async function confirmBooking() {
//     const doctorDropdown = document.getElementById("doctor");
//     const selectedDoctorIndex = doctorDropdown.value; // Index of the selected doctor in the dropdown
//     const date = document.getElementById("date").value;
//     const time = document.getElementById("time").value;

//     if (!selectedDoctorIndex || !date || !time) {
//         alert("Incomplete booking details.");
//         return;
//     }

//     // Use the global doctors array to retrieve doctor details, including doctor_id
//     const selectedDoctor = doctors[selectedDoctorIndex];

//     // Prepare data for submission
//     const appointmentData = {
//         patient_email: "example@patient.com", // Replace with the actual logged-in user's email
//         doctor_id: selectedDoctor.id,        // Send doctor_id instead of other doctor details
//         date: date,
//         time: time

//     };

//     try {
//         // Send data to the backend
//         const response = await fetch('/book-appointment', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(appointmentData)
//         });

//         if (!response.ok) {
//             throw new Error("Failed to book appointment.");
//         }

//         const result = await response.json();
//         if (result.message) {
//             alert(result.message);
//         } else {
//             alert(result.error || "An unknown error occurred.");
//         }

//         closeModal(); // Close the confirmation modal
//     } catch (error) {
//         console.error("Error booking appointment:", error);
//         alert("Unable to confirm the appointment. Please try again later.");
//     }
// }


// function populateDoctors(doctors) {
//     console.log("Doctors fetched from backend:", doctors); //debug
//     const doctorDropdown = document.getElementById("doctor");

//     doctorDropdown.innerHTML = '<option value="" disabled selected>Select a doctor</option>';

//     doctors.forEach(doctor => {
        
//         const doctorOption = document.createElement("option");
//         doctorOption.value = doctor.doctor_id; // Use doctor.id directly
//         doctorOption.textContent = `${doctor.name} - ${doctor.speciality}`;
//         doctorDropdown.appendChild(doctorOption);
//         console.log("Doctor added to dropdown:", doctor.id, doctor.name); //debug
//     });
// }

// function bookAppointment() {
//     const doctorDropdown = document.getElementById("doctor");
//     const selectedDoctorId = doctorDropdown.value; // Fetch the doctor_id directly
//     const date = document.getElementById("date").value;
//     const time = document.getElementById("time").value;
//     console.log("Selected doctor ID:", selectedDoctorId); //debug
//     console.log("Available doctor IDs:", doctors.map(doc => doc.id)); //debug

//     if (!selectedDoctorId || !date || !time) {
//         alert("Please select a doctor, date, and time slot.");
//         return;
//     }

//     // Find the selected doctor's details from the global `doctors` array
//     const selectedDoctor = doctors.find(doc => doc.id === parseInt(selectedDoctorId));

//     if (!selectedDoctor) {
//         alert("Selected doctor not found. Please try again.");
//         return;
//     }

//     // Prepare the details for confirmation
//     const confirmationDetails = `
//         <p><strong>Doctor:</strong> ${selectedDoctor.name}</p>
//         <p><strong>Speciality:</strong> ${selectedDoctor.speciality}</p>
//         <p><strong>Hospital:</strong> ${selectedDoctor.hospital}, ${selectedDoctor.location}</p>
//         <p><strong>Date:</strong> ${date}</p>
//         <p><strong>Time:</strong> ${time}</p>
//     `;

//     // Display the confirmation modal with the details
//     const confirmationModal = document.getElementById("confirmation-modal");
//     const confirmationContent = document.getElementById("confirmation-details");
//     confirmationContent.innerHTML = confirmationDetails;
//     confirmationModal.style.display = "flex";
// }

// async function fetchDoctors() {
//     try {
//         const response = await fetch("/get-doctors");
//         const data = await response.json();
//         console.log("Response from /get-doctors:", data); // Debug log
//         if (data.doctors && data.doctors.length > 0) {
//             doctors = data.doctors.map((doctor) => ({
//                 doctor_id: doctor.doctor_id,
//                 name: doctor.name,
//                 speciality: doctor.speciality,
//                 experience: doctor.experience,
//                 hospital: doctor.hospital,
//                 location: doctor.location,
//             }));

//             console.log("Mapped doctors:", doctors);

//             populateDoctors(doctors);
//         } else {
//             console.error("No doctors available.");
//         }
//     } catch (error) {
//         console.error("Error fetching doctors:", error);
//     }
// }

function populateDoctors(doctors) {
    const doctorSelection = document.getElementById("doctor-selection");
    const doctorDropdown = document.getElementById("doctor");
    doctorDropdown.innerHTML = '<option value="" disabled selected>Select a doctor</option>';
    doctorSelection.innerHTML = "";

    doctors.forEach((doctor, index) => {
        
        const doctorOption = document.createElement("option");
        doctorOption.value = index; // Use index to match `doctors` array
        doctorOption.textContent = `${doctor.name} - ${doctor.speciality}`;
        doctorDropdown.appendChild(doctorOption);

        console.log("Doctor added to dropdown:", doctor.doctor_id, doctor.name);
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
    const selectedDoctorIndex = doctorDropdown.value; // Index corresponds to global `doctors`
    const selectedDoctor = doctors[selectedDoctorIndex];
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!selectedDoctor || !date || !time) {
        alert("Incomplete booking details.");
        return;
    }

    const appointmentData = {
        patient_email: "example@patient.com", // Replace with actual logged-in user email
        doctor_id: selectedDoctor.doctor_id, // Use `doctor_id` from the selected doctor
        date,
        time,
    };

    console.log("Booking appointment:", appointmentData);

    // Send appointment to backend
    try {
        const response = await fetch("/book-appointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
        });

        const result = await response.json();
        if (result.message) {
            alert(result.message);
        } else {
            alert(result.error || "Unknown error.");
        }
    } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Unable to confirm appointment. Please try again later.");
    }
}


async function confirmBooking() {
    const doctorId = document.getElementById("doctor").value; // Fetch doctor_id directly
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!doctorId || !date || !time) {
        alert("Incomplete booking details.");
        return;
    }

    const appointmentData = {
        patient_email: "example@patient.com", // Replace with actual session email
        doctor_id: doctorId, // Use doctor_id directly
        date: date,
        time: time,
    };

    try {
        const response = await fetch('/book-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData),
        });

        if (!response.ok) throw new Error("Failed to book appointment.");

        const result = await response.json();
        alert(result.message || "Appointment booked successfully.");
        closeModal();
    } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Unable to confirm the appointment. Please try again later.");
    }
}


// Close modal function
function closeModal() {
    document.getElementById("confirmation-modal").style.display = "none";
}

// Back button function
function goBack() {
    window.history.back();
}

// Initialize the page
fetchDoctors();
