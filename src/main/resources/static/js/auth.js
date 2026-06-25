/* =============================================
   QuizAI - Auth Pages (Login & Register)
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        window.location.href = '/dashboard';
        return;
    }

    /* ---- Password toggle ---- */
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const input = document.getElementById('password');
            const icon = toggleBtn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    }

    /* ---- LOGIN FORM ---- */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            hideAlert('alertBox');

            if (!username || !password) {
                showAlert('alertBox', 'Please fill in all fields.', 'warning');
                return;
            }

            setLoading('loginBtn', 'loginText', 'loginSpinner', true);
            try {
                const data = await apiRequest('POST', '/auth/login', { username, password });
                setToken(data.token);
                setUserInfo({ username: data.username, email: data.email, role: data.role, userId: data.userId });

                const params = new URLSearchParams(window.location.search);
                window.location.href = params.get('redirect') || '/dashboard';
            } catch (err) {
                showAlert('alertBox', err.message || 'Login failed. Check your credentials.', 'danger');
                setLoading('loginBtn', 'loginText', 'loginSpinner', false);
            }
        });
    }

    /* ---- REGISTER FORM ---- */
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', updatePasswordStrength);
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            hideAlert('alertBox');

            if (!username || !password || !confirmPassword) {
                showAlert('alertBox', 'Please fill in all required fields.', 'warning');
                return;
            }
            if (username.length < 3) {
                showAlert('alertBox', 'Username must be at least 3 characters.', 'warning');
                return;
            }
            if (password.length < 6) {
                showAlert('alertBox', 'Password must be at least 6 characters.', 'warning');
                return;
            }
            if (password !== confirmPassword) {
                showAlert('alertBox', 'Passwords do not match.', 'warning');
                return;
            }

            setLoading('registerBtn', 'registerText', 'registerSpinner', true);
            try {
                const body = { username, password };
                if (email) body.email = email;
                const data = await apiRequest('POST', '/auth/register', body);
                setToken(data.token);
                setUserInfo({ username: data.username, email: data.email, role: data.role, userId: data.userId });
                window.location.href = '/dashboard';
            } catch (err) {
                showAlert('alertBox', err.message || 'Registration failed. Please try again.', 'danger');
                setLoading('registerBtn', 'registerText', 'registerSpinner', false);
            }
        });
    }
});

function setLoading(btnId, textId, spinnerId, loading) {
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const spinner = document.getElementById(spinnerId);
    if (btn) btn.disabled = loading;
    if (text) text.classList.toggle('d-none', loading);
    if (spinner) spinner.classList.toggle('d-none', !loading);
}

function updatePasswordStrength() {
    const val = document.getElementById('password').value;
    const bar = document.getElementById('strengthBar');
    const label = document.getElementById('strengthLabel');
    if (!bar || !label) return;

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
        { pct: 0, cls: '', text: '' },
        { pct: 20, cls: 'bg-danger', text: 'Very weak' },
        { pct: 40, cls: 'bg-warning', text: 'Weak' },
        { pct: 60, cls: 'bg-info', text: 'Fair' },
        { pct: 80, cls: 'bg-primary', text: 'Strong' },
        { pct: 100, cls: 'bg-success', text: 'Very strong' }
    ];
    const lvl = levels[score];
    bar.style.width = lvl.pct + '%';
    bar.className = 'progress-bar ' + lvl.cls;
    label.textContent = lvl.text;
}
