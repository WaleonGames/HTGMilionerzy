const {
  ipcMain,
  shell
}=require("electron");

/* =========================
   LOGS
========================= */

function log(
  message,
  data
){
  if(data===undefined){
    console.log(
      `[IPC] ${message}`
    );

    return;
  }

  console.log(
    `[IPC] ${message}`,
    data
  );
}

function logWarn(
  message,
  data
){
  if(data===undefined){
    console.warn(
      `[IPC] ${message}`
    );

    return;
  }

  console.warn(
    `[IPC] ${message}`,
    data
  );
}

function logError(
  message,
  error
){
  console.error(
    `[IPC] ${message}`,
    error
  );
}

function registerIpc({
  readQuestions,
  addQuestion,
  editQuestion,
  deleteQuestion,
  readSettings,
  saveSettings,
  resetSettings,
  getDefaultSettings,
  createControlsWindow,
  closeControlsWindow,
  getMainWindow,
  getControlsWindow,
  getGameState,
  setGameState,
  getDisplays,
  getPrimaryDisplay,
  handleLoaderAction,
  quitApplication,
  cleanupAndQuitApplication
}={}){
    /* =========================
    APP IPC
  ========================= */

  ipcMain.handle(
    "app:quit",
    ()=>{
      log(
        "Odebrano żądanie zamknięcia programu"
      );

      if(
        typeof quitApplication!==
        "function"
      ){
        logError(
          "Brak funkcji quitApplication",
          new Error(
            "quitApplication nie jest funkcją"
          )
        );

        return false;
      }

      quitApplication();

      return true;
    }
  );

  ipcMain.handle(
    "app:cleanup-and-quit",
    async()=>{
      log(
        "Odebrano żądanie usunięcia lokalnych danych i zamknięcia programu"
      );

      if(
        typeof cleanupAndQuitApplication!==
        "function"
      ){
        logError(
          "Brak funkcji cleanupAndQuitApplication",
          new Error(
            "cleanupAndQuitApplication nie jest funkcją"
          )
        );

        return{
          success:false
        };
      }

      try{
        return await cleanupAndQuitApplication();
      }catch(error){
        logError(
          "Błąd czyszczenia danych lokalnych",
          error
        );

        return{
          success:false,
          error:
            error?.message||
            "Nieznany błąd."
        };
      }
    }
  );

  /* =========================
    LOADER IPC
  ========================= */

  ipcMain.handle(
    "loader:action",
    async(
      event,
      actionId
    )=>{
      log(
        `Odebrano akcję loadera "${actionId}"`
      );

      if(
        typeof handleLoaderAction!==
        "function"
      ){
        logError(
          "Brak funkcji handleLoaderAction",
          new Error(
            "handleLoaderAction nie jest funkcją"
          )
        );

        return{
          success:false
        };
      }

      try{
        const result=
          await handleLoaderAction(
            actionId
          );

        log(
          `Zakończono akcję loadera "${actionId}"`,
          result
        );

        return result;
      }catch(error){
        logError(
          `Błąd akcji loadera "${actionId}"`,
          error
        );

        return{
          success:false
        };
      }
    }
  );

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
    (
      event,
      question
    )=>{
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
    (
      event,
      id
    )=>{
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
    (
      event,
      settings
    )=>{
      return saveSettings(
        settings
      );
    }
  );

  ipcMain.handle(
    "settings:reset",
    ()=>{
      return resetSettings();
    }
  );

  ipcMain.handle(
    "settings:get-defaults",
    ()=>{
      if(
        typeof getDefaultSettings!==
        "function"
      ){
        return null;
      }

      return getDefaultSettings();
    }
  );

  /* =========================
     EXTERNAL LINKS IPC
  ========================= */

  ipcMain.handle(
    "links:open-github",
    async()=>{
      try{
        await shell.openExternal(
          "https://github.com/WaleonGames/HTGMilionerzy"
        );

        return true;
      }catch(error){
        console.error(
          "Nie udało się otworzyć GitHub:",
          error
        );

        return false;
      }
    }
  );

  ipcMain.handle(
    "links:open-feedback",
    async()=>{
      try{
        await shell.openExternal(
          "https://forms.gle/d9km3BGH59gGnsEB8"
        );

        return true;
      }catch(error){
        console.error(
          "Nie udało się otworzyć formularza:",
          error
        );

        return false;
      }
    }
  );

  /* =========================
     SCREEN IPC
  ========================= */

  ipcMain.handle(
    "screen:get-displays",
    ()=>{
      return getDisplays();
    }
  );

  ipcMain.handle(
    "screen:get-primary-display",
    ()=>{
      return getPrimaryDisplay();
    }
  );

  /* =========================
     GAME IPC
  ========================= */

  ipcMain.handle(
    "game:open-controls-window",
    ()=>{
      if(!getGameState()){
        return false;
      }

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

  ipcMain.on(
    "game:closed",
    event=>{
      const mainWindow=
        getMainWindow();

      const controlsWindow=
        getControlsWindow();

      if(
        !mainWindow||
        mainWindow.isDestroyed()||
        event.sender.id!==
          mainWindow.webContents.id
      ){
        return;
      }

      setGameState(
        null
      );

      if(
        controlsWindow&&
        !controlsWindow.isDestroyed()
      ){
        controlsWindow.close();
      }
    }
  );

  ipcMain.handle(
    "game:is-controls-window-open",
    ()=>{
      const controlsWindow=
        getControlsWindow();

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
      const controlsWindow=
        getControlsWindow();

      if(
        controlsWindow&&
        !controlsWindow.isDestroyed()
      ){
        controlsWindow.close();
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
      const mainWindow=
        getMainWindow();

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
     GAME -> STATE
  ========================= */

  ipcMain.on(
    "game:update-state",
    (
      event,
      state
    )=>{
      const mainWindow=
        getMainWindow();

      const controlsWindow=
        getControlsWindow();

      if(
        !mainWindow||
        mainWindow.isDestroyed()||
        event.sender.id!==
          mainWindow.webContents.id
      ){
        return;
      }

      setGameState(
        state||null
      );

      if(
        controlsWindow&&
        !controlsWindow.isDestroyed()
      ){
        controlsWindow
          .webContents
          .send(
            "game:state-changed",
            getGameState()
          );
      }
    }
  );

  /* =========================
     GET STATE
  ========================= */

  ipcMain.handle(
    "game:get-state",
    ()=>{
      return getGameState();
    }
  );

  /* =========================
     REQUEST STATE
  ========================= */

  ipcMain.handle(
    "game:request-state",
    ()=>{
      const mainWindow=
        getMainWindow();

      if(
        !getGameState()||
        !mainWindow||
        mainWindow.isDestroyed()
      ){
        return false;
      }

      mainWindow
        .webContents
        .send(
          "game:request-state"
        );

      return true;
    }
  );

  log(
    "Zarejestrowano obsługę IPC"
  );
}

module.exports={
  registerIpc
};
