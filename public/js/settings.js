const backButton=
  document.getElementById("backButton");

const saveButton=
  document.getElementById("saveButton");

const resetButton=
  document.getElementById("resetButton");

const tabs=
  document.querySelectorAll(".nav-item");

const panels=
  document.querySelectorAll(".tab-panel");

const statusMessage=
  document.getElementById("statusMessage");

/* =========================
   GENERAL
========================= */

const gameTitle=
  document.getElementById("gameTitle");

const questionsCount=
  document.getElementById("questionsCount");

const randomQuestions=
  document.getElementById("randomQuestions");

const randomAnswers=
  document.getElementById("randomAnswers");

const autoNextQuestion=
  document.getElementById("autoNextQuestion");

const confirmAnswer=
  document.getElementById("confirmAnswer");

/* =========================
   SCREEN
========================= */

const fullscreen=
  document.getElementById(
    "fullscreen"
  );

const technicalInfo=
  document.getElementById(
    "technicalInfo"
  );

const screenDisplay=
  document.getElementById(
    "screenDisplay"
  );

const screenResolution=
  document.getElementById(
    "screenResolution"
  );

const manualScreenSettings=
  document.getElementById(
    "manualScreenSettings"
  );

const manualScreenSettingsContent=
  document.getElementById(
    "manualScreenSettingsContent"
  );

const screenIndex=
  document.getElementById(
    "screenIndex"
  );

const screenWidth=
  document.getElementById(
    "screenWidth"
  );

const screenHeight=
  document.getElementById(
    "screenHeight"
  );

let availableDisplays=[];

/* =========================
   SCREEN MODE
========================= */

function updateScreenMode(){
  if(
    !manualScreenSettingsContent
  ){
    return;
  }

  const manual=
    Boolean(
      manualScreenSettings
        ?.checked
    );

  manualScreenSettingsContent.hidden=
    !manual;

  if(screenDisplay){
    screenDisplay.disabled=
      manual;
  }

  if(screenResolution){
    screenResolution.disabled=
      manual;
  }
}

manualScreenSettings
  ?.addEventListener(
    "change",
    ()=>{
      updateScreenMode();
    }
  );

/* =========================
   LOAD DISPLAYS
========================= */

async function loadDisplays(
  selectedDisplayId=null,
  selectedResolution="native"
){
  if(
    !screenDisplay||
    !screenResolution
  ){
    return;
  }

  try{
    const displays=
      await window
        .millionaireAPI
        ?.screen
        ?.getDisplays?.();

    availableDisplays=
      Array.isArray(displays)
        ? displays
        : [];

    renderDisplays(
      selectedDisplayId
    );

    renderResolutions(
      screenDisplay.value,
      selectedResolution
    );
  }catch(error){
    console.error(
      "Błąd pobierania monitorów:",
      error
    );

    availableDisplays=[];

    screenDisplay.innerHTML="";

    const option=
      document.createElement(
        "option"
      );

    option.value="";
    option.textContent=
      "Nie udało się pobrać monitorów";

    screenDisplay.appendChild(
      option
    );

    renderResolutions(
      null,
      selectedResolution
    );
  }
}

/* =========================
   RENDER DISPLAYS
========================= */

function renderDisplays(
  selectedDisplayId=null
){
  if(!screenDisplay){
    return;
  }

  screenDisplay.innerHTML="";

  if(
    availableDisplays.length===0
  ){
    const option=
      document.createElement(
        "option"
      );

    option.value="";

    option.textContent=
      "Brak wykrytych monitorów";

    screenDisplay.appendChild(
      option
    );

    return;
  }

  availableDisplays.forEach(
    display=>{
      const option=
        document.createElement(
          "option"
        );

      option.value=
        String(
          display.id
        );

      option.textContent=
        display.label||
        `Monitor ${
          Number(display.index)+1
        }`;

      screenDisplay.appendChild(
        option
      );
    }
  );

  const requested=
    String(
      selectedDisplayId??""
    );

  const exists=
    availableDisplays.some(
      display=>
        String(display.id)===
        requested
    );

  if(exists){
    screenDisplay.value=
      requested;

    return;
  }

  const primary=
    availableDisplays.find(
      display=>
        display.primary
    )||
    availableDisplays[0];

  if(primary){
    screenDisplay.value=
      String(
        primary.id
      );
  }
}

/* =========================
   GET SELECTED DISPLAY
========================= */

function getSelectedDisplay(){
  const id=
    String(
      screenDisplay?.value||
      ""
    );

  return(
    availableDisplays.find(
      display=>
        String(display.id)===
        id
    )||
    null
  );
}

/* =========================
   RENDER RESOLUTIONS
========================= */

function renderResolutions(
  displayId,
  selectedResolution="native"
){
  if(!screenResolution){
    return;
  }

  screenResolution.innerHTML="";

  const display=
    availableDisplays.find(
      item=>
        String(item.id)===
        String(displayId)
    );

  if(!display){
    const option=
      document.createElement(
        "option"
      );

    option.value="native";

    option.textContent=
      "Natywna / zalecana";

    screenResolution.appendChild(
      option
    );

    return;
  }

  const nativeWidth=
    Number(
      display
        ?.resolution
        ?.width||
      display
        ?.pixelSize
        ?.width||
      1920
    );

  const nativeHeight=
    Number(
      display
        ?.resolution
        ?.height||
      display
        ?.pixelSize
        ?.height||
      1080
    );

  const nativeOption=
    document.createElement(
      "option"
    );

  nativeOption.value=
    "native";

  nativeOption.textContent=
    `Natywna / zalecana — ${
      nativeWidth
    } × ${
      nativeHeight
    }`;

  screenResolution.appendChild(
    nativeOption
  );

  const resolutions=
    Array.isArray(
      display.resolutions
    )
      ? display.resolutions
      : [];

  resolutions.forEach(
    resolution=>{
      const value=
        resolution.value||
        `${
          resolution.width
        }x${
          resolution.height
        }`;

      const option=
        document.createElement(
          "option"
        );

      option.value=
        value;

      option.textContent=
        resolution.label||
        `${
          resolution.width
        } × ${
          resolution.height
        }`;

      screenResolution.appendChild(
        option
      );
    }
  );

  const requested=
    String(
      selectedResolution||
      "native"
    );

  const exists=[
    ...screenResolution.options
  ].some(
    option=>
      option.value===
      requested
  );

  screenResolution.value=
    exists
      ? requested
      : "native";
}

/* =========================
   DISPLAY CHANGE
========================= */

screenDisplay
  ?.addEventListener(
    "change",
    ()=>{
      renderResolutions(
        screenDisplay.value,
        "native"
      );

      syncLegacyScreenValues();
    }
  );

/* =========================
   RESOLUTION CHANGE
========================= */

screenResolution
  ?.addEventListener(
    "change",
    ()=>{
      syncLegacyScreenValues();
    }
  );

/* =========================
   LEGACY SYNC
========================= */

function syncLegacyScreenValues(){
  const display=
    getSelectedDisplay();

  if(!display){
    return;
  }

  if(screenIndex){
    screenIndex.value=
      Number(
        display.index
      )||0;
  }

  const resolution=
    getSelectedResolution();

  if(screenWidth){
    screenWidth.value=
      resolution.width;
  }

  if(screenHeight){
    screenHeight.value=
      resolution.height;
  }
}

/* =========================
   SELECTED RESOLUTION
========================= */

function getSelectedResolution(){
  const display=
    getSelectedDisplay();

  const nativeWidth=
    Number(
      display
        ?.resolution
        ?.width||
      display
        ?.pixelSize
        ?.width||
      1920
    );

  const nativeHeight=
    Number(
      display
        ?.resolution
        ?.height||
      display
        ?.pixelSize
        ?.height||
      1080
    );

  const value=
    screenResolution
      ?.value||
    "native";

  if(value==="native"){
    return{
      value:"native",

      width:
        nativeWidth,

      height:
        nativeHeight
    };
  }

  const match=
    /^(\d+)x(\d+)$/
      .exec(value);

  if(!match){
    return{
      value:"native",

      width:
        nativeWidth,

      height:
        nativeHeight
    };
  }

  return{
    value,

    width:
      Number(
        match[1]
      ),

    height:
      Number(
        match[2]
      )
  };
}

/* =========================
   SOUND
========================= */

const masterVolume=
  document.getElementById("masterVolume");

const masterVolumeValue=
  document.getElementById("masterVolumeValue");

const interfaceSounds=
  document.getElementById("interfaceSounds");

const gameSounds=
  document.getElementById("gameSounds");

