const openControlsButton=
  document.getElementById(
    "openControlsButton"
  );

const closeControlsButton=
  document.getElementById(
    "closeControlsButton"
  );

const detachControlsButton=
  document.getElementById(
    "detachControlsButton"
  );

const controlsPanel=
  document.getElementById(
    "controlsPanel"
  );

const controlsBackdrop=
  document.getElementById(
    "controlsBackdrop"
  );

const exitGameButton=
  document.getElementById(
    "exitGameButton"
  );

const controlToggleSidebarButton=
  document.getElementById(
    "toggleSidebarButton"
  );

const lifeline5050Button=
  document.getElementById(
    "lifeline5050Button"
  );

const lifelineAudienceButton=
  document.getElementById(
    "lifelineAudienceButton"
  );

const lifelineHostButton=
  document.getElementById(
    "lifelineHostButton"
  );

const controlShowMainPanelButton=
  document.getElementById(
    "showMainPanelButton"
  );

const controlShowQuestionButton=
  document.getElementById(
    "showQuestionButton"
  );

const controlShowAnswersButton=
  document.getElementById(
    "showAnswersButton"
  );

const controlNextQuestionButton=
  document.getElementById(
    "nextQuestionButton"
  );

const controlHostAnswerButtons=[
  ...document.querySelectorAll(
    ".game-host-answer"
  )
];

/* =========================
   OFFCANVAS
========================= */

function openControls(){
  controlsPanel?.classList.add(
    "open"
  );

  controlsPanel?.setAttribute(
    "aria-hidden",
    "false"
  );

  if(controlsBackdrop){
    controlsBackdrop.hidden=false;
  }
}

function closeControls(){
  controlsPanel?.classList.remove(
    "open"
  );

  controlsPanel?.setAttribute(
    "aria-hidden",
    "true"
  );

  if(controlsBackdrop){
    controlsBackdrop.hidden=true;
  }
}

/* =========================
   LOCAL CONTROLS
========================= */

openControlsButton?.addEventListener(
  "click",
  openControls
);

closeControlsButton?.addEventListener(
  "click",
  closeControls
);

controlsBackdrop?.addEventListener(
  "click",
  closeControls
);

document.addEventListener(
  "keydown",
  event=>{
    if(event.key==="Escape"){
      closeControls();
    }
  }
);

controlToggleSidebarButton
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "toggle-sidebar"
      );
    }
  );

lifeline5050Button
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "lifeline-5050"
      );
    }
  );

lifelineAudienceButton
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "lifeline-audience"
      );
    }
  );

lifelineHostButton
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "lifeline-host"
      );
    }
  );

controlShowMainPanelButton
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "show-main-panel"
      );
    }
  );

controlShowQuestionButton
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "show-question"
      );
    }
  );

controlShowAnswersButton
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "show-answer"
      );
    }
  );

controlNextQuestionButton
  ?.addEventListener(
    "click",
    ()=>{
      executeGameAction(
        "next-question"
      );
    }
  );

exitGameButton?.addEventListener(
  "click",
  ()=>{
    executeGameAction(
      "exit-game"
    );
  }
);

controlHostAnswerButtons.forEach(
  button=>{
    button.addEventListener(
      "click",
      ()=>{
        executeGameAction(
          "select-answer",
          {
            answer:
              button.dataset
                .hostAnswer
          }
        );
      }
    );
  }
);

/* =========================
   EXECUTE
========================= */

function executeGameAction(
  action,
  payload={}
){
  if(
    !window.MillionaireGame
      ?.executeControlAction
  ){
    console.error(
      "MillionaireGame nie jest jeszcze dostępne."
    );

    return;
  }

  window.MillionaireGame
    .executeControlAction(
      action,
      payload
    );
}

/* =========================
   DETACH CONTROLS
========================= */

detachControlsButton
  ?.addEventListener(
    "click",
    async()=>{
      if(
        !window
          .millionaireAPI
          ?.game
          ?.openControlsWindow
      ){
        console.error(
          "Brak API do otwierania osobnego okna sterowania."
        );

        return;
      }

      try{
        detachControlsButton
          .disabled=true;

        window
          .MillionaireGame
          ?.publishState?.();

        await window
          .millionaireAPI
          .game
          .openControlsWindow();

        closeControls();
      }catch(error){
        console.error(
          "Nie udało się otworzyć okna sterowania:",
          error
        );
      }finally{
        detachControlsButton
          .disabled=false;
      }
    }
  );

/* =========================
   EXTERNAL CONTROLS
========================= */

window
  .millionaireAPI
  ?.game
  ?.onControlsAction?.(
    (
      action,
      payload
    )=>{
      executeGameAction(
        action,
        payload||{}
      );
    }
  );

/* =========================
   REQUEST STATE
========================= */

window
  .millionaireAPI
  ?.game
  ?.onRequestState?.(
    ()=>{
      window
        .MillionaireGame
        ?.publishState?.();
    }
  );

/* =========================
   CONTROLS ATTACHED
========================= */

window
  .millionaireAPI
  ?.game
  ?.onControlsAttached?.(
    ()=>{
      window
        .MillionaireGame
        ?.publishState?.();
    }
  );

/* =========================
   PUBLIC API
========================= */

window.MillionaireGameControls={
  open:openControls,
  close:closeControls,
  execute:executeGameAction
};