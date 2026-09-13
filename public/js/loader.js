const statusElement=document.getElementById(
  "loader-status"
);

const spinnerElement=document.getElementById(
  "loader-spinner"
);

const checks={
  executable:document.querySelector(
    '[data-check="executable"]'
  ),

  application:document.querySelector(
    '[data-check="application"]'
  ),

  data:document.querySelector(
    '[data-check="data"]'
  )
};

function setCheck(
  name,
  state,
  text
){
  const element=checks[name];

  if(!element){
    return;
  }

  const icon=element.querySelector(
    ".loader-check-icon"
  );

  const label=element.querySelector(
    ".loader-check-text"
  );

  element.dataset.state=state;

  if(icon){
    icon.textContent=
      state==="success"
        ? "✓"
        : state==="error"
          ? "✕"
          : "○";
  }

  if(label&&text){
    label.textContent=text;
  }
}

function setStatus(text){
  if(statusElement){
    statusElement.textContent=text;
  }
}

function handleBootloaderStep(step){
  if(!step){
    return;
  }

  const name=step.name;
  const state=step.state;
  const text=step.text;

  if(name){
    setCheck(
      name,
      state,
      text
    );
  }

  if(text){
    setStatus(text);
  }

  if(
    state==="error"&&
    spinnerElement
  ){
    spinnerElement.style.display="none";
  }
}

function startLoader(){
  if(
    !window.millionaireAPI||
    !window.millionaireAPI.loader||
    !window.millionaireAPI.loader.onStep
  ){
    setStatus(
      "Nie udało się uruchomić modułu ładowania."
    );

    if(spinnerElement){
      spinnerElement.style.display="none";
    }

    return;
  }

  window.millionaireAPI.loader.onStep(
    handleBootloaderStep
  );
}

startLoader();