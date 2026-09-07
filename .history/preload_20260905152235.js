const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("millionaireAPI", {
  questions: {
    get: () => {
      return ipcRenderer.invoke("questions:get");
    },

    add: question => {
      return ipcRenderer.invoke(
        "questions:add",
        question
      );
    },

    delete: id => {
      return ipcRenderer.invoke(
        "questions:delete",
        id
      );
    }
  },

  settings: {
    get: () => {
      return ipcRenderer.invoke("settings:get");
    },

    save: settings => {
      return ipcRenderer.invoke(
        "settings:save",
        settings
      );
    },

    reset: () => {
      return ipcRenderer.invoke("settings:reset");
    }
  }
});