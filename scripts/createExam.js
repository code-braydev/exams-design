const container = document.getElementById("questions-container");
const submitBtn = document.getElementById("submitButton");
const nextBtn = document.getElementById("next-question");
const prevBtn = document.getElementById("prev-question");
const pageInfo = document.getElementById("page-info");

const openModalBtn = document.getElementById("open-exam-modal-btn");
const examModal = document.getElementById("exam-modal");
const modalTitle = document.getElementById("modal-exam-title");
const modalDesc = document.getElementById("modal-exam-description");
const saveExamInfoBtn = document.getElementById("save-exam-info");

let currentPage = 0;
let examFormulated = JSON.parse(localStorage.getItem("examFormulated")) || false;
let exams = JSON.parse(localStorage.getItem("examData")) || {
  title: "",
  description: "",
  questions: [],
};

const saveToLocalStorage = () => localStorage.setItem("examData", JSON.stringify(exams));
const saveFormulated = () => localStorage.setItem("examFormulated", "true");
const showModal = () => (examModal.style.display = "flex");
const hideModal = () => (examModal.style.display = "none");

if (openModalBtn) openModalBtn.addEventListener("click", showModal);

if (saveExamInfoBtn) {
  saveExamInfoBtn.addEventListener("click", () => {
    const title = modalTitle.value.trim();
    const desc = modalDesc.value.trim();

    if (!title || !desc) return alert("Complete título y descripción.");

    exams.title = title;
    exams.description = desc;
    saveToLocalStorage();
    examFormulated = true;
    saveFormulated();
    hideModal();
  });
}

if (!examFormulated) showModal();

const updateOptionUI = (block, questionIndex) => {
  const options = block.querySelectorAll(".option-container");

  options.forEach((opt, i) => {
    const input = opt.querySelector(".option-input");
    input.placeholder = `Opción ${i + 1}`;

    const radio = opt.querySelector(".correct-option-radio");
    radio.name = `correct-option-${questionIndex}`;

    const addBtn = opt.querySelector(".add-option");
    const removeBtn = opt.querySelector(".remove-option");

    if (i === options.length - 1) {
      addBtn.style.display = "inline-block";
    } else {
      addBtn.style.display = "none";
    }

    if (options.length === 1) {
      removeBtn.style.display = "none";
    } else {
      removeBtn.style.display = "inline-block";
    }
  });
};

const createOptionElement = () => {
  const div = document.createElement("div");
  div.classList.add("option-container");
  div.innerHTML = `
        <input type="radio" class="correct-option-radio">
        <input type="text" class="option-input input" required>
        <button type="button" class="remove-option">-</button>
        <button type="button" class="add-option">+</button>
    `;
  return div;
};

const createQuestionBlock = (questionData = null) => {
  const block = document.createElement("div");
  block.classList.add("question-block");

  block.innerHTML = `
        <div class="question-head">
            <label>Pregunta:</label>
            <button type="button" class="delete-question"><i class="fas fa-trash-alt"></i></button>
        </div>
        <input type="text" name="question-text" class="input" required>
        <label>Opciones:</label>
        <div class="options-list"></div>
    `;

  const optionsList = block.querySelector(".options-list");
  const questionText = block.querySelector('input[name="question-text"]');

  if (questionData) {
    questionText.value = questionData.title;
    questionData.options.forEach((opt, i) => {
      const option = createOptionElement();
      option.querySelector(".option-input").value = opt;
      if (i === questionData.correctAnswer) {
        option.querySelector(".correct-option-radio").checked = true;
      }
      optionsList.appendChild(option);
    });
  } else {
    optionsList.appendChild(createOptionElement());
  }

  const currentIdx = container.querySelectorAll(".question-block").length;
  updateOptionUI(block, currentIdx);

  return block;
};

const showQuestion = (index) => {
  const questions = container.querySelectorAll(".question-block");

  if (questions.length === 0) {
    pageInfo.textContent = "0 de 0";
    return;
  }

  questions.forEach(
    (q, i) => (q.style.display = i === index ? "block" : "none")
  );
  currentPage = index;
  pageInfo.textContent = `Pregunta ${index + 1} de ${questions.length}`;

  prevBtn.disabled = index === 0;
};

