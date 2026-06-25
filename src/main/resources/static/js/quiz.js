/* =========== SETUP PAGE =========== */
let selectedDifficulty = 'medium';

function setTopic(topic) {
    const input = document.getElementById('topicInput');
    if (input) input.value = topic;
}

function selectDifficulty(level) {
    selectedDifficulty = level;
    document.querySelectorAll('.difficulty-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.level === level);
    });
    const hidden = document.getElementById('difficultyInput');
    if (hidden) hidden.value = level;
}

const setupForm = document.getElementById('quizSetupForm');
if (setupForm) {
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!requireAuth()) return;

        const topic = document.getElementById('topicInput').value.trim();
        const difficulty = document.getElementById('difficultyInput').value;
        const numQuestions = parseInt(document.getElementById('numQuestionsInput').value);
        const timeLimit = parseInt(document.getElementById('timeLimitInput').value);

        if (!topic) {
            showAlert('alertBox', 'Please enter a topic.', 'warning');
            return;
        }

        document.getElementById('startText').classList.add('d-none');
        document.getElementById('startSpinner').classList.remove('d-none');
        document.getElementById('startBtn').disabled = true;

        try {
            const questions = await apiRequest('POST', '/quiz/generate', { topic, difficulty, numberOfQuestions: numQuestions });
            sessionStorage.setItem('quiz_questions', JSON.stringify(questions));
            sessionStorage.setItem('quiz_meta', JSON.stringify({ topic, difficulty, timeLimit, numQuestions }));
            window.location.href = '/quiz/session';
        } catch (err) {
            showAlert('alertBox', 'Failed to generate quiz: ' + err.message, 'danger');
            document.getElementById('startText').classList.remove('d-none');
            document.getElementById('startSpinner').classList.add('d-none');
            document.getElementById('startBtn').disabled = false;
        }
    });

    // Pre-fill from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('topic')) document.getElementById('topicInput').value = params.get('topic');
    if (params.get('difficulty')) selectDifficulty(params.get('difficulty'));
}

/* =========== SESSION PAGE =========== */
let questions = [];
let answers = {};
let currentIndex = 0;
let timerInterval;
let secondsLeft = 900;
let startTime;

function initSession() {
    if (!requireAuth()) return;

    const questionsRaw = sessionStorage.getItem('quiz_questions');
    const metaRaw = sessionStorage.getItem('quiz_meta');

    if (!questionsRaw || !metaRaw) {
        window.location.href = '/quiz/setup';
        return;
    }

    questions = JSON.parse(questionsRaw);
    const meta = JSON.parse(metaRaw);
    secondsLeft = meta.timeLimit || 900;

    document.getElementById('sessionTopic').textContent = meta.topic;
    document.getElementById('sessionDifficulty').textContent = meta.difficulty;
    document.getElementById('totalQNum').textContent = questions.length;

    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('questionCard').classList.remove('d-none');

    buildDots();
    showQuestion(0);
    startTime = Date.now();
    if (secondsLeft > 0) startTimer();
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        secondsLeft--;
        updateTimerDisplay();
        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
        if (secondsLeft <= 60) {
            document.getElementById('timerDisplay').classList.add('warning');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const s = (secondsLeft % 60).toString().padStart(2, '0');
    const el = document.getElementById('timerText');
    if (el) el.textContent = m + ':' + s;
}

function timeUp() {
    const modal = new bootstrap.Modal(document.getElementById('timeUpModal'));
    modal.show();
    setTimeout(submitQuiz, 2000);
}

function buildDots() {
    const container = document.getElementById('questionDots');
    if (!container) return;
    container.innerHTML = questions.map((_, i) => `<div class="quiz-dot" id="dot-${i}"></div>`).join('');
}

function showQuestion(index) {
    currentIndex = index;
    const q = questions[index];
    document.getElementById('qNumber').textContent = index + 1;
    document.getElementById('currentQNum').textContent = index + 1;
    document.getElementById('questionText').textContent = q.questionText;
    document.getElementById('optAText').textContent = q.optionA;
    document.getElementById('optBText').textContent = q.optionB;
    document.getElementById('optCText').textContent = q.optionC;
    document.getElementById('optDText').textContent = q.optionD;

    ['A', 'B', 'C', 'D'].forEach(letter => {
        const el = document.getElementById('opt' + letter);
        el.classList.toggle('selected', answers[q.id] === letter);
    });

    document.getElementById('prevBtn').disabled = index === 0;
    const nextBtn = document.getElementById('nextBtn');
    const submitSection = document.getElementById('submitSection');
    const isLast = index === questions.length - 1;
    nextBtn.style.display = isLast ? 'none' : '';
    if (submitSection) submitSection.style.display = isLast ? '' : 'none !important';
    if (submitSection) submitSection.style.cssText = isLast ? 'display:block!important;' : 'display:none!important;';

    const pct = ((index + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = pct + '%';

    document.querySelectorAll('.quiz-dot').forEach((dot, i) => {
        dot.className = 'quiz-dot';
        if (answers[questions[i].id]) dot.classList.add('answered');
        if (i === index) dot.classList.add('current');
    });
}

function selectAnswer(letter) {
    const qId = questions[currentIndex].id;
    answers[qId] = letter;
    showQuestion(currentIndex);
}

function prevQuestion() { if (currentIndex > 0) showQuestion(currentIndex - 1); }
function nextQuestion() { if (currentIndex < questions.length - 1) showQuestion(currentIndex + 1); }

async function submitQuiz() {
    clearInterval(timerInterval);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const meta = JSON.parse(sessionStorage.getItem('quiz_meta') || '{}');

    const answerList = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] || ""
    }));

    const btn = document.getElementById('submitBtn');
    const spinner = document.getElementById('submitSpinner');
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.remove('d-none');

    try {
        const result = await apiRequest('POST', '/quiz/submit', {
            topic: meta.topic,
            difficulty: meta.difficulty,
            answers: answerList,
            timeTaken
        });
        sessionStorage.setItem('quiz_result', JSON.stringify(result));
        sessionStorage.removeItem('quiz_questions');
        sessionStorage.removeItem('quiz_meta');
        window.location.href = '/quiz/result';
    } catch (err) {
        alert('Failed to submit quiz: ' + err.message);
        if (btn) btn.disabled = false;
        if (spinner) spinner.classList.add('d-none');
    }
}

