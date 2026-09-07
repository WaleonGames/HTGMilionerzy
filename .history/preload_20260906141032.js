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
  }
}