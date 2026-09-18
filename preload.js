const {
  contextBridge,
  ipcRenderer
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
      `[Preload] ${message}`
    );

    return;
  }

  console.log(
    `[Preload] ${message}`,
    data
  );
}

function logWarn(
  message,
  data
){
  if(data===undefined){
    console.warn(
      `[Preload] ${message}`
    );

    return;
  }

  console.warn(
    `[Preload] ${message}`,
    data
  );
}

function logError(
  message,
  error
){
  console.error(
    `[Preload] ${message}`,
    error
  );
}

log(
  "Uruchamianie preload.js"
);

contextBridge.exposeInMainWorld(
  "millionaireAPI",
  {
    /* =========================
      APP
    ========================= */

    app:{
      quit:()=>{
        log(
          "Potwierdzanie zamknięcia programu"
        );

        return ipcRenderer.invoke(
          "app:quit"
        );
      },

      cleanupAndQuit:()=>{
        log(
          "Wysyłanie żądania usunięcia lokalnych danych i zamknięcia programu"
        );

        return ipcRenderer.invoke(
          "app:cleanup-and-quit"
        );
      },

      onExitRequested:callback=>{
        if(
          typeof callback!=="function"
        ){
          logWarn(
            "app.onExitRequested otrzymał nieprawidłowy callback"
          );

          return()=>{
          };
        }

        const listener=()=>{
          log(
            "Odebrano żądanie pokazania menu wyjścia"
          );

          callback();
        };

        ipcRenderer.on(
          "app:exit-requested",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "app:exit-requested",
            listener
          );
        };
      }
    },

    /* =========================
       LOADER
    ========================= */

    loader:{
      onStep:callback=>{
        if(
          typeof callback!=="function"
        ){
          logWarn(
            "loader.onStep otrzymał nieprawidłowy callback"
          );

          return()=>{
          };
        }

        log(
          "Rejestracja nasłuchiwania bootloader:step"
        );

        const listener=(
          event,
          step
        )=>{
          log(
            "Odebrano bootloader:step",
            {
              type:
                step?.type||
                "step",

              name:
                step?.name||
                null,

              state:
                step?.state||
                null
            }
          );

          callback(
            step
          );
        };

        ipcRenderer.on(
          "bootloader:step",
          listener
        );

        return()=>{
          log(
            "Usuwanie nasłuchiwania bootloader:step"
          );

          ipcRenderer.removeListener(
            "bootloader:step",
            listener
          );
        };
      },

      action:async actionId=>{
        log(
          `Wysyłanie akcji loadera "${actionId}"`
        );

        try{
          const result=
            await ipcRenderer.invoke(
              "loader:action",
              actionId
            );

          log(
            `Odebrano wynik akcji loadera "${actionId}"`,
            result
          );

          return result;
        }catch(error){
          logError(
            `Błąd akcji loadera "${actionId}"`,
            error
          );

          throw error;
        }
      }
    },

    /* =========================
       QUESTIONS
    ========================= */

    questions:{
      get:()=>{
        return ipcRenderer.invoke(
          "questions:get"
        );
      },

      add:question=>{
        return ipcRenderer.invoke(
          "questions:add",
          question
        );
      },

      edit:(id,question)=>{
        return ipcRenderer.invoke(
          "questions:edit",
          id,
          question
        );
      },

      delete:id=>{
        return ipcRenderer.invoke(
          "questions:delete",
          id
        );
      }
    },

    /* =========================
       SETTINGS
    ========================= */

    settings:{
      get:()=>{
        return ipcRenderer.invoke(
          "settings:get"
        );
      },

      getDefaults:()=>{
        return ipcRenderer.invoke(
          "settings:get-defaults"
        );
      },

      save:settings=>{
        return ipcRenderer.invoke(
          "settings:save",
          settings
        );
      },

      reset:()=>{
        return ipcRenderer.invoke(
          "settings:reset"
        );
      }
    },

    /* =========================
       EXTERNAL LINKS
    ========================= */

    links:{
      openGitHub:()=>{
        return ipcRenderer.invoke(
          "links:open-github"
        );
      },

      openFeedback:()=>{
        return ipcRenderer.invoke(
          "links:open-feedback"
        );
      }
    },

    /* =========================
       SCREEN
    ========================= */

    screen:{
      getDisplays:()=>{
        return ipcRenderer.invoke(
          "screen:get-displays"
        );
      },

      getPrimaryDisplay:()=>{
        return ipcRenderer.invoke(
          "screen:get-primary-display"
        );
      }
    },

    /* =========================
       SHORTCUTS HELP
    ========================= */

    shortcutsHelp:{
      onOpen:callback=>{
        const listener=()=>{
          callback();
        };

        ipcRenderer.on(
          "shortcuts-help:open",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "shortcuts-help:open",
            listener
          );
        };
      },

      onClose:callback=>{
        const listener=()=>{
          callback();
        };

        ipcRenderer.on(
          "shortcuts-help:close",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "shortcuts-help:close",
            listener
          );
        };
      },

      onToggle:callback=>{
        const listener=()=>{
          callback();
        };

        ipcRenderer.on(
          "shortcuts-help:toggle",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "shortcuts-help:toggle",
            listener
          );
        };
      }
    },

    /* =========================
       GAME
    ========================= */

    game:{
      openControlsWindow:()=>{
        return ipcRenderer.invoke(
          "game:open-controls-window"
        );
      },

      closeControlsWindow:()=>{
        return ipcRenderer.invoke(
          "game:close-controls-window"
        );
      },

      gameClosed:()=>{
        ipcRenderer.send(
          "game:closed"
        );
      },

      isControlsWindowOpen:()=>{
        return ipcRenderer.invoke(
          "game:is-controls-window-open"
        );
      },

      attachControls:()=>{
        return ipcRenderer.invoke(
          "game:attach-controls"
        );
      },

      sendControlsAction:(
        action,
        payload={}
      )=>{
        return ipcRenderer.invoke(
          "game:controls-action",
          action,
          payload
        );
      },

      getState:()=>{
        return ipcRenderer.invoke(
          "game:get-state"
        );
      },

      requestState:()=>{
        return ipcRenderer.invoke(
          "game:request-state"
        );
      },

      updateState:state=>{
        ipcRenderer.send(
          "game:update-state",
          state
        );
      },

      onControlsAction:callback=>{
        const listener=(
          event,
          action,
          payload
        )=>{
          callback(
            action,
            payload||{}
          );
        };

        ipcRenderer.on(
          "game:controls-action",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "game:controls-action",
            listener
          );
        };
      },

      onStateChanged:callback=>{
        const listener=(
          event,
          state
        )=>{
          callback(
            state
          );
        };

        ipcRenderer.on(
          "game:state-changed",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "game:state-changed",
            listener
          );
        };
      },

      onStateRequest:callback=>{
        const listener=()=>{
          callback();
        };

        ipcRenderer.on(
          "game:request-state",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "game:request-state",
            listener
          );
        };
      },

      onRequestState:callback=>{
        const listener=()=>{
          callback();
        };

        ipcRenderer.on(
          "game:request-state",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "game:request-state",
            listener
          );
        };
      },

      onControlsAttached:callback=>{
        const listener=()=>{
          callback();
        };

        ipcRenderer.on(
          "game:controls-attached",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "game:controls-attached",
            listener
          );
        };
      }
    }
  }
);

log(
  "millionaireAPI udostępnione do rendererów"
);
