const {
  contextBridge,
  ipcRenderer
}=require("electron");

contextBridge.exposeInMainWorld(
  "millionaireAPI",
  {
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

    settings:{
      get:()=>{
        return ipcRenderer.invoke(
          "settings:get"
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

      sendControlsAction:(action,payload={})=>{
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
            payload
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
          callback(state);
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
      }
    }
  }
);