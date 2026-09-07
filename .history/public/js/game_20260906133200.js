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

const answersGrid=
  document.getElementById("answersGrid");

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

const showMainPanelButton=
  document.getElementById("showMainPanelButton");

const showQuestionButton=
  document.getElementById("showQuestionButton");

const showAnswersButton=
  document.getElementById("showAnswersButton");

const toggleSidebarButton=
  document.getElementById("toggleSidebarButton");

const nextQuestionButton=
  document.getElementById("nextQuestionButton");

const lifeline5050Button=
  document.getElementById("lifeline5050Button");

const lifelineAudienceButton=
  document.getElementById("lifelineAudienceButton");

const lifeline5050Image=
  document.getElementById("lifeline5050Image");

const lifelineAudienceImage=
  document.getElementById("lifelineAudienceImage");

const lifelineHostImage=
  document.getElementById("lifelineHostImage");

const gameSidebar=
  document.querySelector(".game-sidebar");

const gameApp=
  document.querySelector(".game-app");

const gamePrizeTree=
  document.getElementById("gamePrizeTree");

const resultBox=
  document.querySelector(".game-result");

const answerElements=[
  ...document.querySelectorAll(".game-answer")
];

const hostAnswerButtons=[
  ...document.querySelectorAll(
    ".game-host-answer"
  )
];

const technicalInfoElements=[
  ...document.querySelectorAll(
    ".technical-info"
  )
];

/* =========================
   LIFELINE IMAGES
========================= */

const LIFELINE_IMAGES={
  fiftyFifty:{
    normal:
      "../public/assets/lifelines/50-50.png",

    used:
      "../public/assets/lifelines/wykorzystane 50-50.png",

    blocked:
      "../public/assets/lifelines/zablokowane 50-50.png"
  },

  audience:{
    normal:
      "../public/assets/lifelines/publiczność.png",

    used:
      "../public/assets/lifelines/wykorzystana publiczność.png"
  },

  host:{
    normal:
      "../public/assets/lifelines/pytanie do prowadzącego.png",

    used:
      "../public/assets/lifelines/wykorzystane pytanie do prowadzącego.png"
  },

  phone:{
    normal:
      "../public/assets/lifelines/telefon.png",

    used:
      "../public/assets/lifelines/wykorzystany telefon.png"
  },

  joker:{
    normal:
      "../public/assets/lifelines/joker.png",

    used:
      "../public/assets/lifelines/wykorzystany joker.png"
  },

  doubleShot:{
    normal:
      "../public/assets/lifelines/podwójny strzał.png",

    used:
      "../public/assets/lifelines/wykorzystany podwójny strzał.png",

    blocked:
      "../public/assets/lifelines/zablokowany podwójny strzał.png"
  },

  switchQuestion:{
    normal:
      "../public/assets/lifelines/zamiana pytania.png",

    used:
      "../public/assets/lifelines/wykorzystana zamiana pytania.png"
  }
};

const LIFELINE_FLASH_TIME=1500;

/* =========================
   STATE
========================= */

let questions=[];
let settings=null;

let currentQuestionIndex=0;
let currentSelectedAnswer=null;

let mainPanelVisible=false;
let questionVisible=false;
let answersVisible=false;
let sidebarVisible=false;

let answerChecked=false;
let currentAnswerCorrect=false;
let gameFailed=false;

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
   EXIT
========================= */

exitGameButton.addEventListener("click",()=>{
  const confirmed=confirm(
    "Czy na pewno chcesz zakończyć rozgrywkę?"
  );

  if(!confirmed){
    return;
  }

  window.location.href="index.html";
});

/* =========================
   SIDEBAR
========================= */

toggleSidebarButton.addEventListener("click",()=>{
  sidebarVisible=!sidebarVisible;

  updateSidebar();
});

function updateSidebar(){
  gameSidebar.classList.toggle(
    "hidden",
    !sidebarVisible
  );

  gameApp.classList.toggle(
    "sidebar-hidden",
    !sidebarVisible
  );

  toggleSidebarButton.classList.toggle(
    "active",
    sidebarVisible
  );
}

function initializeSidebar(){
  sidebarVisible=false;

  updateSidebar();
}

/* =========================
   LIFELINES
========================= */

lifeline5050Button?.addEventListener("click",()=>{
  flashLifeline(
    lifeline5050Image,
    "fiftyFifty"
  );
});

lifelineAudienceButton?.addEventListener("click",()=>{
  flashLifeline(
    lifelineAudienceImage,
    "audience"
  );
});

