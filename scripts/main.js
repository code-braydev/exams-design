const exam = JSON.parse(localStorage.getItem("examData"));
const isSaved = localStorage.getItem("examSaved") === "true";

const createBtn = document.querySelector(".create-exam");
const doBtn = document.querySelector(".do-exam");

function redirect(page) {
  if (page === "createExam") {
    if (exam && exam.questions && exam.questions.length > 0) {
      const msg = isSaved
        ? "Ya existe un examen guardado y terminado. Si continúas, se borrará permanentemente.\n\n¿Deseas crear uno nuevo?"
        : "Tienes un borrador de examen sin terminar.\n\n¿Deseas descartarlo y empezar de cero?";

      if (!confirm(msg)) return;

      localStorage.removeItem("examData");
      localStorage.removeItem("examFormulated");
      localStorage.removeItem("examSaved");
    }

    window.location.href = "./pages/createExamn.html";

  } else if (page === "doExam") {
    if (!exam || !isSaved || !exam.questions || exam.questions.length === 0) {
      alert("No hay examen disponible o no ha sido guardado correctamente. Crea uno primero y asegúrate de dar clic en 'Guardar Examen'.");
    } else {
      window.location.href = "./pages/doExam.html";
    }
  }
}

createBtn?.addEventListener("click", () => redirect("createExam"));
doBtn?.addEventListener("click", () => redirect("doExam"));