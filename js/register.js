document.addEventListener('DOMContentLoaded', () => {
    const session = window.EduAcademySession;
    const authCard = document.getElementById('authCard');
    const dashboard = document.getElementById('userDashboardCard');
    const dashboardName = document.getElementById('dashboardUsername');
    const dashboardEmail = document.getElementById('dashboardEmail');
    const dashboardMessage = document.getElementById('dashboardMessage');
    const loginPanel = document.getElementById('loginFormContainer');
    const registerPanel = document.getElementById('registerFormContainer');
    const loginTab = document.getElementById('switchToLogin');
    const registerTab = document.getElementById('switchToRegister');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showTab(tab) {
        const login = tab === 'login';
        loginPanel.classList.toggle('d-none', !login);
        registerPanel.classList.toggle('d-none', login);
        loginTab.className = login ? 'btn btn-primary' : 'btn btn-outline-primary';
        registerTab.className = login ? 'btn btn-outline-primary' : 'btn btn-primary';
    }

    loginTab.addEventListener('click', () => {
        showTab('login');
        if (window.location.hash !== '#sign-in') {
            history.replaceState(null, '', '#sign-in');
        }
    });

    registerTab.addEventListener('click', () => {
        showTab('register');
        if (window.location.hash === '#sign-in') {
            history.replaceState(null, '', window.location.href.split('#')[0]);
        }
    });

    const headerSignIn = document.getElementById('loginBtnNav');
    if (headerSignIn) {
        headerSignIn.addEventListener('click', (event) => {
            event.preventDefault();
            showTab('login');
            if (window.location.hash !== '#sign-in') {
                history.replaceState(null, '', '#sign-in');
            }
        });
    }

    function syncTabWithUrl() {
        showTab(window.location.hash === '#sign-in' ? 'login' : 'register');
    }

    window.addEventListener('hashchange', syncTabWithUrl);
    syncTabWithUrl();

    function renderDashboard() {
        const user = session.readUser();
        const loggedIn = Boolean(user);
        dashboard.classList.toggle('d-none', !loggedIn);
        authCard.classList.toggle('d-none', loggedIn);

        if (user) {
            dashboardName.textContent = user.name;
            dashboardEmail.textContent = user.email;
        }
    }

    document.addEventListener('eduacademy:session-changed', renderDashboard);

    document.getElementById('dashboardSignOutBtn').addEventListener('click', () => {
        session.signOut();
        showTab('login');
        document.getElementById('signInForm').reset();
    });

    renderDashboard();

    function setError(input, errorNode, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        errorNode.textContent = message;
        return false;
    }

    function setSuccess(input, errorNode) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        errorNode.textContent = '';
        return true;
    }

    const signInForm = document.getElementById('signInForm');
    const signInEmail = document.getElementById('signInEmail');
    const signInPassword = document.getElementById('signInPassword');
    const signInEmailError = document.getElementById('signInEmailError');
    const signInPasswordError = document.getElementById('signInPasswordError');
    const signInMessage = document.getElementById('signInMessage');

    function validateSignInEmail() {
        const value = signInEmail.value.trim();
        if (!emailRegex.test(value)) {
            return setError(signInEmail, signInEmailError, 'Enter a valid email address.');
        }
        return setSuccess(signInEmail, signInEmailError);
    }

    function validateSignInPassword() {
        const value = signInPassword.value;
        if (value.length < 6) {
            return setError(signInPassword, signInPasswordError, 'Enter at least 6 characters.');
        }
        return setSuccess(signInPassword, signInPasswordError);
    }

    signInEmail.addEventListener('input', validateSignInEmail);
    signInPassword.addEventListener('input', validateSignInPassword);

    signInForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const validEmail = validateSignInEmail();
        const validPassword = validateSignInPassword();
        if (!validEmail || !validPassword) return;

        const email = signInEmail.value.trim();
        let name = email.split('@')[0];

        try {
            const profile = JSON.parse(localStorage.getItem('eduacademy.demoProfile.v1') || 'null');
            if (profile && profile.email === email && typeof profile.name === 'string') {
                name = profile.name;
            }
        } catch (error) {
          
        }

        const saved = session.setUser({
            name: name.slice(0, 90),
            email
        });

        signInPassword.value = '';
        signInMessage.textContent = '';

        dashboardMessage.textContent = saved
            ? 'Demo sign-in saved in this browser. This is not secure account authentication.'
            : 'You are signed in for this page, but storage is disabled so refreshing may sign you out.';
    });

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

    function validateName() {
        const value = fullNameInput.value.trim();
        if (value.length < 2) {
            return setError(fullNameInput, fullNameError, 'Name must be at least 2 characters.');
        }
        return setSuccess(fullNameInput, fullNameError);
    }

    function validateEmail() {
        if (!emailRegex.test(emailInput.value.trim())) {
            return setError(emailInput, emailError, 'Enter a valid email address.');
        }
        return setSuccess(emailInput, emailError);
    }

    function updateStrength(password) {
        if (!password) {
            strengthBar.style.width = '0%';
            strengthText.textContent = '';
            return;
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const width = password.length < 6 ? 25 : (score <= 2 ? 60 : 100);
        const color = width === 25 ? '#dc3545' : (width === 60 ? '#ffc107' : '#28a745');

        strengthBar.style.width = width + '%';
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = 'Password Strength: ' +
            (width === 25 ? 'Weak' : width === 60 ? 'Medium' : 'Strong');
        strengthText.style.color = color;
    }

    function validatePassword() {
        const value = passwordInput.value;
        updateStrength(value);

        if (value.length < 6) {
            return setError(passwordInput, passwordError, 'Password must be at least 6 characters.');
        }
        return setSuccess(passwordInput, passwordError);
    }

    function validateConfirmPassword() {
        const value = confirmPasswordInput.value;
        if (!value || value !== passwordInput.value) {
            return setError(confirmPasswordInput, confirmPasswordError, 'Passwords must match.');
        }
        return setSuccess(confirmPasswordInput, confirmPasswordError);
    }

    fullNameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);

    passwordInput.addEventListener('input', () => {
        validatePassword();
        if (confirmPasswordInput.value) validateConfirmPassword();
    });

    confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameValid = validateName();
        const emailValid = validateEmail();
        const passwordValid = validatePassword();
        const matchValid = validateConfirmPassword();

        if (!nameValid || !emailValid || !passwordValid || !matchValid) return;

        const profile = {
            name: fullNameInput.value.trim().slice(0, 90),
            email: emailInput.value.trim()
        };

        try {
            localStorage.setItem('eduacademy.demoProfile.v1', JSON.stringify(profile));
        } catch (error) {
           
        }

        const saved = session.setUser(profile);
        form.reset();

        [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });

        updateStrength('');
        formSuccess.textContent = '';

        dashboardMessage.textContent = saved
            ? 'Demo profile created. Your sign-in is saved in this browser.'
            : 'Demo profile created, but storage is disabled so refreshing may sign you out.';
    });
});
