document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const formSuccess = document.getElementById('formSuccess');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    fullNameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', () => {
        validatePassword();
        if (confirmPasswordInput.value !== '') validateConfirmPassword();
    });
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    function validateName() {
        const val = fullNameInput.value.trim();
        if (val === '') {
            setError(fullNameInput, fullNameError, 'Full name is required.');
            return false;
        } else if (val.length < 2) {
            setError(fullNameInput, fullNameError, 'Name must be at least 2 characters.');
            return false;
        } else {
            setSuccess(fullNameInput, fullNameError);
            return true;
        }
    }

    function validateEmail() {
        const val = emailInput.value.trim();
        if (val === '') {
            setError(emailInput, emailError, 'Email address is required.');
            return false;
        } else if (!emailRegex.test(val)) {
            setError(emailInput, emailError, 'Please enter a valid email address format.');
            return false;
        } else {
            setSuccess(emailInput, emailError);
            return true;
        }
    }

    function validatePassword() {
        const val = passwordInput.value;
        if (val === '') {
            setError(passwordInput, passwordError, 'Password is required.');
            updateStrengthMeter(0, '', '');
            return false;
        } else {
            setSuccess(passwordInput, passwordError);
            checkPasswordStrength(val);
            return true;
        }
    }

    function checkPasswordStrength(pwd) {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (pwd.length < 6) {
            updateStrengthMeter(25, 'Weak', '#dc3545');
        } else if (score <= 2) {
            updateStrengthMeter(60, 'Medium', '#ffc107');
        } else {
            updateStrengthMeter(100, 'Strong', '#28a745');
        }
    }

    function updateStrengthMeter(width, text, color) {
        strengthBar.style.width = width + '%';
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text ? Password Strength: ${text} : '';
        strengthText.style.color = color;
    }

    function validateConfirmPassword() { 
        const pwd = passwordInput.value;
        const confirmPwd = confirmPasswordInput.value;

        if (confirmPwd === '') {
            setError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password.');
            return false;
        } else if (confirmPwd !== pwd) {
            setError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match.');
            return false;
        } else {
            setSuccess(confirmPasswordInput, confirmPasswordError);
            return true;
        }
    }

    function setError(input, errorEl, msg) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        errorEl.textContent = msg;
    }

    function setSuccess(input, errorEl) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
        errorEl.textContent = '';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();

        if (isNameValid && isEmailValid && isPasswordValid && isConfirmValid) {
            formSuccess.textContent = 'Registration successful! Welcome to EduAcademy.';
            form.reset();
            [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(inp => inp.classList.remove('is-valid'));
            updateStrengthMeter(0, '', '');
        } else {
            formSuccess.textContent = '';
        }
    });
});
