document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const submitButton = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message-display'); // General message display div

    const displayMessage = (message, type) => {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    };

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (messageDiv) {
            messageDiv.style.display = 'none'; // Clear previous messages
        }

        const formData = new FormData(form);
        const userDetails = {};
        formData.forEach((value, key) => {
            userDetails[key] = value;
        });

        // Add email from hidden input
        const emailInput = document.getElementById('user-email');
        if (emailInput) {
            userDetails.email = emailInput.value;
        }

        // Perform validation for patient details form
        if (form.id === 'patient-details-form') {
            const age = userDetails.age;
            if (!userDetails.full_name || !age || !userDetails.gender || !userDetails.contact || !userDetails.location || !userDetails.email) {
                displayMessage('Please fill all the fields.', 'error');
                return;
            }

            if (isNaN(age) || age <= 0 || age > 120) {
                displayMessage('Please enter a valid age.', 'error');
                return;
            }

            try {
                const response = await fetch('/submit-patient-details', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userDetails)
                });

                const result = await response.json();
                if (response.ok) {
                    displayMessage(result.message || 'Patient details submitted successfully.', 'success');
                    window.location.href = '/chatbot';
                } else {
                    displayMessage(result.error || 'Failed to submit patient details.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                displayMessage('An error occurred while submitting patient details.', 'error');
            }
        }

        // Perform validation for doctor details form
        if (form.id === 'doctor-details-form') {
            const { full_name, specialization, contact, license_number, hospital_name, location, experience, consultation_fees, available_timings, email } = userDetails;

            if (!full_name || !specialization || !contact || !license_number || !hospital_name || !location || !experience || !consultation_fees || !available_timings || !email) {
                displayMessage('Please fill all the fields.', 'error');
                return;
            }

            try {
                const response = await fetch('/submit-doctor-details', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userDetails)
                });

                const result = await response.json();
                if (response.ok) {
                    displayMessage(result.message || 'Doctor details submitted successfully.', 'success');
                    window.location.href = '/doctordashboard';
                } else {
                    displayMessage(result.error || 'Failed to submit doctor details.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                displayMessage('An error occurred while submitting doctor details.', 'error');
            }
        }
    });
});
