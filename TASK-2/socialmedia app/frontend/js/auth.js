class AuthHandler {
    constructor() {
        this.authContainer = document.getElementById('auth-container');
        this.appContainer = document.getElementById('app-container');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.logoutButton = document.getElementById('logout-btn');
        this.loginPage = document.getElementById('login-page');
        this.registerPage = document.getElementById('register-page');
        this.showRegisterLink = document.getElementById('show-register');
        this.showLoginLink = document.getElementById('show-login');
        
        // Initialize event listeners immediately
        this.initializeEventListeners();
        
        // Check auth state and initialize app on load
        this.checkAuthStateAndInitializeApp();
    }

    initializeEventListeners() {
        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        this.logoutButton.addEventListener('click', () => this.handleLogout());

        // Show Register Page
        this.showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginPage.classList.add('hidden');
            this.registerPage.classList.remove('hidden');
            this.clearForms(); // Clear forms when switching
        });

        // Show Login Page
        this.showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.registerPage.classList.add('hidden');
            this.loginPage.classList.remove('hidden');
            this.clearForms(); // Clear forms when switching
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = this.loginForm.querySelector('.error-message');

        try {
            errorElement.textContent = '';
            // Use the api service instance directly
            const data = await api.login({ email, password }); 
            
            // Store user data upon successful login
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            errorElement.textContent = error.message || 'Login failed';
            console.error('Login error:', error);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorElement = this.registerForm.querySelector('.error-message');

        try {
            errorElement.textContent = '';
             // Use the api service instance directly
            const data = await api.register({ username, email, password });
            
            // Note: We don't show the app immediately after registration. 
            // The user needs to log in first.

            // Show success message and switch to login
            errorElement.textContent = 'Registration successful! Please login.';
            errorElement.style.color = 'var(--secondary-color)';
            
            // Clear the register form after successful registration
            this.registerForm.reset();

            setTimeout(() => {
                this.registerPage.classList.add('hidden');
                this.loginPage.classList.remove('hidden');
                errorElement.textContent = ''; // Clear success message after switching
            }, 2000);

        } catch (error) {
            errorElement.textContent = error.message || 'Registration failed';
            console.error('Registration error:', error);
        }
    }

    async handleLogout() {
        try {
            // Use the api service instance directly
            await api.logout();
            this.showAuth();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async checkAuthStateAndInitializeApp() {
        const token = localStorage.getItem(STORAGE_KEYS.token);
        const user = localStorage.getItem(STORAGE_KEYS.user);
        
        if (token && user) {
            try {
                // Set the token in the API service
                api.setToken(token);
                
                // Verify token with the backend
                const currentUser = await api.getCurrentUser();
                
                // If successful, update user data and show the app
                localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(currentUser));
                this.showApp();
                
                // Trigger app initialization after successful auth check
                window.dispatchEvent(new CustomEvent('app:initialized'));
            } catch (error) {
                // If token is invalid or expired, clear everything and show auth page
                console.error('Auth check failed:', error);
                api.clearToken();
                localStorage.removeItem(STORAGE_KEYS.user);
                this.showAuth();
            }
        } else {
            // No token or user data found, show auth page
            api.clearToken();
            localStorage.removeItem(STORAGE_KEYS.user);
            this.showAuth();
        }
    }

    showAuth() {
        this.authContainer.classList.remove('hidden');
        this.appContainer.classList.add('hidden');
        this.clearForms();
    }

    showApp() {
        this.authContainer.classList.add('hidden');
        this.appContainer.classList.remove('hidden');
         // Note: initializeApp is now called after dispatching 'app:initialized'
         // event from checkAuthStateAndInitializeApp or handleLogin.
    }

    clearForms() {
        this.loginForm.reset();
        this.registerForm.reset();
        // Also clear error messages
        if (this.loginForm.querySelector('.error-message')) {
             this.loginForm.querySelector('.error-message').textContent = '';
        }
         if (this.registerForm.querySelector('.error-message')) {
             this.registerForm.querySelector('.error-message').textContent = '';
         }
    }
}

// Initialize auth handler
const authHandler = new AuthHandler();

// The uiHandler instance is created in ui.js, make sure it's initialized
// and listening for the 'app:initialized' event before this script runs.
// The current script order in index.html seems correct (config, auth, api, ui, app - though app.js doesn't exist)
// Assuming ui.js is initialized and listening before this point. 