/* =========================
   PRIZE TREE
========================= */

const currency=
  document.getElementById("currency");

const prizeLevels=
  document.getElementById("prizeLevels");

/* =========================
   APPEARANCE - GENERAL
========================= */

const theme=
  document.getElementById("theme");

const accentColor=
  document.getElementById("accentColor");

const animations=
  document.getElementById("animations");

/* =========================
   APPEARANCE TABS
========================= */

const appearanceTabs=[
  ...document.querySelectorAll(
    ".appearance-tab"
  )
];

const appearancePanels=[
  ...document.querySelectorAll(
    ".appearance-panel"
  )
];

/* =========================
   GAME APPEARANCE
========================= */

const gameAppearancePreset=
  document.getElementById(
    "gameAppearancePreset"
  );

const resetGameAppearanceButton=
  document.getElementById(
    "resetGameAppearanceButton"
  );

/* =========================
   GAME BACKGROUND
========================= */

const gameBackgroundImage=
  document.getElementById(
    "gameBackgroundImage"
  );

const gameBackgroundSize=
  document.getElementById(
    "gameBackgroundSize"
  );

const gameBackgroundPosition=
  document.getElementById(
    "gameBackgroundPosition"
  );

const gameBackgroundBrightness=
  document.getElementById(
    "gameBackgroundBrightness"
  );

const gameBackgroundBrightnessValue=
  document.getElementById(
    "gameBackgroundBrightnessValue"
  );

const gameBackgroundOverlayEnabled=
  document.getElementById(
    "gameBackgroundOverlayEnabled"
  );

const gameBackgroundOverlayColor=
  document.getElementById(
    "gameBackgroundOverlayColor"
  );

const gameBackgroundOverlayOpacity=
  document.getElementById(
    "gameBackgroundOverlayOpacity"
  );

const gameBackgroundOverlayOpacityValue=
  document.getElementById(
    "gameBackgroundOverlayOpacityValue"
  );

/* =========================
   GAME COLORS
========================= */

const gamePrimaryColor=
  document.getElementById(
    "gamePrimaryColor"
  );

const gamePrimaryHoverColor=
  document.getElementById(
    "gamePrimaryHoverColor"
  );

const gameSecondaryColor=
  document.getElementById(
    "gameSecondaryColor"
  );

const gameAccentColor=
  document.getElementById(
    "gameAccentColor"
  );

const gameTextColor=
  document.getElementById(
    "gameTextColor"
  );

const gameMutedColor=
  document.getElementById(
    "gameMutedColor"
  );

const gameSuccessColor=
  document.getElementById(
    "gameSuccessColor"
  );

const gameDangerColor=
  document.getElementById(
    "gameDangerColor"
  );

/* =========================
   ADVANCED
========================= */

const gameAdvancedAppearance=
  document.getElementById(
    "gameAdvancedAppearance"
  );

const gameAdvancedAppearanceContent=
  document.getElementById(
    "gameAdvancedAppearanceContent"
  );

/* =========================
   SIDEBAR
========================= */

const gameSidebarBackground=
  document.getElementById(
    "gameSidebarBackground"
  );

const gameSidebarSurface=
  document.getElementById(
    "gameSidebarSurface"
  );

const gameSidebarSurfaceHover=
  document.getElementById(
    "gameSidebarSurfaceHover"
  );

const gameSidebarBorder=
  document.getElementById(
    "gameSidebarBorder"
  );

const gameSidebarBorderStrong=
  document.getElementById(
    "gameSidebarBorderStrong"
  );

/* =========================
   QUESTION
========================= */

const gameQuestionBackground=
  document.getElementById(
    "gameQuestionBackground"
  );

const gameQuestionBorder=
  document.getElementById(
    "gameQuestionBorder"
  );

const gameQuestionText=
  document.getElementById(
    "gameQuestionText"
  );

const gameQuestionBlur=
  document.getElementById(
    "gameQuestionBlur"
  );

/* =========================
   ANSWERS
========================= */

const gameAnswerBackground=
  document.getElementById(
    "gameAnswerBackground"
  );

const gameAnswerHover=
  document.getElementById(
    "gameAnswerHover"
  );

const gameAnswerBorder=
  document.getElementById(
    "gameAnswerBorder"
  );

const gameAnswerText=
  document.getElementById(
    "gameAnswerText"
  );

const gameAnswerLetterBackground=
  document.getElementById(
    "gameAnswerLetterBackground"
  );

const gameAnswerLetterText=
  document.getElementById(
    "gameAnswerLetterText"
  );

/* =========================
   ANSWER STATES
========================= */

const gameSelectedBackground=
  document.getElementById(
    "gameSelectedBackground"
  );

const gameSelectedBorder=
  document.getElementById(
    "gameSelectedBorder"
  );

const gameCorrectBackground=
  document.getElementById(
    "gameCorrectBackground"
  );

const gameCorrectText=
  document.getElementById(
    "gameCorrectText"
  );

const gameWrongBackground=
  document.getElementById(
    "gameWrongBackground"
  );

const gameWrongText=
  document.getElementById(
    "gameWrongText"
  );

/* =========================
   BUTTONS
========================= */

const gameButtonActive=
  document.getElementById(
    "gameButtonActive"
  );

const gameButtonActiveHover=
  document.getElementById(
    "gameButtonActiveHover"
  );

const gameButtonInactive=
  document.getElementById(
    "gameButtonInactive"
  );

const gameButtonInactiveHover=
  document.getElementById(
    "gameButtonInactiveHover"
  );

const gameButtonDisabledOpacity=
  document.getElementById(
    "gameButtonDisabledOpacity"
  );

/* =========================
   END SCENE
========================= */

const gameEndBackground=
  document.getElementById(
    "gameEndBackground"
  );

const gameEndSurface=
  document.getElementById(
    "gameEndSurface"
  );

const gameEndBorder=
  document.getElementById(
    "gameEndBorder"
  );

const gameEndAmountColor=
  document.getElementById(
    "gameEndAmountColor"
  );

/* =========================
   GAME ANIMATIONS
========================= */

const gameAnimationsEnabled=
  document.getElementById(
    "gameAnimationsEnabled"
  );

const gameSidebarAnimationDuration=
  document.getElementById(
    "gameSidebarAnimationDuration"
  );

const gameQuestionAnimationDuration=
  document.getElementById(
    "gameQuestionAnimationDuration"
  );

const gameAnswerAnimationDuration=
  document.getElementById(
    "gameAnswerAnimationDuration"
  );

const gameEndAnimationDuration=
  document.getElementById(
    "gameEndAnimationDuration"
  );

/* =========================
   SHORTCUTS
========================= */

const shortcutsEnabled=
  document.getElementById(
    "shortcutsEnabled"
  );

const shortcutsSettingsList=
  document.getElementById(
    "shortcutsSettingsList"
  );

const shortcutBaseTimeout=
  document.getElementById(
    "shortcutBaseTimeout"
  );

const shortcutAdditionalTimeout=
  document.getElementById(
    "shortcutAdditionalTimeout"
  );

const shortcutMaxKeys=
  document.getElementById(
    "shortcutMaxKeys"
  );

const resetShortcutsButton=
  document.getElementById(
    "resetShortcutsButton"
  );

let shortcutDraft={};

let shortcutCaptureInput=null;
let shortcutCaptureKeys=[];
let shortcutCaptureTimeout=null;

const SHORTCUT_GROUP_LABELS={
  general:"Ogólne",
  game:"Gra",
  questions:"Pytania",
  settings:"Ustawienia",
  correctAnswer:"Poprawna odpowiedź",
  level:"Poziomy pytań"
};

const SHORTCUT_LABELS={
  help:"Pomoc skrótów",
  home:"Panel główny",
  startGame:"Rozpocznij grę",
  quit:"Wyjdź z programu",
  questions:"Baza pytań",
  settings:"Ustawienia",
  reload:"Odśwież",
  forceReload:"Wymuś odświeżenie",
  fullscreen:"Pełny ekran",
  devTools:"DevTools",

  prefix:"Klawisz aktywujący",

  sidebar:"Pasek boczny",
  controls:"Panel sterowania",
  mainScreen:"Główny ekran",
  showQuestion:"Pokaż pytanie",
  showAnswer:"Pokaż odpowiedź",

  answerA:"Odpowiedź A",
  answerB:"Odpowiedź B",
  answerC:"Odpowiedź C",
  answerD:"Odpowiedź D",

  confirm:"Potwierdź odpowiedź",
  nextQuestion:"Następne pytanie",
  exit:"Zakończ grę",

  add:"Dodaj pytanie",
  edit:"Edytuj pytanie",
  remove:"Usuń pytanie",
  toggleActive:"Aktywne / nieaktywne",

  general:"Ogólne",
  screen:"Ekran",
  sound:"Dźwięk",
  prizeTree:"Drzewko nagród",
  appearance:"Wygląd",
  dataStorage:"Zapisy danych",
  shortcuts:"Skróty",

  save:"Zapisz ustawienia",
  reset:"Przywróć ustawienia",
  colorPalette:"Paleta kolorów"
};

