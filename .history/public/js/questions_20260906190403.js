const backButton=
  document.getElementById("backButton");

const addQuestionButton=
  document.getElementById("addQuestionButton");

const questionModal=
  document.getElementById("questionModal");

const closeModalButton=
  document.getElementById("closeModalButton");

const cancelModalButton=
  document.getElementById("cancelModalButton");

const questionForm=
  document.getElementById("questionForm");

const questionId=
  document.getElementById("questionId");

const questionInput=
  document.getElementById("questionInput");

const answerA=
  document.getElementById("answerA");

const answerB=
  document.getElementById("answerB");

const answerC=
  document.getElementById("answerC");

const answerD=
  document.getElementById("answerD");

const correctAnswer=
  document.getElementById("correctAnswer");

const modalTitle=
  document.getElementById("modalTitle");

const submitQuestionButton=
  document.getElementById("submitQuestionButton");

const questionsCount=
  document.getElementById("questionsCount");

const questionsList=
  document.getElementById("questionsList");

let questionsCache=[];

/* =========================
   NAVIGATION
========================= */

backButton.addEventListener("click",()=>{
  window.location.href="index.html";
});

/* =========================
   OPEN ADD
========================= */

addQuestionButton.addEventListener("click",()=>{
  openAddModal();
});

/* =========================
   CLOSE MODAL
========================= */

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
  if(
    event.key==="Escape"&&
    !questionModal.hidden
  ){
    closeModal();
  }
});

/* =========================
   SUBMIT
========================= */

