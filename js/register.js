document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Función para mostrar/ocultar contraseña
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                targetInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Validación del formulario
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        let isValid = true;
        console.log('Validando el formulario...');


        // Validar nombre completo
        const username = document.getElementById('username').value.trim();
        const usernameError = document.getElementById('usernameError');

        if (username === '') {
            usernameError.textContent = 'Por favor, ingresa tu nombre completo';
            isValid = false;
        } else if (username.length < 3) {
            usernameError.textContent = 'El nombre debe tener al menos 3 caracteres';
            isValid = false;
        } else {
            usernameError.textContent = '';
        }

        // Validar email
        const email = document.getElementById('email').value.trim();
        const emailError = document.getElementById('emailError');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email === '') {
            emailError.textContent = 'Por favor, ingresa tu correo electrónico';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            emailError.textContent = 'Por favor, ingresa un correo electrónico válido';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // Validar teléfono
        const phone = document.getElementById('phoneNumber').value.trim();
        const phoneNumberError = document.getElementById('phoneNumberError');
        const phoneRegex = /^[0-9]{10,15}$/;

        if (phone === '') {
            phoneNumberError.textContent = 'Por favor, ingresa tu número de teléfono';
            isValid = false;
        } else if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
            phoneNumberError.textContent = 'Por favor, ingresa un número de teléfono válido';
            isValid = false;
        } else {
            phoneNumberError.textContent = '';
        }

        // Validar contraseña
        const password = passwordInput.value;
        const passwordError = document.getElementById('passwordError');
        console.log(password)
        if (password === '') {
            passwordError.textContent = 'Por favor, ingresa una contraseña';
            isValid = false;
        } else if (password.length < 8) {
            passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres';
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            passwordError.textContent = 'La contraseña debe incluir al menos una letra mayúscula';
            isValid = false;
        } else if (!/[0-9]/.test(password)) {
            passwordError.textContent = 'La contraseña debe incluir al menos un número';
            isValid = false;
        } else if (!/[!@#$%^&*]/.test(password)) {
            passwordError.textContent = 'La contraseña debe incluir al menos un carácter especial (!@#$%^&*)';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        // Validar confirmación de contraseña
        const confirmPassword = confirmPasswordInput.value;
        const confirmPasswordError = document.getElementById('confirmPasswordError');

        if (confirmPassword === '') {
            confirmPasswordError.textContent = 'Por favor, confirma tu contraseña';
            isValid = false;
        } else if (confirmPassword !== password) {
            confirmPasswordError.textContent = 'Las contraseñas no coinciden';
            isValid = false;
        } else {
            confirmPasswordError.textContent = '';
        }

        // Validar términos y condiciones
        const terms = document.getElementById('terms');
        const termsError = document.getElementById('termsError');

        if (!terms.checked) {
            termsError.textContent = 'Debes aceptar los términos y condiciones';
            isValid = false;
        } else {
            termsError.textContent = '';
        }

        // Si todo es válido, enviar el formulario
        if (isValid) {
            // Recopilar los datos del formulario
            const data = {
                username: document.getElementById('username').value.trim(),
                password: passwordInput.value,
                email: document.getElementById('email').value.trim(),
                person: {
                    name: document.getElementById('name').value.trim(),
                    lastName: document.getElementById('lastname').value.trim(),
                    address: document.getElementById('address').value.trim(),
                    location: document.getElementById('location').value.trim(),  //VER COMO GUARDA ---USE LAS MISMOS NOMBRES DEBERIA ANDAR IGUAL
                    province: document.getElementById('province').value.trim(), //VER COMO GUARDA -- USE LOS MISMO NOMBRES DEBRIA ANDAR IGUAL --- SOLO NO DEBERIAMOS GUARDAR MUNICIPIO
                    phoneNumber: document.getElementById('phoneNumber').value.trim(),
                    identityCard: document.getElementById('identityCard').value.trim(),
                    dateBirth: document.getElementById('dateBirth').value.trim(),
                }
            };
            console.log("enviando datos al servidor")
            console.log(data)
            // Enviar datos al servidor
            fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (response.ok) {
                        showSuccessMessage();
                        console.log('Registro exitoso');
                    } else {
                        return response.json().then(err => {
                            alert('Error en el registro: ' + (err.message || 'Error desconocido'));
                        });
                    }
                })
                .catch(error => {
                    alert('No se pudo conectar con el servidor: ' + error.message);
                });
        }
    });


    //TODO: ESTO SE PERSONALIZARÁ
    // Función para mostrar mensaje de éxito
    function showSuccessMessage() {
        // Crear el elemento de mensaje
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>¡Registro exitoso!</h3>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p>Serás redirigido al inicio de sesión en unos segundos...</p>
        `;

        // Reemplazar el formulario con el mensaje de éxito
        const formContainer = document.querySelector('.form-container');
        const formContent = formContainer.innerHTML;
        formContainer.innerHTML = '';
        formContainer.appendChild(successMessage);

        // Redireccionar después de 3 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }

    // Validación en tiempo real para la contraseña
    passwordInput.addEventListener('input', function () {
        validatePasswordStrength(this.value);
    });

    // Función para validar la fortaleza de la contraseña
    function validatePasswordStrength(password) {
        // Si no existe el elemento para mostrar la fortaleza, lo creamos
        if (!document.querySelector('.password-strength')) {
            const strengthContainer = document.createElement('div');
            strengthContainer.className = 'password-strength';

            const strengthMeter = document.createElement('div');
            strengthMeter.className = 'password-strength-meter';

            const strengthText = document.createElement('div');
            strengthText.className = 'password-strength-text';

            strengthContainer.appendChild(strengthMeter);

            const passwordGroup = passwordInput.closest('.form-group');
            passwordGroup.insertBefore(strengthContainer, document.getElementById('passwordError'));
            passwordGroup.insertBefore(strengthText, document.getElementById('passwordError'));
        }

        const strengthMeter = document.querySelector('.password-strength-meter');
        const strengthText = document.querySelector('.password-strength-text');

        // Criterios de fortaleza
        const lengthValid = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[!@#$%^&*]/.test(password);

        // Calcular puntuación
        let score = 0;
        if (lengthValid) score++;
        if (hasUpperCase) score++;
        if (hasLowerCase) score++;
        if (hasNumbers) score++;
        if (hasSpecialChars) score++;

        // Actualizar indicador visual
        strengthMeter.className = 'password-strength-meter';

        if (password === '') {
            strengthMeter.style.width = '0';
            strengthText.textContent = '';
        } else if (score <= 2) {
            strengthMeter.classList.add('weak');
            strengthText.textContent = 'Débil';
            strengthText.style.color = '#e74c3c';
        } else if (score === 3) {
            strengthMeter.classList.add('medium');
            strengthText.textContent = 'Media';
            strengthText.style.color = '#f39c12';
        } else if (score === 4) {
            strengthMeter.classList.add('good');
            strengthText.textContent = 'Buena';
            strengthText.style.color = '#3498db';
        } else {
            strengthMeter.classList.add('strong');
            strengthText.textContent = 'Fuerte';
            strengthText.style.color = '#2ecc71';
        }
    }

    // Formateo de número de teléfono
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 0) {
            // Formato: (XXX) XXX-XXXX para números de 10 dígitos
            if (value.length <= 10) {
                if (value.length > 6) {
                    value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
                } else if (value.length > 3) {
                    value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
                }
            } else {
                // Para números internacionales más largos
                value = `+${value.substring(0, value.length)}`;
            }
        }

        e.target.value = value;
    })
});


/*Select de provincia, municipio y localidad*/

const $d = document;
const $selectProvincias = $d.getElementById("province");
const $selectDepartamentos = $d.getElementById("municipality");
const $selectLocalidades = $d.getElementById("location");

function selectProvince() {
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(json => {
            let $options = `<option value="">Elige una provincia</option>`;
            json.provincias.forEach(ele =>
                $options += `<option value="${ele.id}">${ele.nombre}</option>`
            );
            $selectProvincias.innerHTML = $options;
        })
        .catch(error => {
            let message = error.statusText || "Ocurrió un error";
            let status = error.status || "";
            $selectProvincias.nextElementSibling.innerHTML = `Error: ${status} ${message}`;
        })
}

function selectDepartament(provinciaId) {
    fetch(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${provinciaId}&max=100`)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(json => {
            let $options = `<option value="">Elige un departamento</option>`;
            json.departamentos.forEach(ele =>
                $options += `<option value="${ele.id}">${ele.nombre}</option>`
            );
            $selectDepartamentos.innerHTML = $options;
        })
        .catch(error => {
            let message = error.statusText || "Ocurrió un error";
            let status = error.status || "";
            $selectDepartamentos.nextElementSibling.innerHTML = `Error: ${status} ${message}`;
        });
}