function cloneValue(
  value
){
  return structuredClone(
    value||{}
  );
}

function isPlainObject(
  value
){
  return Boolean(
    value&&
    typeof value==="object"&&
    !Array.isArray(value)
  );
}

function humanizeShortcutKey(
  key,
  parentKey=null
){
  if(
    parentKey==="level"&&
    /^\d+$/.test(
      String(key)
    )
  ){
    return `Poziom ${key}`;
  }

  if(
    parentKey==="correctAnswer"&&
    ["A","B","C","D"]
      .includes(
        String(key)
      )
  ){
    return `Odpowiedź ${key}`;
  }

  if(SHORTCUT_LABELS[key]){
    return SHORTCUT_LABELS[key];
  }

  if(/^\d+$/.test(String(key))){
    return `Poziom ${key}`;
  }

  return String(key)
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /^./,
      value=>
        value.toUpperCase()
    );
}

function setShortcutPathValue(
  object,
  path,
  value
){
  const keys=
    path.split(".");

  const last=
    keys.pop();

  let current=
    object;

  keys.forEach(key=>{
    if(
      !isPlainObject(
        current[key]
      )
    ){
      current[key]={};
    }

    current=
      current[key];
  });

  current[last]=value;
}

function formatShortcutValue(
  value
){
  return String(
    value??""
  )
    .split("+")
    .map(
      item=>
        item.trim()
    )
    .filter(Boolean)
    .join(" + ");
}

function normalizeShortcutKey(
  key
){
  if(!key){
    return "";
  }

  const aliases={
    " ":"Space",
    Control:"Ctrl",
    Escape:"Esc",
    ArrowUp:"↑",
    ArrowDown:"↓",
    ArrowLeft:"←",
    ArrowRight:"→"
  };

  if(aliases[key]){
    return aliases[key];
  }

  if(key.length===1){
    return key.toUpperCase();
  }

  return key;
}

function isModifierKey(
  key
){
  return[
    "Control",
    "Alt",
    "Shift",
    "Meta"
  ].includes(
    key
  );
}

function getPressedShortcutKeys(
  event
){
  const keys=[];

  if(event.ctrlKey){
    keys.push("Ctrl");
  }

  if(event.altKey){
    keys.push("Alt");
  }

  if(event.shiftKey){
    keys.push("Shift");
  }

  if(event.metaKey){
    keys.push("Meta");
  }

  if(
    !isModifierKey(
      event.key
    )
  ){
    const key=
      normalizeShortcutKey(
        event.key
      );

    if(key){
      keys.push(
        key
      );
    }
  }

  return keys;
}

function renderShortcutSettings(
  shortcuts={}
){
  console.log(
    "[SHORTCUTS] renderShortcutSettings()",
    {
      container:
        shortcutsSettingsList,
      shortcuts
    }
  );

  if(!shortcutsSettingsList){
    console.error(
      "[SHORTCUTS] Brak elementu #shortcutsSettingsList."
    );

    return;
  }

  finishShortcutCapture();

  shortcutsSettingsList.innerHTML="";

  const groups=
    Object.entries(
      shortcuts
    )
      .filter(
        ([key,value])=>
          key!=="enabled"&&
          key!=="timing"&&
          isPlainObject(value)
      );

  console.log(
    "[SHORTCUTS] Grupy do wyrenderowania:",
    groups.map(
      ([key])=>key
    )
  );

  groups.forEach(
    ([groupKey,groupValue])=>{
      console.log(
        `[SHORTCUTS] Render grupy: ${groupKey}`,
        groupValue
      );
        const group=
          document.createElement(
            "section"
          );

        group.className=
          "shortcuts-settings-group";

        const title=
          document.createElement(
            "h4"
          );

        title.className=
          "shortcuts-settings-group-title";

        title.textContent=
          SHORTCUT_GROUP_LABELS[
            groupKey
          ]||
          humanizeShortcutKey(
            groupKey
          );

        const grid=
          document.createElement(
            "div"
          );

        grid.className=
          "shortcuts-settings-grid";

        renderShortcutObject(
          grid,
          groupValue,
          groupKey,
          null
        );

        group.append(
          title,
          grid
        );

        shortcutsSettingsList
          .appendChild(
            group
          );
    }
  );

  console.log(
    "[SHORTCUTS] Render zakończony. Liczba grup:",
    groups.length
  );

  updateShortcutsEnabledState();
}

function renderShortcutObject(
  container,
  object,
  basePath,
  parentKey=null
){
  console.log(
    "[SHORTCUTS] renderShortcutObject()",
    {
      basePath,
      parentKey,
      keys:
        Object.keys(
          object||{}
        )
    }
  );

  Object.entries(
    object
  ).forEach(
    ([key,value])=>{
      const path=
        `${basePath}.${key}`;

      if(isPlainObject(value)){
        const subgroup=
          document.createElement(
            "div"
          );

        subgroup.className=
          "shortcut-setting-subgroup";

        const title=
          document.createElement(
            "strong"
          );

        title.className=
          "shortcut-setting-subgroup-title";

        title.textContent=
          SHORTCUT_GROUP_LABELS[
            key
          ]||
          humanizeShortcutKey(
            key,
            parentKey
          );

        const grid=
          document.createElement(
            "div"
          );

        grid.className=
          "shortcuts-settings-grid";

        renderShortcutObject(
          grid,
          value,
          path,
          key
        );

        subgroup.append(
          title,
          grid
        );

        container.appendChild(
          subgroup
        );

        return;
      }

      const field=
        document.createElement(
          "div"
        );

      field.className=
        "shortcut-setting-item";

      const label=
        document.createElement(
          "label"
        );

      label.textContent=
        humanizeShortcutKey(
          key,
          parentKey
        );

      const input=
        document.createElement(
          "input"
        );

      input.type="text";
      input.readOnly=true;
      input.autocomplete="off";
      input.spellcheck=false;

      input.className=
        "shortcut-capture-input";

      input.value=
        formatShortcutValue(
          value
        );

      input.dataset.shortcutPath=
        path;

      input.dataset.shortcutValue=
        String(
          value??""
        );

      input.placeholder=
        "Kliknij i naciśnij skrót";

      input.addEventListener(
        "click",
        ()=>{
          startShortcutCapture(
            input
          );
        }
      );

      input.addEventListener(
        "keydown",
        event=>{
          handleShortcutCapture(
            event,
            input
          );
        }
      );

      input.addEventListener(
        "blur",
        ()=>{
          if(
            shortcutCaptureInput===
            input
          ){
            if(
              shortcutCaptureKeys
                .length>0
            ){
              saveCapturedSequence(
                input
              );
            }else{
              cancelShortcutCapture();
            }
          }
        }
      );

      field.append(
        label,
        input
      );

      container.appendChild(
        field
      );
    }
  );
}

function startShortcutCapture(
  input
){
  if(
    !shortcutsEnabled
      ?.checked
  ){
    return;
  }

  if(
    shortcutCaptureInput&&
    shortcutCaptureInput!==input
  ){
    if(
      shortcutCaptureKeys
        .length>0
    ){
      saveCapturedSequence(
        shortcutCaptureInput
      );
    }else{
      cancelShortcutCapture();
    }
  }

  clearTimeout(
    shortcutCaptureTimeout
  );

  shortcutCaptureTimeout=null;

  shortcutCaptureInput=
    input;

  shortcutCaptureKeys=[];

  input.classList.add(
    "is-capturing"
  );

  input.value=
    "Naciśnij skrót...";

  input.focus();
}

