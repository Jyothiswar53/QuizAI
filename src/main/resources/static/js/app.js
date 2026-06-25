/* =============================================
   QuizAI - Core App Utilities
   Handles JWT storage, auth checks, API calls
   ============================================= */

const API_BASE = '/api';

/* ---------- Token helpers ---------- */
function getToken() { return localStorage.getItem('quizai_token'); }
function setToken(t) { localStorage.setItem('quizai_token', t); }
function removeToken() { localStorage.removeItem('quizai_token'); }

function getUserInfo() {
    const raw = localStorage.getItem('quizai_user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function setUserInfo(info) { localStorage.setItem('quizai_user', JSON.stringify(info)); }
function removeUserInfo() { localStorage.removeItem('quizai_user'); }

/* ---------- Auth helpers ---------- */
function isLoggedIn() { return !!getToken(); }

function logout() {
    removeToken();
    removeUserInfo();
    window.location.href = '/';
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
    }
    return true;
}

/* ---------- API request ---------- */
async function apiRequest(method, url, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API_BASE + url, opts);
    const data = await res.json().catch(() => null);

    if (res.status === 401) {
        removeToken(); removeUserInfo();
        window.location.href = '/login';
        return;
    }
    if (!res.ok) {
        throw new Error((data && data.message) || 'Something went wrong');
    }
    return data;
}

/* ---------- UI helpers ---------- */
function showAlert(id, message, type = 'danger') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.classList.remove('d-none');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAlert(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
}

function formatTime(seconds) {
    if (seconds < 60) return seconds + 's';
    const m = Math.floor(seconds / 60), s = seconds % 60;
    return m + 'm ' + (s > 0 ? s + 's' : '');
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDifficultyBadge(diff) {
    const map = { easy: 'success', medium: 'warning', hard: 'danger' };
    const cls = map[diff?.toLowerCase()] || 'secondary';
    return `<span class="badge bg-${cls}">${diff}</span>`;
}

function getScoreBadge(pct) {
    const cls = pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger';
    return `<span class="badge bg-${cls}">${pct.toFixed(1)}%</span>`;
}

/* ---------- Navbar setup ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const user = getUserInfo();
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const navUsername = document.getElementById('navUsername');
    const adminNavItem = document.getElementById('adminNavItem');

    if (user && isLoggedIn()) {
        if (guestNav) guestNav.style.display = 'none';
        if (userNav) { userNav.classList.remove('d-none'); }
        if (navUsername) navUsername.textContent = user.username;
        if (adminNavItem && user.role === 'ADMIN') adminNavItem.style.display = '';
    }
});
