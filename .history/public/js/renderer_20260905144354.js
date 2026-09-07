const startGameButton = document.getElementById("startGameButton");
const questionsButton = document.getElementById("questionsButton");
const settingsButton = document.getElementById("settingsButton");
const exitButton = document.getElementById("exitButton");

startGameButton.addEventListener("click",()=>{
  console.log("Rozpocznij grę");
});

questionsButton.addEventListener("click",()=>{
  console.log("Pytania");
});

settingsButton.addEventListener("click",()=>{
  console.log("Ustawienia");
});

exitButton.addEventListener("click",()=>{
  window.close();
});