const startGameButton=
  document.getElementById(
    "startGameButton"
  );

const questionsButton=
  document.getElementById(
    "questionsButton"
  );

const settingsButton=
  document.getElementById(
    "settingsButton"
  );

const exitButton=
  document.getElementById(
    "exitButton"
  );

/* =========================
   INFORMATION
========================= */

const authorsButton=
  document.getElementById(
    "authorsButton"
  );

const versionButton=
  document.getElementById(
    "versionButton"
  );

const githubButton=
  document.getElementById(
    "githubButton"
  );

const feedbackButton=
  document.getElementById(
    "feedbackButton"
  );

/* =========================
   GAME BLOCKED MODAL
========================= */

const gameBlockedModal=
  document.getElementById(
    "gameBlockedModal"
  );

const closeGameBlockedModalButton=
  document.getElementById(
    "closeGameBlockedModalButton"
  );

const cancelGameBlockedModalButton=
  document.getElementById(
    "cancelGameBlockedModalButton"
  );

const goToQuestionsButton=
  document.getElementById(
    "goToQuestionsButton"
  );

let canStartGame=false;

/* =========================
   CHECK GAME
========================= */

async function checkGameAvailability(){
  try{
    const questions=
      await window
        .millionaireAPI
        .questions
        .get();

    if(
      !Array.isArray(questions)||
      questions.length===0
    ){
      canStartGame=false;

      setStartGameUnavailable();

      return;
    }

    const hasFirstLevelQuestion=
      questions.some(
        question=>{
          return(
            Number(
              question?.level
            )===1&&
            question?.active!==false
          );
        }
      );

    canStartGame=
      hasFirstLevelQuestion;

    if(canStartGame){
      setStartGameAvailable();
    }else{
      setStartGameUnavailable();
    }
  }catch(error){
    console.error(
      "Błąd sprawdzania pytań:",
      error
    );

    canStartGame=false;

    setStartGameUnavailable();
  }
}

/* =========================
   START BUTTON STATE
========================= */

function setStartGameAvailable(){
  if(!startGameButton){
    return;
  }

  startGameButton
    .classList
    .remove(
      "action-card-unavailable"
    );

  startGameButton
    .removeAttribute(
      "aria-disabled"
    );

  const description=
    startGameButton
      .querySelector(
        ".action-card-description"
      );

  if(description){
    description.textContent=
      "Uruchom nową rozgrywkę.";
  }
}

function setStartGameUnavailable(){
  if(!startGameButton){
    return;
  }

  startGameButton
    .classList
    .add(
      "action-card-unavailable"
    );

  startGameButton
    .setAttribute(
      "aria-disabled",
      "true"
    );

  const description=
    startGameButton
      .querySelector(
        ".action-card-description"
      );

  if(description){
    description.textContent=
      "Najpierw dodaj pytanie poziomu 1.";
  }
}

/* =========================
   START GAME
========================= */

startGameButton
  ?.addEventListener(
    "click",
    async()=>{
      await checkGameAvailability();

      if(!canStartGame){
        openGameBlockedModal();

        return;
      }

      window.location.href=
        "game.html";
    }
  );

/* =========================
   NAVIGATION
========================= */

questionsButton
  ?.addEventListener(
    "click",
    ()=>{
      window.location.href=
        "questions.html";
    }
  );

settingsButton
  ?.addEventListener(
    "click",
    ()=>{
      window.location.href=
        "settings.html";
    }
  );

/* =========================
   AUTHORS
========================= */

authorsButton
  ?.addEventListener(
    "click",
    ()=>{
      window.location.href=
        "authors.html";
    }
  );

/* =========================
   VERSION
========================= */

versionButton
  ?.addEventListener(
    "click",
    ()=>{
      window.location.href=
        "version.html";
    }
  );

/* =========================
   EXTERNAL LINKS
========================= */

githubButton
  ?.addEventListener(
    "click",
    async()=>{
      try{
        const opened=
          await window
            .millionaireAPI
            ?.links
            ?.openGitHub?.();

        if(opened===false){
          console.warn(
            "Nie udało się otworzyć GitHub."
          );
        }
      }catch(error){
        console.error(
          "Błąd otwierania GitHub:",
          error
        );
      }
    }
  );

feedbackButton
  ?.addEventListener(
    "click",
    async()=>{
      try{
        const opened=
          await window
            .millionaireAPI
            ?.links
            ?.openFeedback?.();

        if(opened===false){
          console.warn(
            "Nie udało się otworzyć formularza."
          );
        }
      }catch(error){
        console.error(
          "Błąd otwierania formularza:",
          error
        );
      }
    }
  );

/* =========================
   EXIT
========================= */

exitButton
  ?.addEventListener(
    "click",
    ()=>{
      window.close();
    }
  );

/* =========================
   MODAL
========================= */

function openGameBlockedModal(){
  if(!gameBlockedModal){
    return;
  }

  gameBlockedModal.hidden=false;
}

function closeGameBlockedModal(){
  if(!gameBlockedModal){
    return;
  }

  gameBlockedModal.hidden=true;
}

closeGameBlockedModalButton
  ?.addEventListener(
    "click",
    closeGameBlockedModal
  );

cancelGameBlockedModalButton
  ?.addEventListener(
    "click",
    closeGameBlockedModal
  );

gameBlockedModal
  ?.addEventListener(
    "click",
    event=>{
      if(
        event.target===
        gameBlockedModal
      ){
        closeGameBlockedModal();
      }
    }
  );

document.addEventListener(
  "keydown",
  event=>{
    if(
      event.key==="Escape"&&
      gameBlockedModal&&
      !gameBlockedModal.hidden
    ){
      closeGameBlockedModal();
    }
  }
);

goToQuestionsButton
  ?.addEventListener(
    "click",
    ()=>{
      window.location.href=
        "questions.html";
    }
  );

/* =========================
   INITIALIZE
========================= */

checkGameAvailability();