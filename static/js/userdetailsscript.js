document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const submitButton = document.getElementById('submit-btn');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form from submitting normally

        // Collect form data
        const formData = new FormData(form);
        const userDetails = {};
        formData.forEach((value, key) => {
            userDetails[key] = value;
        });

        // Perform validation for patient details form
        if (form.id === 'patient-details-form') {
            const age = userDetails.age;
            if (!userDetails.full_name || !age || !userDetails.gender || !userDetails.contact || !userDetails.location) {
                alert('Please fill all the fields.');
                return;
            }

            if (isNaN(age) || age <= 0 || age > 120) {
                alert('Please enter a valid age.');
                return;
            }

            // Send patient details to the backend
            fetch('/submit-patient-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userDetails) // Send the collected user details as JSON
            })
            .then(response => {
                if (response.ok) {
                    alert('Patient details submitted successfully.');
                    window.location.href = '/chatbot'; // Redirect to chatbot for patients
                } else {
                    alert('Failed to submit patient details.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while submitting patient details.');
            });
        }

        // Perform validation for doctor details form
        if (form.id === 'doctor-details-form') {
            const hospitalName = userDetails['hospital_name'];
            if (!userDetails.full_name || !userDetails.specialization || !userDetails.contact || !userDetails.license_number || !hospitalName || !userDetails.location || !userDetails.experience || !userDetails.consultation_fees || !userDetails.available_timings) {
                alert('Please fill all the fields.');
                return;
            }

            // Send doctor details to the backend
            fetch('/submit-doctor-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userDetails) // Send the collected user details as JSON
            })
            .then(response => {
                if (response.ok) {
                    alert('Doctor details submitted successfully.');
                    window.location.href = '/doctordashboard'; // Redirect to doctor dashboard
                } else {
                    alert('Failed to submit doctor details.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while submitting doctor details.');
            });
        }
    });
});
