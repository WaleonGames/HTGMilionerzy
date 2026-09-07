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

const checkAnswerButton=
  document.getElementById("checkAnswerButton");

const previousQuestionButton=
  document.getElementById("previousQuestionButton");

const nextQuestionButton=
  document.getElementById("nextQuestionButton");

const showQuestionButton=
  document.getElementById("showQuestionButton");

const showAnswersButton=
  document.getElementById("showAnswersButton");

const toggleSidebarButton=
  document.getElementById("toggleSidebarButton");

const flash5050Button=
  document.getElementById("flash5050Button");

const flashAudienceButton=
  document.getElementById("flashAudienceButton");

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

const answerButtons=[
  ...document.querySelectorAll(".game-answer")
];

const technicalInfoElements=[
  ...document.querySelectorAll(
    ".technical-info"
  )
];

const LIFELINE_IMAGES={
  fiftyFifty:{
    normal:"../public/assets/lifelines/50-50.png",
    used:"../public/assets/lifelines/wykorzystane 50-50.png",
    blocked:"../public/assets/lifelines/zablokowane 50-50.png"
  },

  audience:{
    normal:"../public/assets/lifelines/publiczność.png",
    used:"../public/assets/lifelines/wykorzystana publiczność.png"
  },

  host:{
    normal:"../public/assets/lifelines/pytanie do prowadzącego.png",
    used:"../public/assets/lifelines/wykorzystane pytanie do prowadzącego.png"
  },

  phone:{
    normal:"../public/assets/lifelines/telefon.png",
    used:"../public/assets/lifelines/wykorzystany telefon.png"
  },

  joker:{
    normal:"../public/assets/lifelines/joker.png",
    used:"../public/assets/lifelines/wykorzystany joker.png"
  },

  doubleShot:{
    normal:"../public/assets/lifelines/podwójny strzał.png",
    used:"../public/assets/lifelines/wykorzystany podwójny strzał.png",
    blocked:"../public/assets/lifelines/zablokowany podwójny strzał.png"
  },

  switchQuestion:{
    normal:"../public/assets/lifelines/zamiana pytania.png",
    used:"../public/assets/lifelines/wykorzystana zamiana pytania.png"
  }
};

const LIFELINE_FLASH_TIME=1500;

let questions=[];
let settings=null;

let currentQuestionIndex=0;
let currentSelectedAnswer=null;

let questionVisible=false;
let answersVisible=false;
let sidebarVisible=false;

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
  updateDisplayButtons();
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

flash5050Button?.addEventListener("click",()=>{
  flashLifeline(
    lifeline5050Image,
    "fiftyFifty"
  );
});

flashAudienceButton?.addEventListener("click",()=>{
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
    console.warn(
      `Brak grafiki dla ${lifeline}/${state}`
    );

    return;
  }

  image.src=source;
}

/* =========================
   SETTINGS
========================= */

async function loadSettings(){
  try{
    settings=
      await window.millionaireAPI.settings.get();

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

  const formatted=
    new Intl.NumberFormat(
      "pl-PL"
    ).format(value);

  return `${formatted} ${currency}`;
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

    renderQuestion();
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
   RENDER QUESTION
========================= */

function renderQuestion(){
  const question=
    questions[currentQuestionIndex];

  if(!question){
    showEmptyQuestion();
    return;
  }

  currentSelectedAnswer=null;

  selectedAnswer.textContent=
    "Brak";

  answerResult.textContent=
    "—";

  checkAnswerButton.disabled=true;

  questionNumber.textContent=
    `Pytanie ${currentQuestionIndex+1}`;

  questionProgress.textContent=
    `${currentQuestionIndex+1} / ${questions.length}`;

  questionText.textContent=
    question.question||
    "Brak treści pytania.";

  answerTextA.textContent=
    question.answers?.A||"—";

  answerTextB.textContent=
    question.answers?.B||"—";

  answerTextC.textContent=
    question.answers?.C||"—";

  answerTextD.textContent=
    question.answers?.D||"—";

  questionText.hidden=
    !questionVisible;

  answersGrid.hidden=
    !answersVisible;

  answerButtons.forEach(button=>{
    button.disabled=false;

    button.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });

  previousQuestionButton.disabled=
    currentQuestionIndex===0;

  nextQuestionButton.disabled=
    currentQuestionIndex>=
      questions.length-1;

  updateDisplayButtons();
  updatePrizeTreeActive();
}

/* =========================
   EMPTY
========================= */

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

  answerButtons.forEach(button=>{
    button.disabled=true;

    button.classList.remove(
      "selected",
      "correct",
      "wrong"
    );
  });

  questionText.hidden=
    !questionVisible;

  answersGrid.hidden=
    !answersVisible;

  updatePrizeTreeActive();
}

/* =========================
   ANSWER SELECTION
========================= */

answerButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    const answer=
      button.dataset.answer;

    if(
      !answer||
      !questions[currentQuestionIndex]
    ){
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

    button.classList.add(
      "selected"
    );

    selectedAnswer.textContent=
      answer;

    answerResult.textContent="—";

    checkAnswerButton.disabled=false;
  });
});