function flashLifeline(
  image,
  lifeline,
  duration=LIFELINE_FLASH_TIME
){
  if(!image){
    return;
  }

  const normal=
    LIFELINE_IMAGES[lifeline]?.normal;

  const used=
    LIFELINE_IMAGES[lifeline]?.used;

  if(!normal||!used){
    return;
  }

  clearTimeout(
    image.lifelineTimeout
  );

  image.src=used;

  image.lifelineTimeout=setTimeout(()=>{
    image.src=normal;
    image.lifelineTimeout=null;
  },duration);
}

function setLifelineState(
  image,
  lifeline,
  state="normal"
){
  if(!image){
    return;
  }

  const source=
    LIFELINE_IMAGES[lifeline]?.[state];

  if(!source){
    return;
  }

  clearTimeout(
    image.lifelineTimeout
  );

  image.lifelineTimeout=null;
  image.src=source;
}

function resetLifelines(){
  setLifelineState(
    lifeline5050Image,
    "fiftyFifty",
    "normal"
  );

  setLifelineState(
    lifelineAudienceImage,
    "audience",
    "normal"
  );

  setLifelineState(
    lifelineHostImage,
    "host",
    "normal"
  );
}

/* =========================
   SETTINGS
========================= */

async function loadSettings(){
  try{
    settings=
      await window.millionaireAPI
        .settings
        .get();

    applyTechnicalInfo();
    renderPrizeTree();
  }catch(error){
    console.error(
      "Błąd pobierania ustawień:",
      error
    );

    settings=null;

    applyTechnicalInfo();
    renderPrizeTree();
  }
}

function applyTechnicalInfo(){
  const visible=
    settings?.screen?.technicalInfo===true;

  technicalInfoElements.forEach(element=>{
    element.hidden=!visible;
  });
}

/* =========================
   PRIZE TREE
========================= */

function renderPrizeTree(){
  gamePrizeTree.innerHTML="";

  const prizeTree=
    settings?.prizeTree||{};

  const currency=
    String(
      prizeTree.currency||"zł"
    ).trim();

  const levels=
    Array.isArray(prizeTree.levels)
      ? [...prizeTree.levels]
      : [];

  if(!levels.length){
    const empty=
      document.createElement("div");

    empty.className=
      "game-prize-empty";

    empty.textContent=
      "Brak poziomów nagród.";

    gamePrizeTree.appendChild(
      empty
    );

    return;
  }

  levels
    .sort((a,b)=>{
      return Number(b.level)-
        Number(a.level);
    })
    .forEach(prize=>{
      const levelNumber=
        Number(prize.level)||0;

      const item=
        document.createElement("div");

      item.className=
        "game-prize-item";

      item.dataset.level=
        String(levelNumber);

      if(prize.guaranteed){
        item.classList.add(
          "guaranteed"
        );
      }

      if(
        levelNumber===
        currentQuestionIndex+1
      ){
        item.classList.add(
          "active"
        );
      }

      const level=
        document.createElement("span");

      level.className=
        "game-prize-level";

      level.textContent=
        String(levelNumber);

      const amount=
        document.createElement("strong");

      amount.className=
        "game-prize-amount";

      amount.textContent=
        formatPrize(
          prize.amount,
          currency
        );

      item.append(
        level,
        amount
      );

      gamePrizeTree.appendChild(
        item
      );
    });
}

function updatePrizeTreeActive(){
  const currentLevel=
    currentQuestionIndex+1;

  gamePrizeTree
    .querySelectorAll(
      ".game-prize-item"
    )
    .forEach(item=>{
      item.classList.toggle(
        "active",
        Number(
          item.dataset.level
        )===currentLevel
      );
    });
}

function formatPrize(amount,currency){
  const value=
    Number(amount)||0;

  return `${
    new Intl.NumberFormat("pl-PL")
      .format(value)
  } ${currency}`;
}

/* =========================
   QUESTIONS
========================= */

async function loadQuestions(){
  try{
    const data=
      await window.millionaireAPI
        .questions
        .get();

    questions=
      Array.isArray(data)
        ? data
        : [];

    if(!questions.length){
      showEmptyQuestion();
      return;
    }

    currentQuestionIndex=0;

    loadCurrentQuestion();
  }catch(error){
    console.error(
      "Błąd pobierania pytań:",
      error
    );

    questions=[];

    showEmptyQuestion();
  }
}

/* =========================
   LOAD CURRENT QUESTION
========================= */

