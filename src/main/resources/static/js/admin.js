/* =============================================
   QuizAI - Admin Dashboard Page
   ============================================= */

let allUsers = [];
let deleteUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) return;

    const user = getUserInfo();
    if (!user || user.role !== 'ADMIN') {
        showAlert('alertBox', 'Access denied. Admin privileges required.', 'danger');
        setTimeout(() => window.location.href = '/dashboard', 2000);
        return;
    }

    await Promise.all([loadStats(), loadUsers()]);

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
});

async function loadStats() {
    try {
        const stats = await apiRequest('GET', '/admin/stats');

        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalQuizzes').textContent = stats.totalQuizzes;
        document.getElementById('totalQuestions').textContent = stats.totalQuestions;
        document.getElementById('avgScore').textContent = (stats.averageScore || 0).toFixed(1) + '%';

        renderDifficultyChart(stats.quizzesByDifficulty || {});
        renderTopicChart(stats.quizzesByTopic || {});
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

function renderDifficultyChart(data) {
    const container = document.getElementById('difficultyChartContainer');
    if (!container) return;

    const colors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
    const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

    const bars = Object.entries(data).map(([key, val]) => {
        const pct = ((val / total) * 100).toFixed(1);
        return `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="fw-semibold text-capitalize">${key}</span>
                    <span class="text-muted">${val} quizzes (${pct}%)</span>
                </div>
                <div class="progress" style="height:10px;border-radius:6px;">
                    <div class="progress-bar" style="width:${pct}%;background:${colors[key] || '#6366f1'};border-radius:6px;"></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = bars || '<p class="text-muted">No data yet</p>';
}

function renderTopicChart(data) {
    const container = document.getElementById('topicChartContainer');
    if (!container) return;

    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted[0]?.[1] || 1;

    const bars = sorted.map(([key, val]) => {
        const pct = ((val / max) * 100).toFixed(1);
        return `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="fw-semibold">${key}</span>
                    <span class="text-muted">${val} quizzes</span>
                </div>
                <div class="progress" style="height:10px;border-radius:6px;">
                    <div class="progress-bar bg-primary" style="width:${pct}%;border-radius:6px;"></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = bars || '<p class="text-muted">No data yet</p>';
}

async function loadUsers() {
    try {
        const users = await apiRequest('GET', '/admin/users');
        allUsers = users || [];
        renderUsers(allUsers);
    } catch (err) {
        console.error('Failed to load users:', err);
        document.getElementById('usersLoading').innerHTML = `
            <div class="text-center py-5">
                <p class="text-danger">Failed to load users</p>
                <button class="btn btn-sm btn-outline-primary" onclick="loadUsers()">Retry</button>
            </div>
        `;
    }
}

function renderUsers(users) {
    const loading = document.getElementById('usersLoading');
    const table = document.getElementById('usersTable');
    const tbody = document.getElementById('usersTableBody');
    const me = getUserInfo();

    if (loading) loading.classList.add('d-none');
    if (table) table.classList.remove('d-none');

    if (!users || users.length === 0) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No users found</td></tr>';
        return;
    }

    const rows = users.map(u => {
        const isMe = me && u.id == me.userId;
        const roleBadge = u.role === 'ADMIN'
            ? '<span class="badge bg-danger">ADMIN</span>'
            : '<span class="badge bg-secondary">USER</span>';
        const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

        return `
            <tr>
                <td class="ps-4 text-muted">#${u.id}</td>
                <td>
                    <span class="fw-semibold">${u.username}</span>
                    ${isMe ? '<span class="badge bg-primary ms-1">You</span>' : ''}
                </td>
                <td class="text-muted">${u.email || '—'}</td>
                <td>${roleBadge}</td>
                <td class="text-muted">${date}</td>
                <td class="pe-4">
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewUserHistory(${u.id}, '${u.username}')">
                            <i class="bi bi-clock-history"></i>
                        </button>
                        ${!isMe ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal(${u.id}, '${u.username}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (tbody) tbody.innerHTML = rows;
}

function filterUsers(query) {
    if (!query) { renderUsers(allUsers); return; }
    const filtered = allUsers.filter(u =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(query.toLowerCase()))
    );
    renderUsers(filtered);
}

function openDeleteModal(userId, username) {
    deleteUserId = userId;
    const nameEl = document.getElementById('deleteUsername');
    if (nameEl) nameEl.textContent = username;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

async function confirmDelete() {
    if (!deleteUserId) return;
    const btn = document.getElementById('confirmDeleteBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Deleting...'; }

    try {
        await apiRequest('DELETE', `/admin/users/${deleteUserId}`);
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        await loadUsers();
        deleteUserId = null;
    } catch (err) {
        showAlert('alertBox', 'Failed to delete user: ' + err.message, 'danger');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Delete User'; }
    }
}

async function viewUserHistory(userId, username) {
    try {
        const history = await apiRequest('GET', `/admin/users/${userId}/history`);
        const tbody = history.map(h => `
            <tr>
                <td>${h.topic}</td>
                <td>${h.difficulty}</td>
                <td>${h.score}/${h.totalQuestions} (${h.percentage.toFixed(1)}%)</td>
                <td>${formatTime(h.timeTaken)}</td>
                <td>${new Date(h.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" class="text-center text-muted">No quiz history</td></tr>';

        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="modal fade" id="historyModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Quiz History — ${username}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-0">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr><th>Topic</th><th>Difficulty</th><th>Score</th><th>Time</th><th>Date</th></tr>
                                </thead>
                                <tbody>${tbody}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal.firstElementChild);
        const bsModal = new bootstrap.Modal(document.getElementById('historyModal'));
        bsModal.show();
        document.getElementById('historyModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } catch (err) {
        showAlert('alertBox', 'Failed to load user history: ' + err.message, 'danger');
    }
}