/* =========== RESULT PAGE =========== */
function initResult() {
    const raw = sessionStorage.getItem('quiz_result');
    if (!raw) { window.location.href = '/dashboard'; return; }

    const result = JSON.parse(raw);
    document.getElementById('resultLoading').classList.add('d-none');
    document.getElementById('resultContent').classList.remove('d-none');

    const pct = result.percentage;
    let emoji = '😢', label = 'Keep practicing!';
    if (pct >= 90) { emoji = '🏆'; label = 'Outstanding!'; }
    else if (pct >= 80) { emoji = '🎉'; label = 'Excellent work!'; }
    else if (pct >= 70) { emoji = '😊'; label = 'Good job!'; }
    else if (pct >= 60) { emoji = '👍'; label = 'Not bad!'; }
    else if (pct >= 40) { emoji = '📚'; label = 'Keep practicing!'; }

    document.getElementById('resultEmoji').textContent = emoji;
    document.getElementById('resultScoreDisplay').textContent = pct.toFixed(1) + '%';
    document.getElementById('resultLabel').textContent = label;
    document.getElementById('resultTopic').textContent = result.topic;
    document.getElementById('resultTime').textContent = '⏱ ' + formatTime(result.timeTaken);

    const diffEl = document.getElementById('resultDifficulty');
    if (diffEl) {
        const cls = result.difficulty === 'easy' ? 'success' : result.difficulty === 'medium' ? 'warning' : 'danger';
        diffEl.className = `badge bg-${cls}`;
        diffEl.textContent = result.difficulty;
    }

    document.getElementById('correctCount').textContent = result.score;
    document.getElementById('wrongCount').textContent = result.totalQuestions - result.score;
    document.getElementById('totalCount').textContent = result.totalQuestions;
    document.getElementById('timeTakenDisplay').textContent = formatTime(result.timeTaken);

    const adaptiveMsg = document.getElementById('adaptiveMessage');
    const adaptiveBtn = document.getElementById('adaptiveBtn');
    if (adaptiveMsg && result.suggestedDifficulty) {
        adaptiveMsg.textContent = `Try ${result.suggestedDifficulty} difficulty next to keep improving!`;
        if (adaptiveBtn) adaptiveBtn.href = `/quiz/setup?topic=${encodeURIComponent(result.topic)}&difficulty=${result.suggestedDifficulty}`;
    }

    renderReview(result.questionResults);
}

