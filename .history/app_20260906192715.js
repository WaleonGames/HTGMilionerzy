const {
  app,
  BrowserWindow,
  ipcMain,
  screen:electronScreen
}=require("electron");

const path=require("path");
const crypto=require("crypto");

const {
  ensureDirectory,
  ensureFile,
  readJson,
  writeJson
}=require("./utils/file");

const DATA_DIR=
  path.join(
    __dirname,
    "data"
  );

const QUESTIONS_FILE=
  path.join(
    DATA_DIR,
    "quests.json"
  );

const SETTINGS_FILE=
  path.join(
    DATA_DIR,
    "settings.json"
  );

const DEFAULT_SETTINGS={
  general:{
    gameTitle:"Milionerzy",
    questionsCount:12,
    autoNextQuestion:false,
    confirmAnswer:true,

    randomQuestions:false,
    randomAnswers:false
  },

  screen:{
    fullscreen:false,
    screenIndex:0,
    width:1920,
    height:1080,
    technicalInfo:false
  },

  sound:{
    masterVolume:100,
    interfaceSounds:true,
    gameSounds:true
  },

  prizeTree:{
    currency:"zł",

    levels:[
      {
        level:1,
        amount:1000,
        guaranteed:false
      },
      {
        level:2,
        amount:2000,
        guaranteed:true
      },
      {
        level:3,
        amount:5000,
        guaranteed:false
      },
      {
        level:4,
        amount:10000,
        guaranteed:false
      },
      {
        level:5,
        amount:15000,
        guaranteed:false
      },
      {
        level:6,
        amount:25000,
        guaranteed:false
      },
      {
        level:7,
        amount:40000,
        guaranteed:true
      },
      {
        level:8,
        amount:75000,
        guaranteed:false
      },
      {
        level:9,
        amount:125000,
        guaranteed:false
      },
      {
        level:10,
        amount:250000,
        guaranteed:false
      },
      {
        level:11,
        amount:500000,
        guaranteed:false
      },
      {
        level:12,
        amount:1000000,
        guaranteed:false
      }
    ]
  },

  appearance:{
    theme:"light",
    accentColor:"#356df3",
    animations:true
  },

  dataStorage:{
    autoSave:true,
    autoBackup:false,
    backupInterval:30
  }
};

let mainWindow=null;
let controlsWindow=null;

let gameState=null;

/* =========================
   DATA
========================= */

