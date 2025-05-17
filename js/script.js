document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.getElementById('togglePassword');



    // Toggle password visibility
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Form validation
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Reset error messages
        emailError.textContent = '';
        passwordError.textContent = '';
        loginError.textContent = '';

        let isValid = true;

        // Validate email
        if (!emailInput.value) {
            emailError.textContent = 'Por favor, ingresa tu correo electrónico';
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            emailError.textContent = 'Por favor, ingresa un correo electrónico válido';
            isValid = false;
        }

        // Validate password
        if (!passwordInput.value) {
            passwordError.textContent = 'Por favor, ingresa tu contraseña';
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

    if (isValid) {

        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            saveToken(data.token);
            window.location.href = "../dashboard/client.html"; // Redirect to dashboard
        } else {
            document.getElementById("error").innerText = "Credenciales inválidas";
        }
    }
});

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function simulateLogin(email, password) {
        // Show loading state
        const loginBtn = document.querySelector('.login-btn');
        const originalBtnText = loginBtn.textContent;
        loginBtn.textContent = 'Procesando...';
        loginBtn.disabled = true;

        // Simulate API call with timeout
        setTimeout(() => {
            // This is where you would normally make an API call to your backend
            // For demo purposes, we'll just check for a demo account
            if (email === 'demo@alkemy.org' && password === 'password123') {
                // Successful login
                loginError.textContent = '';
                alert('¡Inicio de sesión exitoso!');
                // Redirect to dashboard or home page
                // window.location.href = 'dashboard.html';
            } else {
                // Failed login
                loginError.textContent = 'Correo electrónico o contraseña incorrectos';
            }

            // Reset button state
            loginBtn.textContent = originalBtnText;
            loginBtn.disabled = false;
        }, 1500);
    }
});