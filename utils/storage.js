const path=require("path");

const {
  app
}=require("electron");

const {
  normalizePath,
  pathExists,
  fileExists,
  directoryExists,
  ensureDirectory,
  ensureFile,
  canRead,
  canWrite,
  canReadWrite,
  readJson,
  readJsonStrict,
  writeJson,
  writeText,
  copyDirectory,
  movePath,
  deleteDirectory,
  deletePath,
  getPathInfo
}=require("./file");

const {
  DEFAULT_SETTINGS
}=require("../config/default-settings");

/* =========================
   CONSTANTS
========================= */

const STORAGE_DIRECTORY_NAME=
  "HTGMilionerzy";

const QUESTIONS_FILE_NAME=
  "quests.json";

const SETTINGS_FILE_NAME=
  "settings.json";

const BACKUP_DIRECTORY_NAME=
  "backup";

const STORAGE_MARKER_FILE_NAME=
  ".htgmilionerzy";

const STORAGE_CONFIG_FILE_NAME=
  "storage.json";

/* =========================
   STATE
========================= */

let dataDirectory=null;

/* =========================
   LOCAL APPLICATION DATA
========================= */

function getLocalApplicationDirectory(){
  const userData=
    app.getPath(
      "userData"
    );

  console.log(
    "[Storage][Debug] platform:",
    process.platform
  );

  console.log(
    "[Storage][Debug] appData:",
    app.getPath(
      "appData"
    )
  );

  console.log(
    "[Storage][Debug] userData:",
    userData
  );

  console.log(
    "[Storage][Debug] local storage config:",
    path.join(
      userData,
      "storage",
      STORAGE_CONFIG_FILE_NAME
    )
  );

  return userData;
}

/* =========================
   LOCAL STORAGE CONFIG
========================= */

function getLocalStorageConfigDirectory(){
  return path.join(
    app.getPath("userData"),
    "storage"
  );
}

function getLocalStorageConfigFile(){
  return path.join(
    getLocalStorageConfigDirectory(),
    STORAGE_CONFIG_FILE_NAME
  );
}

/* =========================
   DEFAULT LOCATION
========================= */

function getDefaultDataDirectory(){
  return path.join(
    app.getPath("documents"),
    STORAGE_DIRECTORY_NAME
  );
}

/* =========================
   CURRENT LOCATION
========================= */

function setDataDirectory(directory){
  const normalized=
    normalizePath(directory);

  if(!normalized){
    throw new Error(
      "Nieprawidłowa lokalizacja danych."
    );
  }

  dataDirectory=
    normalized;

  return dataDirectory;
}

function clearDataDirectory(){
  dataDirectory=null;
}

function getDataDirectory(){
  return dataDirectory;
}

function hasDataDirectory(){
  return Boolean(
    dataDirectory
  );
}

/* =========================
   STORAGE PATHS
========================= */

function getStoragePaths(
  directory=dataDirectory
){
  const normalized=
    normalizePath(directory);

  if(!normalized){
    return{
      dataDir:null,
      questionsFile:null,
      settingsFile:null,
      backupDir:null,
      markerFile:null
    };
  }

  return{
    dataDir:
      normalized,

    questionsFile:
      path.join(
        normalized,
        QUESTIONS_FILE_NAME
      ),

    settingsFile:
      path.join(
        normalized,
        SETTINGS_FILE_NAME
      ),

    backupDir:
      path.join(
        normalized,
        BACKUP_DIRECTORY_NAME
      ),

    markerFile:
      path.join(
        normalized,
        STORAGE_MARKER_FILE_NAME
      )
  };
}

function getQuestionsFile(){
  return getStoragePaths()
    .questionsFile;
}

function getSettingsFile(){
  return getStoragePaths()
    .settingsFile;
}

function getBackupDirectory(){
  return getStoragePaths()
    .backupDir;
}

function getMarkerFile(){
  return getStoragePaths()
    .markerFile;
}

/* =========================
   MARKER
========================= */

function createStorageMarker(
  directory=dataDirectory
){
  const {
    markerFile
  }=getStoragePaths(
    directory
  );

  if(!markerFile){
    throw new Error(
      "Nie ustawiono lokalizacji danych."
    );
  }

  if(
    !fileExists(
      markerFile
    )
  ){
    writeJson(
      markerFile,
      {
        type:
          "HTGMilionerzyStorage",

        version:1
      }
    );
  }

  return markerFile;
}

function hasStorageMarker(
  directory=dataDirectory
){
  const {
    markerFile
  }=getStoragePaths(
    directory
  );

  if(
    !markerFile||
    !fileExists(markerFile)
  ){
    return false;
  }

  try{
    const marker=
      readJsonStrict(
        markerFile
      );

    return Boolean(
      marker&&
      marker.type===
        "HTGMilionerzyStorage"
    );
  }catch(error){
    return false;
  }
}

