document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirm-password"]');
    const emailInput = document.querySelector('input[name="email"]');
    const roleSelect = document.querySelector('select[name="role"]');
    const errorMessageDiv = document.getElementById('error-message'); // Get the dedicated error message div

    // Initially hide the error message div
    if (errorMessageDiv) {
        errorMessageDiv.style.display = 'none';
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Clear previous error messages
        if (errorMessageDiv) {
            errorMessageDiv.textContent = '';
            errorMessageDiv.style.display = 'none';
        }

        // Client-side validation for empty fields
        if (!emailInput.value || !passwordInput.value || !confirmPasswordInput.value || !roleSelect.value) {
            if (errorMessageDiv) {
                errorMessageDiv.textContent = "Please fill in all fields.";
                errorMessageDiv.style.display = 'block';
            }
            return;
        }

        // Validate passwords match
        if (passwordInput.value !== confirmPasswordInput.value) {
            if (errorMessageDiv) {
                errorMessageDiv.textContent = "Passwords do not match!";
                errorMessageDiv.style.display = 'block';
            }
            return;
        }

        const userData = {
            email: emailInput.value,
            password: passwordInput.value,
            role: roleSelect.value,
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                if (roleSelect.value === 'patient') {
                    window.location.href = '/userdetails-patient';
                } else if (roleSelect.value === 'doctor') {
                    window.location.href = '/userdetails-doctor';
                }
            } else {
                const errorData = await response.json();
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = `Registration failed: ${errorData.error || response.statusText}`;
                    errorMessageDiv.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error during registration:', error);
            if (errorMessageDiv) {
                errorMessageDiv.textContent = 'An error occurred during registration. Please try again later.';
                errorMessageDiv.style.display = 'block';
            }
        }
    });

    // Real-time confirm password validation
    confirmPasswordInput.addEventListener('input', function () {
        if (passwordInput.value !== confirmPasswordInput.value) {
            if (errorMessageDiv) {
                errorMessageDiv.textContent = "Passwords do not match!";
                errorMessageDiv.style.display = 'block';
            }
        } else {
            if (errorMessageDiv) {
                errorMessageDiv.style.display = 'none';
            }
        }
    });
});
