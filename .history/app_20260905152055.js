const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS = {
  general: {},
  screen: {},
  sound: {},
  prizeTree: {},
  appearance: {},
  dataStorage: {}
};

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(DEFAULT_SETTINGS, null, 2),
      "utf8"
    );
  }
}

function readSettings() {
  ensureDataFiles();

  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
    const settings = JSON.parse(raw);

    return {
      ...DEFAULT_SETTINGS,
      ...settings
    };
  } catch (error) {
    console.error("Błąd odczytu settings.json:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  ensureDataFiles();

  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(settings, null, 2),
    "utf8"
  );

  return settings;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 1000,
    minHeight: 650,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(
    path.join(__dirname, "views", "index.html")
  );

  win.once("ready-to-show", () => {
    win.show();
  });
}

/* =========================
   SETTINGS
========================= */

ipcMain.handle("settings:get", () => {
  return readSettings();
});

ipcMain.handle("settings:save", (event, settings) => {
  return saveSettings(settings);
});

ipcMain.handle("settings:reset", () => {
  saveSettings(DEFAULT_SETTINGS);
  return readSettings();
});

/* =========================
   APP
========================= */

app.whenReady().then(() => {
  ensureDataFiles();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});