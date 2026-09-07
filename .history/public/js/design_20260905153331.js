document.addEventListener("DOMContentLoaded",()=>{
  initializeDesign();
});

function initializeDesign(){
  document.documentElement.dataset.design="white";
  document.body.classList.add("design-loaded");

  normalizeButtons();
  normalizeInputs();
  normalizeCards();
  normalizeModals();
}

function normalizeButtons(){
  document.querySelectorAll("button").forEach(button=>{
    if(
      button.classList.contains("button-primary")||
      button.classList.contains("primary")||
      button.classList.contains("delete-button")||
      button.classList.contains("danger")
    ){
      return;
    }

    button.classList.add("design-button");
  });
}

function normalizeInputs(){
  document.querySelectorAll(
    "input,select,textarea"
  ).forEach(input=>{
    input.classList.add("design-input");
  });
}

function normalizeCards(){
  document.querySelectorAll(
    ".card,.panel,.settings-card,.question-card"
  ).forEach(card=>{
    card.classList.add("design-surface");
  });
}

function normalizeModals(){
  document.querySelectorAll(
    ".modal,.modal-content"
  ).forEach(modal=>{
    modal.classList.add("design-modal");
  });
}