/* =========================
   CREATE STORAGE
========================= */

function createStorage(
  directory,
  {
    createQuestions=true,
    createSettings=true,
    createBackup=true,
    createMarker=true
  }={}
){
  const normalized=
    setDataDirectory(
      directory
    );

  const paths=
    getStoragePaths(
      normalized
    );

  ensureDirectory(
    paths.dataDir
  );

  if(createQuestions){
    ensureFile(
      paths.questionsFile,
      []
    );
  }

  if(createSettings){
    ensureFile(
      paths.settingsFile,
      structuredClone(
        DEFAULT_SETTINGS
      )
    );
  }

  if(createBackup){
    ensureDirectory(
      paths.backupDir
    );
  }

  if(createMarker){
    createStorageMarker(
      paths.dataDir
    );
  }

  rememberStorage(
    paths.dataDir
  );

  return getStorageInfo(
    paths.dataDir
  );
}

function createDefaultStorage(){
  return createStorage(
    getDefaultDataDirectory()
  );
}

/* =========================
   ENSURE STORAGE
========================= */

function ensureStorageFiles(
  directory=dataDirectory
){
  const paths=
    getStoragePaths(
      directory
    );

  if(!paths.dataDir){
    throw new Error(
      "Nie ustawiono lokalizacji danych."
    );
  }

  ensureDirectory(
    paths.dataDir
  );

  ensureFile(
    paths.questionsFile,
    []
  );

  ensureFile(
    paths.settingsFile,
    structuredClone(
      DEFAULT_SETTINGS
    )
  );

  ensureDirectory(
    paths.backupDir
  );

  createStorageMarker(
    paths.dataDir
  );

  return paths;
}

/* =========================
   REMEMBER STORAGE
========================= */

function rememberStorage(
  directory=dataDirectory
){
  const normalized=
    normalizePath(directory);

  if(!normalized){
    throw new Error(
      "Nieprawidłowa lokalizacja danych."
    );
  }

  const configFile=
    getLocalStorageConfigFile();

  writeJson(
    configFile,
    {
      dataPath:
        normalized
    }
  );

  return normalized;
}

function forgetStorage(){
  const configFile=
    getLocalStorageConfigFile();

  if(
    pathExists(
      configFile
    )
  ){
    deletePath(
      configFile
    );
  }

  clearDataDirectory();

  return true;
}

function getRememberedStorage(){
  const configFile=
    getLocalStorageConfigFile();

  if(
    !fileExists(
      configFile
    )
  ){
    return null;
  }

  const config=
    readJson(
      configFile,
      null
    );

  const rememberedPath=
    normalizePath(
      config?.dataPath
    );

  return rememberedPath||
    null;
}

function loadRememberedStorage(){
  const remembered=
    getRememberedStorage();

  if(!remembered){
    return null;
  }

  setDataDirectory(
    remembered
  );

  return remembered;
}

/* =========================
   STORAGE STATUS
========================= */

function storageExists(
  directory=dataDirectory
){
  const normalized=
    normalizePath(directory);

  return Boolean(
    normalized&&
    directoryExists(
      normalized
    )
  );
}

function storageAccessible(
  directory=dataDirectory
){
  const normalized=
    normalizePath(directory);

  if(
    !normalized||
    !directoryExists(
      normalized
    )
  ){
    return false;
  }

  return canReadWrite(
    normalized
  );
}

function validateStorage(
  directory=dataDirectory
){
  const paths=
    getStoragePaths(
      directory
    );

  const result={
    valid:false,
    exists:false,
    accessible:false,
    marker:false,
    questions:false,
    settings:false,
    backup:false
  };

  if(
    !paths.dataDir||
    !directoryExists(
      paths.dataDir
    )
  ){
    return result;
  }

  result.exists=true;

  result.accessible=
    storageAccessible(
      paths.dataDir
    );

  result.marker=
    hasStorageMarker(
      paths.dataDir
    );

  result.questions=
    fileExists(
      paths.questionsFile
    );

  result.settings=
    fileExists(
      paths.settingsFile
    );

  result.backup=
    directoryExists(
      paths.backupDir
    );

  result.valid=Boolean(
    result.exists&&
    result.accessible&&
    result.questions&&
    result.settings
  );

  return result;
}

/* =========================
   STORAGE INFO
========================= */

