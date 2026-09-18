const {
  DEFAULT_SETTINGS
}=require("./config/default-settings");

const {
  fileExists,
  readJsonStrict
}=require("./utils/file");

const storage=
  require("./utils/storage");

/* =========================
   HELPERS
========================= */

function isObject(value){
  return Boolean(
    value&&
    typeof value==="object"&&
    !Array.isArray(value)
  );
}

function getMissingSettings(
  defaults,
  current,
  prefix=""
){
  const missing=[];

  if(!isObject(defaults)){
    return missing;
  }

  Object.keys(defaults)
    .forEach(key=>{
      const fullKey=
        prefix
          ? `${prefix}.${key}`
          : key;

      if(
        !current||
        !Object.prototype.hasOwnProperty.call(
          current,
          key
        )
      ){
        missing.push(
          fullKey
        );

        return;
      }

      if(
        isObject(
          defaults[key]
        )
      ){
        if(
          !isObject(
            current[key]
          )
        ){
          missing.push(
            fullKey
          );

          return;
        }

        missing.push(
          ...getMissingSettings(
            defaults[key],
            current[key],
            fullKey
          )
        );
      }
    });

  return missing;
}

function sendStep(
  mainWindow,
  {
    type="step",
    name=null,
    state=null,
    text=null,
    title=null,
    status=null,
    description=null,
    actions=null
  }={}
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
      type,
      name,
      state,
      text,
      title,
      status,
      description,
      actions
    }
  );
}

/* =========================
   STORAGE INITIALIZATION
========================= */

function initializeDataStorage(){
  if(
    storage.hasDataDirectory()
  ){
    return{
      source:"current",
      path:
        storage.getDataDirectory(),
      exists:
        storage.storageExists(),
      accessible:
        storage.storageAccessible()
    };
  }

  return storage.initializeStorage();
}

/* =========================
   STORAGE
========================= */

function checkStorage(){
  const current=
    storage.getDataDirectory();

  if(!current){
    return{
      valid:false,
      missing:true,
      unavailable:false
    };
  }

  if(
    !storage.storageExists(
      current
    )
  ){
    return{
      valid:false,
      missing:true,
      unavailable:false
    };
  }

  if(
    !storage.storageAccessible(
      current
    )
  ){
    return{
      valid:false,
      missing:false,
      unavailable:true
    };
  }

  return{
    valid:true,
    missing:false,
    unavailable:false
  };
}

/* =========================
   SETTINGS
========================= */

function checkConfiguration(){
  const settingsFile=
    storage.getSettingsFile();

  if(
    !settingsFile||
    !fileExists(
      settingsFile
    )
  ){
    return{
      valid:false,
      missingFile:true,
      damaged:false,
      missingSettings:[]
    };
  }

  let settings;

  try{
    settings=
      readJsonStrict(
        settingsFile
      );
  }catch(error){
    console.error(
      "[Bootloader] Nie udało się odczytać konfiguracji:",
      error
    );

    return{
      valid:false,
      missingFile:false,
      damaged:true,
      missingSettings:[]
    };
  }

  if(
    !isObject(
      settings
    )
  ){
    return{
      valid:false,
      missingFile:false,
      damaged:true,
      missingSettings:[]
    };
  }

  const missingSettings=
    getMissingSettings(
      DEFAULT_SETTINGS,
      settings
    );

  return{
    valid:
      missingSettings.length===0,
    missingFile:false,
    damaged:false,
    missingSettings
  };
}

/* =========================
   QUESTIONS
========================= */

function checkQuestions(){
  const questionsFile=
    storage.getQuestionsFile();

  if(
    !questionsFile||
    !fileExists(
      questionsFile
    )
  ){
    return{
      valid:false,
      missingFile:true,
      damaged:false
    };
  }

  let questions;

  try{
    questions=
      readJsonStrict(
        questionsFile
      );
  }catch(error){
    console.error(
      "[Bootloader] Nie udało się odczytać bazy pytań:",
      error
    );

    return{
      valid:false,
      missingFile:false,
      damaged:true
    };
  }

  if(
    !Array.isArray(
      questions
    )
  ){
    return{
      valid:false,
      missingFile:false,
      damaged:true
    };
  }

  return{
    valid:true,
    missingFile:false,
    damaged:false,
    count:
      questions.length
  };
}

/* =========================
   BOOTLOADER
========================= */

