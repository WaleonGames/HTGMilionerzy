const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("millionaireAPI", {
  getQuestions: () => {
    return ipcRenderer.invoke("questions:get");
  },

  addQuestion: question => {
    return ipcRenderer.invoke(
      "questions:add",
      question
    );
  },

  deleteQuestion: id => {
    return ipcRenderer.invoke(
      "questions:delete",
      id
    );
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