document.querySelector('#signup-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const role = document.querySelector('select[name="role"]').value;
    
    if (!email || !password || !role) {
        alert("Please fill in all fields.");
        return;
    }
    
    // Simulating role-based redirection
    if (role === "user") {
        // Redirect to the user dashboard or main page
        window.location.href = "../aichatbot/index.html";
    } else if (role === "doctor") {
        // Redirect to the doctor dashboard
        window.location.href = "../doctor/doctor-dashboard.html";
    } else {
        alert("Please select a valid role.");
    }
});