function loadCurrentQuestion(){
  const question=
    questions[currentQuestionIndex];

  if(!question){
    showEmptyQuestion();
    return;
  }

  resetQuestionState();

  questionNumber.textContent=
    `Pytanie ${currentQuestionIndex+1}`;

  questionProgress.textContent=
    `${currentQuestionIndex+1} / ${questions.length}`;

  questionText.dataset.value=
    question.question||"";

  answerTextA.dataset.value=
    question.answers?.A||"";

  answerTextB.dataset.value=
    question.answers?.B||"";

  answerTextC.dataset.value=
    question.answers?.C||"";

  answerTextD.dataset.value=
    question.answers?.D||"";

  questionText.textContent="";

  answerTextA.textContent="";
  answerTextB.textContent="";
  answerTextC.textContent="";
  answerTextD.textContent="";

  updatePrizeTreeActive();
}

/* =========================
   RESET QUESTION
========================= */

function resetQuestionState(){
  currentSelectedAnswer=null;

  mainPanelVisible=false;
  questionVisible=false;
  answersVisible=false;

  answerChecked=false;
  currentAnswerCorrect=false;
  gameFailed=false;

  questionText.hidden=true;
  answersGrid.hidden=true;

  selectedAnswer.textContent=
    "Brak";

  answerResult.textContent=
    "Oczekiwanie";

  resultBox.classList.remove(
    "success",
    "error"
  );

  showMainPanelButton.disabled=false;

  showQuestionButton.disabled=true;
  showAnswersButton.disabled=true;

  nextQuestionButton.disabled=true;

  showMainPanelButton.classList.add(
    "game-button-primary"
  );

  showMainPanelButton.classList.remove(
    "active"
  );

  showQuestionButton.classList.remove(
    "game-button-primary",
    "active"
  );

  showAnswersButton.classList.remove(
    "game-button-primary",
    "active"
  );

  answerElements.forEach(answer=>{
    answer.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });

  hostAnswerButtons.forEach(button=>{
    button.disabled=true;

    button.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });
}

/* =========================
   SHOW MAIN PANEL
========================= */

showMainPanelButton.addEventListener("click",()=>{
  if(mainPanelVisible){
    return;
  }

  mainPanelVisible=true;

  questionText.hidden=true;
  answersGrid.hidden=false;

  answerTextA.textContent="";
  answerTextB.textContent="";
  answerTextC.textContent="";
  answerTextD.textContent="";

  showMainPanelButton.disabled=true;

  showMainPanelButton.classList.remove(
    "game-button-primary"
  );

  showMainPanelButton.classList.add(
    "active"
  );

  showQuestionButton.disabled=false;

  showQuestionButton.classList.add(
    "game-button-primary"
  );
});

/* =========================
   SHOW QUESTION
========================= */

showQuestionButton.addEventListener("click",()=>{
  if(
    !mainPanelVisible||
    questionVisible
  ){
    return;
  }

  questionVisible=true;

  questionText.textContent=
    questionText.dataset.value||"";

  questionText.hidden=false;

  showQuestionButton.disabled=true;

  showQuestionButton.classList.remove(
    "game-button-primary"
  );

  showQuestionButton.classList.add(
    "active"
  );

  showAnswersButton.disabled=false;

  showAnswersButton.classList.add(
    "game-button-primary"
  );
});

/* =========================
   SHOW ANSWERS
========================= */

showAnswersButton.addEventListener("click",()=>{
  if(
    !questionVisible||
    answersVisible
  ){
    return;
  }

  answersVisible=true;

  answerTextA.textContent=
    answerTextA.dataset.value||"";

  answerTextB.textContent=
    answerTextB.dataset.value||"";

  answerTextC.textContent=
    answerTextC.dataset.value||"";

  answerTextD.textContent=
    answerTextD.dataset.value||"";

  showAnswersButton.disabled=true;

  showAnswersButton.classList.remove(
    "game-button-primary"
  );

  showAnswersButton.classList.add(
    "active"
  );

  enableHostAnswers();
});

/* =========================
   ENABLE HOST ANSWERS
========================= */

function enableHostAnswers(){
  hostAnswerButtons.forEach(button=>{
    button.disabled=false;
  });
}

/* =========================
   HOST ANSWER
========================= */

hostAnswerButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    if(
      answerChecked||
      gameFailed||
      !answersVisible
    ){
      return;
    }

    const answer=
      String(
        button.dataset.hostAnswer||""
      )
        .trim()
        .toUpperCase();

    if(
      !["A","B","C","D"].includes(
        answer
      )
    ){
      return;
    }

    checkAnswer(
      answer,
      button
    );
  });
});

