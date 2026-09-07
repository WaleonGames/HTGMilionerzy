const startGameButton=document.getElementById("startGameButton");
const questionsButton=document.getElementById("questionsButton");
const settingsButton=document.getElementById("settingsButton");
const exitButton=document.getElementById("exitButton");

startGameButton.addEventListener("click",()=>{
  window.location.href="game.html";
});

questionsButton.addEventListener("click",()=>{
  window.location.href="questions.html";
});

settingsButton.addEventListener("click",()=>{
  window.location.href="settings.html";
});

exitButton.addEventListener("click",()=>{
  window.close();
});