function getStorageInfo(
  directory=dataDirectory
){
  const paths=
    getStoragePaths(
      directory
    );

  const validation=
    validateStorage(
      directory
    );

  return{
    path:
      paths.dataDir,

    paths,

    validation,

    info:
      paths.dataDir
        ? getPathInfo(
            paths.dataDir
          )
        : null
  };
}

/* =========================
   QUESTIONS
========================= */

function readQuestions(
  defaultValue=[]
){
  const file=
    getQuestionsFile();

  if(!file){
    return structuredClone(
      defaultValue
    );
  }

  const questions=
    readJson(
      file,
      defaultValue
    );

  return Array.isArray(
    questions
  )
    ? questions
    : structuredClone(
        defaultValue
      );
}

function writeQuestions(
  questions
){
  const file=
    getQuestionsFile();

  if(!file){
    throw new Error(
      "Nie ustawiono lokalizacji danych."
    );
  }

  if(
    !Array.isArray(
      questions
    )
  ){
    throw new TypeError(
      "Baza pytań musi być tablicą."
    );
  }

  return writeJson(
    file,
    questions
  );
}

/* =========================
   SETTINGS
========================= */

function readSettings(
  defaultValue=DEFAULT_SETTINGS
){
  const file=
    getSettingsFile();

  if(!file){
    return structuredClone(
      defaultValue
    );
  }

  return readJson(
    file,
    defaultValue
  );
}

function writeSettings(
  settings
){
  const file=
    getSettingsFile();

  if(!file){
    throw new Error(
      "Nie ustawiono lokalizacji danych."
    );
  }

  if(
    !settings||
    typeof settings!=="object"||
    Array.isArray(settings)
  ){
    throw new TypeError(
      "Konfiguracja musi być obiektem."
    );
  }

  return writeJson(
    file,
    settings
  );
}

/* =========================
   BACKUP
========================= */

function ensureBackupDirectory(){
  const backupDir=
    getBackupDirectory();

  if(!backupDir){
    throw new Error(
      "Nie ustawiono lokalizacji danych."
    );
  }

  return ensureDirectory(
    backupDir
  );
}

function createBackup(){
  const paths=
    getStoragePaths();

  if(!paths.dataDir){
    throw new Error(
      "Nie ustawiono lokalizacji danych."
    );
  }

  ensureBackupDirectory();

  if(
    fileExists(
      paths.questionsFile
    )
  ){
    const questions=
      readJson(
        paths.questionsFile,
        []
      );

    writeJson(
      path.join(
        paths.backupDir,
        QUESTIONS_FILE_NAME
      ),
      questions
    );
  }

  if(
    fileExists(
      paths.settingsFile
    )
  ){
    const settings=
      readJson(
        paths.settingsFile,
        DEFAULT_SETTINGS
      );

    writeJson(
      path.join(
        paths.backupDir,
        SETTINGS_FILE_NAME
      ),
      settings
    );
  }

  return paths.backupDir;
}

/* =========================
   COPY STORAGE
========================= */

function copyStorage(
  destinationDirectory
){
  const source=
    getDataDirectory();

  const destination=
    normalizePath(
      destinationDirectory
    );

  if(
    !source||
    !directoryExists(source)
  ){
    throw new Error(
      "Nie znaleziono aktualnego magazynu danych."
    );
  }

  if(!destination){
    throw new Error(
      "Nieprawidłowa lokalizacja docelowa."
    );
  }

  copyDirectory(
    source,
    destination,
    {
      overwrite:true
    }
  );

  return destination;
}

/* =========================
   MOVE STORAGE
========================= */

function moveStorage(
  destinationDirectory
){
  const source=
    getDataDirectory();

  const destination=
    normalizePath(
      destinationDirectory
    );

  if(
    !source||
    !directoryExists(source)
  ){
    throw new Error(
      "Nie znaleziono aktualnego magazynu danych."
    );
  }

  if(!destination){
    throw new Error(
      "Nieprawidłowa lokalizacja docelowa."
    );
  }

  if(source===destination){
    return source;
  }

  const moved=
    movePath(
      source,
      destination,
      {
        overwrite:false
      }
    );

  if(!moved){
    return false;
  }

  setDataDirectory(
    destination
  );

  rememberStorage(
    destination
  );

  return destination;
}

/* =========================
   CLEANUP ERROR REPORT
========================= */