/* =========================
   CHECK ANSWER
========================= */

function checkAnswer(
  selected,
  hostButton
){
  const question=
    questions[currentQuestionIndex];

  if(!question){
    return;
  }

  const correctAnswer=
    String(
      question.correctAnswer||""
    )
      .trim()
      .toUpperCase();

  currentSelectedAnswer=selected;
  answerChecked=true;

  selectedAnswer.textContent=
    selected;

  hostAnswerButtons.forEach(button=>{
    button.disabled=true;

    button.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });

  answerElements.forEach(answer=>{
    answer.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });

  if(selected===correctAnswer){
    handleCorrectAnswer(
      correctAnswer,
      hostButton
    );

    return;
  }

  handleWrongAnswer(
    selected,
    correctAnswer,
    hostButton
  );
}

/* =========================
   CORRECT ANSWER
========================= */

function handleCorrectAnswer(
  correctAnswer,
  hostButton
){
  currentAnswerCorrect=true;
  gameFailed=false;

  hostButton.classList.add(
    "correct"
  );

  const screenAnswer=
    getScreenAnswer(
      correctAnswer
    );

  if(screenAnswer){
    screenAnswer.classList.add(
      "correct"
    );
  }

  answerResult.textContent=
    "Poprawna odpowiedź";

  resultBox.classList.remove(
    "error"
  );

  resultBox.classList.add(
    "success"
  );

  nextQuestionButton.disabled=
    currentQuestionIndex>=
      questions.length-1;
}

/* =========================
   WRONG ANSWER
========================= */

function handleWrongAnswer(
  selected,
  correctAnswer,
  hostButton
){
  currentAnswerCorrect=false;
  gameFailed=true;

  hostButton.classList.add(
    "wrong"
  );

  const selectedScreen=
    getScreenAnswer(
      selected
    );

  const correctScreen=
    getScreenAnswer(
      correctAnswer
    );

  if(selectedScreen){
    selectedScreen.classList.add(
      "wrong"
    );
  }

  if(correctScreen){
    correctScreen.classList.add(
      "correct"
    );
  }

  const correctHostButton=
    getHostAnswerButton(
      correctAnswer
    );

  if(correctHostButton){
    correctHostButton.classList.add(
      "correct"
    );
  }

  answerResult.textContent=
    `Błędna odpowiedź. Poprawna: ${correctAnswer}`;

  resultBox.classList.remove(
    "success"
  );

  resultBox.classList.add(
    "error"
  );

  nextQuestionButton.disabled=true;
}

/* =========================
   ANSWER HELPERS
========================= */

function getScreenAnswer(letter){
  return document.querySelector(
    `.game-answer[data-answer="${letter}"]`
  );
}

function getHostAnswerButton(letter){
  return document.querySelector(
    `.game-host-answer[data-host-answer="${letter}"]`
  );
}

/* =========================
   NEXT QUESTION
========================= */

nextQuestionButton.addEventListener("click",()=>{
  if(
    !answerChecked||
    !currentAnswerCorrect||
    gameFailed
  ){
    return;
  }

  if(
    currentQuestionIndex>=
    questions.length-1
  ){
    return;
  }

  currentQuestionIndex++;

  loadCurrentQuestion();
});

/* =========================
   EMPTY
========================= */

function showEmptyQuestion(){
  questionNumber.textContent=
    "Brak pytań";

  questionProgress.textContent=
    "0 / 0";

  questionText.textContent="";

  answerTextA.textContent="";
  answerTextB.textContent="";
  answerTextC.textContent="";
  answerTextD.textContent="";

  questionText.hidden=true;
  answersGrid.hidden=true;

  selectedAnswer.textContent=
    "Brak";

  answerResult.textContent=
    "Brak pytań";

  resultBox.classList.remove(
    "success",
    "error"
  );

  showMainPanelButton.disabled=true;
  showQuestionButton.disabled=true;
  showAnswersButton.disabled=true;
  nextQuestionButton.disabled=true;

  hostAnswerButtons.forEach(button=>{
    button.disabled=true;
  });
}

/* =========================
   INITIALIZE
========================= */

async function initializeGame(){
  questionText.hidden=true;
  answersGrid.hidden=true;

  initializeSidebar();
  resetLifelines();

  await Promise.all([
    loadSettings(),
    loadQuestions()
  ]);

  renderPrizeTree();
  updatePrizeTreeActive();
}

initializeGame();