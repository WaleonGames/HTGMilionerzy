const backButton=document.getElementById("backButton");
const addQuestionButton=document.getElementById("addQuestionButton");

const questionModal=document.getElementById("questionModal");
const closeModalButton=document.getElementById("closeModalButton");
const cancelModalButton=document.getElementById("cancelModalButton");

const questionForm=document.getElementById("questionForm");
const questionInput=document.getElementById("questionInput");

const answerA=document.getElementById("answerA");
const answerB=document.getElementById("answerB");
const answerC=document.getElementById("answerC");
const answerD=document.getElementById("answerD");

const correctAnswer=document.getElementById("correctAnswer");

const questionsCount=document.getElementById("questionsCount");
const questionsList=document.getElementById("questionsList");

backButton.addEventListener("click",()=>{
  window.location.href="index.html";
});

addQuestionButton.addEventListener("click",()=>{
  openModal();
});

closeModalButton.addEventListener("click",()=>{
  closeModal();
});

cancelModalButton.addEventListener("click",()=>{
  closeModal();
});

questionModal.addEventListener("click",event=>{
  if(event.target===questionModal){
    closeModal();
  }
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!questionModal.hidden){
    closeModal();
  }
});

questionForm.addEventListener("submit",async event=>{
  event.preventDefault();

  const question={
    question:questionInput.value.trim(),

    answers:{
      A:answerA.value.trim(),
      B:answerB.value.trim(),
      C:answerC.value.trim(),
      D:answerD.value.trim()
    },

    correctAnswer:correctAnswer.value
  };

  if(
    !question.question||
    !question.answers.A||
    !question.answers.B||
    !question.answers.C||
    !question.answers.D||
    !question.correctAnswer
  ){
    return;
  }

  await window.millionaireAPI.questions.add(
    question
  );

  closeModal();

  await loadQuestions();
});

function openModal(){
  questionForm.reset();

  questionModal.hidden=false;

  setTimeout(()=>{
    questionInput.focus();
  },0);
}

function closeModal(){
  questionModal.hidden=true;
  questionForm.reset();
}

async function loadQuestions(){
  const questions=
    await window.millionaireAPI.questions.get();

  renderQuestions(questions);
}

function renderQuestions(questions){
  questionsCount.textContent=getQuestionsLabel(
    questions.length
  );

  questionsList.innerHTML="";

  if(!questions.length){
    const empty=document.createElement("div");

    empty.className="empty";
    empty.textContent="Brak pytań w bazie.";

    questionsList.appendChild(empty);

    return;
  }

  questions.forEach((question,index)=>{
    const card=document.createElement("article");

    card.className="card list-item";

    const header=document.createElement("div");

    header.className="list-item-header";

    const title=document.createElement("h3");

    title.textContent=
      `${index+1}. ${question.question}`;

    const deleteButton=document.createElement("button");

    deleteButton.type="button";
    deleteButton.className="button button-danger";
    deleteButton.textContent="Usuń";

    deleteButton.addEventListener("click",async()=>{
      const confirmed=confirm(
        "Czy na pewno chcesz usunąć to pytanie?"
      );

      if(!confirmed){
        return;
      }

      await window.millionaireAPI.questions.delete(
        question.id
      );

      await loadQuestions();
    });

    header.append(
      title,
      deleteButton
    );

    const answers=document.createElement("div");

    answers.className="grid grid-2";

    ["A","B","C","D"].forEach(letter=>{
      const answer=document.createElement("div");

      answer.className="answer";

      if(letter===question.correctAnswer){
        answer.classList.add("answer-correct");
      }

      const strong=document.createElement("strong");

      strong.textContent=`${letter}:`;

      const text=document.createTextNode(
        ` ${question.answers[letter]}`
      );

      answer.append(
        strong,
        text
      );

      answers.appendChild(answer);
    });

    card.append(
      header,
      answers
    );

    questionsList.appendChild(card);
  });
}

function getQuestionsLabel(count){
  if(count===1){
    return "1 pytanie";
  }

  if(
    count%10>=2&&
    count%10<=4&&
    !(count%100>=12&&count%100<=14)
  ){
    return `${count} pytania`;
  }

  return `${count} pytań`;
}

loadQuestions();