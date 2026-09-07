const openControlsButton=
  document.getElementById("openControlsButton");

const closeControlsButton=
  document.getElementById("closeControlsButton");

const controlsPanel=
  document.getElementById("controlsPanel");

const controlsBackdrop=
  document.getElementById("controlsBackdrop");

const exitGameButton=
  document.getElementById("exitGameButton");

const questionNumber=
  document.getElementById("questionNumber");

const questionProgress=
  document.getElementById("questionProgress");

const questionText=
  document.getElementById("questionText");

const answerTextA=
  document.getElementById("answerTextA");

const answerTextB=
  document.getElementById("answerTextB");

const answerTextC=
  document.getElementById("answerTextC");

const answerTextD=
  document.getElementById("answerTextD");

const selectedAnswer=
  document.getElementById("selectedAnswer");

const answerResult=
  document.getElementById("answerResult");

const checkAnswerButton=
  document.getElementById("checkAnswerButton");

const previousQuestionButton=
  document.getElementById("previousQuestionButton");

const nextQuestionButton=
  document.getElementById("nextQuestionButton");

const answerButtons=[
  ...document.querySelectorAll(".game-answer")
];

let questions=[];
let currentQuestionIndex=0;
let currentSelectedAnswer=null;

/* =========================
   OFFCANVAS
========================= */

openControlsButton.addEventListener("click",()=>{
  openControls();
});

closeControlsButton.addEventListener("click",()=>{
  closeControls();
});

controlsBackdrop.addEventListener("click",()=>{
  closeControls();
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    closeControls();
  }
});

exitGameButton.addEventListener("click",()=>{
  window.location.href="index.html";
});

function openControls(){
  controlsPanel.classList.add("open");

  controlsPanel.setAttribute(
    "aria-hidden",
    "false"
  );

  controlsBackdrop.hidden=false;
}

function closeControls(){
  controlsPanel.classList.remove("open");

  controlsPanel.setAttribute(
    "aria-hidden",
    "true"
  );

  controlsBackdrop.hidden=true;
}

/* =========================
   QUESTIONS
========================= */

async function loadQuestions(){
  try{
    const data=
      await window.millionaireAPI.questions.get();

    questions=Array.isArray(data)
      ? data
      : [];

    if(!questions.length){
      showEmptyQuestion();
      return;
    }

    currentQuestionIndex=0;

    renderQuestion();
  }catch(error){
    console.error(
      "Błąd pobierania pytań:",
      error
    );

    showEmptyQuestion();
  }
}

function renderQuestion(){
  const question=
    questions[currentQuestionIndex];

  if(!question){
    showEmptyQuestion();
    return;
  }

  currentSelectedAnswer=null;

  selectedAnswer.textContent="Brak";
  answerResult.textContent="—";

  checkAnswerButton.disabled=true;

  questionNumber.textContent=
    `Pytanie ${currentQuestionIndex+1}`;

  questionProgress.textContent=
    `${currentQuestionIndex+1} / ${questions.length}`;

  questionText.textContent=
    question.question||"Brak treści pytania.";

  answerTextA.textContent=
    question.answers?.A||"—";

  answerTextB.textContent=
    question.answers?.B||"—";

  answerTextC.textContent=
    question.answers?.C||"—";

  answerTextD.textContent=
    question.answers?.D||"—";

  answerButtons.forEach(button=>{
    button.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });

  previousQuestionButton.disabled=
    currentQuestionIndex===0;

  nextQuestionButton.disabled=
    currentQuestionIndex>=questions.length-1;
}

function showEmptyQuestion(){
  questionNumber.textContent=
    "Brak pytań";

  questionProgress.textContent=
    "0 / 0";

  questionText.textContent=
    "Brak pytań w bazie.";

  answerTextA.textContent="—";
  answerTextB.textContent="—";
  answerTextC.textContent="—";
  answerTextD.textContent="—";

  selectedAnswer.textContent="Brak";
  answerResult.textContent="—";

  checkAnswerButton.disabled=true;
  previousQuestionButton.disabled=true;
  nextQuestionButton.disabled=true;
}

/* =========================
   ANSWER SELECTION
========================= */

answerButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    const answer=
      button.dataset.answer;

    if(!answer){
      return;
    }

    currentSelectedAnswer=answer;

    answerButtons.forEach(item=>{
      item.classList.remove(
        "selected",
        "correct",
        "wrong"
      );
    });

    button.classList.add("selected");

    selectedAnswer.textContent=answer;

    answerResult.textContent="—";

    checkAnswerButton.disabled=false;
  });
});

/* =========================
   CHECK ANSWER
========================= */

checkAnswerButton.addEventListener("click",()=>{
  const question=
    questions[currentQuestionIndex];

  if(
    !question||
    !currentSelectedAnswer
  ){
    return;
  }

  const correctAnswer=
    String(
      question.correctAnswer||""
    ).toUpperCase();

  answerButtons.forEach(button=>{
    const answer=
      button.dataset.answer;

    button.classList.remove(
      "selected",
      "correct",
      "wrong"
    );

    if(answer===correctAnswer){
      button.classList.add("correct");
    }

    if(
      answer===currentSelectedAnswer&&
      answer!==correctAnswer
    ){
      button.classList.add("wrong");
    }
  });

  if(
    currentSelectedAnswer===correctAnswer
  ){
    answerResult.textContent=
      "Poprawna odpowiedź";
  }else{
    answerResult.textContent=
      `Błędna odpowiedź. Poprawna: ${correctAnswer}`;
  }

  checkAnswerButton.disabled=true;
});

/* =========================
   NAVIGATION
========================= */

previousQuestionButton.addEventListener("click",()=>{
  if(currentQuestionIndex<=0){
    return;
  }

  currentQuestionIndex--;

  renderQuestion();
});

nextQuestionButton.addEventListener("click",()=>{
  if(
    currentQuestionIndex>=
    questions.length-1
  ){
    return;
  }

  currentQuestionIndex++;

  renderQuestion();
});

/* =========================
   START
========================= */

loadQuestions();