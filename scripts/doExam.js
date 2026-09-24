const exam = JSON.parse(localStorage.getItem("examData"));
const container = document.getElementById("questions-container");
const form = document.getElementById("exam-form");
const examTitleEl = document.getElementById("exam-title");
const examDescEl = document.querySelector(".info-exam");
const MIN_PASS_GRADE = 3.2;

if (!exam) {
  alert("No hay examen disponible. Volviendo al inicio.");
  window.location.href = "../index.html";
}

const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const createQuestionElement = (question, index) => {
  const div = document.createElement("div");
  div.classList.add("question-block");

  div.innerHTML = `
    <h3>${index + 1}. ${capitalize(question.title)}</h3>
    ${question.options
      .map(
        (option, optionIndex) => `
      <label>
        <input type="radio" name="question${index}" value="${optionIndex}" required>
        ${capitalize(option)}
      </label><br>
    `
      )
      .join("")}
  `;
  return div;
};

const renderExam = () => {
  examTitleEl.textContent = "Examen de " + (capitalize(exam.title) || "Examen sin título");
  examDescEl.textContent = capitalize(exam.description) || "Sin descripción";

  exam.questions.forEach((question, index) => {
    const questionEl = createQuestionElement(question, index);
    container.appendChild(questionEl);
  });
};

const calculateScore = () => {
  let score = 0;
  let total = 0;

  exam.questions.forEach((q, index) => {
    if (!q.title || q.correctAnswer < 0 || !q.options?.length) return;

    total++;

    const selected = document.querySelector(`input[name="question${index}"]:checked`);

    if (selected && parseInt(selected.value, 10) === q.correctAnswer) {
      score++;
    }
  });

  return { score, total };
};

const showModal = (message, estado, type = "success") => {
  const modal = document.getElementById("result-modal");
  const modalMessage = document.getElementById("modal-message");
  const modalEstado = document.getElementById("modal-estado");

  modalMessage.textContent = message;
  modalEstado.textContent = estado;

  modalEstado.style.color = type === "success" ? "#28a745" : "#dc3545";

  modal.style.display = "flex";

  const retryBtn = document.getElementById("retry-btn");
  const backBtn = document.getElementById("back-btn");

  if (retryBtn) retryBtn.onclick = () => window.location.reload();
  if (backBtn) backBtn.onclick = () => (window.location.href = "../index.html");
};

const handleSubmit = (e) => {
  e.preventDefault();

  const { score, total } = calculateScore();

  const calificacion = ((score / total) * 5).toFixed(2);
  const aprobado = calificacion >= MIN_PASS_GRADE;

  const estado = aprobado ? "¡Aprobado! 🎉" : "Reprobado 😔";
  const mensaje = `Tu calificación final es ${calificacion} / 5.00`;

  showModal(mensaje, estado, aprobado ? "success" : "error");
};

form.addEventListener("submit", handleSubmit);
renderExam();