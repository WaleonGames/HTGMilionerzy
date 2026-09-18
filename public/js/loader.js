const titleElement=document.getElementById(
  "loaderTitle"
);

const statusElement=document.getElementById(
  "loaderStatus"
);

const spinnerElement=document.getElementById(
  "loaderSpinner"
);

const actionElement=document.getElementById(
  "loaderAction"
);

const actionTitleElement=document.getElementById(
  "loaderActionTitle"
);

const actionDescriptionElement=document.getElementById(
  "loaderActionDescription"
);

const actionButtonsElement=document.getElementById(
  "loaderActionButtons"
);

const checks={
  storage:document.querySelector(
    '[data-check="storage"]'
  ),

  configuration:document.querySelector(
    '[data-check="configuration"]'
  ),

  questions:document.querySelector(
    '[data-check="questions"]'
  ),

  ready:document.querySelector(
    '[data-check="ready"]'
  )
};

/* =========================
   STATE
========================= */

let actionInProgress=false;

/* =========================
   LOGS
========================= */

function log(
  message,
  data
){
  if(data===undefined){
    console.log(
      `[Loader] ${message}`
    );

    return;
  }

  console.log(
    `[Loader] ${message}`,
    data
  );
}

function logWarn(
  message,
  data
){
  if(data===undefined){
    console.warn(
      `[Loader] ${message}`
    );

    return;
  }

  console.warn(
    `[Loader] ${message}`,
    data
  );
}

function logError(
  message,
  error
){
  console.error(
    `[Loader] ${message}`,
    error
  );
}

/* =========================
   CHECKS
========================= */

function setCheck(
  name,
  state,
  text
){
  const element=
    checks[name];

  if(!element){
    return;
  }

  const icon=
    element.querySelector(
      ".loader-check-icon"
    );

  const label=
    element.querySelector(
      ".loader-check-text"
    );

  element.dataset.state=
    state||"pending";

  log(
    `Etap "${name}" -> ${state||"pending"}`,
    text||null
  );

  if(icon){
    icon.textContent=
      state==="success"
        ? "✓"
        : state==="error"
          ? "✕"
          : state==="loading"
            ? "•"
            : "○";
  }

  if(
    label&&
    text
  ){
    label.textContent=
      text;
  }
}

function resetChecks(){
  Object.keys(checks)
    .forEach(name=>{
      const element=
        checks[name];

      if(!element){
        return;
      }

      const icon=
        element.querySelector(
          ".loader-check-icon"
        );

      element.dataset.state=
        "pending";

      if(icon){
        icon.textContent="○";
      }
    });
}

/* =========================
   TEXT
========================= */

function setStatus(text){
  if(!statusElement){
    return;
  }

  statusElement.textContent=
    String(
      text||""
    );
}

function setTitle(text){
  if(!titleElement){
    return;
  }

  titleElement.textContent=
    String(
      text||
      "Ładowanie"
    );
}

/* =========================
   SPINNER
========================= */

function showSpinner(){
  if(!spinnerElement){
    return;
  }

  spinnerElement.hidden=false;
  spinnerElement.style.display="";
}

function hideSpinner(){
  if(!spinnerElement){
    return;
  }

  spinnerElement.hidden=true;
  spinnerElement.style.display="none";
}

/* =========================
   ACTIONS
========================= */

function clearActions(){
  if(!actionButtonsElement){
    return;
  }

  actionButtonsElement
    .replaceChildren();
}

function setActionButtonsDisabled(
  disabled
){
  if(!actionButtonsElement){
    return;
  }

  actionButtonsElement
    .querySelectorAll("button")
    .forEach(button=>{
      button.disabled=
        disabled;
    });
}

function hideAction(){
  if(!actionElement){
    return;
  }

  actionElement.hidden=true;

  clearActions();
}

function createActionButton(action){
  const button=
    document.createElement(
      "button"
    );

  button.type="button";

  button.className=
    action?.primary===true
      ? "button button-primary"
      : "button button-secondary";

  button.textContent=
    String(
      action?.label||
      "Kontynuuj"
    );

  button.addEventListener(
    "click",
    async()=>{
      if(actionInProgress){
        return;
      }

      if(
        !action?.id||
        !window.millionaireAPI
          ?.loader
          ?.action
      ){
        setStatus(
          "Nie udało się wykonać wybranej operacji."
        );

        return;
      }

      actionInProgress=true;

      log(
        `Uruchamianie akcji "${action.id}"`
      );

      setActionButtonsDisabled(
        true
      );

      showSpinner();

      try{
        const result=
          await window
            .millionaireAPI
            .loader
            .action(
              action.id
            );

        if(
          result?.canceled
        ){
          logWarn(
            `Anulowano akcję "${action.id}"`
          );

          hideSpinner();

          setActionButtonsDisabled(
            false
          );

          actionInProgress=false;

          return;
        }

        if(
          result&&
          result.success===false
        ){
          logWarn(
            `Akcja "${action.id}" zakończyła się niepowodzeniem`,
            result
          );

          hideSpinner();

          setStatus(
            "Nie udało się wykonać wybranej operacji."
          );

          setActionButtonsDisabled(
            false
          );

          actionInProgress=false;
        }
      }catch(error){
        logError(
          `Błąd akcji "${action.id}"`,
          error
        );

        hideSpinner();

        setStatus(
          "Nie udało się wykonać wybranej operacji."
        );

        setActionButtonsDisabled(
          false
        );

        actionInProgress=false;
      }
    }
  );

  return button;
}

