const attachControlsButton=
  document.getElementById("attachControlsButton");

const toggleSidebarButton=
  document.getElementById("toggleSidebarButton");

const lifeline5050Button=
  document.getElementById("lifeline5050Button");

const lifelineAudienceButton=
  document.getElementById("lifelineAudienceButton");

const showMainPanelButton=
  document.getElementById("showMainPanelButton");

const showQuestionButton=
  document.getElementById("showQuestionButton");

const showAnswersButton=
  document.getElementById("showAnswersButton");

const nextQuestionButton=
  document.getElementById("nextQuestionButton");

const exitGameButton=
  document.getElementById("exitGameButton");

const selectedAnswer=
  document.getElementById("selectedAnswer");

const answerConfirmHint=
  document.getElementById("answerConfirmHint");

const answerResult=
  document.getElementById("answerResult");

const resultBox=
  document.querySelector(".game-result");

const hostAnswerButtons=[
  ...document.querySelectorAll(
    ".game-host-answer"
  )
];

let currentState=null;

/* =========================
   ATTACH
========================= */

attachControlsButton.addEventListener(
  "click",
  async()=>{
    await window.millionaireAPI
      .game
      .attachControls();

    window.close();
  }
);

/* =========================
   SIDEBAR
========================= */

toggleSidebarButton.addEventListener(
  "click",
  ()=>{
    sendAction(
      "toggle-sidebar"
    );
  }
);

/* =========================
   LIFELINES
========================= */

lifeline5050Button.addEventListener(
  "click",
  ()=>{
    sendAction(
      "lifeline-5050"
    );
  }
);

lifelineAudienceButton.addEventListener(
  "click",
  ()=>{
    sendAction(
      "lifeline-audience"
    );
  }
);

/* =========================
   MAIN PANEL
========================= */

showMainPanelButton.addEventListener(
  "click",
  ()=>{
    sendAction(
      "show-main-panel"
    );
  }
);

showQuestionButton.addEventListener(
  "click",
  ()=>{
    sendAction(
      "show-question"
    );
  }
);

showAnswersButton.addEventListener(
  "click",
  ()=>{
    sendAction(
      "show-answer"
    );
  }
);

/* =========================
   HOST ANSWERS
========================= */

hostAnswerButtons.forEach(button=>{
  button.addEventListener(
    "click",
    ()=>{
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

      sendAction(
        "select-answer",
        {
          answer
        }
      );
    }
  );
});

/* =========================
   NEXT QUESTION
========================= */

nextQuestionButton.addEventListener(
  "click",
  ()=>{
    sendAction(
      "next-question"
    );
  }
);

/* =========================
   EXIT GAME
========================= */

exitGameButton.addEventListener(
  "click",
  ()=>{
    sendAction(
      "exit-game"
    );
  }
);

/* =========================
   SEND ACTION
========================= */

async function sendAction(
  action,
  payload={}
){
  try{
    await window.millionaireAPI
      .game
      .sendControlsAction(
        action,
        payload
      );
  }catch(error){
    console.error(
      "Błąd wysyłania akcji:",
      error
    );
  }
}

/* =========================
   STATE
========================= */