const saveCurrentQuestion = () => {
  const currentBlock = container.querySelectorAll(".question-block")[currentPage];
  if (!currentBlock) return;

  const title = currentBlock.querySelector('input[name="question-text"]').value.trim();
  const options = Array.from(
    currentBlock.querySelectorAll(".option-input")
  ).map((o) => o.value.trim());

  const correctAnswer = Array.from(
    currentBlock.querySelectorAll(".correct-option-radio")
  ).findIndex((r) => r.checked);

  exams.questions[currentPage] = { title, options, correctAnswer };
  saveToLocalStorage();
};

const validateExamInfo = () => exams.title && exams.description;

const validateQuestion = (block) => {
  const title = block.querySelector('input[name="question-text"]').value.trim();
  const options = Array.from(block.querySelectorAll(".option-input")).map((o) =>
    o.value.trim()
  );
  const correctAnswer = Array.from(
    block.querySelectorAll(".correct-option-radio")
  ).some((r) => r.checked);

  if (!title) { alert("Debe escribir la pregunta."); return false; }
  if (options.length < 2) { alert("Debe agregar al menos 2 opciones."); return false; }
  if (options.some((o) => !o)) { alert("Complete todas las opciones."); return false; }
  if (!correctAnswer) { alert("Seleccione una respuesta correcta."); return false; }

  return true;
};

document.addEventListener("click", (e) => {
  const block = e.target.closest(".question-block");
  if (!block) return;

  const optionsList = block.querySelector(".options-list");
  const allBlocks = Array.from(container.querySelectorAll(".question-block"));
  const questionIndex = allBlocks.indexOf(block);

  if (e.target.closest(".add-option")) {
    const questionInput = block.querySelector('input[name="question-text"]');
    const currentOptions = block.querySelectorAll(".option-container");
    const lastOptionInput = currentOptions[currentOptions.length - 1].querySelector(".option-input");

    if (!questionInput.value.trim()) return alert("Escriba la pregunta antes de agregar opciones.");
    if (!lastOptionInput.value.trim()) return alert("Complete la opción anterior primero.");

    optionsList.appendChild(createOptionElement());
    updateOptionUI(block, questionIndex);
  }

  if (e.target.closest(".remove-option")) {
    const option = e.target.closest(".option-container");
    const allOptions = block.querySelectorAll(".option-container");

    if (allOptions.length <= 1) return;

    option.remove();
    updateOptionUI(block, questionIndex);
  }

  if (e.target.closest(".delete-question")) {
    if (container.querySelectorAll(".question-block").length <= 1)
      return alert("No se puede eliminar la última pregunta.");

    if (!confirm("¿Desea eliminar esta pregunta?")) return;

    block.remove();
    exams.questions.splice(questionIndex, 1);
    saveToLocalStorage();

    const newTotal = container.querySelectorAll(".question-block").length;
    const newPage = (currentPage >= newTotal) ? newTotal - 1 : currentPage;

    showQuestion(newPage);
  }
});

nextBtn.addEventListener("click", () => {
  const block = container.querySelectorAll(".question-block")[currentPage];

  if (!validateExamInfo()) return alert("Falta información del examen (Título/Descripción).");
  if (!validateQuestion(block)) return;

  saveCurrentQuestion();

  const questions = container.querySelectorAll(".question-block");
  if (currentPage === questions.length - 1) {
    const newBlock = createQuestionBlock();
    container.appendChild(newBlock);
  }
  showQuestion(currentPage + 1);
});

prevBtn.addEventListener("click", () => {
  saveCurrentQuestion();
  if (currentPage > 0) {
    showQuestion(currentPage - 1);
  }
});

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!validateExamInfo()) return alert("Complete información del examen.");

  const allQuestions = container.querySelectorAll(".question-block");

  for (let i = 0; i < allQuestions.length; i++) {
    const block = allQuestions[i];
    if (!validateQuestion(block)) {
      showQuestion(i);
      return;
    }
    currentPage = i;
    saveCurrentQuestion();
  }

  exams.questions = exams.questions.filter(
    (q) => q.title && q.options.length >= 2
  );

  saveToLocalStorage();
  localStorage.setItem("examSaved", "true");

  alert("¡Examen guardado correctamente!");
  window.location.replace("../index.html");
});

const init = () => {
  container.innerHTML = "";
  modalTitle.value = exams.title || "";
  modalDesc.value = exams.description || "";

  if (!exams.questions || exams.questions.length === 0) {
    container.appendChild(createQuestionBlock());
  } else {
    exams.questions.forEach((q) =>
      container.appendChild(createQuestionBlock(q))
    );
  }

  currentPage = 0;
  showQuestion(currentPage);
};

init();