function showAction(action){
  if(
    !actionElement||
    !actionButtonsElement
  ){
    return;
  }

  actionInProgress=false;

  log(
    "Wymagane działanie użytkownika",
    {
      title:action?.title||null,
      actions:Array.isArray(action?.actions)
        ? action.actions.map(item=>item.id)
        : []
    }
  );

  clearActions();

  if(actionTitleElement){
    actionTitleElement.textContent=
      String(
        action?.title||
        "Wymagane działanie"
      );
  }

  if(actionDescriptionElement){
    actionDescriptionElement
      .textContent=
        String(
          action?.description||
          ""
        );
  }

  const actions=
    Array.isArray(
      action?.actions
    )
      ? action.actions
      : [];

  actions.forEach(item=>{
    actionButtonsElement
      .appendChild(
        createActionButton(
          item
        )
      );
  });

  actionElement.hidden=false;

  hideSpinner();
}

/* =========================
   BOOTLOADER EVENTS
========================= */

function handleBootloaderStep(step){
  if(
    !step||
    typeof step!=="object"
  ){
    logWarn(
      "Otrzymano nieprawidłowy komunikat bootloadera",
      step
    );

    return;
  }

  log(
    "Otrzymano krok bootloadera",
    {
      type:step.type||"step",
      name:step.name||null,
      state:step.state||null,
      status:step.status||null
    }
  );

  const name=
    step.name;

  const state=
    step.state;

  const text=
    step.text;

  if(
    name&&
    checks[name]
  ){
    setCheck(
      name,
      state,
      text
    );
  }

  if(
    step.type==="action"
  ){
    if(step.title){
      setTitle(
        step.title
      );
    }

    if(step.status){
      setStatus(
        step.status
      );
    }

    showAction(
      step
    );

    return;
  }

  hideAction();

  if(step.title){
    setTitle(
      step.title
    );
  }else if(
    name!=="ready"
  ){
    setTitle(
      "Ładowanie"
    );
  }

  if(step.status){
    setStatus(
      step.status
    );
  }else if(text){
    setStatus(
      text
    );
  }

  if(
    state==="error"
  ){
    logWarn(
      `Etap "${name||"nieznany"}" zgłosił błąd`
    );

    actionInProgress=false;

    hideSpinner();

    return;
  }

  if(
    state==="loading"||
    state==="pending"
  ){
    showSpinner();
  }

  if(
    state==="success"&&
    name!=="ready"
  ){
    showSpinner();
  }

  if(
    name==="ready"&&
    state==="success"
  ){
    log(
      "Proces ładowania zakończony pomyślnie"
    );

    actionInProgress=false;

    setTitle(
      step.title||
      "Gotowe"
    );

    setStatus(
      step.status||
      "Program jest gotowy do uruchomienia."
    );

    hideSpinner();
  }
}

/* =========================
   START
========================= */

function startLoader(){
  log(
    "Uruchamianie interfejsu loadera"
  );

  if(
    !window.millionaireAPI||
    !window.millionaireAPI.loader||
    typeof window
      .millionaireAPI
      .loader
      .onStep!=="function"
  ){
    logError(
      "API loadera jest niedostępne",
      new Error(
        "window.millionaireAPI.loader.onStep jest niedostępne"
      )
    );

    setTitle(
      "Błąd uruchamiania"
    );

    setStatus(
      "Nie udało się uruchomić modułu ładowania."
    );

    hideSpinner();

    return;
  }

  resetChecks();

  setTitle(
    "Ładowanie"
  );

  setStatus(
    "Przygotowywanie aplikacji..."
  );

  hideAction();
  showSpinner();

  window.millionaireAPI
    .loader
    .onStep(
      handleBootloaderStep
    );

  log(
    "Nasłuchiwanie komunikatów bootloadera aktywne"
  );
}

startLoader();
