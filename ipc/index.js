const {
  ipcMain,
  shell
}=require("electron");

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
  getPrimaryDisplay
}={}){
  /* =========================
    LOADER IPC
  ========================= */

  ipcMain.handle(
    "loader:get-executable-info",
    ()=>{
      return getExecutableInfo();
    }
  );

  ipcMain.handle(
    "loader:check-executable",
    ()=>{
      return checkExecutable();
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
}

module.exports={
  registerIpc
};