async function runBootloader(
  mainWindow
){
  console.log(
    "[Bootloader] Rozpoczynanie sprawdzania programu"
  );

  const result={
    success:false,
    storage:null,
    configuration:null,
    questions:null
  };

  sendStep(
    mainWindow,
    {
      name:"storage",
      state:"loading",
      text:
        "Sprawdzanie miejsca przechowywania danych",
      status:
        "Sprawdzanie danych programu..."
    }
  );

  const initialized=
    initializeDataStorage();

  console.log(
    "[Bootloader] Inicjalizacja magazynu:",
    initialized
  );

  result.storage={
    initialization:
      initialized,
    ...checkStorage()
  };

  if(
    !result.storage.valid
  ){
    const remembered=
      storage.getRememberedStorage();

    const unavailable=
      Boolean(
        remembered&&
        (
          !storage.storageExists(
            remembered
          )||
          !storage.storageAccessible(
            remembered
          )
        )
      );

    sendStep(
      mainWindow,
      {
        type:"action",
        name:"storage",
        state:"error",
        title:
          unavailable
            ? "Nie znaleziono danych programu"
            : "Wybierz miejsce przechowywania danych",
        status:
          unavailable
            ? "Wcześniej używane miejsce przechowywania danych jest niedostępne."
            : "Program wymaga miejsca do przechowywania danych.",
        description:
          unavailable
            ? "Podłącz ponownie nośnik z danymi lub wybierz inne miejsce przechowywania."
            : "Nie znaleziono miejsca przechowywania danych programu. Możesz utworzyć je w domyślnej lokalizacji lub wskazać inne miejsce.",
        actions:
          unavailable
            ? [
                {
                  id:"storage:retry",
                  label:"Spróbuj ponownie",
                  primary:true
                },
                {
                  id:"storage:select",
                  label:"Wybierz inne miejsce"
                },
                {
                  id:"storage:create-default",
                  label:"Utwórz nowe w Dokumentach"
                }
              ]
            : [
                {
                  id:"storage:create-default",
                  label:"Utwórz w Dokumentach",
                  primary:true
                },
                {
                  id:"storage:select",
                  label:"Wybierz inne miejsce"
                }
              ]
      }
    );

    return result;
  }

  sendStep(
    mainWindow,
    {
      name:"storage",
      state:"success",
      text:
        "Miejsce przechowywania danych jest dostępne",
      status:
        "Sprawdzanie konfiguracji..."
    }
  );

  sendStep(
    mainWindow,
    {
      name:"configuration",
      state:"loading",
      text:
        "Sprawdzanie konfiguracji"
    }
  );

  result.configuration=
    checkConfiguration();

  console.log(
    "[Bootloader] Stan konfiguracji:",
    result.configuration
  );

  if(
    !result.configuration.valid
  ){
    sendStep(
      mainWindow,
      {
        type:"action",
        name:"configuration",
        state:"error",
        title:
          "Wymagane uzupełnienie danych",
        status:
          "Konfiguracja programu wymaga uzupełnienia.",
        description:
          result.configuration.damaged
            ? "Nie udało się poprawnie odczytać konfiguracji programu. Aby kontynuować, należy ją naprawić."
            : result.configuration.missingFile
              ? "Nie znaleziono wymaganej konfiguracji programu. Aby kontynuować, należy ją utworzyć."
              : "Program wykrył brakujące elementy konfiguracji. Aby kontynuować, należy je uzupełnić.",
        actions:[
          {
            id:
              result.configuration.damaged
                ? "configuration:repair"
                : result.configuration.missingFile
                  ? "configuration:create"
                  : "configuration:complete",
            label:
              result.configuration.damaged
                ? "Napraw konfigurację"
                : result.configuration.missingFile
                  ? "Utwórz konfigurację"
                  : "Uzupełnij",
            primary:true
          }
        ]
      }
    );

    return result;
  }

  sendStep(
    mainWindow,
    {
      name:"configuration",
      state:"success",
      text:
        "Konfiguracja jest gotowa",
      status:
        "Sprawdzanie bazy pytań..."
    }
  );

  sendStep(
    mainWindow,
    {
      name:"questions",
      state:"loading",
      text:
        "Sprawdzanie bazy pytań"
    }
  );

  result.questions=
    checkQuestions();

  console.log(
    "[Bootloader] Stan bazy pytań:",
    result.questions
  );

  if(
    !result.questions.valid
  ){
    sendStep(
      mainWindow,
      {
        type:"action",
        name:"questions",
        state:"error",
        title:
          "Wymagane uzupełnienie danych",
        status:
          "Baza pytań wymaga przygotowania.",
        description:
          result.questions.damaged
            ? "Nie udało się poprawnie odczytać bazy pytań. Aby kontynuować, należy ją naprawić."
            : "Nie znaleziono wymaganej bazy pytań. Program może utworzyć brakujący plik.",
        actions:[
          {
            id:
              result.questions.damaged
                ? "questions:repair"
                : "questions:create",
            label:
              result.questions.damaged
                ? "Napraw bazę pytań"
                : "Utwórz bazę pytań",
            primary:true
          }
        ]
      }
    );

    return result;
  }

  sendStep(
    mainWindow,
    {
      name:"questions",
      state:"success",
      text:
        "Baza pytań jest gotowa",
      status:
        "Przygotowywanie programu..."
    }
  );

  sendStep(
    mainWindow,
    {
      name:"ready",
      state:"loading",
      text:
        "Przygotowywanie programu"
    }
  );

  result.success=true;

  sendStep(
    mainWindow,
    {
      name:"ready",
      state:"success",
      text:
        "Program jest gotowy",
      title:
        "Gotowe",
      status:
        "Program jest gotowy do uruchomienia."
    }
  );

  console.log(
    "[Bootloader] Sprawdzanie zakończone pomyślnie"
  );

  return result;
}

/* =========================
   EXPORTS
========================= */

module.exports={
  isObject,
  getMissingSettings,
  sendStep,
  initializeDataStorage,
  checkStorage,
  checkConfiguration,
  checkQuestions,
  runBootloader
};