function selectLocation(departamentoId) {
    fetch(`https://apis.datos.gob.ar/georef/api/localidades?departamento=${departamentoId}&max=100`)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(json => {
            let $options = `<option value="">Elige una localidad</option>`;
            json.localidades.forEach(ele =>
                $options += `<option value="${ele.id}">${ele.nombre}</option>`
            );
            $selectLocalidades.innerHTML = $options;
        })
        .catch(error => {
            let message = error.statusText || "Ocurrió un error";
            let status = error.status || "";
            $selectLocalidades.nextElementSibling.innerHTML = `Error: ${status} ${message}`;
        });
}

$d.addEventListener("DOMContentLoaded", selectProvince);

$selectProvincias.addEventListener('change', function(event) {
    const provinciaId = event.target.value;
    if (provinciaId) {
        selectDepartament(provinciaId);
        $selectLocalidades.innerHTML = `<option value="">Elige una localidad</option>`;
    } else {
        $selectDepartamentos.innerHTML = `<option value="">Elige un departamento</option>`;
        $selectLocalidades.innerHTML = `<option value="">Elige una localidad</option>`;
    }
});

$selectDepartamentos.addEventListener('change', function(event) {
    const departamentoId = event.target.value;
    if (departamentoId) {
        selectLocation(departamentoId);
    } else {
        $selectLocalidades.innerHTML = `<option value="">Elige una localidad</option>`;
    }
});

$selectLocalidades.addEventListener('change', function(event) {
    const localidadId = event.target.value;
    console.log("Seleccionaste la localidad (id):", localidadId);
});