function ensureDataFiles(){
  ensureDirectory(
    DATA_DIR
  );

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

  const questions=
    readJson(
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

function normalizeQuestionData(question){
  const level=
    Number(
      question?.level
    );

  return{
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
    )
      .trim()
      .toUpperCase(),

    level:
      Number.isInteger(level)&&
      level>=1&&
      level<=12
        ? level
        : 1,

    active:
      question?.active!==false
  };
}

function validateQuestion(question){
  return Boolean(
    question.question&&
    question.answers.A&&
    question.answers.B&&
    question.answers.C&&
    question.answers.D&&
    ["A","B","C","D"].includes(
      question.correctAnswer
    )
  );
}

function addQuestion(question){
  const questions=
    readQuestions();

  const normalized=
    normalizeQuestionData(
      question
    );

  if(
    !validateQuestion(
      normalized
    )
  ){
    throw new Error(
      "Nieprawidłowe dane pytania."
    );
  }

  const newQuestion={
    id:crypto.randomUUID(),

    ...normalized,

    createdAt:
      new Date().toISOString()
  };

  questions.push(
    newQuestion
  );

  saveQuestions(
    questions
  );

  return newQuestion;
}

function editQuestion(
  id,
  question
){
  const questions=
    readQuestions();

  const index=
    questions.findIndex(
      item=>{
        return item.id===id;
      }
    );

  if(index===-1){
    throw new Error(
      "Nie znaleziono pytania."
    );
  }

  const normalized=
    normalizeQuestionData(
      question
    );

  if(
    !validateQuestion(
      normalized
    )
  ){
    throw new Error(
      "Nieprawidłowe dane pytania."
    );
  }

  const current=
    questions[index];

  const updatedQuestion={
    ...current,

    ...normalized,

    id:current.id,

    createdAt:
      current.createdAt||
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  questions[index]=
    updatedQuestion;

  saveQuestions(
    questions
  );

  return updatedQuestion;
}

function deleteQuestion(id){
  const questions=
    readQuestions();

  const filtered=
    questions.filter(
      question=>{
        return question.id!==id;
      }
    );

  if(
    filtered.length===
    questions.length
  ){
    return false;
  }

  saveQuestions(
    filtered
  );

  return true;
}

/* =========================
   SETTINGS
========================= */

function readSettings(){
  ensureDataFiles();

  const settings=
    readJson(
      SETTINGS_FILE,
      {}
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
   MAIN WINDOW
========================= */

function createWindow(){
  const settings=
    readSettings();

  const screenSettings=
    settings.screen||
    DEFAULT_SETTINGS.screen;

  const displays=
    electronScreen.getAllDisplays();

  let screenIndex=
    Number(
      screenSettings.screenIndex
    );

  if(
    !Number.isInteger(
      screenIndex
    )||
    screenIndex<0||
    screenIndex>=displays.length
  ){
    screenIndex=0;
  }

  const selectedDisplay=
    displays[screenIndex]||
    electronScreen.getPrimaryDisplay();

  const width=
    Number(
      screenSettings.width
    )||
    DEFAULT_SETTINGS.screen.width;

  const height=
    Number(
      screenSettings.height
    )||
    DEFAULT_SETTINGS.screen.height;

  const fullscreen=
    screenSettings.fullscreen===true;

  mainWindow=
    new BrowserWindow({
      x:selectedDisplay.workArea.x,
      y:selectedDisplay.workArea.y,

      width,
      height,

      minWidth:1000,
      minHeight:650,

      fullscreen,

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

  mainWindow.loadFile(
    path.join(
      __dirname,
      "views",
      "index.html"
    )
  );

  mainWindow.once(
    "ready-to-show",
    ()=>{
      mainWindow.show();
    }
  );

  mainWindow.on(
    "closed",
    ()=>{
      mainWindow=null;

      if(
        controlsWindow&&
        !controlsWindow.isDestroyed()
      ){
        controlsWindow.close();
      }
    }
  );
}

/* =========================
   CONTROLS WINDOW
========================= */

function createControlsWindow(){
  if(
    controlsWindow&&
    !controlsWindow.isDestroyed()
  ){
    if(
      controlsWindow.isMinimized()
    ){
      controlsWindow.restore();
    }

    controlsWindow.show();
    controlsWindow.focus();

    return controlsWindow;
  }

  controlsWindow=
    new BrowserWindow({
      width:430,
      height:820,

      minWidth:360,
      minHeight:600,

      show:false,

      title:"Milionerzy - Sterowanie",

      webPreferences:{
        preload:path.join(
          __dirname,
          "preload.js"
        ),

        contextIsolation:true,
        nodeIntegration:false
      }
    });

  controlsWindow.loadFile(
    path.join(
      __dirname,
      "views",
      "controls.html"
    )
  );

  controlsWindow.once(
    "ready-to-show",
    ()=>{
      controlsWindow.show();

      if(gameState){
        controlsWindow
          .webContents
          .send(
            "game:state-changed",
            gameState
          );
      }
    }
  );

  controlsWindow.on(
    "closed",
    ()=>{
      controlsWindow=null;

      if(
        mainWindow&&
        !mainWindow.isDestroyed()
      ){
        mainWindow
          .webContents
          .send(
            "game:controls-attached"
          );
      }
    }
  );

  return controlsWindow;
}

function closeControlsWindow(){
  if(
    !controlsWindow||
    controlsWindow.isDestroyed()
  ){
    return false;
  }

  controlsWindow.close();

  return true;
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
    return addQuestion(
      question
    );
  }
);

ipcMain.handle(
  "questions:edit",
  (
    event,
    id,
    question
  )=>{
    return editQuestion(
      id,
      question
    );
  }
);

ipcMain.handle(
  "questions:delete",
  (event,id)=>{
    return deleteQuestion(
      id
    );
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
    return saveSettings(
      settings
    );
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
   GAME IPC
========================= */

ipcMain.handle(
  "game:open-controls-window",
  ()=>{
    createControlsWindow();

    return true;
  }
);

ipcMain.handle(
  "game:close-controls-window",
  ()=>{
    return closeControlsWindow();
  }
);

ipcMain.handle(
  "game:is-controls-window-open",
  ()=>{
    return Boolean(
      controlsWindow&&
      !controlsWindow.isDestroyed()
    );
  }
);

/* =========================
   ATTACH CONTROLS
========================= */

ipcMain.handle(
  "game:attach-controls",
  ()=>{
    if(
      controlsWindow&&
      !controlsWindow.isDestroyed()
    ){
      controlsWindow.close();
    }

    if(
      mainWindow&&
      !mainWindow.isDestroyed()
    ){
      mainWindow
        .webContents
        .send(
          "game:controls-attached"
        );
    }

    return true;
  }
);

/* =========================
   CONTROLS -> GAME
========================= */

ipcMain.handle(
  "game:controls-action",
  (
    event,
    action,
    payload
  )=>{
    if(
      !mainWindow||
      mainWindow.isDestroyed()
    ){
      return false;
    }

    mainWindow
      .webContents
      .send(
        "game:controls-action",
        action,
        payload||{}
      );

    return true;
  }
);

/* =========================
   GAME STATE
========================= */

ipcMain.on(
  "game:update-state",
  (
    event,
    state
  )=>{
    gameState=
      state||null;

    if(
      controlsWindow&&
      !controlsWindow.isDestroyed()
    ){
      controlsWindow
        .webContents
        .send(
          "game:state-changed",
          gameState
        );
    }
  }
);

ipcMain.handle(
  "game:get-state",
  ()=>{
    return gameState;
  }
);

/* =========================
   APP
========================= */

app.whenReady().then(()=>{
  ensureDataFiles();

  createWindow();

  app.on(
    "activate",
    ()=>{
      if(
        BrowserWindow
          .getAllWindows()
          .length===0
      ){
        createWindow();
      }
    }
  );
});

app.on(
  "window-all-closed",
  ()=>{
    if(
      process.platform!=="darwin"
    ){
      app.quit();
    }
  }
);