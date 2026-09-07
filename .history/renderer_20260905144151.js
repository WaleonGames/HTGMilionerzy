const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("questionInput");

const answerA = document.getElementById("answerA");
const answerB = document.getElementById("answerB");
const answerC = document.getElementById("answerC");
const answerD = document.getElementById("answerD");

const correctAnswerInput = document.getElementById("correctAnswer");

const questionCount = document.getElementById("questionCount");
const currentQuestion = document.getElementById("currentQuestion");
const questionNumber = document.getElementById("questionNumber");

const gameAnswers = document.querySelectorAll(".game-answer");

const checkAnswerButton = document.getElementById("checkAnswerButton");
const nextQuestionButton = document.getElementById("nextQuestionButton");

const result = document.getElementById("result");

const questions = [];

let currentQuestionIndex = 0;
let selectedAnswer = null;
let answerChecked = false;

questionForm.addEventListener("submit", event => {
  event.preventDefault();

  const question = {
    id: crypto.randomUUID(),
    question: questionInput.value.trim(),
    answers: {
      A: answerA.value.trim(),
      B: answerB.value.trim(),
      C: answerC.value.trim(),
      D: answerD.value.trim()
    },
    correctAnswer: correctAnswerInput.value
  };

  questions.push(question);

  questionForm.reset();

  questionCount.textContent = questions.length;

  if (questions.length === 1) {
    currentQuestionIndex = 0;
    loadQuestion();
  } else {
    updateQuestionNumber();
  }
});

gameAnswers.forEach(button => {
  button.addEventListener("click", () => {
    if (!questions.length || answerChecked) {
      return;
    }

    selectedAnswer = button.dataset.answer;

    gameAnswers.forEach(answer => {
      answer.classList.remove("selected");
    });

    button.classList.add("selected");

    checkAnswerButton.disabled = false;
  });
});

checkAnswerButton.addEventListener("click", () => {
  if (!questions.length || !selectedAnswer || answerChecked) {
    return;
  }

  const question = questions[currentQuestionIndex];

  answerChecked = true;

  gameAnswers.forEach(button => {
    button.disabled = true;

    const answer = button.dataset.answer;

    if (answer === question.correctAnswer) {
      button.classList.add("correct");
    }

    if (
      answer === selectedAnswer &&
      selectedAnswer !== question.correctAnswer
    ) {
      button.classList.add("wrong");
    }
  });

  checkAnswerButton.disabled = true;

  if (selectedAnswer === question.correctAnswer) {
    showResult(
      "success",
      `Poprawna odpowiedź! ${question.correctAnswer}: ${question.answers[question.correctAnswer]}`
    );
  } else {
    showResult(
      "error",
      `Błędna odpowiedź. Poprawna to ${question.correctAnswer}: ${question.answers[question.correctAnswer]}`
    );
  }

  nextQuestionButton.disabled =
    currentQuestionIndex >= questions.length - 1;
});

nextQuestionButton.addEventListener("click", () => {
  if (currentQuestionIndex >= questions.length - 1) {
    return;
  }

  currentQuestionIndex++;
  loadQuestion();
});

function loadQuestion() {
  if (!questions.length) {
    return;
  }

  const question = questions[currentQuestionIndex];

  selectedAnswer = null;
  answerChecked = false;

  currentQuestion.textContent = question.question;

  gameAnswers.forEach(button => {
    const answer = button.dataset.answer;

    button.querySelector("span").textContent =
      question.answers[answer];

    button.disabled = false;

    button.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });

  result.hidden = true;
  result.textContent = "";
  result.className = "result";

  checkAnswerButton.disabled = true;
  nextQuestionButton.disabled = true;

  updateQuestionNumber();
}

function updateQuestionNumber() {
  if (!questions.length) {
    questionNumber.textContent = "0 / 0";
    return;
  }

  questionNumber.textContent =
    `${currentQuestionIndex + 1} / ${questions.length}`;
}

function showResult(type, message) {
  result.hidden = false;
  result.className = `result ${type}`;
  result.textContent = message;
}