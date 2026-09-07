const {app,BrowserWindow,ipcMain}=require("electron");
const path=require("path");
const fs=require("fs");
const crypto=require("crypto");

const DATA_DIR=path.join(__dirname,"data");
const QUESTIONS_FILE=path.join(DATA_DIR,"quests.json");
const SETTINGS_FILE=path.join(DATA_DIR,"settings.json");

const DEFAULT_SETTINGS={
  general:{},
  screen:{},
  sound:{},
  prizeTree:{},
  appearance:{},
  dataStorage:{}
};

/* =========================
   DATA
========================= */

function ensureDataFiles(){
  if(!fs.existsSync(DATA_DIR)){
    fs.mkdirSync(DATA_DIR,{recursive:true});
  }

  if(!fs.existsSync(QUESTIONS_FILE)){
    fs.writeFileSync(
      QUESTIONS_FILE,
      JSON.stringify([],null,2),
      "utf8"
    );
  }

  if(!fs.existsSync(SETTINGS_FILE)){
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(DEFAULT_SETTINGS,null,2),
      "utf8"
    );
  }
}

/* =========================
   QUESTIONS
========================= */

function readQuestions(){
  ensureDataFiles();

  try{
    const raw=fs.readFileSync(
      QUESTIONS_FILE,
      "utf8"
    );

    const questions=JSON.parse(raw);

    return Array.isArray(questions)
      ? questions
      : [];
  }catch(error){
    console.error(
      "Błąd odczytu quests.json:",
      error
    );

    return [];
  }
}

function saveQuestions(questions){
  ensureDataFiles();

  fs.writeFileSync(
    QUESTIONS_FILE,
    JSON.stringify(questions,null,2),
    "utf8"
  );

  return questions;
}

function addQuestion(question){
  const questions=readQuestions();

  const newQuestion={
    id:crypto.randomUUID(),
    question:String(
      question?.question||""
    ).trim(),

    answers:{
      A:String(
        question?.answers?.A||""
      ).trim(),

      B:String(
        question?.answers?.B||""
      ).trim(),

      C:String(
        question?.answers?.C||""
      ).trim(),

      D:String(
        question?.answers?.D||""
      ).trim()
    },

    correctAnswer:String(
      question?.correctAnswer||""
    ).trim().toUpperCase(),

    createdAt:new Date().toISOString()
  };

  if(
    !newQuestion.question||
    !newQuestion.answers.A||
    !newQuestion.answers.B||
    !newQuestion.answers.C||
    !newQuestion.answers.D||
    !["A","B","C","D"].includes(
      newQuestion.correctAnswer
    )
  ){
    throw new Error(
      "Nieprawidłowe dane pytania."
    );
  }

  questions.push(newQuestion);

  saveQuestions(questions);

  return newQuestion;
}

function deleteQuestion(id){
  const questions=readQuestions();

  const filtered=questions.filter(
    question=>question.id!==id
  );

  if(filtered.length===questions.length){
    return false;
  }

  saveQuestions(filtered);

  return true;
}

/* =========================
   SETTINGS
========================= */

function readSettings(){
  ensureDataFiles();

  try{
    const raw=fs.readFileSync(
      SETTINGS_FILE,
      "utf8"
    );

    const settings=JSON.parse(raw);

    return{
      ...DEFAULT_SETTINGS,
      ...settings
    };
  }catch(error){
    console.error(
      "Błąd odczytu settings.json:",
      error
    );

    return{
      ...DEFAULT_SETTINGS
    };
  }
}

function saveSettings(settings){
  ensureDataFiles();

  const normalized={
    ...DEFAULT_SETTINGS,
    ...settings
  };

  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(normalized,null,2),
    "utf8"
  );

  return normalized;
}

/* =========================
   WINDOW
========================= */

function createWindow(){
  const win=new BrowserWindow({
    width:1400,
    height:850,
    minWidth:1000,
    minHeight:650,
    show:false,

    webPreferences:{
      preload:path.join(
        __dirname,
        "preload.js"
      ),

      contextIsolation:true,
      nodeIntegration:false
    }
  });

  win.loadFile(
    path.join(
      __dirname,
      "views",
      "index.html"
    )
  );

  win.once("ready-to-show",()=>{
    win.show();
  });
}

/* =========================
   QUESTIONS IPC
========================= */

ipcMain.handle(
  "questions:get",
  ()=>{
    return readQuestions();
  }
);

ipcMain.handle(
  "questions:add",
  (event,question)=>{
    return addQuestion(question);
  }
);

ipcMain.handle(
  "questions:delete",
  (event,id)=>{
    return deleteQuestion(id);
  }
);

/* =========================
   SETTINGS IPC
========================= */

ipcMain.handle(
  "settings:get",
  ()=>{
    return readSettings();
  }
);

ipcMain.handle(
  "settings:save",
  (event,settings)=>{
    return saveSettings(settings);
  }
);

ipcMain.handle(
  "settings:reset",
  ()=>{
    saveSettings(DEFAULT_SETTINGS);

    return readSettings();
  }
);

/* =========================
   APP
========================= */

app.whenReady().then(()=>{
  ensureDataFiles();

  createWindow();

  app.on("activate",()=>{
    if(
      BrowserWindow
        .getAllWindows()
        .length===0
    ){
      createWindow();
    }
  });
});

app.on("window-all-closed",()=>{
  if(process.platform!=="darwin"){
    app.quit();
  }
});