questionForm.addEventListener(
  "submit",
  async event=>{
    event.preventDefault();

    const id=
      questionId.value.trim();

    const question={
      question:
        questionInput.value.trim(),

      answers:{
        A:answerA.value.trim(),
        B:answerB.value.trim(),
        C:answerC.value.trim(),
        D:answerD.value.trim()
      },

      correctAnswer:
        correctAnswer.value
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

    submitQuestionButton.disabled=true;

    try{
      if(id){
        await window
          .millionaireAPI
          .questions
          .edit(
            id,
            question
          );
      }else{
        await window
          .millionaireAPI
          .questions
          .add(
            question
          );
      }

      closeModal();

      await loadQuestions();
    }catch(error){
      console.error(
        "Błąd zapisu pytania:",
        error
      );

      alert(
        "Nie udało się zapisać pytania."
      );
    }finally{
      submitQuestionButton.disabled=false;
    }
  }
);

/* =========================
   OPEN ADD MODAL
========================= */

function openAddModal(){
  questionForm.reset();

  questionId.value="";

  modalTitle.textContent=
    "Dodaj pytanie";

  submitQuestionButton.textContent=
    "Dodaj pytanie";

  questionModal.hidden=false;

  setTimeout(()=>{
    questionInput.focus();
  },0);
}

/* =========================
   OPEN EDIT MODAL
========================= */

function openEditModal(question){
  questionForm.reset();

  questionId.value=
    question.id||"";

  questionInput.value=
    question.question||"";

  answerA.value=
    question.answers?.A||"";

  answerB.value=
    question.answers?.B||"";

  answerC.value=
    question.answers?.C||"";

  answerD.value=
    question.answers?.D||"";

  correctAnswer.value=
    question.correctAnswer||"";

  modalTitle.textContent=
    "Edytuj pytanie";

  submitQuestionButton.textContent=
    "Zapisz zmiany";

  questionModal.hidden=false;

  setTimeout(()=>{
    questionInput.focus();
  },0);
}

/* =========================
   CLOSE MODAL
========================= */

function closeModal(){
  questionModal.hidden=true;

  questionForm.reset();

  questionId.value="";

  modalTitle.textContent=
    "Dodaj pytanie";

  submitQuestionButton.textContent=
    "Dodaj pytanie";
}

/* =========================
   LOAD QUESTIONS
========================= */

async function loadQuestions(){
  try{
    const questions=
      await window
        .millionaireAPI
        .questions
        .get();

    questionsCache=
      Array.isArray(questions)
        ? questions
        : [];

    renderQuestions(
      questionsCache
    );
  }catch(error){
    console.error(
      "Błąd pobierania pytań:",
      error
    );

    questionsCache=[];

    renderQuestions([]);
  }
}

/* =========================
   RENDER QUESTIONS
========================= */

function renderQuestions(questions){
  questionsCount.textContent=
    getQuestionsLabel(
      questions.length
    );

  questionsList.innerHTML="";

  if(!questions.length){
    const empty=
      document.createElement("div");

    empty.className="empty";

    empty.textContent=
      "Brak pytań w bazie.";

    questionsList.appendChild(
      empty
    );

    return;
  }

  questions.forEach(
    (question,index)=>{
      const card=
        document.createElement(
          "article"
        );

      card.className=
        "card list-item";

      /* =========================
         HEADER
      ========================= */

      const header=
        document.createElement(
          "div"
        );

      header.className=
        "list-item-header";

      const title=
        document.createElement(
          "h3"
        );

      title.textContent=
        `${index+1}. ${question.question}`;

      const actions=
        document.createElement(
          "div"
        );

      actions.className=
        "list-item-actions";

      /* =========================
         EDIT
      ========================= */

      const editButton=
        document.createElement(
          "button"
        );

      editButton.type="button";

      editButton.className=
        "button button-secondary";

      editButton.textContent=
        "Edytuj";

      editButton.addEventListener(
        "click",
        ()=>{
          openEditModal(
            question
          );
        }
      );

      /* =========================
         DELETE
      ========================= */

      const deleteButton=
        document.createElement(
          "button"
        );

      deleteButton.type="button";

      deleteButton.className=
        "button button-danger";

      deleteButton.textContent=
        "Usuń";

      deleteButton.addEventListener(
        "click",
        async()=>{
          const confirmed=
            confirm(
              "Czy na pewno chcesz usunąć to pytanie?"
            );

          if(!confirmed){
            return;
          }

          deleteButton.disabled=true;
          editButton.disabled=true;

          try{
            await window
              .millionaireAPI
              .questions
              .delete(
                question.id
              );

            await loadQuestions();
          }catch(error){
            console.error(
              "Błąd usuwania pytania:",
              error
            );

            alert(
              "Nie udało się usunąć pytania."
            );

            deleteButton.disabled=false;
            editButton.disabled=false;
          }
        }
      );

      actions.append(
        editButton,
        deleteButton
      );

      header.append(
        title,
        actions
      );

      /* =========================
         ANSWERS
      ========================= */

      const answers=
        document.createElement(
          "div"
        );

      answers.className=
        "grid grid-2";

      ["A","B","C","D"]
        .forEach(letter=>{
          const answer=
            document.createElement(
              "div"
            );

          answer.className=
            "answer";

          if(
            letter===
            question.correctAnswer
          ){
            answer.classList.add(
              "answer-correct"
            );
          }

          const strong=
            document.createElement(
              "strong"
            );

          strong.textContent=
            `${letter}:`;

          const text=
            document.createTextNode(
              ` ${
                question.answers?.[
                  letter
                ]||""
              }`
            );

          answer.append(
            strong,
            text
          );

          answers.appendChild(
            answer
          );
        });

      card.append(
        header,
        answers
      );

      questionsList.appendChild(
        card
      );
    }
  );
}

/* =========================
   LABEL
========================= */

function getQuestionsLabel(count){
  if(count===1){
    return "1 pytanie";
  }

  if(
    count%10>=2&&
    count%10<=4&&
    !(
      count%100>=12&&
      count%100<=14
    )
  ){
    return `${count} pytania`;
  }

  return `${count} pytań`;
}

/* =========================
   INITIALIZE
========================= */

loadQuestions();