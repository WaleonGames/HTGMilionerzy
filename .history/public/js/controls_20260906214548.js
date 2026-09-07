const attachControlsButton=
  document.getElementById("attachControlsButton");

const toggleSidebarButton=
  document.getElementById("toggleSidebarButton");

const lifeline5050Button=
  document.getElementById("lifeline5050Button");

const lifelineAudienceButton=
  document.getElementById("lifelineAudienceButton");

const lifelineHostButton=
  document.getElementById("lifelineHostButton");

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

attachControlsButton?.addEventListener(
  "click",
  async()=>{
    try{
      await window.millionaireAPI
        .game
        .attachControls();
    }catch(error){
      console.error(
        "Błąd przywracania sterowania:",
        error
      );
    }
  }
);

/* =========================
   SIDEBAR
========================= */

toggleSidebarButton?.addEventListener(
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

lifeline5050Button?.addEventListener(
  "click",
  ()=>{
    sendAction(
      "lifeline-5050"
    );
  }
);

lifelineAudienceButton?.addEventListener(
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

showMainPanelButton?.addEventListener(
  "click",
  ()=>{
    sendAction(
      "show-main-panel"
    );
  }
);

showQuestionButton?.addEventListener(
  "click",
  ()=>{
    sendAction(
      "show-question"
    );
  }
);

showAnswersButton?.addEventListener(
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

nextQuestionButton?.addEventListener(
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

exitGameButton?.addEventListener(
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
    const sent=
      await window.millionaireAPI
        .game
        .sendControlsAction(
          action,
          payload
        );

    if(sent===false){
      console.warn(
        "Okno gry nie jest dostępne."
      );
    }
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
    disableInterface();
    return;
  }

  currentState=state;

  /* =========================
     SIDEBAR
  ========================= */

  toggleSidebarButton.disabled=
    false;

  toggleSidebarButton.classList.toggle(
    "active",
    state.sidebarVisible===true
  );

  /* =========================
     LIFELINES
  ========================= */

  lifeline5050Button.disabled=
    false;

  lifelineAudienceButton.disabled=
    false;

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
    state.mainPanelVisible!==true&&
    state.gameFailed!==true
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

  showAnswersButton.textContent=
    visibleAnswerCount>=4
      ? "Odpowiedzi"
      : answerLabels[
          visibleAnswerCount
        ]||"Odpowiedzi";

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
      String(
        button.dataset.hostAnswer||""
      )
        .trim()
        .toUpperCase();

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

  /* =========================
     EXIT
  ========================= */

  exitGameButton.disabled=false;
}

/* =========================
   DISABLE INTERFACE
========================= */

function disableInterface(){
  currentState=null;

  toggleSidebarButton.disabled=true;

  lifeline5050Button.disabled=true;
  lifelineAudienceButton.disabled=true;

  showMainPanelButton.disabled=true;
  showQuestionButton.disabled=true;
  showAnswersButton.disabled=true;

  hostAnswerButtons.forEach(button=>{
    button.disabled=true;

    button.classList.remove(
      "selected",
      "confirm-ready",
      "correct",
      "wrong"
    );
  });

  nextQuestionButton.disabled=true;
  exitGameButton.disabled=true;

  selectedAnswer.textContent=
    "Brak";

  answerConfirmHint.textContent=
    "Brak aktywnej rozgrywki.";

  answerResult.textContent=
    "Brak rozgrywki";

  resultBox.classList.remove(
    "success",
    "error"
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

    if(state){
      applyState(state);
    }else{
      disableInterface();
    }

    if(
      window.millionaireAPI
        .game
        .requestState
    ){
      await window.millionaireAPI
        .game
        .requestState();
    }
  }catch(error){
    console.error(
      "Błąd pobierania stanu gry:",
      error
    );

    disableInterface();
  }
}

/* =========================
   LIVE STATE
========================= */

window.millionaireAPI
  .game
  .onStateChanged(
    state=>{
      if(state){
        applyState(state);
      }else{
        disableInterface();
      }
    }
  );

/* =========================
   INITIALIZE
========================= */

disableInterface();
loadInitialState();