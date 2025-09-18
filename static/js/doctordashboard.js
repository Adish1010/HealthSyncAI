document.addEventListener("DOMContentLoaded", () => {
    const appointmentsList = document.getElementById("appointments-list");
    const modal = document.getElementById("patient-modal");
    const closeModalBtn = document.querySelector(".close-btn");
    const saveDiagnosisBtn = document.getElementById("save-diagnosis-btn");
    const symptomsInput = document.getElementById("symptoms-input");
    const diagnosisInput = document.getElementById("diagnosis-input");
    const modalErrorMessage = document.getElementById("modal-error-message"); // New: Error message div in modal

    let selectedAppointmentId = null;

    // Fetch appointments
    async function fetchAppointments() {
        try {
            const response = await fetch('/get-appointments');
            const data = await response.json();

            if (response.ok && data.appointments.length > 0) {
                populateAppointments(data.appointments);
            } else {
                appointmentsList.innerHTML = "<tr><td colspan='7'>No upcoming appointments.</td></tr>";
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            appointmentsList.innerHTML = "<tr><td colspan='7'>Unable to load appointments.</td></tr>";
        }
    }

    // Populate appointments table
    function populateAppointments(appointments) {
        appointmentsList.innerHTML = ""; // Clear table

        appointments.forEach((appointment) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${appointment.patient_name}</td>
                <td>${appointment.age}</td>
                <td>${appointment.gender}</td>
                <td>${appointment.appointment_date}</td>
                <td>${appointment.appointment_time}</td>
                <td>${appointment.status}</td>
                <td>
                    <button class="consult-btn" data-id="${appointment.appointment_id}" 
                        >
                        Add Notes
                    </button>
                </td>
            `;

            appointmentsList.appendChild(row);
        });

        // Add event listeners for consultation buttons
        document.querySelectorAll(".consult-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                selectedAppointmentId = e.target.getAttribute("data-id");
                openModal();
            });
        });
    }

    // Open modal
    function openModal() {
        symptomsInput.value = "";
        diagnosisInput.value = "";
        if (modalErrorMessage) {
            modalErrorMessage.textContent = ''; // Clear previous error messages
            modalErrorMessage.style.display = 'none';
        }
        modal.style.display = "block";
    }

    // Close modal
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Save diagnosis
    saveDiagnosisBtn.addEventListener("click", async () => {
        const symptoms = symptomsInput.value;
        const diagnosis = diagnosisInput.value;

        if (!symptoms || !diagnosis) {
            if (modalErrorMessage) {
                modalErrorMessage.textContent = "Please fill out all fields.";
                modalErrorMessage.style.display = 'block';
            }
            return;
        }

        try {
            const response = await fetch('/save-diagnosis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointment_id: selectedAppointmentId,
                    symptoms,
                    diagnosis
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert("Diagnosis saved successfully."); // Keeping alert for success, can be improved later
                modal.style.display = "none";
                fetchAppointments(); // Refresh table
            } else {
                if (modalErrorMessage) {
                    modalErrorMessage.textContent = result.error || "Failed to save diagnosis.";
                    modalErrorMessage.style.display = 'block';
                }
            }
        } catch (error) {
            console.error("Error saving diagnosis:", error);
            if (modalErrorMessage) {
                modalErrorMessage.textContent = "Unable to save diagnosis. Please try again later.";
                modalErrorMessage.style.display = 'block';
            }
        }
    });

    // Initialize
    fetchAppointments();
});
