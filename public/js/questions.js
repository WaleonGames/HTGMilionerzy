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

const questionLevel=
  document.getElementById("questionLevel");

const questionActive=
  document.getElementById("questionActive");

const modalTitle=
  document.getElementById("modalTitle");

const submitQuestionButton=
  document.getElementById("submitQuestionButton");

const questionsCount=
  document.getElementById("questionsCount");

const questionsList=
  document.getElementById("questionsList");

/* =========================
   QUESTION SELECT MODAL
========================= */

const questionSelectModal=
  document.getElementById(
    "questionSelectModal"
  );

const questionSelectList=
  document.getElementById(
    "questionSelectList"
  );

const questionSelectEmpty=
  document.getElementById(
    "questionSelectEmpty"
  );

const questionSelectModalTitle=
  document.getElementById(
    "questionSelectModalTitle"
  );

const questionSelectModalDescription=
  document.getElementById(
    "questionSelectModalDescription"
  );

let questionsCache=[];

let questionSelectMode=null;

/* =========================
   NAVIGATION
========================= */

backButton?.addEventListener(
  "click",
  ()=>{
    window.location.href="index.html";
  }
);

/* =========================
   OPEN ADD
========================= */

addQuestionButton?.addEventListener(
  "click",
  ()=>{
    openAddModal();
  }
);

/* =========================
   CLOSE MODAL
========================= */

closeModalButton?.addEventListener(
  "click",
  ()=>{
    closeModal();
  }
);

cancelModalButton?.addEventListener(
  "click",
  ()=>{
    closeModal();
  }
);

questionModal?.addEventListener(
  "click",
  event=>{
    if(
      event.target===
      questionModal
    ){
      closeModal();
    }
  }
);

/* =========================
   QUESTION SELECT MODAL
========================= */

questionSelectModal?.addEventListener(
  "click",
  event=>{
    if(
      event.target===
      questionSelectModal||
      event.target.hasAttribute(
        "data-modal-close"
      )
    ){
      closeQuestionSelectModal();
    }
  }
);

/* =========================
   ESCAPE
========================= */

document.addEventListener(
  "keydown",
  event=>{
    if(event.key!=="Escape"){
      return;
    }

    if(
      questionSelectModal&&
      !questionSelectModal.hidden
    ){
      closeQuestionSelectModal();
      return;
    }

    if(
      questionModal&&
      !questionModal.hidden
    ){
      closeModal();
    }
  }
);

/* =========================
   SUBMIT
========================= */

