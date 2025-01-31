document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirm-password"]');
    const emailInput = document.querySelector('input[name="email"]');
    const roleSelect = document.querySelector('select[name="role"]'); // Assuming there's a role select field

    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    errorMessage.style.fontSize = '14px';
    errorMessage.style.marginTop = '5px';
    errorMessage.style.display = 'none'; // Initially hidden
    confirmPasswordInput.parentNode.appendChild(errorMessage);

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent form from submitting by default

        // Validate passwords match
        if (passwordInput.value !== confirmPasswordInput.value) {
            errorMessage.textContent = "Passwords do not match!";
            errorMessage.style.display = 'block'; // Show error message
            return; // Stop the form submission
        }

        errorMessage.style.display = 'none'; // Hide error message if validation passes

        const userData = {
            email: emailInput.value,
            password: passwordInput.value,
            role: roleSelect.value,
        };

        try {
            // Send data to the backend
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                // Redirect based on role
                if (roleSelect.value === 'patient') {
                    window.location.href = '/userdetails-patient';
                } else if (roleSelect.value === 'doctor') {
                    window.location.href = '/userdetails-doctor';
                }
            } else {
                const errorText = await response.text();
                alert(`Registration failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred. Please try again later.');
        }
    });

    // Optional: Real-time confirm password validation
    confirmPasswordInput.addEventListener('input', function () {
        if (passwordInput.value !== confirmPasswordInput.value) {
            errorMessage.textContent = "Passwords do not match!";
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    });
});
