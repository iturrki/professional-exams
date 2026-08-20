const EXAMS = Array.isArray(window.EXAMS) ? window.EXAMS : [];

const els = {
  home: document.getElementById("home"),
  examMenu: document.getElementById("examMenu"),
  examMenuTitle: document.getElementById("examMenuTitle"),
  examMenuSubtitle: document.getElementById("examMenuSubtitle"),
  testCards: document.getElementById("testCards"),
  menuBackBtn: document.getElementById("menuBackBtn"),
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
let currentTest = null;
let currentQuestions = [];
let answers = {};
let submitted = false;

function quizId(exam, test = null) {
  return test ? `${exam.id}:${test.id}` : exam.id;
}

function storageKey(id) {
  return `professional-exams:${id}`;
}

function resultKey(id) {
  return `professional-exams:${id}:best`;
}

function loadAnswers(id) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(id)) || "{}");
  } catch {
    return {};
  }
}

function saveAnswers() {
  if (!currentExam) return;
  const id = quizId(currentExam, currentTest);
  localStorage.setItem(storageKey(id), JSON.stringify(answers));
}

function getBestScore(id) {
  const raw = Number(localStorage.getItem(resultKey(id)));
  return Number.isFinite(raw) && raw >= 0 ? raw : null;
}

function pluralTests(n) {
  if (n === 1) return "اختبار واحد";
  if (n === 2) return "اختباران";
  if (n >= 3 && n <= 10) return `${n} اختبارات`;
  return `${n} اختبار`;
}

function getExamQuestionCount(exam) {
  if (Array.isArray(exam.tests) && exam.tests.length) {
    return exam.tests.reduce((sum, test) => sum + (Array.isArray(test.questions) ? test.questions.length : 0), 0);
  }
  return Array.isArray(exam.questions) ? exam.questions.length : 0;
}

function getExamAnsweredCount(exam) {
  if (Array.isArray(exam.tests) && exam.tests.length) {
    return exam.tests.reduce((sum, test) => {
      return sum + Object.keys(loadAnswers(quizId(exam, test))).length;
    }, 0);
  }
  return Object.keys(loadAnswers(exam.id)).length;
}

function renderHome() {
  els.totalPill.textContent = pluralTests(EXAMS.length);
  els.cards.innerHTML = "";

  EXAMS.forEach((exam) => {
    const hasSubtests = Array.isArray(exam.tests) && exam.tests.length > 0;
    const count = getExamQuestionCount(exam);
    const answered = getExamAnsweredCount(exam);
    const pct = count ? Math.min(100, Math.round((answered / count) * 100)) : 0;
    const best = hasSubtests ? null : getBestScore(exam.id);

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h2>${escapeHtml(exam.title)}</h2>
      <div class="subtitle muted">${escapeHtml(exam.subtitle || "")}</div>
      <div class="meta">
        ${hasSubtests ? `<span class="badge">${pluralTests(exam.tests.length)}</span>` : `<span class="badge">${count} سؤال</span>`}
        ${hasSubtests && count ? `<span class="badge">${count} سؤال</span>` : ""}
        ${exam.badge ? `<span class="badge">${escapeHtml(exam.badge)}</span>` : ""}
        ${best !== null ? `<span class="badge">أفضل نتيجة ${best}%</span>` : ""}
      </div>
      <div class="progress" aria-label="نسبة التقدم">
        <span style="width:${pct}%"></span>
      </div>
      ${
        hasSubtests
          ? `<button class="primary" type="button" data-exam-menu="${escapeAttr(exam.id)}">فتح الاختبارات</button>`
          : count
            ? `<button class="primary" type="button" data-exam="${escapeAttr(exam.id)}">
                ${answered ? "متابعة الاختبار" : "بدء الاختبار"}
              </button>`
            : `<button class="disabled-btn" type="button" disabled>لم تتم إضافة الأسئلة بعد</button>`
      }
    `;
    els.cards.appendChild(card);
  });

  els.cards.querySelectorAll("[data-exam-menu]").forEach((btn) => {
    btn.addEventListener("click", () => openExamMenu(btn.dataset.examMenu));
  });

  els.cards.querySelectorAll("[data-exam]").forEach((btn) => {
    btn.addEventListener("click", () => startExam(btn.dataset.exam));
  });
}

function openExamMenu(id) {
  const exam = EXAMS.find((item) => item.id === id);
  if (!exam || !Array.isArray(exam.tests) || !exam.tests.length) return;

  currentExam = exam;
  currentTest = null;
  currentQuestions = [];
  answers = {};
  submitted = false;

  els.home.classList.add("hidden");
  els.quiz.classList.add("hidden");
  els.examMenu.classList.remove("hidden");
  els.examMenuTitle.textContent = exam.title;
  els.examMenuSubtitle.textContent = "اختر الاختبار الذي تريد البدء به";

  renderTestCards();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderTestCards() {
  els.testCards.innerHTML = "";
  if (!currentExam?.tests) return;

  currentExam.tests.forEach((test) => {
    const count = Array.isArray(test.questions) ? test.questions.length : 0;
    const id = quizId(currentExam, test);
    const saved = loadAnswers(id);
    const answered = Object.keys(saved).length;
    const pct = count ? Math.min(100, Math.round((answered / count) * 100)) : 0;
    const best = getBestScore(id);

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h2>${escapeHtml(test.title)}</h2>
      <div class="subtitle muted">${escapeHtml(test.subtitle || "")}</div>
      <div class="meta">
        <span class="badge">${count} سؤال</span>
        ${best !== null ? `<span class="badge">أفضل نتيجة ${best}%</span>` : ""}
      </div>
      <div class="progress" aria-label="نسبة التقدم">
        <span style="width:${pct}%"></span>
      </div>
      ${
        count
          ? `<button class="primary" type="button" data-test="${escapeAttr(test.id)}">${answered ? "متابعة الاختبار" : "بدء الاختبار"}</button>`
          : `<button class="disabled-btn" type="button" disabled>لم تتم إضافة الأسئلة بعد</button>`
      }
    `;
    els.testCards.appendChild(card);
  });

  els.testCards.querySelectorAll("[data-test]").forEach((btn) => {
    btn.addEventListener("click", () => startExam(currentExam.id, btn.dataset.test));
  });
}

