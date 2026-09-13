const {
  app
}=require("electron");

const fs=require("fs");
const path=require("path");

const {
  parseVersionTag,
  getLatestRelease
}=require("./utils/version");

const {
  readJson
}=require("./utils/file");

const PACKAGE_FILE=
  path.join(
    __dirname,
    "package.json"
  );

const DATA_DIR=
  path.join(
    __dirname,
    "data"
  );

const QUESTIONS_FILE=
  path.join(
    DATA_DIR,
    "quests.json"
  );

const SETTINGS_FILE=
  path.join(
    DATA_DIR,
    "settings.json"
  );

/* =========================
   LOADER
========================= */

function sendStep(
  mainWindow,
  name,
  state,
  text
){
  if(
    !mainWindow||
    mainWindow.isDestroyed()
  ){
    return;
  }

  mainWindow.webContents.send(
    "bootloader:step",
    {
      name,
      state,
      text
    }
  );
}

/* =========================
   EXECUTABLE
========================= */

function getExecutableInfo(){
  const executablePath=
    app.getPath("exe");

  return{
    path:
      executablePath,

    name:
      path.basename(
        executablePath
      ),

    exists:
      fs.existsSync(
        executablePath
      ),

    isExe:
      path.extname(
        executablePath
      ).toLowerCase()===".exe",

    isPackaged:
      app.isPackaged,

    platform:
      process.platform
  };
}

function checkExecutable(){
  const executable=
    getExecutableInfo();

  if(
    !executable.exists
  ){
    return{
      valid:false,
      reason:
        "Nie znaleziono uruchomionego pliku wykonywalnego.",
      executable
    };
  }

  if(
    process.platform==="win32"&&
    !executable.isExe
  ){
    return{
      valid:false,
      reason:
        "Uruchomiony plik nie jest plikiem EXE.",
      executable
    };
  }

  return{
    valid:true,
    reason:null,
    executable
  };
}

/* =========================
   APPLICATION VERSION
========================= */

function getCurrentVersion(){
  if(
    !fs.existsSync(
      PACKAGE_FILE
    )
  ){
    return null;
  }

  const packageData=
    readJson(
      PACKAGE_FILE,
      {}
    );

  const version=
    String(
      packageData?.version||
      ""
    )
      .trim()
      .toLowerCase();

  if(!version){
    return null;
  }

  return{
    raw:version,
    parsed:
      parseVersionTag(
        version
      )
  };
}

/* =========================
   VERSION CHECK
========================= */

async function checkVersion(){
  const current=
    getCurrentVersion();

  if(!current){
    return{
      valid:false,
      updateAvailable:false,
      current:null,
      latest:null,
      reason:
        "Nie znaleziono wersji aplikacji."
    };
  }

  if(!current.parsed){
    return{
      valid:false,
      updateAvailable:false,
      current,
      latest:null,
      reason:
        `Nieprawidłowy format wersji: ${current.raw}`
    };
  }

  try{
    const latest=
      await getLatestRelease();

    if(!latest){
      return{
        valid:true,
        updateAvailable:false,
        current,
        latest:null,
        reason:
          "Nie znaleziono żadnego wydania."
      };
    }

    const currentVersion=
      current.parsed;

    const latestVersion=
      parseVersionTag(
        latest.tag
      );

    if(!latestVersion){
      return{
        valid:true,
        updateAvailable:false,
        current,
        latest:null,
        reason:
          "Najnowsze wydanie ma nieprawidłową wersję."
      };
    }

    const currentOrder=
      currentVersion.order;

    const latestOrder=
      latestVersion.order;

    let comparison=0;

    if(
      currentOrder<
      latestOrder
    ){
      comparison=-1;
    }else if(
      currentOrder>
      latestOrder
    ){
      comparison=1;
    }else if(
      currentVersion.type===
      "prototype"
    ){
      if(
        currentVersion.version<
        latestVersion.version
      ){
        comparison=-1;
      }else if(
        currentVersion.version>
        latestVersion.version
      ){
        comparison=1;
      }
    }else{
      const currentSemver=
        currentVersion.version;

      const latestSemver=
        latestVersion.version;

      if(
        currentSemver.major<
        latestSemver.major
      ){
        comparison=-1;
      }else if(
        currentSemver.major>
        latestSemver.major
      ){
        comparison=1;
      }else if(
        currentSemver.minor<
        latestSemver.minor
      ){
        comparison=-1;
      }else if(
        currentSemver.minor>
        latestSemver.minor
      ){
        comparison=1;
      }else if(
        currentSemver.patch<
        latestSemver.patch
      ){
        comparison=-1;
      }else if(
        currentSemver.patch>
        latestSemver.patch
      ){
        comparison=1;
      }
    }

    return{
      valid:true,

      updateAvailable:
        comparison<0,

      current,

      latest,

      comparison,

      reason:null
    };
  }catch(error){
    return{
      valid:true,
      updateAvailable:false,
      current,
      latest:null,
      comparison:0,
      reason:
        `Nie udało się sprawdzić aktualizacji: ${error.message}`
    };
  }
}

