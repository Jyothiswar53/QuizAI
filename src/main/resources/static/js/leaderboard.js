/* =============================================
   QuizAI - Leaderboard Page
   ============================================= */

let allEntries = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadLeaderboard();
});

async function loadLeaderboard() {
    try {
        const data = await apiRequest('GET', '/leaderboard');
        allEntries = data || [];
        renderLeaderboard(allEntries);
        renderPodium(allEntries);

        const totalEl = document.getElementById('totalPlayers');
        if (totalEl) totalEl.textContent = allEntries.length + ' players';

        const user = getUserInfo();
        if (user && isLoggedIn()) {
            const myEntry = allEntries.find(e => e.userId == user.userId);
            if (myEntry) {
                const card = document.getElementById('myRankCard');
                if (card) {
                    card.style.display = '';
                    const rankText = document.getElementById('myRankText');
                    if (rankText) rankText.textContent = `#${myEntry.rank} — ${myEntry.username}: ${myEntry.totalScore} points`;
                }
            }
        }
    } catch (err) {
        console.error('Failed to load leaderboard:', err);
        document.getElementById('leaderboardLoading').innerHTML = `
            <div class="text-center py-5">
                <p class="text-danger"><i class="bi bi-exclamation-circle me-2"></i>Failed to load leaderboard</p>
                <button class="btn btn-sm btn-outline-primary" onclick="loadLeaderboard()">Retry</button>
            </div>
        `;
    }
}

function renderPodium(entries) {
    const container = document.getElementById('podiumSection');
    if (!container || entries.length === 0) return;

    const medals = ['🥇', '🥈', '🥉'];
    const cls = ['gold', 'silver', 'bronze'];

    const top3 = entries.slice(0, 3);
    // Render in order: 2nd, 1st, 3rd for visual podium
    const order = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : [top3[0]];

    container.innerHTML = order.map((entry, i) => {
        const origIndex = top3.indexOf(entry);
        const c = cls[origIndex] || 'silver';
        return `
            <div class="podium-card ${c} p-3">
                <div class="podium-bar ${c} mb-3"></div>
                <span class="podium-medal">${medals[origIndex] || '🏅'}</span>
                <div class="podium-rank fw-black">#${entry.rank}</div>
                <div class="podium-name" title="${entry.username}">${entry.username}</div>
                <div class="podium-score">${entry.totalScore} pts</div>
                <small class="text-muted">${entry.totalQuizzes} quizzes</small>
            </div>
        `;
    }).join('');
}

function renderLeaderboard(entries) {
    const loading = document.getElementById('leaderboardLoading');
    const empty = document.getElementById('leaderboardEmpty');
    const table = document.getElementById('leaderboardTable');
    const tbody = document.getElementById('leaderboardBody');

    if (loading) loading.classList.add('d-none');

    if (!entries || entries.length === 0) {
        if (empty) empty.classList.remove('d-none');
        return;
    }

    if (table) table.classList.remove('d-none');

    const user = getUserInfo();
    const rows = entries.map(entry => {
        const isMe = user && entry.userId == user.userId;
        let rankBadge = `<div class="rank-badge">${entry.rank}</div>`;
        if (entry.rank === 1) rankBadge = `<div class="rank-badge gold-badge">🥇</div>`;
        else if (entry.rank === 2) rankBadge = `<div class="rank-badge silver-badge">🥈</div>`;
        else if (entry.rank === 3) rankBadge = `<div class="rank-badge bronze-badge">🥉</div>`;

        return `
            <tr class="${isMe ? 'table-primary' : ''}">
                <td class="ps-4">${rankBadge}</td>
                <td>
                    <span class="fw-semibold">${entry.username}</span>
                    ${isMe ? '<span class="badge bg-primary ms-2">You</span>' : ''}
                </td>
                <td><span class="fw-bold text-primary">${entry.totalScore}</span> pts</td>
                <td>${entry.totalQuizzes}</td>
                <td class="pe-4">
                    <span class="badge ${entry.averageScore >= 80 ? 'bg-success' : entry.averageScore >= 60 ? 'bg-warning text-dark' : 'bg-danger'}">
                        ${entry.averageScore.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    if (tbody) tbody.innerHTML = rows;
}
