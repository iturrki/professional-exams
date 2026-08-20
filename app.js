const EXAMS = Array.isArray(window.EXAMS) ? window.EXAMS : [];

const els = {
  home: document.getElementById("home"),
  quiz: document.getElementById("quiz"),
  cards: document.getElementById("cards"),
  totalPill: document.getElementById("totalPill"),
  quizTitle: document.getElementById("quizTitle"),
  quizStats: document.getElementById("quizStats"),
  questions: document.getElementById("questions"),
  result: document.getElementById("result"),
  topProgressBar: document.getElementById("topProgressBar"),
  backBtn: document.getElementById("backBtn"),
  submitBtn: document.getElementById("submitBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

let currentExam = null;
let answers = {};
let submitted = false;

function storageKey(examId) {
  return `professional-exams:${examId}`;
}

function resultKey(examId) {
  return `professional-exams:${examId}:best`;
}

function loadAnswers(examId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(examId)) || "{}");
  } catch {
    return {};
  }
}

function saveAnswers() {
  if (!currentExam) return;
  localStorage.setItem(storageKey(currentExam.id), JSON.stringify(answers));
}

function getBestScore(examId) {
  const raw = Number(localStorage.getItem(resultKey(examId)));
  return Number.isFinite(raw) && raw >= 0 ? raw : null;
}

function pluralTests(n) {
  if (n === 1) return "اختبار واحد";
  if (n === 2) return "اختباران";
  if (n >= 3 && n <= 10) return `${n} اختبارات`;
  return `${n} اختبار`;
}

function renderHome() {
  els.totalPill.textContent = pluralTests(EXAMS.length);
  els.cards.innerHTML = "";

  EXAMS.forEach((exam) => {
    const count = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const saved = loadAnswers(exam.id);
    const answered = Object.keys(saved).length;
    const pct = count ? Math.min(100, Math.round((answered / count) * 100)) : 0;
    const best = getBestScore(exam.id);

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h2>${escapeHtml(exam.title)}</h2>
      <div class="subtitle muted">${escapeHtml(exam.subtitle || "")}</div>
      <div class="meta">
        <span class="badge">${count} سؤال</span>
        ${exam.badge ? `<span class="badge">${escapeHtml(exam.badge)}</span>` : ""}
        ${best !== null ? `<span class="badge">أفضل نتيجة ${best}%</span>` : ""}
      </div>
      <div class="progress" aria-label="نسبة التقدم">
        <span style="width:${pct}%"></span>
      </div>
      ${
        count
          ? `<button class="primary" type="button" data-exam="${escapeAttr(exam.id)}">
              ${answered ? "متابعة الاختبار" : "بدء الاختبار"}
            </button>`
          : `<button class="disabled-btn" type="button" disabled>لم تتم إضافة الأسئلة بعد</button>`
      }
    `;
    els.cards.appendChild(card);
  });

  els.cards.querySelectorAll("[data-exam]").forEach((btn) => {
    btn.addEventListener("click", () => startExam(btn.dataset.exam));
  });
}

function startExam(id) {
  currentExam = EXAMS.find((exam) => exam.id === id);
  if (!currentExam || !currentExam.questions?.length) return;

  answers = loadAnswers(id);
  submitted = false;
  els.result.classList.add("hidden");
  els.result.innerHTML = "";
  els.home.classList.add("hidden");
  els.quiz.classList.remove("hidden");
  els.quizTitle.textContent = currentExam.title;

  renderQuestions();
  updateStats();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderQuestions() {
  els.questions.innerHTML = "";

  currentExam.questions.forEach((q, index) => {
    const card = document.createElement("article");
    card.className = "qcard";
    card.dataset.index = index;

    const options = (q.options || []).map((opt) => {
      const selected = answers[index] === opt.key ? " selected" : "";
      return `
        <button class="opt${selected}" type="button"
                data-index="${index}" data-key="${escapeAttr(opt.key)}">
          <span class="letter">${escapeHtml(opt.key)}</span>
          <span>${escapeHtml(opt.text)}</span>
        </button>
      `;
    }).join("");

    card.innerHTML = `
      <div class="qhead">
        <div class="qtext">${escapeHtml(q.text)}</div>
        <div class="qnum">${q.n ?? index + 1}</div>
      </div>
      <div class="opts">${options}</div>
    `;
    els.questions.appendChild(card);
  });

  els.questions.querySelectorAll(".opt").forEach((btn) => {
    btn.addEventListener("click", () => selectAnswer(Number(btn.dataset.index), btn.dataset.key));
  });
}

function selectAnswer(index, key) {
  if (submitted) return;
  answers[index] = key;
  saveAnswers();

  const card = els.questions.querySelector(`.qcard[data-index="${index}"]`);
  card.querySelectorAll(".opt").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.key === key);
  });

  updateStats();
}

function updateStats() {
  if (!currentExam) return;
  const total = currentExam.questions.length;
  const answered = Object.keys(answers).length;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  els.quizStats.textContent = `تمت الإجابة عن ${answered} من ${total}`;
  els.topProgressBar.style.width = `${pct}%`;
}

function submitQuiz() {
  if (!currentExam) return;

  const total = currentExam.questions.length;
  if (!total) return;

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  currentExam.questions.forEach((q, index) => {
    const chosen = answers[index];
    if (!chosen) unanswered++;
    else if (chosen === q.answer) correct++;
    else wrong++;

    const card = els.questions.querySelector(`.qcard[data-index="${index}"]`);
    card.querySelectorAll(".opt").forEach((btn) => {
      btn.classList.remove("selected", "correct", "wrong");
      const key = btn.dataset.key;
      if (key === q.answer) btn.classList.add("correct");
      if (chosen && key === chosen && chosen !== q.answer) btn.classList.add("wrong");
    });
  });

  const pct = Math.round((correct / total) * 100);
  const best = getBestScore(currentExam.id);
  if (best === null || pct > best) localStorage.setItem(resultKey(currentExam.id), String(pct));

  submitted = true;
  els.result.innerHTML = `
    <div class="muted">نتيجتك</div>
    <div class="score">${pct}%</div>
    <div class="resultgrid">
      <div class="rbox"><b>${correct}</b><span class="muted">صحيح</span></div>
      <div class="rbox"><b>${wrong}</b><span class="muted">خطأ</span></div>
      <div class="rbox"><b>${unanswered}</b><span class="muted">بدون إجابة</span></div>
    </div>
    <p class="note">تم إظهار الإجابة الصحيحة باللون الأخضر، والإجابة الخاطئة التي اخترتها باللون الأحمر.</p>
  `;
  els.result.classList.remove("hidden");
  els.result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetQuiz() {
  if (!currentExam) return;
  localStorage.removeItem(storageKey(currentExam.id));
  answers = {};
  submitted = false;
  els.result.classList.add("hidden");
  els.result.innerHTML = "";
  renderQuestions();
  updateStats();
}

function goHome() {
  currentExam = null;
  answers = {};
  submitted = false;
  els.quiz.classList.add("hidden");
  els.home.classList.remove("hidden");
  renderHome();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

els.backBtn.addEventListener("click", goHome);
els.submitBtn.addEventListener("click", submitQuiz);
els.resetBtn.addEventListener("click", resetQuiz);

renderHome();
