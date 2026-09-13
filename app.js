const {
  app,
  BrowserWindow,
  screen:electronScreen
}=require("electron");

const path=require("path");
const crypto=require("crypto");

const {
  createToolbar
}=require("./toolbar");

const {
  registerIpc
}=require("./ipc");

const {
  runBootloader
}=require("./bootloader");

const {
  DEFAULT_SETTINGS
}=require(
  "./config/default-settings"
);

const {
  ensureDirectory,
  ensureFile,
  readJson,
  writeJson
}=require("./utils/file");

const {
  getDisplays,
  getPrimaryDisplay
}=require("./utils/screen");

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

/* =========================
   STATE
========================= */

let mainWindow=null;
let controlsWindow=null;
let gameState=null;

/* =========================
   HELPERS
========================= */

function deepMerge(
  target,
  source
){
  if(
    !source||
    typeof source!=="object"
  ){
    return target;
  }

  Object.keys(source)
    .forEach(key=>{
      const value=
        source[key];

      if(
        value&&
        typeof value==="object"&&
        !Array.isArray(value)
      ){
        if(
          !target[key]||
          typeof target[key]!=="object"||
          Array.isArray(
            target[key]
          )
        ){
          target[key]={};
        }

        deepMerge(
          target[key],
          value
        );
      }else{
        target[key]=value;
      }
    });

  return target;
}

function normalizeAppearanceSettings(
  appearance={}
){
  const normalized=
    structuredClone(
      DEFAULT_SETTINGS.appearance
    );

  /*
   * Migracja starej struktury:
   *
   * appearance:{
   *   theme,
   *   accentColor,
   *   primaryColor,
   *   animations
   * }
   */

  if(
    appearance.theme!==undefined
  ){
    normalized.general.theme=
      appearance.theme;
  }

  if(
    appearance.accentColor!==undefined
  ){
    normalized.general.accentColor=
      appearance.accentColor;
  }

  if(
    appearance.primaryColor!==undefined
  ){
    normalized.general.accentColor=
      appearance.primaryColor;
  }

  if(
    appearance.animations!==undefined
  ){
    normalized.general.animations=
      appearance.animations;
  }

  /*
   * Nowa struktura.
   */

  if(
    appearance.general&&
    typeof appearance.general===
      "object"
  ){
    deepMerge(
      normalized.general,
      appearance.general
    );
  }

  if(
    appearance.game&&
    typeof appearance.game===
      "object"
  ){
    deepMerge(
      normalized.game,
      appearance.game
    );
  }

  return normalized;
}

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

function saveQuestions(
  questions
){
  ensureDataFiles();

  return writeJson(
    QUESTIONS_FILE,
    questions
  );
}

