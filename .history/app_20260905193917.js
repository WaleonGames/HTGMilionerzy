const {app,BrowserWindow,ipcMain}=require("electron");
const path=require("path");
const crypto=require("crypto");

const {
  ensureDirectory,
  ensureFile,
  readJson,
  writeJson
}=require("./utils/file");

const DATA_DIR=path.join(__dirname,"data");
const QUESTIONS_FILE=path.join(DATA_DIR,"quests.json");
const SETTINGS_FILE=path.join(DATA_DIR,"settings.json");

const DEFAULT_SETTINGS={
  general:{},

  screen:{
    fullscreen:false,
    screenIndex:0,
    width:1920,
    height:1080
  },

  sound:{},
  prizeTree:{},
  appearance:{},
  dataStorage:{}
};

/* =========================
   DATA
========================= */

function ensureDataFiles(){
  ensureDirectory(DATA_DIR);

  ensureFile(
    QUESTIONS_FILE,
    []
  );

  ensureFile(
    SETTINGS_FILE,
    DEFAULT_SETTINGS
  );
}

/* =========================
   QUESTIONS
========================= */

function readQuestions(){
  ensureDataFiles();

  const questions=readJson(
    QUESTIONS_FILE,
    []
  );

  return Array.isArray(questions)
    ? questions
    : [];
}

function saveQuestions(questions){
  ensureDataFiles();

  return writeJson(
    QUESTIONS_FILE,
    questions
  );
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

  const settings=readJson(
    SETTINGS_FILE,
    DEFAULT_SETTINGS
  );

  return{
    general:{
      ...DEFAULT_SETTINGS.general,
      ...(settings?.general||{})
    },

    screen:{
      ...DEFAULT_SETTINGS.screen,
      ...(settings?.screen||{})
    },

    sound:{
      ...DEFAULT_SETTINGS.sound,
      ...(settings?.sound||{})
    },

    prizeTree:{
      ...DEFAULT_SETTINGS.prizeTree,
      ...(settings?.prizeTree||{})
    },

    appearance:{
      ...DEFAULT_SETTINGS.appearance,
      ...(settings?.appearance||{})
    },

    dataStorage:{
      ...DEFAULT_SETTINGS.dataStorage,
      ...(settings?.dataStorage||{})
    }
  };
}

function saveSettings(settings){
  ensureDataFiles();

  const normalized={
    general:{
      ...DEFAULT_SETTINGS.general,
      ...(settings?.general||{})
    },

    screen:{
      ...DEFAULT_SETTINGS.screen,
      ...(settings?.screen||{})
    },

    sound:{
      ...DEFAULT_SETTINGS.sound,
      ...(settings?.sound||{})
    },

    prizeTree:{
      ...DEFAULT_SETTINGS.prizeTree,
      ...(settings?.prizeTree||{})
    },

    appearance:{
      ...DEFAULT_SETTINGS.appearance,
      ...(settings?.appearance||{})
    },

    dataStorage:{
      ...DEFAULT_SETTINGS.dataStorage,
      ...(settings?.dataStorage||{})
    }
  };

  writeJson(
    SETTINGS_FILE,
    normalized
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
    writeJson(
      SETTINGS_FILE,
      structuredClone(
        DEFAULT_SETTINGS
      )
    );

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