questionForm?.addEventListener(
  "submit",
  async event=>{
    event.preventDefault();

    const id=
      questionId.value.trim();

    const level=
      Number(
        questionLevel.value
      );

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
          .trim()
          .toUpperCase(),

      level,

      active:
        questionActive.checked
    };

    if(
      !question.question||
      !question.answers.A||
      !question.answers.B||
      !question.answers.C||
      !question.answers.D||
      !["A","B","C","D"].includes(
        question.correctAnswer
      )||
      !Number.isInteger(level)||
      level<1||
      level>12
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

  questionLevel.value="1";
  questionActive.checked=true;

  modalTitle.textContent=
    "Dodaj pytanie";

  submitQuestionButton.textContent=
    "Dodaj pytanie";

  questionModal.hidden=false;

  setTimeout(
    ()=>{
      questionInput.focus();
    },
    0
  );
}

/* =========================
   OPEN EDIT MODAL
========================= */

function openEditModal(question){
  if(!question){
    return;
  }

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

  questionLevel.value=
    String(
      question.level??1
    );

  questionActive.checked=
    question.active!==false;

  modalTitle.textContent=
    "Edytuj pytanie";

  submitQuestionButton.textContent=
    "Zapisz zmiany";

  questionModal.hidden=false;

  setTimeout(
    ()=>{
      questionInput.focus();
    },
    0
  );
}

/* =========================
   CLOSE MODAL
========================= */

function closeModal(){
  if(!questionModal){
    return;
  }

  questionModal.hidden=true;

  questionForm.reset();

  questionId.value="";

  questionLevel.value="1";
  questionActive.checked=true;

  modalTitle.textContent=
    "Dodaj pytanie";

  submitQuestionButton.textContent=
    "Dodaj pytanie";
}

/* =========================
   OPEN QUESTION SELECT MODAL
========================= */

function openQuestionSelectModal(
  mode
){
  if(!questionSelectModal){
    return;
  }

  if(
    mode!=="edit"&&
    mode!=="remove"
  ){
    return;
  }

  questionSelectMode=
    mode;

  if(mode==="edit"){
    questionSelectModalTitle.textContent=
      "Wybierz pytanie do edycji";

    questionSelectModalDescription.textContent=
      "Wybierz pytanie, które chcesz edytować.";
  }

  if(mode==="remove"){
    questionSelectModalTitle.textContent=
      "Wybierz pytanie do usunięcia";

    questionSelectModalDescription.textContent=
      "Wybierz pytanie, które chcesz usunąć.";
  }

  renderQuestionSelectList(
    questionsCache
  );

  questionSelectModal.hidden=false;
}

/* =========================
   CLOSE QUESTION SELECT MODAL
========================= */

function closeQuestionSelectModal(){
  if(!questionSelectModal){
    return;
  }

  questionSelectModal.hidden=true;

  questionSelectMode=null;

  if(questionSelectList){
    questionSelectList.innerHTML="";
  }
}

/* =========================
   RENDER QUESTION SELECT
========================= */

function renderQuestionSelectList(
  questions
){
  if(!questionSelectList){
    return;
  }

  questionSelectList.innerHTML="";

  if(
    !Array.isArray(questions)||
    !questions.length
  ){
    if(questionSelectEmpty){
      questionSelectEmpty.hidden=false;
    }

    return;
  }

  if(questionSelectEmpty){
    questionSelectEmpty.hidden=true;
  }

  questions.forEach(
    (question,index)=>{
      const button=
        document.createElement(
          "button"
        );

      button.type="button";

      button.className=
        "question-select-item";

      const number=
        document.createElement(
          "span"
        );

      number.className=
        "question-select-number";

      number.textContent=
        String(index+1);

      const content=
        document.createElement(
          "span"
        );

      content.className=
        "question-select-content";

      const title=
        document.createElement(
          "strong"
        );

      title.className=
        "question-select-title";

      title.textContent=
        question.question||
        "Bez treści";

      const meta=
        document.createElement(
          "span"
        );

      meta.className=
        "question-select-meta";

      meta.textContent=
        `Poziom ${getQuestionLevel(
          question
        )}`;

      if(
        question.active===false
      ){
        meta.textContent+=
          " • Nieaktywne";
      }

      content.append(
        title,
        meta
      );

      button.append(
        number,
        content
      );

      button.addEventListener(
        "click",
        ()=>{
          handleQuestionSelection(
            question
          );
        }
      );

      questionSelectList.appendChild(
        button
      );
    }
  );
}

/* =========================
   QUESTION SELECTION
========================= */

async function handleQuestionSelection(
  question
){
  const mode=
    questionSelectMode;

  closeQuestionSelectModal();

  if(!question){
    return;
  }

  if(mode==="edit"){
    openEditModal(
      question
    );

    return;
  }

  if(mode==="remove"){
    await deleteQuestion(
      question
    );
  }
}

/* =========================
   DELETE QUESTION
========================= */

async function deleteQuestion(
  question
){
  if(!question?.id){
    return;
  }

  const confirmed=
    confirm(
      "Czy na pewno chcesz usunąć to pytanie?"
    );

  if(!confirmed){
    return;
  }

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
  }
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

function renderQuestions(
  questions
){
  if(!questionsCount||!questionsList){
    return;
  }

  questionsCount.textContent=
    getQuestionsLabel(
      questions.length
    );

  questionsList.innerHTML="";

  if(!questions.length){
    const empty=
      document.createElement(
        "div"
      );

    empty.className=
      "empty";

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

      if(
        question.active===false
      ){
        card.classList.add(
          "question-inactive"
        );
      }

      /* =========================
         HEADER
      ========================= */

      const header=
        document.createElement(
          "div"
        );

      header.className=
        "list-item-header";

      const headerMain=
        document.createElement(
          "div"
        );

      headerMain.className=
        "list-item-header-main";

      const title=
        document.createElement(
          "h3"
        );

      title.textContent=
        `${index+1}. ${question.question}`;

      const meta=
        createQuestionMeta(
          question
        );

      headerMain.append(
        title,
        meta
      );

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
          deleteButton.disabled=true;
          editButton.disabled=true;

          await deleteQuestion(
            question
          );

          deleteButton.disabled=false;
          editButton.disabled=false;
        }
      );

      actions.append(
        editButton,
        deleteButton
      );

      header.append(
        headerMain,
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
        .forEach(
          letter=>{
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
          }
        );

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
   QUESTION META
========================= */

function createQuestionMeta(
  question
){
  const meta=
    document.createElement(
      "div"
    );

  meta.className=
    "question-meta";

  const levelBadge=
    document.createElement(
      "span"
    );

  levelBadge.className=
    "question-badge";

  const level=
    getQuestionLevel(
      question
    );

  levelBadge.textContent=
    `Poziom ${level}`;

  const activeBadge=
    document.createElement(
      "span"
    );

  activeBadge.className=
    "question-badge";

  if(
    question.active===false
  ){
    activeBadge.classList.add(
      "question-badge-disabled"
    );

    activeBadge.textContent=
      "Nieaktywne";
  }else{
    activeBadge.classList.add(
      "question-badge-active"
    );

    activeBadge.textContent=
      "Aktywne";
  }

  meta.append(
    levelBadge,
    activeBadge
  );

  return meta;
}

/* =========================
   QUESTION LEVEL
========================= */

function getQuestionLevel(
  question
){
  const level=
    Number(
      question?.level
    );

  if(
    Number.isInteger(level)&&
    level>=1&&
    level<=12
  ){
    return level;
  }

  return 1;
}

/* =========================
   SET CORRECT ANSWER
========================= */

function setCorrectAnswer(
  answer
){
  const value=
    String(
      answer||""
    ).toUpperCase();

  if(
    !["A","B","C","D"].includes(
      value
    )
  ){
    return;
  }

  if(!correctAnswer){
    return;
  }

  correctAnswer.value=
    value;

  correctAnswer.dispatchEvent(
    new Event(
      "change",
      {
        bubbles:true
      }
    )
  );
}

/* =========================
   SET LEVEL
========================= */

function setQuestionLevel(
  level
){
  const value=
    Number(level);

  if(
    !Number.isInteger(value)||
    value<1||
    value>12
  ){
    return;
  }

  if(!questionLevel){
    return;
  }

  questionLevel.value=
    String(value);

  questionLevel.dispatchEvent(
    new Event(
      "change",
      {
        bubbles:true
      }
    )
  );
}

/* =========================
   TOGGLE ACTIVE
========================= */

function toggleCurrentActive(){
  if(!questionActive){
    return;
  }

  questionActive.checked=
    !questionActive.checked;

  questionActive.dispatchEvent(
    new Event(
      "change",
      {
        bubbles:true
      }
    )
  );
}

/* =========================
   LABEL
========================= */

function getQuestionsLabel(
  count
){
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
   PUBLIC API
========================= */

window.MillionaireQuestions={
  openAddModal,
  openQuestionPicker:
    openQuestionSelectModal,
  setCorrectAnswer,
  setLevel:setQuestionLevel,
  toggleCurrentActive,
  toggleActive:toggleCurrentActive
};

/* =========================
   INITIALIZE
========================= */

loadQuestions();