/* =========================
   APPLICATION
========================= */

function checkApplication(){
  const packageExists=
    fs.existsSync(
      PACKAGE_FILE
    );

  if(!packageExists){
    return{
      valid:false,
      reason:
        "Nie znaleziono pliku package.json."
    };
  }

  let packageData;

  try{
    packageData=
      readJson(
        PACKAGE_FILE,
        null
      );
  }catch(error){
    return{
      valid:false,
      reason:
        "Nie udało się odczytać package.json."
    };
  }

  if(
    !packageData||
    typeof packageData!=="object"
  ){
    return{
      valid:false,
      reason:
        "Nieprawidłowa zawartość package.json."
    };
  }

  if(
    !packageData.name
  ){
    return{
      valid:false,
      reason:
        "Brak nazwy aplikacji w package.json."
    };
  }

  if(
    !packageData.version
  ){
    return{
      valid:false,
      reason:
        "Brak wersji aplikacji w package.json."
    };
  }

  return{
    valid:true,
    reason:null,
    name:
      packageData.name,
    version:
      packageData.version
  };
}

/* =========================
   DATA
========================= */

function checkData(){
  if(
    !fs.existsSync(
      DATA_DIR
    )
  ){
    return{
      valid:false,
      reason:
        "Nie znaleziono katalogu danych."
    };
  }

  if(
    !fs.existsSync(
      QUESTIONS_FILE
    )
  ){
    return{
      valid:false,
      reason:
        "Nie znaleziono pliku quests.json."
    };
  }

  if(
    !fs.existsSync(
      SETTINGS_FILE
    )
  ){
    return{
      valid:false,
      reason:
        "Nie znaleziono pliku settings.json."
    };
  }

  let questions;

  try{
    questions=
      readJson(
        QUESTIONS_FILE,
        null
      );
  }catch(error){
    return{
      valid:false,
      reason:
        "Nie udało się odczytać quests.json."
    };
  }

  if(
    !Array.isArray(
      questions
    )
  ){
    return{
      valid:false,
      reason:
        "quests.json nie zawiera prawidłowej tablicy."
    };
  }

  let settings;

  try{
    settings=
      readJson(
        SETTINGS_FILE,
        null
      );
  }catch(error){
    return{
      valid:false,
      reason:
        "Nie udało się odczytać settings.json."
    };
  }

  if(
    !settings||
    typeof settings!=="object"||
    Array.isArray(settings)
  ){
    return{
      valid:false,
      reason:
        "settings.json zawiera nieprawidłowe dane."
    };
  }

  return{
    valid:true,
    reason:null,
    questions:
      questions.length
  };
}

/* =========================
   BOOTLOADER
========================= */

async function runBootloader(
  mainWindow
){
  const result={
    success:false,

    executable:null,
    version:null,
    application:null,
    data:null
  };

  /* EXECUTABLE */

  sendStep(
    mainWindow,
    "executable",
    "loading",
    "Sprawdzanie pliku wykonywalnego"
  );

  result.executable=
    checkExecutable();

  if(
    !result.executable.valid
  ){
    sendStep(
      mainWindow,
      "executable",
      "error",
      result.executable.reason
    );

    return result;
  }

  sendStep(
    mainWindow,
    "executable",
    "success",
    "Plik wykonywalny poprawny"
  );

  /* APPLICATION */

  sendStep(
    mainWindow,
    "application",
    "loading",
    "Sprawdzanie aplikacji"
  );

  result.application=
    checkApplication();

  if(
    !result.application.valid
  ){
    sendStep(
      mainWindow,
      "application",
      "error",
      result.application.reason
    );

    return result;
  }

  sendStep(
    mainWindow,
    "application",
    "success",
    "Aplikacja poprawna"
  );

  /* DATA */

  sendStep(
    mainWindow,
    "data",
    "loading",
    "Sprawdzanie danych"
  );

  result.data=
    checkData();

  if(
    !result.data.valid
  ){
    sendStep(
      mainWindow,
      "data",
      "error",
      result.data.reason
    );

    return result;
  }

  sendStep(
    mainWindow,
    "data",
    "success",
    "Dane aplikacji poprawne"
  );

  /* VERSION */

  result.version=
    await checkVersion();

  if(
    !result.version.valid
  ){
    return result;
  }

  result.success=true;

  return result;
}

/* =========================
   PUBLIC API
========================= */

module.exports={
  getExecutableInfo,
  checkExecutable,
  getCurrentVersion,
  checkVersion,
  checkApplication,
  checkData,
  runBootloader
};