function applyState(state){
  if(!state){
    return;
  }

  currentState=state;

  /* =========================
     SIDEBAR
  ========================= */

  toggleSidebarButton.classList.toggle(
    "active",
    state.sidebarVisible===true
  );

  /* =========================
     MAIN PANEL
  ========================= */

  showMainPanelButton.disabled=
    state.mainPanelVisible===true||
    state.gameFailed===true;

  showMainPanelButton.classList.toggle(
    "active",
    state.mainPanelVisible===true
  );

  showMainPanelButton.classList.toggle(
    "game-button-primary",
    state.mainPanelVisible!==true
  );

  /* =========================
     QUESTION
  ========================= */

  showQuestionButton.disabled=
    state.mainPanelVisible!==true||
    state.questionVisible===true||
    state.gameFailed===true;

  showQuestionButton.classList.toggle(
    "active",
    state.questionVisible===true
  );

  showQuestionButton.classList.toggle(
    "game-button-primary",
    state.mainPanelVisible===true&&
    state.questionVisible!==true&&
    state.gameFailed!==true
  );

  /* =========================
     ANSWERS DISPLAY
  ========================= */

  const visibleAnswerCount=
    Number(
      state.visibleAnswerCount||0
    );

  const answerLabels=[
    "Pokaż A",
    "Pokaż B",
    "Pokaż C",
    "Pokaż D"
  ];

  showAnswersButton.disabled=
    state.questionVisible!==true||
    visibleAnswerCount>=4||
    state.gameFailed===true;

  if(visibleAnswerCount>=4){
    showAnswersButton.textContent=
      "Odpowiedzi";
  }else{
    showAnswersButton.textContent=
      answerLabels[
        visibleAnswerCount
      ]||"Odpowiedzi";
  }

  showAnswersButton.classList.toggle(
    "active",
    visibleAnswerCount>=4
  );

  showAnswersButton.classList.toggle(
    "game-button-primary",
    state.questionVisible===true&&
    visibleAnswerCount<4&&
    state.gameFailed!==true
  );

  /* =========================
     HOST ANSWERS
  ========================= */

  hostAnswerButtons.forEach(button=>{
    const answer=
      button.dataset.hostAnswer;

    button.disabled=
      state.answersVisible!==true||
      state.answerChecked===true||
      state.gameFailed===true;

    button.classList.remove(
      "selected",
      "confirm-ready",
      "correct",
      "wrong"
    );

    if(
      state.currentSelectedAnswer===
      answer
    ){
      button.classList.add(
        "selected"
      );
    }

    if(
      state.answerConfirmReady===true&&
      state.currentSelectedAnswer===
      answer
    ){
      button.classList.add(
        "confirm-ready"
      );
    }

    if(
      state.answerChecked===true&&
      state.correctAnswer===answer
    ){
      button.classList.add(
        "correct"
      );
    }

    if(
      state.answerChecked===true&&
      state.currentAnswerCorrect===false&&
      state.currentSelectedAnswer===
      answer
    ){
      button.classList.add(
        "wrong"
      );
    }
  });

  /* =========================
     SELECTED ANSWER
  ========================= */

  selectedAnswer.textContent=
    state.currentSelectedAnswer||
    "Brak";

  /* =========================
     CONFIRM HINT
  ========================= */

  answerConfirmHint.textContent=
    state.answerConfirmHint||
    "Wybierz odpowiedź.";

  /* =========================
     RESULT
  ========================= */

  answerResult.textContent=
    state.answerResult||
    "Oczekiwanie";

  resultBox.classList.remove(
    "success",
    "error"
  );

  if(
    state.answerChecked===true&&
    state.currentAnswerCorrect===true
  ){
    resultBox.classList.add(
      "success"
    );
  }

  if(
    state.answerChecked===true&&
    state.currentAnswerCorrect===false
  ){
    resultBox.classList.add(
      "error"
    );
  }

  /* =========================
     NEXT QUESTION
  ========================= */

  nextQuestionButton.disabled=
    !(
      state.answerChecked===true&&
      state.currentAnswerCorrect===true&&
      state.hasNextQuestion===true
    );
}

/* =========================
   INITIAL STATE
========================= */

async function loadInitialState(){
  try{
    const state=
      await window.millionaireAPI
        .game
        .getState();

    applyState(state);
  }catch(error){
    console.error(
      "Błąd pobierania stanu gry:",
      error
    );
  }
}

/* =========================
   LIVE STATE
========================= */

window.millionaireAPI
  .game
  .onStateChanged(
    state=>{
      applyState(state);
    }
  );

/* =========================
   INITIALIZE
========================= */

loadInitialState();