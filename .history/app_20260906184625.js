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
    confirmAnswer:true
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
        amount:500,
        guaranteed:false
      },
      {
        level:2,
        amount:1000,
        guaranteed:true
      },
      {
        level:3,
        amount:2000,
        guaranteed:false
      },
      {
        level:4,
        amount:5000,
        guaranteed:false
      },
      {
        level:5,
        amount:10000,
        guaranteed:false
      },
      {
        level:6,
        amount:20000,
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

function addQuestion(question){
  const questions=
    readQuestions();

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
    )
      .trim()
      .toUpperCase(),

    createdAt:
      new Date().toISOString()
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

  questions.push(
    newQuestion
  );

  saveQuestions(
    questions
  );

  return newQuestion;
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
    }
  );

  controlsWindow.on(
    "closed",
    ()=>{
      controlsWindow=null;
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

  controlsWindow=null;

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