function normalizeQuestionData(
  question
){
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

function validateQuestion(
  question
){
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

function addQuestion(
  question
){
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
      item=>
        item.id===id
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

function deleteQuestion(
  id
){
  const questions=
    readQuestions();

  const filtered=
    questions.filter(
      question=>
        question.id!==id
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

  const normalized=
    structuredClone(
      DEFAULT_SETTINGS
    );

  /* GENERAL */

  deepMerge(
    normalized.general,
    settings?.general||{}
  );

  /* SCREEN */

  deepMerge(
    normalized.screen,
    settings?.screen||{}
  );

  /* SOUND */

  deepMerge(
    normalized.sound,
    settings?.sound||{}
  );

  /* PRIZE TREE */

  if(
    settings?.prizeTree&&
    typeof settings.prizeTree===
      "object"
  ){
    normalized.prizeTree={
      ...normalized.prizeTree,
      ...settings.prizeTree,

      levels:
        Array.isArray(
          settings.prizeTree.levels
        )
          ? settings.prizeTree.levels
          : normalized.prizeTree.levels
    };
  }

  /* APPEARANCE */

  normalized.appearance=
    normalizeAppearanceSettings(
      settings?.appearance||{}
    );

  /* SHORTCUTS */

  deepMerge(
    normalized.shortcuts,
    settings?.shortcuts||{}
  );

  /* DATA STORAGE */

  deepMerge(
    normalized.dataStorage,
    settings?.dataStorage||{}
  );

  return normalized;
}

function saveSettings(
  settings
){
  ensureDataFiles();

  const normalized=
    structuredClone(
      DEFAULT_SETTINGS
    );

  /* GENERAL */

  deepMerge(
    normalized.general,
    settings?.general||{}
  );

  /* SCREEN */

  deepMerge(
    normalized.screen,
    settings?.screen||{}
  );

  /* SOUND */

  deepMerge(
    normalized.sound,
    settings?.sound||{}
  );

  /* PRIZE TREE */

  if(
    settings?.prizeTree&&
    typeof settings.prizeTree===
      "object"
  ){
    normalized.prizeTree={
      ...normalized.prizeTree,
      ...settings.prizeTree,

      levels:
        Array.isArray(
          settings.prizeTree.levels
        )
          ? settings.prizeTree.levels
          : normalized.prizeTree.levels
    };
  }

  /* APPEARANCE */

  normalized.appearance=
    normalizeAppearanceSettings(
      settings?.appearance||{}
    );

  /* SHORTCUTS */

  deepMerge(
    normalized.shortcuts,
    settings?.shortcuts||{}
  );

  /* DATA STORAGE */

  deepMerge(
    normalized.dataStorage,
    settings?.dataStorage||{}
  );

  writeJson(
    SETTINGS_FILE,
    normalized
  );

  return normalized;
}

function resetSettings(){
  ensureDataFiles();

  writeJson(
    SETTINGS_FILE,
    structuredClone(
      DEFAULT_SETTINGS
    )
  );

  return readSettings();
}

/* =========================
   MAIN WINDOW PAGE
========================= */

function isGamePage(
  url
){
  if(!url){
    return false;
  }

  try{
    const parsedUrl=
      new URL(url);

    const pathname=
      decodeURIComponent(
        parsedUrl.pathname
      );

    return path.basename(
      pathname
    )==="game.html";
  }catch(error){
    console.error(
      "Błąd sprawdzania strony:",
      error
    );

    return false;
  }
}

function handleMainWindowNavigation(
  url
){
  if(
    isGamePage(url)
  ){
    return;
  }

  gameState=null;

  if(
    controlsWindow&&
    !controlsWindow.isDestroyed()
  ){
    controlsWindow.close();
  }
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

  let selectedDisplay=
    null;

  /*
   * NOWY TRYB:
   * wybór monitora przez displayId.
   */

  if(
    screenSettings.mode===
      "select"&&
    screenSettings.displayId!==null&&
    screenSettings.displayId!==
      undefined
  ){
    const displayId=
      String(
        screenSettings.displayId
      );

    selectedDisplay=
      displays.find(
        display=>
          String(display.id)===
          displayId
      )||
      null;
  }

  /*
   * FALLBACK:
   * stary screenIndex.
   */

  if(!selectedDisplay){
    selectedDisplay=
      displays[screenIndex]||
      electronScreen
        .getPrimaryDisplay();
  }

  let width=
    Number(
      screenSettings.width
    )||
    DEFAULT_SETTINGS.screen.width;

  let height=
    Number(
      screenSettings.height
    )||
    DEFAULT_SETTINGS.screen.height;

  /*
   * NOWY TRYB ROZDZIELCZOŚCI.
   */

  if(
    screenSettings.mode===
    "select"
  ){
    const resolution=
      String(
        screenSettings.resolution||
        "native"
      );

    if(
      resolution==="native"
    ){
      const scaleFactor=
        Number(
          selectedDisplay.scaleFactor
        )||1;

      width=
        Math.round(
          selectedDisplay.size.width*
          scaleFactor
        );

      height=
        Math.round(
          selectedDisplay.size.height*
          scaleFactor
        );
    }else{
      const match=
        /^(\d+)x(\d+)$/i.exec(
          resolution
        );

      if(match){
        width=
          Number(
            match[1]
          );

        height=
          Number(
            match[2]
          );
      }
    }
  }

  const fullscreen=
    screenSettings.fullscreen===
    true;

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

  mainWindow.webContents.on(
    "did-navigate",
    (
      event,
      url
    )=>{
      handleMainWindowNavigation(
        url
      );
    }
  );

  mainWindow.loadFile(
    path.join(
      __dirname,
      "views/loader.html"
    )
  );

  mainWindow.webContents.once(
    "did-finish-load",
    ()=>{
      setTimeout(
        ()=>{
          if(
            mainWindow &&
            !mainWindow.isDestroyed()
          ){
            mainWindow.loadFile(
              path.join(
                __dirname,
                "views/index.html"
              )
            );
          }
        },
        2000
      );
    }
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
      gameState=null;

      if(
        controlsWindow&&
        !controlsWindow.isDestroyed()
      ){
        controlsWindow.close();
      }

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

      title:
        "Milionerzy - Sterowanie",

      autoHideMenuBar:true,

      webPreferences:{
        preload:path.join(
          __dirname,
          "preload.js"
        ),

        contextIsolation:true,
        nodeIntegration:false
      }
    });

  /*
   * Okno sterowania nie korzysta
   * z głównego toolbara.
   */

  controlsWindow.removeMenu();

  controlsWindow.setMenuBarVisibility(
    false
  );

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
      if(
        !controlsWindow||
        controlsWindow.isDestroyed()
      ){
        return;
      }

      controlsWindow.removeMenu();

      controlsWindow
        .setMenuBarVisibility(
          false
        );

      controlsWindow.show();
      controlsWindow.focus();

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

/* =========================
   CLOSE CONTROLS WINDOW
========================= */

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
   REGISTER IPC
========================= */

function registerApplicationIpc(){
  registerIpc({
    readQuestions,
    addQuestion,
    editQuestion,
    deleteQuestion,

    readSettings,
    saveSettings,
    resetSettings,

    getDefaultSettings:()=>{
      return structuredClone(
        DEFAULT_SETTINGS
      );
    },

    createControlsWindow,
    closeControlsWindow,

    getMainWindow:()=>{
      return mainWindow;
    },

    getControlsWindow:()=>{
      return controlsWindow;
    },

    getGameState:()=>{
      return gameState;
    },

    setGameState:state=>{
      gameState=
        state;
    },

    getDisplays,
    getPrimaryDisplay
  });
}

/* =========================
   APP
========================= */

app.whenReady().then(
  async()=>{
    ensureDataFiles();

    registerApplicationIpc();

    createWindow();

    createToolbar({
      mainWindow,
      readSettings
    });

    mainWindow.webContents.once(
      "did-finish-load",
      async()=>{
        if(
          mainWindow.webContents
            .getURL()
            .endsWith("loader.html")
        ){
          const bootResult=
            await runBootloader(
              mainWindow
            );

          if(
            !bootResult.success
          ){
            console.error(
              "Bootloader:",
              bootResult
            );

            return;
          }

          setTimeout(
            ()=>{
              if(
                mainWindow&&
                !mainWindow.isDestroyed()
              ){
                mainWindow.loadFile(
                  path.join(
                    __dirname,
                    "views",
                    "index.html"
                  )
                );
              }
            },
            2000
          );
        }
      }
    );

    app.on(
      "activate",
      ()=>{
        if(
          BrowserWindow
            .getAllWindows()
            .length===0
        ){
          createWindow();

          createToolbar({
            mainWindow,
            readSettings
          });
        }
      }
    );
  }
);

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