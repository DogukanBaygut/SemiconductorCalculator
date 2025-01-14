class AuthManager {
    constructor() {
        this.API_URL = 'http://localhost:3001/api';
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.initializeEventListeners();
        this.startSessionTimer();
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (token && currentUser) {
            try {
                const response = await fetch(`${this.API_URL}/verify-token`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    this.updateNavigation(true, data.user);
                    return true;
                } else {
                    this.logout();
                    return false;
                }
            } catch (error) {
                console.error('Token kontrolü hatası:', error);
                this.logout();
                return false;
            }
        } else {
            this.updateNavigation(false);
            return false;
        }
    }

    updateNavigation(isAuthenticated, user = null) {
        const authSection = document.querySelector('.nav-controls .auth-section');
        
        if (authSection) {
            if (isAuthenticated && user) {
                authSection.innerHTML = `
                    <span class="user-name">
                        <i class="fas fa-user"></i>
                        ${user.name}
                    </span>
                    <a href="profile.html" class="nav-button profile" style="color: white; background: #2196F3;">
                        <i class="fas fa-id-card"></i> Profil
                    </a>
                    <a href="#" onclick="authManager.logout()" class="nav-button logout" style="color: white; background: #f44336;">
                        <i class="fas fa-sign-out-alt"></i> Çıkış Yap
                    </a>
                `;
            } else {
                authSection.innerHTML = `
                    <a href="login.html" class="nav-button login" style="color: white; background: #4CAF50;">
                        <i class="fas fa-sign-in-alt"></i> Giriş Yap
                    </a>
                `;
            }
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.updateNavigation(false);
        const protectedPages = ['/profile.html', '/dashboard.html'];
        if (protectedPages.some(page => window.location.pathname.includes(page))) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            this.updateNavigation(true, data.user);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError('loginForm', error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showError('registerForm', 'Şifreler eşleşmiyor');
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            this.updateNavigation(true, data.user);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError('registerForm', error.message);
        }
    }

    showError(formId, message) {
        const form = document.getElementById(formId);
        let errorDiv = form.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            form.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    static showLoginForm() {
        document.querySelector('.tab[data-translate="login"]').classList.add('active');
        document.querySelector('.tab[data-translate="register"]').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
    }

    static showRegisterForm() {
        document.querySelector('.tab[data-translate="login"]').classList.remove('active');
        document.querySelector('.tab[data-translate="register"]').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        if (password.length < minLength) errors.push('Şifre en az 8 karakter olmalıdır');
        if (!hasUpperCase) errors.push('Şifre en az bir büyük harf içermelidir');
        if (!hasLowerCase) errors.push('Şifre en az bir küçük harf içermelidir');
        if (!hasNumbers) errors.push('Şifre en az bir rakam içermelidir');
        if (!hasSpecialChars) errors.push('Şifre en az bir özel karakter içermelidir');

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    startSessionTimer() {
        setInterval(() => this.checkSession(), 60000);
    }

    checkSession() {
        const token = localStorage.getItem('token');
        if (token) {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            if (tokenData.exp * 1000 < Date.now()) {
                this.logout();
                alert('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
            }
        }
    }
}

function toggleForms() {
    document.getElementById('loginBox').classList.toggle('hidden');
    document.getElementById('registerBox').classList.toggle('hidden');
    if (document.getElementById('loginBox').classList.contains('hidden')) {
        window.location.hash = 'register';
    } else {
        window.location.hash = '';
    }
}

let authManager;
window.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
}); 