/* =============================================
   QuizAI - Dashboard Page
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) return;

    const user = getUserInfo();
    if (user) {
        const el = document.getElementById('dashUsername');
        if (el) el.textContent = user.username;
    }

    await loadQuizHistory();
});

async function loadQuizHistory() {
    try {
        const history = await apiRequest('GET', '/quiz/history');
        displayHistory(history);
        updateStats(history);
    } catch (err) {
        console.error('Failed to load history:', err);
        showHistoryError();
    }
}

function updateStats(history) {
    document.getElementById('totalQuizzes').textContent = history.length;

    if (history.length === 0) {
        document.getElementById('bestScore').textContent = '0%';
        document.getElementById('avgScore').textContent = '0%';
        document.getElementById('totalTime').textContent = '0m';
        return;
    }

    const best = Math.max(...history.map(h => h.percentage));
    const avg = history.reduce((sum, h) => sum + h.percentage, 0) / history.length;
    const totalSec = history.reduce((sum, h) => sum + h.timeTaken, 0);
    const totalMin = Math.round(totalSec / 60);

    document.getElementById('bestScore').textContent = best.toFixed(1) + '%';
    document.getElementById('avgScore').textContent = avg.toFixed(1) + '%';
    document.getElementById('totalTime').textContent = totalMin + 'm';
}

function displayHistory(history) {
    const loading = document.getElementById('historyLoading');
    const empty = document.getElementById('historyEmpty');
    const list = document.getElementById('historyList');
    const tbody = document.getElementById('historyTableBody');

    if (loading) loading.classList.add('d-none');

    if (!history || history.length === 0) {
        if (empty) empty.classList.remove('d-none');
        return;
    }

    if (list) list.classList.remove('d-none');

    const rows = history.slice(0, 10).map(h => {
        const pct = h.percentage ?? ((h.score / h.totalQuestions) * 100);
        const scoreClass = pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger';
        return `
            <tr>
                <td>
                    <span class="fw-semibold">${h.topic}</span>
                </td>
                <td>${getDifficultyBadge(h.difficulty)}</td>
                <td>
                    <span class="badge bg-${scoreClass}">
                        ${h.score}/${h.totalQuestions} (${pct.toFixed(1)}%)
                    </span>
                </td>
                <td class="text-muted">${formatTime(h.timeTaken)}</td>
                <td class="text-muted">${formatDate(h.createdAt)}</td>
            </tr>
        `;
    }).join('');

    if (tbody) tbody.innerHTML = rows;
}

function showHistoryError() {
    const loading = document.getElementById('historyLoading');
    if (loading) {
        loading.innerHTML = `
            <div class="text-center py-4">
                <p class="text-danger"><i class="bi bi-exclamation-circle me-2"></i>Failed to load quiz history</p>
                <button class="btn btn-sm btn-outline-primary" onclick="loadQuizHistory()">Retry</button>
            </div>
        `;
    }
}