function escapeHtml(text) {
    if (text == null) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderReview(items) {

    const container = document.getElementById("reviewContainer");
    if (!container || !items) return;

    console.log(items);
    container.innerHTML = items.map((q, i) => {

        // supports both "correct" and "isCorrect"
        const isCorrect = q.isCorrect ?? q.correct;

        return `
            <div class="review-item ${isCorrect ? "correct" : "incorrect"}">

                <h5 class="mb-3">
                    ${isCorrect ? "✅" : "❌"} Question ${i + 1}
                </h5>

                <p class="fw-bold">
                    ${escapeHtml(q.questionText)}
                </p>

                <div class="ms-3">
                    <div ${q.selectedAnswer === "A" ? 'style="font-weight:bold;"' : ""}>
                        A. ${escapeHtml(q.optionA)}
                    </div>

                    <div ${q.selectedAnswer === "B" ? 'style="font-weight:bold;"' : ""}>
                        B. ${escapeHtml(q.optionB)}
                    </div>

                    <div ${q.selectedAnswer === "C" ? 'style="font-weight:bold;"' : ""}>
                        C. ${escapeHtml(q.optionC)}
                    </div>

                    <div ${q.selectedAnswer === "D" ? 'style="font-weight:bold;"' : ""}>
                        D. ${escapeHtml(q.optionD)}
                    </div>
                </div>
                <br>
                <p>
                    <strong>Your Answer:</strong>
                    ${q.selectedAnswer}
                </p>
                <p>
                    <strong>Correct Answer:</strong>
                    ${q.correctAnswer}
                </p>
            </div>
            <hr>`;
    }).join("");
}

async function exportPDF() {
    const raw = sessionStorage.getItem("quiz_result");
    if (!raw) return;

    const result = JSON.parse(raw);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;
    const pageHeight = 280;

    function checkPageSpace(required = 10) {
        if (y + required > pageHeight) {
            doc.addPage();
            y = 20;
        }
    }

    // ===== Header =====
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("QuizAI - Result Report", 105, y, { align: "center" });
    y += 12;

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");

    doc.text(`Topic: ${result.topic}`, 20, y);
    y += 8;

    doc.text(`Difficulty: ${result.difficulty}`, 20, y);
    y += 8;

    doc.text(
        `Score: ${result.score}/${result.totalQuestions} (${result.percentage.toFixed(1)}%)`,
        20,
        y
    );
    y += 8;

    doc.text(`Time Taken: ${formatTime(result.timeTaken)}`, 20, y);
    y += 15;

    doc.setFont(undefined, "bold");
    doc.text("Question Review", 20, y);
    y += 10;

    // ===== Questions =====
    (result.questionResults || []).forEach((q, index) => {

        const isCorrect = q.isCorrect ?? q.correct;

        checkPageSpace(80);

        doc.setFont(undefined, "bold");

        const title = `${isCorrect ? "✓" : "✗"} Question ${index + 1}`;
        doc.text(title, 20, y);
        y += 8;

        const questionLines = doc.splitTextToSize(q.questionText, 170);
        doc.text(questionLines, 20, y);
        y += questionLines.length * 6 + 2;

        doc.setFont(undefined, "normal");

        doc.text(`A. ${q.optionA}`, 25, y);
        y += 6;

        doc.text(`B. ${q.optionB}`, 25, y);
        y += 6;

        doc.text(`C. ${q.optionC}`, 25, y);
        y += 6;

        doc.text(`D. ${q.optionD}`, 25, y);
        y += 8;

        doc.setFont(undefined, "bold");
        doc.text(`Your Answer : ${q.selectedAnswer || "Not Answered"}`, 25, y);
        y += 7;

        doc.text(`Correct Answer : ${q.correctAnswer}`, 25, y);
        y += 10;

        // Divider
        doc.line(20, y, 190, y);
        y += 8;
    });

    doc.save(
        `QuizAI_Result_${result.topic}_${new Date()
            .toISOString()
            .split("T")[0]}.pdf`
    );
}

/* =========== PAGE INIT =========== */
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path === '/quiz/session') initSession();
    if (path === '/quiz/result') initResult();
});

