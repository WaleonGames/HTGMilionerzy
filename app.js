const {
  app,
  BrowserWindow,
  dialog,
  screen:electronScreen
}=require("electron");

const fs=require("fs");
const path=require("path");
const crypto=require("crypto");

const {
  spawn
}=require("child_process");

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
  ensureFile
}=require("./utils/file");

const storage=
  require("./utils/storage");

const {
  getDisplays,
  getPrimaryDisplay
}=require("./utils/screen");

/* =========================
   STATE
========================= */

let mainWindow=null;
let controlsWindow=null;
let gameState=null;

let allowApplicationQuit=false;
let cleanupLocalDataOnQuit=false;

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
   DATA / STORAGE
========================= */

function completeConfiguration(){
  const existing=
    storage.readSettings(
      {}
    );

  const completed=
    structuredClone(
      DEFAULT_SETTINGS
    );

  deepMerge(
    completed,
    existing&&
    typeof existing==="object"&&
    !Array.isArray(existing)
      ? existing
      : {}
  );

  storage.writeSettings(
    completed
  );

  return completed;
}

async function handleBootloaderResult(
  bootResult
){
  if(
    !bootResult||
    !bootResult.success
  ){
    return bootResult||{
      success:false
    };
  }

  if(
    !mainWindow||
    mainWindow.isDestroyed()
  ){
    return bootResult;
  }

  console.log(
    "[App] Bootloader zakończony. Otwieranie menu głównego."
  );

  await mainWindow.loadFile(
    path.join(
      __dirname,
      "views",
      "index.html"
    )
  );

  return bootResult;
}

async function rerunBootloader(){
  if(
    !mainWindow||
    mainWindow.isDestroyed()
  ){
    return{
      success:false
    };
  }

  const bootResult=
    await runBootloader(
      mainWindow
    );

  return handleBootloaderResult(
    bootResult
  );
}

async function handleLoaderAction(
  actionId
){
  if(
    !mainWindow||
    mainWindow.isDestroyed()
  ){
    return{
      success:false
    };
  }

  try{
    switch(actionId){
      case "storage:create-default":{
        storage.createDefaultStorage();

        return rerunBootloader();
      }

      case "storage:select":{
        const result=
          await dialog.showOpenDialog(
            mainWindow,
            {
              title:
                "Wybierz miejsce przechowywania danych",
              buttonLabel:
                "Wybierz folder",
              properties:[
                "openDirectory",
                "createDirectory"
              ]
            }
          );

        if(
          result.canceled||
          !result.filePaths?.[0]
        ){
          return{
            success:false,
            canceled:true
          };
        }

        const selectedDirectory=
          result.filePaths[0];

        const finalDirectory=
          path.basename(
            selectedDirectory
          ).toLowerCase()===
          storage.STORAGE_DIRECTORY_NAME
            .toLowerCase()
            ? selectedDirectory
            : path.join(
                selectedDirectory,
                storage.STORAGE_DIRECTORY_NAME
              );

        storage.createStorage(
          finalDirectory
        );

        return rerunBootloader();
      }

      case "storage:retry":{
        storage.clearDataDirectory();

        storage.loadRememberedStorage();

        return rerunBootloader();
      }

      case "configuration:create":{
        ensureFile(
          storage.getSettingsFile(),
          structuredClone(
            DEFAULT_SETTINGS
          )
        );

        return rerunBootloader();
      }

      case "configuration:complete":{
        completeConfiguration();

        return rerunBootloader();
      }

      case "configuration:repair":{
        storage.writeSettings(
          structuredClone(
            DEFAULT_SETTINGS
          )
        );

        return rerunBootloader();
      }

      case "questions:create":{
        ensureFile(
          storage.getQuestionsFile(),
          []
        );

        return rerunBootloader();
      }

      case "questions:repair":{
        storage.writeQuestions(
          []
        );

        return rerunBootloader();
      }

      default:
        return{
          success:false
        };
    }
  }catch(error){
    console.error(
      "[Loader] Nie udało się wykonać operacji:",
      error
    );

    return{
      success:false
    };
  }
}

/* =========================
   QUESTIONS
========================= */

function readQuestions(){
  return storage.readQuestions(
    []
  );
}