function writeCleanupErrorReport(
  localDirectory,
  error
){
  try{
    const reportFile=
      path.join(
        app.getPath("documents"),
        "HTGMilionerzy-cleanup-error.txt"
      );

    const content=[
      "HTGMilionerzy - błąd czyszczenia danych lokalnych",
      "",
      `Data: ${new Date().toISOString()}`,
      `System: ${process.platform}`,
      `appData: ${app.getPath("appData")}`,
      `userData: ${app.getPath("userData")}`,
      `Katalog usuwany: ${localDirectory}`,
      `Katalog nadal istnieje: ${directoryExists(localDirectory)}`,
      "",
      "Błąd:",
      error?.stack||
      error?.message||
      String(error)
    ].join("\n");

    writeText(
      reportFile,
      content
    );

    console.error(
      "[Storage] Utworzono raport błędu:",
      reportFile
    );

    return reportFile;
  }catch(reportError){
    console.error(
      "[Storage] Nie udało się utworzyć raportu błędu:",
      reportError
    );

    return null;
  }
}

/* =========================
   DELETE LOCAL APPLICATION DATA
========================= */

function deleteLocalApplicationData(){
  const localDirectory=
    normalizePath(
      getLocalApplicationDirectory()
    );

  if(!localDirectory){
    const error=
      new Error(
        "Nie udało się ustalić lokalnego katalogu programu."
      );

    writeCleanupErrorReport(
      null,
      error
    );

    throw error;
  }

  try{
    const directoryName=
      path.basename(
        localDirectory
      );

    console.log(
      "[Storage][Cleanup] katalog:",
      localDirectory
    );

    console.log(
      "[Storage][Cleanup] nazwa:",
      directoryName
    );

    console.log(
      "[Storage][Cleanup] istnieje przed:",
      directoryExists(
        localDirectory
      )
    );

    if(
      directoryName.toLowerCase()!==
      STORAGE_DIRECTORY_NAME.toLowerCase()
    ){
      throw new Error(
        `Odmowa usunięcia nieprawidłowego katalogu: ${localDirectory}`
      );
    }

    if(
      !directoryExists(
        localDirectory
      )
    ){
      console.log(
        "[Storage][Cleanup] Katalog już nie istnieje."
      );

      return true;
    }

    deleteDirectory(
      localDirectory,
      {
        recursive:true
      }
    );

    const existsAfter=
      directoryExists(
        localDirectory
      );

    console.log(
      "[Storage][Cleanup] istnieje po:",
      existsAfter
    );

    if(existsAfter){
      throw new Error(
        `Katalog nadal istnieje po próbie usunięcia: ${localDirectory}`
      );
    }

    console.log(
      "[Storage][Cleanup] Cały katalog został usunięty."
    );

    return true;
  }catch(error){
    console.error(
      "[Storage][Cleanup] Nie udało się usunąć danych:",
      error
    );

    writeCleanupErrorReport(
      localDirectory,
      error
    );

    throw error;
  }
}

/* =========================
   INITIALIZE
========================= */

function initializeStorage(){
  const remembered=
    getRememberedStorage();

  if(remembered){
    setDataDirectory(
      remembered
    );

    return{
      source:"remembered",
      path:remembered,
      exists:
        storageExists(
          remembered
        ),
      accessible:
        storageAccessible(
          remembered
        )
    };
  }

  const defaultDirectory=
    getDefaultDataDirectory();

  if(
    storageExists(
      defaultDirectory
    )
  ){
    setDataDirectory(
      defaultDirectory
    );

    rememberStorage(
      defaultDirectory
    );

    return{
      source:"default",
      path:
        defaultDirectory,
      exists:true,
      accessible:
        storageAccessible(
          defaultDirectory
        )
    };
  }

  return{
    source:null,
    path:null,
    exists:false,
    accessible:false
  };
}

/* =========================
   EXPORTS
========================= */

module.exports={
  STORAGE_DIRECTORY_NAME,
  QUESTIONS_FILE_NAME,
  SETTINGS_FILE_NAME,
  BACKUP_DIRECTORY_NAME,
  STORAGE_MARKER_FILE_NAME,

  getLocalApplicationDirectory,

  getLocalStorageConfigDirectory,
  getLocalStorageConfigFile,

  getDefaultDataDirectory,

  setDataDirectory,
  clearDataDirectory,
  getDataDirectory,
  hasDataDirectory,

  getStoragePaths,
  getQuestionsFile,
  getSettingsFile,
  getBackupDirectory,
  getMarkerFile,

  createStorageMarker,
  hasStorageMarker,

  createStorage,
  createDefaultStorage,
  ensureStorageFiles,

  rememberStorage,
  forgetStorage,
  getRememberedStorage,
  loadRememberedStorage,

  storageExists,
  storageAccessible,
  validateStorage,
  getStorageInfo,

  readQuestions,
  writeQuestions,

  readSettings,
  writeSettings,

  ensureBackupDirectory,
  createBackup,

  copyStorage,
  moveStorage,

  getLocalApplicationDirectory,
  deleteLocalApplicationData,

  initializeStorage
};
