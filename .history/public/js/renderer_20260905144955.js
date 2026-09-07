const startGameButton=document.getElementById("startGameButton");
const questionsButton=document.getElementById("questionsButton");
const settingsButton=document.getElementById("settingsButton");
const exitButton=document.getElementById("exitButton");

startGameButton.addEventListener("click",()=>{
  console.log("Rozpocznij grę");
});

questionsButton.addEventListener("click",()=>{
  window.location.href="questions.html";
});

settingsButton.addEventListener("click",()=>{
  console.log("Ustawienia");
});

exitButton.addEventListener("click",()=>{
  window.close();
});