function saveQuestions(
  questions
){
  return storage.writeQuestions(
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
  const settings=
    storage.readSettings(
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

  storage.writeSettings(
    normalized
  );

  return normalized;
}

function resetSettings(){
  storage.writeSettings(
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
   WINDOWS CLEANUP
========================= */

function scheduleWindowsLocalDataCleanup(){
  if(process.platform!=="win32"){
    return false;
  }

  const localDirectory=
    storage.getLocalApplicationDirectory();

  if(!localDirectory){
    throw new Error(
      "Nie udało się ustalić katalogu danych lokalnych."
    );
  }

  const parentPid=
    process.pid;

  const cleanerFile=
    path.join(
      app.getPath("temp"),
      `HTGMilionerzy-cleanup-${parentPid}.cmd`
    );

  const reportFile=
    path.join(
      app.getPath("documents"),
      "HTGMilionerzy-cleanup-error.txt"
    );

  console.log(
    "[App][Cleanup] PID:",
    parentPid
  );

  console.log(
    "[App][Cleanup] Katalog:",
    localDirectory
  );

  console.log(
    "[App][Cleanup] Cleaner:",
    cleanerFile
  );

  const script=[
    "@echo off",
    "setlocal EnableExtensions",
    "",
    `set "TARGET=${localDirectory}"`,
    `set "REPORT=${reportFile}"`,
    "",
    "timeout /t 4 /nobreak >nul",
    "",
    "set ATTEMPT=0",
    "",
    ":DELETE_RETRY",
    "set /a ATTEMPT+=1",
    "",
    "if exist \"%TARGET%\" (",
    "  rmdir /S /Q \"%TARGET%\" >nul 2>&1",
    ")",
    "",
    "if not exist \"%TARGET%\" goto SUCCESS",
    "",
    "if %ATTEMPT% GEQ 15 goto FAILED",
    "",
    "timeout /t 1 /nobreak >nul",
    "goto DELETE_RETRY",
    "",
    ":SUCCESS",
    "del \"%REPORT%\" >nul 2>&1",
    "del \"%~f0\" >nul 2>&1",
    "exit /b 0",
    "",
    ":FAILED",
    "(",
    "  echo HTGMilionerzy - blad czyszczenia danych lokalnych",
    "  echo.",
    "  echo Data: %DATE% %TIME%",
    "  echo System: win32",
    "  echo Katalog: %TARGET%",
    "  echo Liczba prob: %ATTEMPT%",
    "  echo.",
    "  echo Nie udalo sie usunac lokalnych danych programu.",
    ") > \"%REPORT%\"",
    "",
    "start \"HTGMilionerzy - Cleanup Error\" cmd /k type \"%REPORT%\"",
    "",
    "del \"%~f0\" >nul 2>&1",
    "exit /b 1"
  ].join("\r\n");

  fs.writeFileSync(
    cleanerFile,
    script,
    "utf8"
  );

  if(!fs.existsSync(cleanerFile)){
    throw new Error(
      "Nie udało się utworzyć skryptu czyszczącego."
    );
  }

  console.log(
    "[App][Cleanup] Utworzono skrypt czyszczący"
  );

  const cleaner=
    spawn(
      cleanerFile,
      [],
      {
        detached:true,
        windowsHide:true,
        stdio:"ignore",
        shell:true
      }
    );

  cleaner.unref();

  console.log(
    "[App][Cleanup] Cleaner uruchomiony bezpośrednio:",
    cleanerFile
  );

  return true;
}

/* =========================
   APPLICATION EXIT
========================= */

function requestApplicationQuit(){
  if(
    !mainWindow||
    mainWindow.isDestroyed()
  ){
    return false;
  }

  console.log(
    "[App] Żądanie otwarcia menu wyjścia"
  );

  mainWindow
    .webContents
    .send(
      "app:exit-requested"
    );

  return true;
}

async function cleanupAndQuitApplication(){
  console.log(
    "[App] Zaplanowano usunięcie lokalnych danych przy zamknięciu"
  );

  allowApplicationQuit=true;

  /*
   * Windows nie pozwala niezawodnie
   * usunąć aktywnego userData z procesu
   * Electron, który sam z niego korzysta.
   */

  if(process.platform==="win32"){
    try{
      scheduleWindowsLocalDataCleanup();

      console.log(
        "[App] Windows - zewnętrzne czyszczenie przygotowane"
      );

      app.quit();

      return{
        success:true
      };
    }catch(error){
      console.error(
        "[App] Windows - nie udało się przygotować czyszczenia:",
        error
      );

      allowApplicationQuit=false;

      return{
        success:false,
        error:
          error?.message||
          "Nie udało się przygotować czyszczenia."
      };
    }
  }

  /*
   * Linux:
   * zachowujemy obecny działający system.
   */

  cleanupLocalDataOnQuit=true;

  app.quit();

  return{
    success:true
  };
}

function quitApplication(){
  console.log(
    "[App] Potwierdzono zamknięcie programu"
  );

  allowApplicationQuit=true;

  app.quit();

  return true;
}

/* =========================
   MAIN WINDOW
========================= */

function createWindow(){
  const settings=
    storage.hasDataDirectory()&&
    storage.storageExists()&&
    storage.storageAccessible()
      ? readSettings()
      : structuredClone(
          DEFAULT_SETTINGS
        );

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


  mainWindow.once(
    "ready-to-show",
    ()=>{
      mainWindow.show();
    }
  );

  mainWindow.on(
    "close",
    event=>{
      if(allowApplicationQuit){
        console.log(
          "[App] Zamknięcie okna dozwolone"
        );

        return;
      }

      event.preventDefault();

      console.log(
        "[App] Przechwycono próbę zamknięcia głównego okna"
      );

      requestApplicationQuit();
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
    getPrimaryDisplay,

    handleLoaderAction,

    quitApplication,
    cleanupAndQuitApplication
  });
}

/* =========================
   APP
========================= */

app.whenReady().then(
  async()=>{
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

          await handleBootloaderResult(
            bootResult
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
  "will-quit",
  ()=>{
    /*
     * Windows korzysta z osobnego procesu,
     * który wykona czyszczenie dopiero po
     * zakończeniu Electrona.
     */

    if(process.platform==="win32"){
      return;
    }

    if(!cleanupLocalDataOnQuit){
      return;
    }

    console.log(
      "[App] Usuwanie lokalnych danych programu"
    );

    try{
      storage.deleteLocalApplicationData();

      console.log(
        "[App] Lokalne dane programu zostały usunięte"
      );
    }catch(error){
      console.error(
        "[App] Błąd usuwania lokalnych danych:",
        error
      );
    }
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