/* =========================
   CHECK ANSWER
========================= */

checkAnswerButton.addEventListener(
  "click",
  ()=>{
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
      )
        .trim()
        .toUpperCase();

    answerButtons.forEach(button=>{
      const answer=
        String(
          button.dataset.answer||""
        ).toUpperCase();

      button.classList.remove(
        "selected",
        "correct",
        "wrong"
      );

      if(answer===correctAnswer){
        button.classList.add(
          "correct"
        );
      }

      if(
        answer===currentSelectedAnswer&&
        answer!==correctAnswer
      ){
        button.classList.add(
          "wrong"
        );
      }

      button.disabled=true;
    });

    if(
      currentSelectedAnswer===
      correctAnswer
    ){
      answerResult.textContent=
        "Poprawna odpowiedź";
    }else{
      answerResult.textContent=
        `Błędna odpowiedź. Poprawna: ${correctAnswer}`;
    }

    checkAnswerButton.disabled=true;
  }
);

/* =========================
   QUESTION NAVIGATION
========================= */

previousQuestionButton.addEventListener(
  "click",
  ()=>{
    if(currentQuestionIndex<=0){
      return;
    }

    currentQuestionIndex--;

    renderQuestion();
  }
);

nextQuestionButton.addEventListener(
  "click",
  ()=>{
    if(
      currentQuestionIndex>=
      questions.length-1
    ){
      return;
    }

    currentQuestionIndex++;

    renderQuestion();
  }
);

/* =========================
   SHOW QUESTION
========================= */

showQuestionButton.addEventListener(
  "click",
  ()=>{
    questionVisible=
      !questionVisible;

    questionText.hidden=
      !questionVisible;

    updateDisplayButtons();
  }
);

/* =========================
   SHOW ANSWERS
========================= */

showAnswersButton.addEventListener(
  "click",
  ()=>{
    answersVisible=
      !answersVisible;

    answersGrid.hidden=
      !answersVisible;

    updateDisplayButtons();
  }
);

/* =========================
   DISPLAY BUTTONS
========================= */

function updateDisplayButtons(){
  showQuestionButton.textContent=
    "Pytanie";

  showAnswersButton.textContent=
    "Odpowiedzi";

  toggleSidebarButton.textContent=
    "Panel boczny";

  showQuestionButton.classList.toggle(
    "active",
    questionVisible
  );

  showAnswersButton.classList.toggle(
    "active",
    answersVisible
  );

  toggleSidebarButton.classList.toggle(
    "active",
    sidebarVisible
  );
}

/* =========================
   INITIALIZE
========================= */

async function initializeGame(){
  initializeSidebar();

  questionVisible=false;
  answersVisible=false;

  questionText.hidden=true;
  answersGrid.hidden=true;

  updateDisplayButtons();

  await Promise.all([
    loadSettings(),
    loadQuestions()
  ]);

  renderPrizeTree();
  updatePrizeTreeActive();
}

initializeGame();