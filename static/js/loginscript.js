document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form from submitting the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Simple validation
    if (email === "" || password === "" || role === "") {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // Send login data to the backend for authentication
        const response = await fetch('/login/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role }),
        });

        if (response.ok) {
            // Handle successful login
            const result = await response.json(); // Backend should send the target URL
            window.location.href = result.redirect_url; // Redirect based on role
        } else {
            // Handle failed login
            const error = await response.text();
            alert(`Login failed: ${error}`);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again later.');
    }
});