function handleShortcutCapture(
  event,
  input
){
  if(
    shortcutCaptureInput!==
    input
  ){
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if(
    event.key==="Escape"
  ){
    cancelShortcutCapture();
    return;
  }

  if(
    event.key==="Backspace"||
    event.key==="Delete"
  ){
    input.dataset.shortcutValue="";
    input.value="";

    setShortcutPathValue(
      shortcutDraft,
      input.dataset.shortcutPath,
      ""
    );

    finishShortcutCapture();

    return;
  }

  /*
   * Sam klawisz Ctrl / Alt / Shift / Meta
   * jeszcze niczego nie zapisuje.
   * Dzięki temu można nacisnąć:
   *
   * Ctrl -> B
   * Ctrl + Shift -> P
   */

  if(
    isModifierKey(
      event.key
    )
  ){
    const preview=
      getPressedShortcutKeys(
        event
      );

    input.value=
      preview.length
        ? `${preview.join(" + ")} + ...`
        : "Naciśnij skrót...";

    return;
  }

  /*
   * Kombinacja z modyfikatorem:
   *
   * Ctrl + B
   * Ctrl + Shift + P
   */

  if(
    event.ctrlKey||
    event.altKey||
    event.shiftKey||
    event.metaKey
  ){
    const keys=
      getPressedShortcutKeys(
        event
      );

    const value=
      keys.join("+");

    saveCapturedValue(
      input,
      value
    );

    return;
  }

  /*
   * Sekwencja:
   *
   * G + B
   * P + Q + 1
   * B + P
   */

  const key=
    normalizeShortcutKey(
      event.key
    );

  if(!key){
    return;
  }

  const maxKeys=
    normalizeNumber(
      shortcutMaxKeys
        ?.value,
      4,
      1,
      8
    );

  if(
    shortcutCaptureKeys.length<
    maxKeys
  ){
    shortcutCaptureKeys.push(
      key
    );
  }

  input.value=
    shortcutCaptureKeys.join(
      " + "
    );

  clearTimeout(
    shortcutCaptureTimeout
  );

  /*
   * Ustalony standard:
   *
   * 1 klawisz  = 1000 ms
   * +250 ms za każdy kolejny
   *
   * Wartości mogą być zmienione
   * w ustawieniach.
   */

  const base=
    normalizeNumber(
      shortcutBaseTimeout
        ?.value,
      1000,
      250
    );

  const additional=
    normalizeNumber(
      shortcutAdditionalTimeout
        ?.value,
      250,
      0
    );

  const timeout=
    base+
    Math.max(
      0,
      shortcutCaptureKeys.length-1
    )*
    additional;

  if(
    shortcutCaptureKeys.length>=
    maxKeys
  ){
    saveCapturedSequence(
      input
    );

    return;
  }

  shortcutCaptureTimeout=
    setTimeout(
      ()=>{
        saveCapturedSequence(
          input
        );
      },
      timeout
    );
}

function saveCapturedSequence(
  input
){
  if(
    !input||
    shortcutCaptureKeys
      .length===0
  ){
    cancelShortcutCapture();
    return;
  }

  const value=
    shortcutCaptureKeys.join(
      "+"
    );

  saveCapturedValue(
    input,
    value
  );
}

function saveCapturedValue(
  input,
  value
){
  if(!input){
    return;
  }

  const normalizedValue=
    String(
      value||""
    )
      .split("+")
      .map(
        item=>
          item.trim()
      )
      .filter(Boolean)
      .join("+");

  input.dataset.shortcutValue=
    normalizedValue;

  input.value=
    formatShortcutValue(
      normalizedValue
    );

  setShortcutPathValue(
    shortcutDraft,
    input.dataset.shortcutPath,
    normalizedValue
  );

  console.log(
    "[SHORTCUTS] Zmieniono skrót:",
    {
      path:
        input.dataset.shortcutPath,
      value:
        normalizedValue
    }
  );

  console.log(
    "[SHORTCUTS] Aktualny shortcutDraft:",
    shortcutDraft
  );

  finishShortcutCapture();
}

function cancelShortcutCapture(){
  if(!shortcutCaptureInput){
    return;
  }

  shortcutCaptureInput.value=
    formatShortcutValue(
      shortcutCaptureInput
        .dataset
        .shortcutValue||
      ""
    );

  finishShortcutCapture();
}

function finishShortcutCapture(){
  clearTimeout(
    shortcutCaptureTimeout
  );

  shortcutCaptureTimeout=null;

  shortcutCaptureInput
    ?.classList
    .remove(
      "is-capturing"
    );

  shortcutCaptureInput=null;
  shortcutCaptureKeys=[];
}

function updateShortcutsEnabledState(){
  const enabled=
    shortcutsEnabled
      ? shortcutsEnabled.checked
      : true;

  shortcutsSettingsList
    ?.classList
    .toggle(
      "shortcuts-settings-disabled",
      !enabled
    );

  shortcutsSettingsList
    ?.querySelectorAll(
      ".shortcut-capture-input"
    )
    .forEach(
      input=>{
        input.disabled=
          !enabled;
      }
    );
}

shortcutsEnabled
  ?.addEventListener(
    "change",
    ()=>{
      if(
        !shortcutsEnabled.checked
      ){
        cancelShortcutCapture();
      }

      updateShortcutsEnabledState();
    }
  );

function applyShortcutEditorSettings(
  shortcuts={}
){
  console.log(
    "[SHORTCUTS] applyShortcutEditorSettings()",
    shortcuts
  );

  shortcutDraft=
    cloneValue(
      shortcuts
    );

  console.log(
    "[SHORTCUTS] Utworzono shortcutDraft:",
    shortcutDraft
  );

  if(shortcutsEnabled){
    shortcutsEnabled.checked=
      shortcuts.enabled!==false;
  }else{
    console.warn(
      "[SHORTCUTS] Brak #shortcutsEnabled."
    );
  }

  if(shortcutBaseTimeout){
    shortcutBaseTimeout.value=
      shortcuts
        ?.timing
        ?.base??
      1000;
  }else{
    console.warn(
      "[SHORTCUTS] Brak #shortcutBaseTimeout."
    );
  }

  if(shortcutAdditionalTimeout){
    shortcutAdditionalTimeout.value=
      shortcuts
        ?.timing
        ?.additionalPerKey??
      250;
  }else{
    console.warn(
      "[SHORTCUTS] Brak #shortcutAdditionalTimeout."
    );
  }

  if(shortcutMaxKeys){
    shortcutMaxKeys.value=
      shortcuts
        ?.timing
        ?.maxKeys??
      4;
  }else{
    console.warn(
      "[SHORTCUTS] Brak #shortcutMaxKeys."
    );
  }

  console.log(
    "[SHORTCUTS] Uruchamiam renderShortcutSettings()."
  );

  renderShortcutSettings(
    shortcutDraft
  );
}

function collectShortcutSettings(){
  console.log(
    "[SHORTCUTS] collectShortcutSettings() - rozpoczęcie"
  );

  if(
    shortcutCaptureInput&&
    shortcutCaptureKeys.length>0
  ){
    saveCapturedSequence(
      shortcutCaptureInput
    );
  }

  const shortcuts=
    cloneValue(
      shortcutDraft
    );

  shortcuts.enabled=
    shortcutsEnabled
      ? shortcutsEnabled.checked
      : true;

  if(
    !isPlainObject(
      shortcuts.timing
    )
  ){
    shortcuts.timing={};
  }

  shortcuts.timing.base=
    normalizeNumber(
      shortcutBaseTimeout
        ?.value,
      1000,
      250
    );

  shortcuts
    .timing
    .additionalPerKey=
    normalizeNumber(
      shortcutAdditionalTimeout
        ?.value,
      250,
      0
    );

  shortcuts.timing.maxKeys=
    normalizeNumber(
      shortcutMaxKeys
        ?.value,
      4,
      1,
      8
    );

  console.log(
    "[SHORTCUTS] Dane przygotowane do zapisu:",
    shortcuts
  );

  return shortcuts;
}

resetShortcutsButton
  ?.addEventListener(
    "click",
    async()=>{
      const confirmed=
        confirm(
          "Czy przywrócić domyślne skróty klawiszowe?"
        );

      if(!confirmed){
        return;
      }

      const getDefaults=
        window
          .millionaireAPI
          ?.settings
          ?.getDefaults;

      if(
        typeof getDefaults!==
        "function"
      ){
        showStatus(
          "Brak API domyślnych ustawień."
        );

        return;
      }

      try{
        const defaults=
          await getDefaults();

        applyShortcutEditorSettings(
          defaults?.shortcuts||{}
        );

        showStatus(
          "Przywrócono domyślne skróty."
        );
      }catch(error){
        console.error(
          "Błąd przywracania skrótów:",
          error
        );

        showStatus(
          "Nie udało się przywrócić skrótów."
        );
      }
    }
  );

/* =========================
   DEFAULT PRIZES
========================= */

const DEFAULT_PRIZES=[
  500,
  1000,
  2000,
  5000,
  10000,
  20000,
  40000,
  75000,
  125000,
  250000,
  500000,
  1000000
];

/* =========================
   DEFAULT GAME APPEARANCE
========================= */

const DEFAULT_GAME_APPEARANCE={
  preset:"default",

  advanced:false,

  background:{
    image:
      "../public/assets/background/glowne.png",

    size:"cover",
    position:"center",
    brightness:100,

    overlayEnabled:false,
    overlayColor:"#000000",
    overlayOpacity:0
  },

  colors:{
    primary:"#8b5cf6",
    primaryHover:"#a778ff",
    secondary:"#536dfe",
    accent:"#a855f7",

    text:"#ffffff",
    muted:"#b9b5d4",

    success:"#22c55e",
    danger:"#ef4444"
  },

  sidebar:{
    background:
      "rgba(7, 8, 32, 0.94)",

    surface:
      "rgba(24, 20, 65, 0.88)",

    surfaceHover:
      "rgba(48, 35, 105, 0.92)",

    border:
      "rgba(145, 112, 255, 0.28)",

    borderStrong:
      "rgba(165, 132, 255, 0.55)"
  },

  question:{
    background:
      "rgba(9, 10, 38, 0.90)",

    border:
      "rgba(157, 128, 255, 0.42)",

    text:"#ffffff",

    blur:8
  },

  answers:{
    background:
      "rgba(15, 16, 52, 0.92)",

    backgroundHover:
      "rgba(35, 29, 88, 0.94)",

    border:
      "rgba(145, 112, 255, 0.34)",

    text:"#ffffff",

    letterBackground:
      "rgba(139, 92, 246, 0.18)",

    letterText:"#bda1ff",

    selected:{
      background:
        "rgba(83, 109, 254, 0.30)",

      border:"#8b5cf6"
    },

    correct:{
      background:
        "rgba(34, 197, 94, 0.20)",

      text:"#8ef0ae"
    },

    wrong:{
      background:
        "rgba(239, 68, 68, 0.20)",

      text:"#ff9a9a"
    }
  },

  buttons:{
    active:"#8b5cf6",
    activeHover:"#a778ff",

    inactive:
      "rgba(24, 20, 65, 0.88)",

    inactiveHover:
      "rgba(48, 35, 105, 0.92)",

    disabledOpacity:0.5
  },

  endScene:{
    background:
      "rgba(7, 8, 32, 0.88)",

    surface:
      "rgba(24, 20, 65, 0.92)",

    border:
      "rgba(165, 132, 255, 0.55)",

    amountColor:"#ffffff"
  },

  animations:{
    enabled:true,

    sidebarDuration:1000,
    questionDuration:900,
    answerDuration:750,
    endSceneDuration:1000
  }
};

/* =========================
   PRESETS
========================= */

const GAME_APPEARANCE_PRESETS={
  default:
    DEFAULT_GAME_APPEARANCE,

  purple:{
    ...structuredClone(
      DEFAULT_GAME_APPEARANCE
    ),

    preset:"purple"
  },

  blue:{
    ...structuredClone(
      DEFAULT_GAME_APPEARANCE
    ),

    preset:"blue",

    colors:{
      ...DEFAULT_GAME_APPEARANCE
        .colors,

      primary:"#356df3",
      primaryHover:"#285bd4",
      secondary:"#536dfe",
      accent:"#38bdf8"
    }
  },

  dark:{
    ...structuredClone(
      DEFAULT_GAME_APPEARANCE
    ),

    preset:"dark",

    colors:{
      ...DEFAULT_GAME_APPEARANCE
        .colors,

      primary:"#6d5dfc",
      primaryHover:"#8073ff",
      secondary:"#3b4cca",
      accent:"#9f7aea"
    },

    sidebar:{
      ...DEFAULT_GAME_APPEARANCE
        .sidebar,

      background:
        "rgba(4, 5, 18, 0.97)",

      surface:
        "rgba(15, 16, 36, 0.94)",

      surfaceHover:
        "rgba(30, 32, 62, 0.96)"
    }
  }
};

let currentSettings=null;

/* =========================
   NAVIGATION
========================= */

backButton?.addEventListener(
  "click",
  ()=>{
    window.location.href=
      "index.html";
  }
);

function openTab(
  target
){
  if(!target){
    return false;
  }

  let found=false;

  tabs.forEach(tab=>{
    const isActive=
      tab.dataset.tab===
      target;

    tab.classList.toggle(
      "active",
      isActive
    );

    if(isActive){
      found=true;
    }
  });

  panels.forEach(panel=>{
    panel.classList.toggle(
      "active",
      panel.dataset.panel===
        target
    );
  });

  return found;
}

tabs.forEach(tab=>{
  tab.addEventListener(
    "click",
    ()=>{
      openTab(
        tab.dataset.tab
      );
    }
  );
});

/* =========================
   APPEARANCE NAVIGATION
========================= */

function openAppearanceTab(
  target
){
  if(!target){
    return false;
  }

  let found=false;

  appearanceTabs.forEach(tab=>{
    const isActive=
      tab.dataset
        .appearanceTab===
      target;

    tab.classList.toggle(
      "active",
      isActive
    );

    if(isActive){
      found=true;
    }
  });

  appearancePanels.forEach(panel=>{
    panel.classList.toggle(
      "active",
      panel.dataset
        .appearancePanel===
        target
    );
  });

  return found;
}

appearanceTabs.forEach(tab=>{
  tab.addEventListener(
    "click",
    ()=>{
      openAppearanceTab(
        tab.dataset
          .appearanceTab
      );
    }
  );
});

/* =========================
   ADVANCED APPEARANCE
========================= */

gameAdvancedAppearance
  ?.addEventListener(
    "change",
    ()=>{
      updateAdvancedAppearance();
    }
  );

function updateAdvancedAppearance(){
  if(
    !gameAdvancedAppearanceContent
  ){
    return;
  }

  gameAdvancedAppearanceContent.hidden=
    !gameAdvancedAppearance.checked;
}

/* =========================
   BACKGROUND VALUES
========================= */

gameBackgroundBrightness
  ?.addEventListener(
    "input",
    ()=>{
      updateGameRangeValues();
    }
  );

gameBackgroundOverlayOpacity
  ?.addEventListener(
    "input",
    ()=>{
      updateGameRangeValues();
    }
  );

function updateGameRangeValues(){
  if(
    gameBackgroundBrightnessValue
  ){
    gameBackgroundBrightnessValue
      .textContent=
      `${
        gameBackgroundBrightness
          ?.value??100
      }%`;
  }

  if(
    gameBackgroundOverlayOpacityValue
  ){
    gameBackgroundOverlayOpacityValue
      .textContent=
      `${
        gameBackgroundOverlayOpacity
          ?.value??0
      }%`;
  }
}

/* =========================
   SOUND
========================= */

masterVolume?.addEventListener(
  "input",
  ()=>{
    masterVolumeValue.textContent=
      `${masterVolume.value}%`;
  }
);

/* =========================
   GAME PRESET
========================= */

gameAppearancePreset
  ?.addEventListener(
    "change",
    ()=>{
      const preset=
        gameAppearancePreset.value;

      if(preset==="custom"){
        return;
      }

      const appearance=
        getGameAppearancePreset(
          preset
        );

      applyGameAppearance(
        appearance
      );
    }
  );

function getGameAppearancePreset(
  preset
){
  const appearance=
    GAME_APPEARANCE_PRESETS[
      preset
    ]||
    DEFAULT_GAME_APPEARANCE;

  return structuredClone(
    appearance
  );
}

/* =========================
   CUSTOM PRESET
========================= */

function markGameAppearanceCustom(){
  if(!gameAppearancePreset){
    return;
  }

  gameAppearancePreset.value=
    "custom";
}

const gameAppearanceInputs=[
  gameBackgroundImage,
  gameBackgroundSize,
  gameBackgroundPosition,
  gameBackgroundBrightness,
  gameBackgroundOverlayEnabled,
  gameBackgroundOverlayColor,
  gameBackgroundOverlayOpacity,

  gamePrimaryColor,
  gamePrimaryHoverColor,
  gameSecondaryColor,
  gameAccentColor,
  gameTextColor,
  gameMutedColor,
  gameSuccessColor,
  gameDangerColor,

  gameAdvancedAppearance,

  gameSidebarBackground,
  gameSidebarSurface,
  gameSidebarSurfaceHover,
  gameSidebarBorder,
  gameSidebarBorderStrong,

  gameQuestionBackground,
  gameQuestionBorder,
  gameQuestionText,
  gameQuestionBlur,

  gameAnswerBackground,
  gameAnswerHover,
  gameAnswerBorder,
  gameAnswerText,
  gameAnswerLetterBackground,
  gameAnswerLetterText,

  gameSelectedBackground,
  gameSelectedBorder,
  gameCorrectBackground,
  gameCorrectText,
  gameWrongBackground,
  gameWrongText,

  gameButtonActive,
  gameButtonActiveHover,
  gameButtonInactive,
  gameButtonInactiveHover,
  gameButtonDisabledOpacity,

  gameEndBackground,
  gameEndSurface,
  gameEndBorder,
  gameEndAmountColor,

  gameAnimationsEnabled,
  gameSidebarAnimationDuration,
  gameQuestionAnimationDuration,
  gameAnswerAnimationDuration,
  gameEndAnimationDuration
].filter(Boolean);

gameAppearanceInputs.forEach(
  element=>{
    const eventName=
      element.type==="checkbox"||
      element.tagName==="SELECT"
        ? "change"
        : "input";

    element.addEventListener(
      eventName,
      ()=>{
        markGameAppearanceCustom();

        if(
          element===
          gameBackgroundBrightness||
          element===
          gameBackgroundOverlayOpacity
        ){
          updateGameRangeValues();
        }
      }
    );
  }
);

/* =========================
   RESET GAME APPEARANCE
========================= */

resetGameAppearanceButton
  ?.addEventListener(
    "click",
    ()=>{
      const confirmed=
        confirm(
          "Czy przywrócić domyślny wygląd gry?"
        );

      if(!confirmed){
        return;
      }

      const appearance=
        structuredClone(
          DEFAULT_GAME_APPEARANCE
        );

      appearance.preset=
        "default";

      applyGameAppearance(
        appearance
      );

      showStatus(
        "Przywrócono domyślny wygląd gry."
      );
    }
  );

/* =========================
   SYNC SHORTCUTS RUNTIME
========================= */

function syncShortcutRuntime(
  settings
){
  const shortcuts=
    settings?.shortcuts||{};

  console.log(
    "[SHORTCUTS] syncShortcutRuntime()",
    shortcuts
  );

  if(
    window.MillionaireShortcuts
      ?.applySettings
  ){
    console.log(
      "[SHORTCUTS] Aktualizuję core.js."
    );

    window.MillionaireShortcuts
      .applySettings(
        shortcuts
      );
  }else{
    console.log(
      "[SHORTCUTS] core.js nie jest jeszcze dostępny."
    );
  }

  if(
    window.MillionaireShortcutsHelp
      ?.refresh
  ){
    console.log(
      "[SHORTCUTS] Odświeżam pomocnik skrótów."
    );

    window.MillionaireShortcutsHelp
      .refresh();
  }else{
    console.log(
      "[SHORTCUTS] help.js nie jest jeszcze dostępny."
    );
  }
}

/* =========================
   SAVE
========================= */

async function saveSettings(){
  const settings=
    collectSettings();

  try{
    const savedSettings=
      await window
        .millionaireAPI
        .settings
        .save(
          settings
        );

    currentSettings=
      savedSettings;

    applySettings(
      savedSettings
    );

    applyGeneralDesign(
      savedSettings
    );

    syncShortcutRuntime(
      savedSettings
    );

    showStatus(
      "Ustawienia zapisane."
    );

    return true;
  }catch(error){
    console.error(
      "Błąd zapisu ustawień:",
      error
    );

    showStatus(
      "Nie udało się zapisać ustawień."
    );

    return false;
  }
}

saveButton?.addEventListener(
  "click",
  ()=>{
    saveSettings();
  }
);

/* =========================
   RESET
========================= */

async function resetSettings(){
  const confirmed=
    confirm(
      "Czy na pewno chcesz przywrócić ustawienia domyślne?"
    );

  if(!confirmed){
    return false;
  }

  try{
    const settings=
      await window
        .millionaireAPI
        .settings
        .reset();

    currentSettings=
      settings;

    applySettings(
      settings
    );

    applyGeneralDesign(
      settings
    );

    syncShortcutRuntime(
      settings
    );

    showStatus(
      "Przywrócono ustawienia domyślne."
    );

    return true;
  }catch(error){
    console.error(
      "Błąd resetowania ustawień:",
      error
    );

    showStatus(
      "Nie udało się przywrócić ustawień."
    );

    return false;
  }
}

resetButton?.addEventListener(
  "click",
  ()=>{
    resetSettings();
  }
);

/* =========================
   PRIZE LEVELS
========================= */

function createPrizeLevels(prizes){
  prizeLevels.innerHTML="";

  const list=
    Array.isArray(prizes)&&
    prizes.length
      ? prizes
      : DEFAULT_PRIZES.map(
          (amount,index)=>({
            level:index+1,

            amount,

            guaranteed:
              index===1||
              index===6
          })
        );

  list.forEach(
    (prize,index)=>{
      const row=
        document.createElement(
          "div"
        );

      row.className=
        "prize-item";

      const number=
        document.createElement(
          "div"
        );

      number.className=
        "prize-number";

      number.textContent=
        `Poziom ${index+1}`;

      const amount=
        document.createElement(
          "input"
        );

      amount.type="number";
      amount.min="0";

      amount.dataset
        .prizeAmount="";

      amount.value=
        Number(
          prize.amount??0
        );

      const guaranteedLabel=
        document.createElement(
          "label"
        );

      guaranteedLabel.className=
        "setting-inline";

      const guaranteed=
        document.createElement(
          "input"
        );

      guaranteed.type=
        "checkbox";

      guaranteed.dataset
        .prizeGuaranteed="";

      guaranteed.checked=
        Boolean(
          prize.guaranteed
        );

      const text=
        document.createElement(
          "span"
        );

      text.textContent=
        "Próg gwarantowany";

      guaranteedLabel.append(
        guaranteed,
        text
      );

      row.append(
        number,
        amount,
        guaranteedLabel
      );

      prizeLevels.appendChild(
        row
      );
    }
  );
}

/* =========================
   COLLECT SETTINGS
========================= */

function collectSettings(){
  const prizeRows=[
    ...prizeLevels
      .querySelectorAll(
        ".prize-item"
      )
  ];

  return{
    general:{
      gameTitle:
        gameTitle.value.trim(),

      questionsCount:
        normalizeNumber(
          questionsCount.value,
          12,
          1
        ),

      randomQuestions:
        randomQuestions.checked,

      randomAnswers:
        randomAnswers.checked,

      autoNextQuestion:
        autoNextQuestion.checked,

      confirmAnswer:
        confirmAnswer.checked
    },

    screen:{
      fullscreen:
        fullscreen.checked,

      technicalInfo:
        technicalInfo.checked,

      mode:
        manualScreenSettings
          ?.checked
          ? "manual"
          : "select",

      displayId:
        screenDisplay
          ?.value||
        null,

      resolution:
        screenResolution
          ?.value||
        "native",

      screenIndex:
        normalizeNumber(
          screenIndex.value,
          0,
          0
        ),

      width:
        normalizeNumber(
          screenWidth.value,
          1920,
          640
        ),

      height:
        normalizeNumber(
          screenHeight.value,
          1080,
          480
        )
    },

    sound:{
      masterVolume:
        normalizeNumber(
          masterVolume.value,
          100,
          0,
          100
        ),

      interfaceSounds:
        interfaceSounds.checked,

      gameSounds:
        gameSounds.checked
    },

    prizeTree:{
      currency:
        currency.value
          .trim()||
        "zł",

      levels:
        prizeRows.map(
          (row,index)=>{
            const amount=
              row.querySelector(
                "[data-prize-amount]"
              );

            const guaranteed=
              row.querySelector(
                "[data-prize-guaranteed]"
              );

            return{
              level:index+1,

              amount:
                normalizeNumber(
                  amount?.value,
                  0,
                  0
                ),

              guaranteed:
                Boolean(
                  guaranteed?.checked
                )
            };
          }
        )
    },

    appearance:{
      general:{
        theme:
          theme.value,

        accentColor:
          accentColor.value,

        animations:
          animations.checked
      },

      game:
        collectGameAppearance()
    },

    shortcuts:
      collectShortcutSettings()
  };
}

/* =========================
   COLLECT GAME APPEARANCE
========================= */

function collectGameAppearance(){
  return{
    preset:
      gameAppearancePreset
        ?.value||
      "custom",

    advanced:
      Boolean(
        gameAdvancedAppearance
          ?.checked
      ),

    background:{
      image:
        gameBackgroundImage
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .background
          .image,

      size:
        gameBackgroundSize
          ?.value||
        "cover",

      position:
        gameBackgroundPosition
          ?.value||
        "center",

      brightness:
        normalizeNumber(
          gameBackgroundBrightness
            ?.value,
          100,
          25,
          150
        ),

      overlayEnabled:
        Boolean(
          gameBackgroundOverlayEnabled
            ?.checked
        ),

      overlayColor:
        gameBackgroundOverlayColor
          ?.value||
        "#000000",

      overlayOpacity:
        normalizeNumber(
          gameBackgroundOverlayOpacity
            ?.value,
          0,
          0,
          100
        )
    },

    colors:{
      primary:
        gamePrimaryColor
          ?.value||
        "#8b5cf6",

      primaryHover:
        gamePrimaryHoverColor
          ?.value||
        "#a778ff",

      secondary:
        gameSecondaryColor
          ?.value||
        "#536dfe",

      accent:
        gameAccentColor
          ?.value||
        "#a855f7",

      text:
        gameTextColor
          ?.value||
        "#ffffff",

      muted:
        gameMutedColor
          ?.value||
        "#b9b5d4",

      success:
        gameSuccessColor
          ?.value||
        "#22c55e",

      danger:
        gameDangerColor
          ?.value||
        "#ef4444"
    },

    sidebar:{
      background:
        gameSidebarBackground
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .sidebar
          .background,

      surface:
        gameSidebarSurface
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .sidebar
          .surface,

      surfaceHover:
        gameSidebarSurfaceHover
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .sidebar
          .surfaceHover,

      border:
        gameSidebarBorder
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .sidebar
          .border,

      borderStrong:
        gameSidebarBorderStrong
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .sidebar
          .borderStrong
    },

    question:{
      background:
        gameQuestionBackground
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .question
          .background,

      border:
        gameQuestionBorder
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .question
          .border,

      text:
        gameQuestionText
          ?.value||
        "#ffffff",

      blur:
        normalizeNumber(
          gameQuestionBlur
            ?.value,
          8,
          0,
          30
        )
    },

    answers:{
      background:
        gameAnswerBackground
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .answers
          .background,

      backgroundHover:
        gameAnswerHover
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .answers
          .backgroundHover,

      border:
        gameAnswerBorder
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .answers
          .border,

      text:
        gameAnswerText
          ?.value||
        "#ffffff",

      letterBackground:
        gameAnswerLetterBackground
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .answers
          .letterBackground,

      letterText:
        gameAnswerLetterText
          ?.value||
        "#bda1ff",

      selected:{
        background:
          gameSelectedBackground
            ?.value
            .trim()||
          DEFAULT_GAME_APPEARANCE
            .answers
            .selected
            .background,

        border:
          gameSelectedBorder
            ?.value||
          "#8b5cf6"
      },

      correct:{
        background:
          gameCorrectBackground
            ?.value
            .trim()||
          DEFAULT_GAME_APPEARANCE
            .answers
            .correct
            .background,

        text:
          gameCorrectText
            ?.value||
          "#8ef0ae"
      },

      wrong:{
        background:
          gameWrongBackground
            ?.value
            .trim()||
          DEFAULT_GAME_APPEARANCE
            .answers
            .wrong
            .background,

        text:
          gameWrongText
            ?.value||
          "#ff9a9a"
      }
    },

    buttons:{
      active:
        gameButtonActive
          ?.value||
        "#8b5cf6",

      activeHover:
        gameButtonActiveHover
          ?.value||
        "#a778ff",

      inactive:
        gameButtonInactive
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .buttons
          .inactive,

      inactiveHover:
        gameButtonInactiveHover
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .buttons
          .inactiveHover,

      disabledOpacity:
        normalizeNumber(
          gameButtonDisabledOpacity
            ?.value,
          0.5,
          0,
          1
        )
    },

    endScene:{
      background:
        gameEndBackground
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .endScene
          .background,

      surface:
        gameEndSurface
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .endScene
          .surface,

      border:
        gameEndBorder
          ?.value
          .trim()||
        DEFAULT_GAME_APPEARANCE
          .endScene
          .border,

      amountColor:
        gameEndAmountColor
          ?.value||
        "#ffffff"
    },

    animations:{
      enabled:
        Boolean(
          gameAnimationsEnabled
            ?.checked
        ),

      sidebarDuration:
        normalizeNumber(
          gameSidebarAnimationDuration
            ?.value,
          1000,
          0
        ),

      questionDuration:
        normalizeNumber(
          gameQuestionAnimationDuration
            ?.value,
          900,
          0
        ),

      answerDuration:
        normalizeNumber(
          gameAnswerAnimationDuration
            ?.value,
          750,
          0
        ),

      endSceneDuration:
        normalizeNumber(
          gameEndAnimationDuration
            ?.value,
          1000,
          0
        )
    }
  };
}

/* =========================
   APPLY SETTINGS
========================= */

function applySettings(settings){
  currentSettings=
    settings;

  const general=
    settings?.general||{};

  const screen=
    settings?.screen||{};

  const sound=
    settings?.sound||{};

  const prizeTree=
    settings?.prizeTree||{};

  const appearance=
    normalizeAppearance(
      settings?.appearance
    );

  const shortcuts=
    settings?.shortcuts||{};

  /* GENERAL */

  gameTitle.value=
    general.gameTitle??
    "Milionerzy";

  questionsCount.value=
    general.questionsCount??
    12;

  randomQuestions.checked=
    general.randomQuestions??
    false;

  randomAnswers.checked=
    general.randomAnswers??
    false;

  autoNextQuestion.checked=
    general.autoNextQuestion??
    false;

  confirmAnswer.checked=
    general.confirmAnswer??
    true;

  /* SCREEN */

  fullscreen.checked=
    screen.fullscreen??
    false;

  technicalInfo.checked=
    screen.technicalInfo??
    false;

  screenIndex.value=
    screen.screenIndex??
    0;

  screenWidth.value=
    screen.width??
    1920;

  screenHeight.value=
    screen.height??
    1080;

  if(manualScreenSettings){
    manualScreenSettings.checked=
      screen.mode
        ? screen.mode==="manual"
        : true;
  }

  updateScreenMode();

  loadDisplays(
    screen.displayId??
    null,

    screen.resolution??
    "native"
  );

  /* SOUND */

  masterVolume.value=
    sound.masterVolume??
    100;

  masterVolumeValue.textContent=
    `${masterVolume.value}%`;

  interfaceSounds.checked=
    sound.interfaceSounds??
    true;

  gameSounds.checked=
    sound.gameSounds??
    true;

  /* PRIZE TREE */

  currency.value=
    prizeTree.currency??
    "zł";

  createPrizeLevels(
    prizeTree.levels
  );

  /* APPEARANCE GENERAL */

  theme.value=
    appearance
      .general
      .theme;

  accentColor.value=
    appearance
      .general
      .accentColor;

  animations.checked=
    appearance
      .general
      .animations;

  /* GAME */

  applyGameAppearance(
    appearance.game
  );

  /* SHORTCUTS */

  console.log(
    "[SHORTCUTS] applySettings() otrzymało:",
    shortcuts
  );

  console.log(
    "[SHORTCUTS] Elementy HTML:",
    {
      shortcutsEnabled:
        Boolean(
          shortcutsEnabled
        ),

      shortcutsSettingsList:
        Boolean(
          shortcutsSettingsList
        ),

      shortcutBaseTimeout:
        Boolean(
          shortcutBaseTimeout
        ),

      shortcutAdditionalTimeout:
        Boolean(
          shortcutAdditionalTimeout
        ),

      shortcutMaxKeys:
        Boolean(
          shortcutMaxKeys
        ),

      resetShortcutsButton:
        Boolean(
          resetShortcutsButton
        )
    }
  );

  applyShortcutEditorSettings(
    shortcuts
  );

}

/* =========================
   NORMALIZE APPEARANCE
========================= */

function normalizeAppearance(
  appearance={}
){
  const oldTheme=
    appearance.theme;

  const oldAccentColor=
    appearance.accentColor||
    appearance.primaryColor;

  const oldAnimations=
    appearance.animations;

  const general={
    theme:
      appearance.general?.theme??
      oldTheme??
      "light",

    accentColor:
      appearance.general
        ?.accentColor??
      oldAccentColor??
      "#356df3",

    animations:
      appearance.general
        ?.animations??
      oldAnimations??
      true
  };

  const game=
    deepMerge(
      structuredClone(
        DEFAULT_GAME_APPEARANCE
      ),
      appearance.game||{}
    );

  return{
    general,
    game
  };
}

/* =========================
   APPLY GAME APPEARANCE
========================= */

function applyGameAppearance(
  gameAppearance={}
){
  const game=
    deepMerge(
      structuredClone(
        DEFAULT_GAME_APPEARANCE
      ),
      gameAppearance
    );

  gameAppearancePreset.value=
    game.preset||
    "default";

  gameAdvancedAppearance.checked=
    game.advanced===true;

  /* BACKGROUND */

  gameBackgroundImage.value=
    game.background.image;

  gameBackgroundSize.value=
    game.background.size;

  gameBackgroundPosition.value=
    game.background.position;

  gameBackgroundBrightness.value=
    game.background.brightness;

  gameBackgroundOverlayEnabled.checked=
    game.background.overlayEnabled;

  gameBackgroundOverlayColor.value=
    normalizeColorInput(
      game.background.overlayColor,
      "#000000"
    );

  gameBackgroundOverlayOpacity.value=
    game.background.overlayOpacity;

  /* COLORS */

  gamePrimaryColor.value=
    normalizeColorInput(
      game.colors.primary,
      "#8b5cf6"
    );

  gamePrimaryHoverColor.value=
    normalizeColorInput(
      game.colors.primaryHover,
      "#a778ff"
    );

  gameSecondaryColor.value=
    normalizeColorInput(
      game.colors.secondary,
      "#536dfe"
    );

  gameAccentColor.value=
    normalizeColorInput(
      game.colors.accent,
      "#a855f7"
    );

  gameTextColor.value=
    normalizeColorInput(
      game.colors.text,
      "#ffffff"
    );

  gameMutedColor.value=
    normalizeColorInput(
      game.colors.muted,
      "#b9b5d4"
    );

  gameSuccessColor.value=
    normalizeColorInput(
      game.colors.success,
      "#22c55e"
    );

  gameDangerColor.value=
    normalizeColorInput(
      game.colors.danger,
      "#ef4444"
    );

  /* SIDEBAR */

  gameSidebarBackground.value=
    game.sidebar.background;

  gameSidebarSurface.value=
    game.sidebar.surface;

  gameSidebarSurfaceHover.value=
    game.sidebar.surfaceHover;

  gameSidebarBorder.value=
    game.sidebar.border;

  gameSidebarBorderStrong.value=
    game.sidebar.borderStrong;

  /* QUESTION */

  gameQuestionBackground.value=
    game.question.background;

  gameQuestionBorder.value=
    game.question.border;

  gameQuestionText.value=
    normalizeColorInput(
      game.question.text,
      "#ffffff"
    );

  gameQuestionBlur.value=
    game.question.blur;

  /* ANSWERS */

  gameAnswerBackground.value=
    game.answers.background;

  gameAnswerHover.value=
    game.answers.backgroundHover;

  gameAnswerBorder.value=
    game.answers.border;

  gameAnswerText.value=
    normalizeColorInput(
      game.answers.text,
      "#ffffff"
    );

  gameAnswerLetterBackground.value=
    game.answers.letterBackground;

  gameAnswerLetterText.value=
    normalizeColorInput(
      game.answers.letterText,
      "#bda1ff"
    );

  gameSelectedBackground.value=
    game.answers
      .selected
      .background;

  gameSelectedBorder.value=
    normalizeColorInput(
      game.answers
        .selected
        .border,
      "#8b5cf6"
    );

  gameCorrectBackground.value=
    game.answers
      .correct
      .background;

  gameCorrectText.value=
    normalizeColorInput(
      game.answers
        .correct
        .text,
      "#8ef0ae"
    );

  gameWrongBackground.value=
    game.answers
      .wrong
      .background;

  gameWrongText.value=
    normalizeColorInput(
      game.answers
        .wrong
        .text,
      "#ff9a9a"
    );

  /* BUTTONS */

  gameButtonActive.value=
    normalizeColorInput(
      game.buttons.active,
      "#8b5cf6"
    );

  gameButtonActiveHover.value=
    normalizeColorInput(
      game.buttons.activeHover,
      "#a778ff"
    );

  gameButtonInactive.value=
    game.buttons.inactive;

  gameButtonInactiveHover.value=
    game.buttons.inactiveHover;

  gameButtonDisabledOpacity.value=
    game.buttons.disabledOpacity;

  /* END SCENE */

  gameEndBackground.value=
    game.endScene.background;

  gameEndSurface.value=
    game.endScene.surface;

  gameEndBorder.value=
    game.endScene.border;

  gameEndAmountColor.value=
    normalizeColorInput(
      game.endScene.amountColor,
      "#ffffff"
    );

  /* ANIMATIONS */

  gameAnimationsEnabled.checked=
    game.animations.enabled;

  gameSidebarAnimationDuration.value=
    game.animations.sidebarDuration;

  gameQuestionAnimationDuration.value=
    game.animations.questionDuration;

  gameAnswerAnimationDuration.value=
    game.animations.answerDuration;

  gameEndAnimationDuration.value=
    game.animations.endSceneDuration;

  updateAdvancedAppearance();
  updateGameRangeValues();
}

/* =========================
   DESIGN
========================= */

function applyGeneralDesign(
  settings
){
  const appearance=
    normalizeAppearance(
      settings?.appearance
    );

  window
    .millionaireDesign
    ?.apply({
      theme:
        appearance
          .general
          .theme,

      accentColor:
        appearance
          .general
          .accentColor
    });
}

/* =========================
   DEEP MERGE
========================= */

function deepMerge(
  target,
  source
){
  if(
    !source||
    typeof source!=="object"
  ){
    return target;
  }

  Object.keys(source)
    .forEach(key=>{
      const value=
        source[key];

      if(
        value&&
        typeof value==="object"&&
        !Array.isArray(value)
      ){
        if(
          !target[key]||
          typeof target[key]!=="object"||
          Array.isArray(
            target[key]
          )
        ){
          target[key]={};
        }

        deepMerge(
          target[key],
          value
        );
      }else{
        target[key]=value;
      }
    });

  return target;
}

/* =========================
   COLOR HELPER
========================= */

function normalizeColorInput(
  value,
  fallback="#000000"
){
  const color=
    String(value||"")
      .trim();

  if(
    /^#[0-9a-f]{6}$/i
      .test(color)
  ){
    return color;
  }

  return fallback;
}

/* =========================
   NUMBER HELPER
========================= */

function normalizeNumber(
  value,
  fallback,
  min=null,
  max=null
){
  let number=
    Number(value);

  if(
    !Number.isFinite(number)
  ){
    number=fallback;
  }

  if(
    min!==null&&
    number<min
  ){
    number=min;
  }

  if(
    max!==null&&
    number>max
  ){
    number=max;
  }

  return number;
}

/* =========================
   STATUS
========================= */

function showStatus(message){
  statusMessage.textContent=
    message;

  statusMessage.hidden=false;

  clearTimeout(
    showStatus.timeout
  );

  showStatus.timeout=
    setTimeout(()=>{
      statusMessage.hidden=true;
    },2200);
}

/* =========================
   LOAD
========================= */

async function loadSettings(){
  console.log(
    "[SHORTCUTS] Rozpoczynam loadSettings()."
  );

  try{
    const settings=
      await window
        .millionaireAPI
        .settings
        .get();

    console.log(
      "[SHORTCUTS] Odebrano settings z IPC:",
      settings
    );

    console.log(
      "[SHORTCUTS] Odebrana sekcja shortcuts:",
      settings?.shortcuts
    );

    applySettings(
      settings
    );

    applyGeneralDesign(
      settings
    );

    /*
     * settings.js jest ładowany
     * przed core.js, więc przy
     * pierwszym starcie core sam
     * pobierze ustawienia. Przy
     * późniejszym reload() ta
     * funkcja zsynchronizuje je
     * od razu.
     */

    syncShortcutRuntime(
      settings
    );
  }catch(error){
    console.error(
      "Błąd pobierania ustawień:",
      error
    );

    showStatus(
      "Nie udało się wczytać ustawień."
    );
  }
}

/* =========================
   START
========================= */

window.MillionaireSettings={
  openTab,
  openAppearanceTab,

  save:
    saveSettings,

  reset:
    resetSettings,

  reload:
    loadSettings,

  getCurrent:()=>{
    return currentSettings;
  },

  getDisplays:()=>{
    return[
      ...availableDisplays
    ];
  },

  getSelectedDisplay,
  getSelectedResolution,

  getShortcuts:()=>{
    return collectShortcutSettings();
  },

  renderShortcuts:
    renderShortcutSettings,

  applyShortcuts:
    applyShortcutEditorSettings
};

loadSettings();