function startExam(examId, testId = null) {
  const exam = EXAMS.find((item) => item.id === examId);
  if (!exam) return;

  const test = testId && Array.isArray(exam.tests)
    ? exam.tests.find((item) => item.id === testId)
    : null;

  const questions = test
    ? (Array.isArray(test.questions) ? test.questions : [])
    : (Array.isArray(exam.questions) ? exam.questions : []);

  if (!questions.length) return;

  currentExam = exam;
  currentTest = test;
  currentQuestions = questions;
  const id = quizId(exam, test);
  answers = loadAnswers(id);
  submitted = false;

  els.result.classList.add("hidden");
  els.result.innerHTML = "";
  els.home.classList.add("hidden");
  els.examMenu.classList.add("hidden");
  els.quiz.classList.remove("hidden");
  els.quizTitle.textContent = test ? `${exam.title} — ${test.title}` : exam.title;

  renderQuestions();
  updateStats();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderQuestions() {
  els.questions.innerHTML = "";

  currentQuestions.forEach((q, index) => {
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
  const total = currentQuestions.length;
  const answered = Object.keys(answers).length;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  els.quizStats.textContent = `تمت الإجابة عن ${answered} من ${total}`;
  els.topProgressBar.style.width = `${pct}%`;
}

function submitQuiz() {
  if (!currentExam || !currentQuestions.length) return;

  const total = currentQuestions.length;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  currentQuestions.forEach((q, index) => {
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
  const id = quizId(currentExam, currentTest);
  const best = getBestScore(id);
  if (best === null || pct > best) localStorage.setItem(resultKey(id), String(pct));

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
  const id = quizId(currentExam, currentTest);
  localStorage.removeItem(storageKey(id));
  answers = {};
  submitted = false;
  els.result.classList.add("hidden");
  els.result.innerHTML = "";
  renderQuestions();
  updateStats();
}

function backFromQuiz() {
  if (currentExam && currentTest && Array.isArray(currentExam.tests)) {
    const examId = currentExam.id;
    currentTest = null;
    currentQuestions = [];
    answers = {};
    submitted = false;
    els.quiz.classList.add("hidden");
    openExamMenu(examId);
    return;
  }
  goHome();
}

function goHome() {
  currentExam = null;
  currentTest = null;
  currentQuestions = [];
  answers = {};
  submitted = false;
  els.quiz.classList.add("hidden");
  els.examMenu.classList.add("hidden");
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

els.menuBackBtn.addEventListener("click", goHome);
els.backBtn.addEventListener("click", backFromQuiz);
els.submitBtn.addEventListener("click", submitQuiz);
els.resetBtn.addEventListener("click", resetQuiz);

renderHome();
