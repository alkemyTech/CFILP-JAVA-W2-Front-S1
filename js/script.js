document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
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

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Reset error messages
        usernameError.textContent = '';
        passwordError.textContent = '';
        loginError.textContent = '';

        let isValid = true;

        // Validate username
        if (!username) {
            usernameError.textContent = 'Por favor, ingresa tu nombre de usuario';
            isValid = false;
        } else if (!isValidUsername(username)) {
            usernameError.textContent = 'Por favor, ingresa un nombre de usuario válido';
            isValid = false;
        }

        // Validate password
        if (!password) {
            passwordError.textContent = 'Por favor, ingresa tu contraseña';
            isValid = false;
        } else if (password.length < 6) {
            passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        if (isValid) {
            try {
                const response = await fetch("http://localhost:8080/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    saveToken(data.token);  //savetoken en auth.js
                    window.location.href = "./../dashboard/client/client.html"; // Redirigir a la página de inicio después del inicio de sesión exitoso
                } else {
                    loginError.textContent = "Credenciales inválidas";
                }
            } catch (error) {
                loginError.textContent = "Error de conexión. Intente más tarde.";
            }
        }
    });


    function isValidUsername(username) {
        // Por ejemplo: solo letras, números, guiones bajos, entre 3 y 15 caracteres
        const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
        return usernameRegex.test(username);
    }


});