(function () {
    'use strict';

    const USER_KEY = 'currentUser';
    let memoryUser = null;

    function readUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            if (!raw) return memoryUser;

            const data = JSON.parse(raw);

            if (
                data &&
                typeof data.name === 'string' &&
                typeof data.email === 'string' &&
                data.name.trim() &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
            ) {
                return {
                    name: data.name,
                    email: data.email
                };
            }
        } catch (error) {
            
        }

        return memoryUser;
    }

    function updateNavigation() {
        const user = readUser();
        const link = document.getElementById('loginBtnNav');
        const profile = document.getElementById('userProfileNav');
        const username = document.getElementById('navUsername');

        if (!link || !profile || !username) return;

        link.classList.toggle('d-none', Boolean(user));
        profile.classList.toggle('d-none', !user);
        profile.classList.toggle('d-flex', Boolean(user));

        username.textContent = user ? user.name : '';
    }

    function setUser(user) {
        if (
            !user ||
            typeof user.name !== 'string' ||
            typeof user.email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
        ) {
            return false;
        }

        memoryUser = {
            name: user.name.trim().slice(0, 90),
            email: user.email.trim()
        };

        let persistent = true;

        try {
            localStorage.setItem(
                USER_KEY,
                JSON.stringify(memoryUser)
            );
        } catch (error) {
            persistent = false;
        }

        updateNavigation();

        document.dispatchEvent(
            new Event('eduacademy:session-changed')
        );

        return persistent;
    }

    function signOut() {
        memoryUser = null;

        try {
            localStorage.removeItem(USER_KEY);
        } catch (error) {
            
        }

        updateNavigation();

        document.dispatchEvent(
            new Event('eduacademy:session-changed')
        );
    }

    window.EduAcademySession = Object.freeze({
        readUser,
        setUser,
        signOut
    });

    document.addEventListener('DOMContentLoaded', function () {
        const logout = document.getElementById('logoutBtnNav');

        if (logout) {
            logout.addEventListener('click', signOut);
        }

        updateNavigation();
    });
})();
