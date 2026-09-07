const openControlsButton=
  document.getElementById("openControlsButton");

const closeControlsButton=
  document.getElementById("closeControlsButton");

const detachControlsButton=
  document.getElementById("detachControlsButton");

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

const answerConfirmHint=
  document.getElementById("answerConfirmHint");

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
   LIFELINES
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
const ANSWER_CONFIRM_DELAY=2000;

/* =========================
   STATE
========================= */

let questions=[];
let gameQuestions=[];
let settings=null;

let currentQuestionIndex=0;
let currentSelectedAnswer=null;

let mainPanelVisible=false;
let questionVisible=false;
let answersVisible=false;
let sidebarVisible=false;

let visibleAnswerCount=0;

let answerChecked=false;
let currentAnswerCorrect=false;
let gameFailed=false;

let answerConfirmReady=false;
let answerConfirmTimeout=null;
let answerConfirmInterval=null;

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
   DETACH CONTROLS
========================= */

detachControlsButton?.addEventListener(
  "click",
  async()=>{
    if(
      !window.millionaireAPI?.game
        ?.openControlsWindow
    ){
      console.error(
        "Brak API do otwierania osobnego okna sterowania."
      );

      return;
    }

    try{
      detachControlsButton.disabled=true;

      await window.millionaireAPI
        .game
        .openControlsWindow();

      closeControls();
    }catch(error){
      console.error(
        "Nie udało się otworzyć okna sterowania:",
        error
      );
    }finally{
      detachControlsButton.disabled=false;
    }
  }
);

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

  clearAnswerConfirmation();

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

      const currentQuestion=
        gameQuestions[
          currentQuestionIndex
        ];

      const currentLevel=
        Number(
          currentQuestion?.level
        )||
        currentQuestionIndex+1;

      if(
        levelNumber===
        currentLevel
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
  const question=
    gameQuestions[
      currentQuestionIndex
    ];

  const currentLevel=
    Number(
      question?.level
    )||
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
    new Intl.NumberFormat(
      "pl-PL"
    ).format(value)
  } ${currency}`;
}

/* =========================
   PREPARE GAME QUESTIONS
========================= */

function prepareGameQuestions(){
  const randomQuestions=
    settings?.general?.randomQuestions===true;

  const randomAnswers=
    settings?.general?.randomAnswers===true;

  const activeQuestions=
    questions.filter(question=>{
      return question.active!==false;
    });

  const prepared=[];

  const maxLevel=
    Number(
      settings?.general?.questionsCount
    )||12;

  for(
    let level=1;
    level<=maxLevel;
    level++
  ){
    const pool=
      activeQuestions.filter(question=>{
        return Number(
          question.level
        )===level;
      });

    if(!pool.length){
      console.warn(
        `Brak aktywnych pytań dla poziomu ${level}.`
      );

      continue;
    }

    const selectedQuestion=
      randomQuestions
        ? pool[
            Math.floor(
              Math.random()*pool.length
            )
          ]
        : pool[0];

    let preparedQuestion=
      structuredClone(
        selectedQuestion
      );

    if(randomAnswers){
      preparedQuestion=
        shuffleQuestionAnswers(
          preparedQuestion
        );
    }

    prepared.push(
      preparedQuestion
    );
  }

  gameQuestions=prepared;
}

/* =========================
   SHUFFLE ANSWERS
========================= */

function shuffleQuestionAnswers(question){
  const letters=[
    "A",
    "B",
    "C",
    "D"
  ];

  const entries=
    letters.map(letter=>{
      return{
        originalLetter:letter,
        text:
          question.answers?.[letter]||""
      };
    });

  shuffleArray(entries);

  const answers={};
  let correctAnswer="";

  entries.forEach((entry,index)=>{
    const newLetter=
      letters[index];

    answers[newLetter]=
      entry.text;

    if(
      entry.originalLetter===
      question.correctAnswer
    ){
      correctAnswer=
        newLetter;
    }
  });

  return{
    ...question,
    answers,
    correctAnswer
  };
}

function shuffleArray(array){
  for(
    let i=array.length-1;
    i>0;
    i--
  ){
    const j=
      Math.floor(
        Math.random()*(i+1)
      );

    [
      array[i],
      array[j]
    ]=[
      array[j],
      array[i]
    ];
  }

  return array;
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

    prepareGameQuestions();

    if(!gameQuestions.length){
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
    gameQuestions=[];

    showEmptyQuestion();
  }
}

/* =========================
   LOAD CURRENT QUESTION
========================= */

function loadCurrentQuestion(){
  const question=
    gameQuestions[
      currentQuestionIndex
    ];

  if(!question){
    showEmptyQuestion();
    return;
  }

  resetQuestionState();

  const level=
    Number(
      question.level
    )||
    currentQuestionIndex+1;

  questionNumber.textContent=
    `Pytanie ${level}`;

  questionProgress.textContent=
    `${currentQuestionIndex+1} / ${gameQuestions.length}`;

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

  updatePrizeTreeActive();
}

/* =========================
   RESET QUESTION
========================= */

function resetQuestionState(){
  clearAnswerConfirmation();

  currentSelectedAnswer=null;

  mainPanelVisible=false;
  questionVisible=false;
  answersVisible=false;

  visibleAnswerCount=0;

  answerChecked=false;
  currentAnswerCorrect=false;
  gameFailed=false;

  questionText.hidden=true;
  answersGrid.hidden=true;

  questionText.textContent="";

  answerTextA.textContent="";
  answerTextB.textContent="";
  answerTextC.textContent="";
  answerTextD.textContent="";

  selectedAnswer.textContent=
    "Brak";

  if(answerConfirmHint){
    answerConfirmHint.textContent=
      "Wybierz odpowiedź.";
  }

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

  showAnswersButton.textContent=
    "Odpowiedzi";

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
      "confirm-ready",
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

  questionText.hidden=false;
  answersGrid.hidden=false;

  questionText.textContent="";

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

  updateShowAnswersButton();
});

/* =========================
   SHOW ANSWERS
========================= */

showAnswersButton.addEventListener("click",()=>{
  if(
    !questionVisible||
    visibleAnswerCount>=4
  ){
    return;
  }

  const answers=[
    {
      element:answerTextA,
      value:answerTextA.dataset.value
    },
    {
      element:answerTextB,
      value:answerTextB.dataset.value
    },
    {
      element:answerTextC,
      value:answerTextC.dataset.value
    },
    {
      element:answerTextD,
      value:answerTextD.dataset.value
    }
  ];

  const current=
    answers[visibleAnswerCount];

  current.element.textContent=
    current.value||"";

  visibleAnswerCount++;

  updateShowAnswersButton();

  if(visibleAnswerCount===4){
    answersVisible=true;

    showAnswersButton.disabled=true;

    showAnswersButton.classList.remove(
      "game-button-primary"
    );

    showAnswersButton.classList.add(
      "active"
    );

    enableHostAnswers();
  }
});

function updateShowAnswersButton(){
  const labels=[
    "Pokaż A",
    "Pokaż B",
    "Pokaż C",
    "Pokaż D"
  ];

  if(visibleAnswerCount>=4){
    showAnswersButton.textContent=
      "Odpowiedzi";

    return;
  }

  showAnswersButton.textContent=
    labels[visibleAnswerCount];
}

/* =========================
   ENABLE HOST ANSWERS
========================= */

function enableHostAnswers(){
  if(answerChecked){
    return;
  }

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
      getHostAnswerValue(button);

    if(!answer){
      return;
    }

    if(
      currentSelectedAnswer===answer&&
      answerConfirmReady
    ){
      checkAnswer(answer);

      return;
    }

    selectHostAnswer(
      answer,
      button
    );

    startAnswerConfirmationDelay();
  });
});

function getHostAnswerValue(button){
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
    return null;
  }

  return answer;
}

function selectHostAnswer(
  answer,
  hostButton
){
  clearAnswerConfirmation();

  currentSelectedAnswer=
    answer;

  selectedAnswer.textContent=
    answer;

  if(answerConfirmHint){
    answerConfirmHint.textContent=
      "Przygotowanie do potwierdzenia...";
  }

  hostAnswerButtons.forEach(button=>{
    button.classList.remove(
      "selected",
      "confirm-ready"
    );
  });

  answerElements.forEach(answerElement=>{
    answerElement.classList.remove(
      "selected"
    );
  });

  hostButton.classList.add(
    "selected"
  );

  const screenAnswer=
    getScreenAnswer(answer);

  if(screenAnswer){
    screenAnswer.classList.add(
      "selected"
    );
  }
}

function startAnswerConfirmationDelay(){
  answerConfirmReady=false;

  clearTimeout(
    answerConfirmTimeout
  );

  clearInterval(
    answerConfirmInterval
  );

  let remaining=
    Math.ceil(
      ANSWER_CONFIRM_DELAY/1000
    );

  if(answerConfirmHint){
    answerConfirmHint.textContent=
      `Poczekaj ${remaining} s...`;
  }

  answerConfirmInterval=setInterval(()=>{
    remaining--;

    if(
      remaining>0&&
      answerConfirmHint
    ){
      answerConfirmHint.textContent=
        `Poczekaj ${remaining} s...`;
    }
  },1000);

  answerConfirmTimeout=setTimeout(()=>{
    clearInterval(
      answerConfirmInterval
    );

    answerConfirmInterval=null;
    answerConfirmTimeout=null;

    answerConfirmReady=true;

    if(answerConfirmHint){
      answerConfirmHint.textContent=
        "Kliknij ponownie tę samą odpowiedź, aby potwierdzić.";
    }

    const button=
      getHostAnswerButton(
        currentSelectedAnswer
      );

    if(button){
      button.classList.add(
        "confirm-ready"
      );
    }
  },ANSWER_CONFIRM_DELAY);
}

function clearAnswerConfirmation(){
  clearTimeout(
    answerConfirmTimeout
  );

  clearInterval(
    answerConfirmInterval
  );

  answerConfirmTimeout=null;
  answerConfirmInterval=null;
  answerConfirmReady=false;

  hostAnswerButtons.forEach(button=>{
    button.classList.remove(
      "confirm-ready"
    );
  });
}

/* =========================
   CHECK ANSWER
========================= */

function checkAnswer(selected){
  if(
    answerChecked||
    !answerConfirmReady||
    selected!==currentSelectedAnswer
  ){
    return;
  }

  const question=
    gameQuestions[
      currentQuestionIndex
    ];

  if(!question){
    return;
  }

  clearAnswerConfirmation();

  const correctAnswer=
    String(
      question.correctAnswer||""
    )
      .trim()
      .toUpperCase();

  answerChecked=true;

  hostAnswerButtons.forEach(button=>{
    button.disabled=true;

    button.classList.remove(
      "selected",
      "confirm-ready",
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

  const selectedHostButton=
    getHostAnswerButton(
      selected
    );

  if(selected===correctAnswer){
    handleCorrectAnswer(
      correctAnswer,
      selectedHostButton
    );

    return;
  }

  handleWrongAnswer(
    selected,
    correctAnswer,
    selectedHostButton
  );
}

/* =========================
   CORRECT
========================= */

function handleCorrectAnswer(
  correctAnswer,
  hostButton
){
  currentAnswerCorrect=true;
  gameFailed=false;

  if(hostButton){
    hostButton.classList.add(
      "correct"
    );
  }

  const screenAnswer=
    getScreenAnswer(
      correctAnswer
    );

  if(screenAnswer){
    screenAnswer.classList.add(
      "correct"
    );
  }

  if(answerConfirmHint){
    answerConfirmHint.textContent=
      "Odpowiedź została potwierdzona.";
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
      gameQuestions.length-1;
}

/* =========================
   WRONG
========================= */

function handleWrongAnswer(
  selected,
  correctAnswer,
  hostButton
){
  currentAnswerCorrect=false;
  gameFailed=true;

  if(hostButton){
    hostButton.classList.add(
      "wrong"
    );
  }

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

  if(answerConfirmHint){
    answerConfirmHint.textContent=
      "Odpowiedź została potwierdzona.";
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
   HELPERS
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
    gameQuestions.length-1
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
  clearAnswerConfirmation();

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

  if(answerConfirmHint){
    answerConfirmHint.textContent=
      "Brak dostępnego pytania.";
  }

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

    button.classList.remove(
      "selected",
      "confirm-ready",
      "correct",
      "wrong"
    );
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

  await loadSettings();
  await loadQuestions();

  renderPrizeTree();
  updatePrizeTreeActive();
}

initializeGame();