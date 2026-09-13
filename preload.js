const {
  contextBridge,
  ipcRenderer
}=require("electron");

contextBridge.exposeInMainWorld(
  "millionaireAPI",
  {
    /* =========================
       LOADER
    ========================= */

    loader:{
      onStep:callback=>{
        const listener=(
          event,
          step
        )=>{
          callback(
            step
          );
        };

        ipcRenderer.on(
          "bootloader:step",
          listener
        );

        return()=>{
          ipcRenderer.removeListener(
            "bootloader:step",
            listener
          );
        };
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