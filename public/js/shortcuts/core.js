const shortcutGroups=new Map();

let activeShortcutGroup=null;
let activeShortcutNode=null;

let shortcutSequence=[];
let shortcutMessageTimeout=null;
let shortcutInputTimeout=null;

let shortcutsSettings={};

let shortcutsReady=false;

/* =========================
   DEFAULT CONFIG
========================= */

const DEFAULT_SHORTCUT_CONFIG={
  enabled:true,
  maxKeys:4,
  baseTimeout:1000,
  additionalTimeout:250
};

const SHORTCUT_CONFIG={
  ...DEFAULT_SHORTCUT_CONFIG
};

/* =========================
   SETTINGS
========================= */

async function loadShortcutSettings(){
  try{
    const settings=
      await window
        .millionaireAPI
        ?.settings
        ?.get?.();

    applyShortcutSettings(
      settings?.shortcuts||{}
    );

    shortcutsReady=true;

    return shortcutsSettings;
  }catch(error){
    console.error(
      "Błąd pobierania ustawień skrótów:",
      error
    );

    applyShortcutSettings(
      {}
    );

    shortcutsReady=true;

    return shortcutsSettings;
  }
}

function applyShortcutSettings(
  shortcuts={}
){
  shortcutsSettings=
    structuredClone(
      shortcuts||{}
    );

  const timing=
    shortcutsSettings
      ?.timing||{};

  SHORTCUT_CONFIG.enabled=
    shortcutsSettings.enabled!==
    false;

  SHORTCUT_CONFIG.baseTimeout=
    normalizeNumber(
      timing.base,
      DEFAULT_SHORTCUT_CONFIG
        .baseTimeout,
      250
    );

  SHORTCUT_CONFIG.additionalTimeout=
    normalizeNumber(
      timing.additionalPerKey,
      DEFAULT_SHORTCUT_CONFIG
        .additionalTimeout,
      0
    );

  SHORTCUT_CONFIG.maxKeys=
    normalizeNumber(
      timing.maxKeys,
      DEFAULT_SHORTCUT_CONFIG
        .maxKeys,
      1,
      8
    );

  if(
    !SHORTCUT_CONFIG.enabled
  ){
    deactivateShortcutGroup();
  }

  refreshRegisteredGroups();

  return shortcutsSettings;
}

/* =========================
   REFRESH
========================= */

async function refreshShortcutSettings(){
  return loadShortcutSettings();
}

/* =========================
   GET GROUP SETTINGS
========================= */

function getShortcutGroupSettings(
  id
){
  if(!id){
    return{};
  }

  const group=
    shortcutsSettings?.[id];

  if(
    !group||
    typeof group!=="object"||
    Array.isArray(group)
  ){
    return{};
  }

  return group;
}

/* =========================
   HELPERS
========================= */

function isTypingElement(
  element
){
  return(
    element instanceof
      HTMLInputElement||
    element instanceof
      HTMLTextAreaElement||
    element instanceof
      HTMLSelectElement||
    element?.isContentEditable
  );
}

function normalizeKey(
  key
){
  if(!key){
    return "";
  }

  const aliases={
    Esc:"Escape",
    Space:" ",
    Ctrl:"Control"
  };

  const value=
    aliases[key]||
    key;

  if(value.length===1){
    return value.toLowerCase();
  }

  return value;
}

function formatKey(
  key
){
  if(!key){
    return "";
  }

  const aliases={
    Escape:"Esc",
    Control:"Ctrl",
    " ":"Space",
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

function getShortcutDuration(
  keyCount=1
){
  const count=
    Math.max(
      1,
      Math.min(
        SHORTCUT_CONFIG.maxKeys,
        Number(keyCount)||1
      )
    );

  return(
    SHORTCUT_CONFIG.baseTimeout+
    (
      count-1
    )*
    SHORTCUT_CONFIG
      .additionalTimeout
  );
}

function getCurrentKeyCount(){
  return shortcutSequence.length;
}

function getCurrentDuration(){
  return getShortcutDuration(
    getCurrentKeyCount()
  );
}

function formatShortcutSequence(){
  return shortcutSequence
    .map(formatKey)
    .join(" + ");
}

/* =========================
   MESSAGE
========================= */

function getShortcutMessage(){
  let message=
    document.getElementById(
      "shortcutMessage"
    );

  if(message){
    return message;
  }

  message=
    document.createElement(
      "div"
    );

  message.id=
    "shortcutMessage";

  message.className=
    "shortcut-message";

  message.hidden=true;

  document.body.appendChild(
    message
  );

  return message;
}

function showShortcutMessage(
  text,
  duration=null
){
  const message=
    getShortcutMessage();

  clearTimeout(
    shortcutMessageTimeout
  );

  shortcutMessageTimeout=null;

  message.textContent=text;
  message.hidden=false;

  if(duration){
    shortcutMessageTimeout=
      setTimeout(
        ()=>{
          hideShortcutMessage();
        },
        duration
      );
  }
}

function hideShortcutMessage(){
  clearTimeout(
    shortcutMessageTimeout
  );

  shortcutMessageTimeout=null;

  const message=
    document.getElementById(
      "shortcutMessage"
    );

  if(message){
    message.hidden=true;
  }
}

/* =========================
   INPUT TIMEOUT
========================= */

function clearShortcutInputTimeout(){
  clearTimeout(
    shortcutInputTimeout
  );

  shortcutInputTimeout=null;
}

function startShortcutInputTimeout(){
  clearShortcutInputTimeout();

  const duration=
    getCurrentDuration();

  shortcutInputTimeout=
    setTimeout(
      ()=>{
        cancelShortcut(
          "Upłynął czas skrótu"
        );
      },
      duration
    );
}

/* =========================
   RESOLVE PREFIX
========================= */

function resolveGroupPrefix(
  group
){
  if(!group){
    return "";
  }

  const configured=
    getShortcutGroupSettings(
      group.id
    );

  const prefix=
    configured?.prefix||
    group.defaultPrefix||
    group.prefix||
    "";

  return normalizeKey(
    String(prefix)
  );
}

/* =========================
   REGISTER
========================= */

function registerShortcutGroup({
  id,
  prefix,
  name,
  shortcuts={},
  buildShortcuts=null
}){
  if(!id){
    console.warn(
      "Nie można zarejestrować grupy skrótów bez id."
    );

    return;
  }

  if(
    !prefix&&
    typeof buildShortcuts!==
      "function"
  ){
    console.warn(
      `Grupa skrótów "${id}" nie posiada prefixu.`
    );
  }

  const group={
    id,

    name:
      name||id,

    prefix:
      normalizeKey(
        String(prefix||"")
      ),

    defaultPrefix:
      normalizeKey(
        String(prefix||"")
      ),

    shortcuts:
      shortcuts||{},

    defaultShortcuts:
      shortcuts||{},

    buildShortcuts:
      typeof buildShortcuts===
        "function"
        ? buildShortcuts
        : null
  };

  shortcutGroups.set(
    id,
    group
  );

  refreshShortcutGroup(
    group
  );

  return group;
}

/* =========================
   REFRESH GROUP
========================= */

function refreshShortcutGroup(
  group
){
  if(!group){
    return;
  }

  const settings=
    getShortcutGroupSettings(
      group.id
    );

  group.prefix=
    resolveGroupPrefix(
      group
    );

  if(group.buildShortcuts){
    try{
      const shortcuts=
        group.buildShortcuts(
          settings,
          structuredClone(
            shortcutsSettings
          )
        );

      if(
        shortcuts&&
        typeof shortcuts==="object"
      ){
        group.shortcuts=
          shortcuts;
      }
    }catch(error){
      console.error(
        `Błąd generowania skrótów grupy "${group.id}":`,
        error
      );
    }
  }
}

function refreshRegisteredGroups(){
  shortcutGroups.forEach(
    group=>{
      refreshShortcutGroup(
        group
      );
    }
  );
}

/* =========================
   FIND GROUP
========================= */

function findGroupByPrefix(
  prefix
){
  const normalizedPrefix=
    normalizeKey(prefix);

  return[
    ...shortcutGroups.values()
  ].find(
    group=>
      group.prefix===
      normalizedPrefix
  )||null;
}

/* =========================
   ACTIVATE
========================= */

function activateShortcutGroup(
  group
){
  if(
    !group||
    !SHORTCUT_CONFIG.enabled
  ){
    return;
  }

  clearShortcutInputTimeout();

  refreshShortcutGroup(
    group
  );

  if(!group.prefix){
    return;
  }

  activeShortcutGroup=
    group;

  activeShortcutNode=
    group.shortcuts;

  shortcutSequence=[
    group.prefix
  ];

  showShortcutMessage(
    `Tryb skrótów: ${
      group.name.toUpperCase()
    } — wybierz klawisz`
  );

  startShortcutInputTimeout();
}

/* =========================
   RESET
========================= */

function resetShortcutState(){
  clearShortcutInputTimeout();

  activeShortcutGroup=null;
  activeShortcutNode=null;

  shortcutSequence=[];
}

/* =========================
   DEACTIVATE
========================= */

function deactivateShortcutGroup(){
  resetShortcutState();

  hideShortcutMessage();
}

/* =========================
   CANCEL
========================= */

function cancelShortcut(
  message=null
){
  const keyCount=
    Math.max(
      1,
      getCurrentKeyCount()
    );

  resetShortcutState();

  if(message){
    showShortcutMessage(
      message,
      getShortcutDuration(
        keyCount
      )
    );

    return;
  }

  hideShortcutMessage();
}

/* =========================
   SUBMENU CHECK
========================= */

function getChildShortcuts(
  shortcut
){
  if(
    shortcut&&
    typeof shortcut==="object"
  ){
    if(
      shortcut.shortcuts&&
      typeof shortcut.shortcuts===
        "object"
    ){
      return shortcut.shortcuts;
    }

    if(
      shortcut.children&&
      typeof shortcut.children===
        "object"
    ){
      return shortcut.children;
    }
  }

  return null;
}

function hasChildShortcuts(
  shortcut
){
  const children=
    getChildShortcuts(
      shortcut
    );

  return Boolean(
    children&&
    Object.keys(
      children
    ).length>0
  );
}

/* =========================
   SUBMODE
========================= */

function enterShortcutSubmode(
  shortcut
){
  const children=
    getChildShortcuts(
      shortcut
    );

  if(!children){
    return;
  }

  if(
    shortcutSequence.length>=
    SHORTCUT_CONFIG.maxKeys
  ){
    cancelShortcut(
      `Maksymalnie ${
        SHORTCUT_CONFIG.maxKeys
      } klawisze w skrócie`
    );

    return;
  }

  activeShortcutNode=
    children;

  const message=
    shortcut.prompt||
    shortcut.message||
    `${
      formatShortcutSequence()
    } — wybierz następny klawisz`;

  showShortcutMessage(
    message
  );

  startShortcutInputTimeout();
}

/* =========================
   EXECUTE
========================= */

function executeShortcut(
  shortcut
){
  if(!shortcut){
    return;
  }

  const keyCount=
    getCurrentKeyCount();

  clearShortcutInputTimeout();

  try{
    shortcut.execute?.();
  }catch(error){
    console.error(
      "Błąd wykonywania skrótu:",
      error
    );

    resetShortcutState();

    showShortcutMessage(
      "Nie udało się wykonać skrótu",
      getShortcutDuration(
        keyCount
      )
    );

    return;
  }

  resetShortcutState();

  if(shortcut.message){
    showShortcutMessage(
      shortcut.message,
      getShortcutDuration(
        keyCount
      )
    );

    return;
  }

  hideShortcutMessage();
}

/* =========================
   PROCESS KEY
========================= */

function processShortcutKey(
  event
){
  const key=
    normalizeKey(
      event.key
    );

  const shortcut=
    activeShortcutNode?.[key];

  if(!shortcut){
    event.preventDefault();

    const sequence=
      formatShortcutSequence();

    showShortcutMessage(
      `Brak skrótu ${
        sequence
      } + ${
        formatKey(
          event.key
        )
      }`,
      getCurrentDuration()
    );

    startShortcutInputTimeout();

    return;
  }

  event.preventDefault();

  shortcutSequence.push(
    key
  );

  if(
    shortcutSequence.length>
    SHORTCUT_CONFIG.maxKeys
  ){
    cancelShortcut(
      "Skrót jest zbyt długi"
    );

    return;
  }

  if(
    hasChildShortcuts(
      shortcut
    )
  ){
    enterShortcutSubmode(
      shortcut
    );

    return;
  }

  executeShortcut(
    shortcut
  );
}

/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  event=>{
    if(
      !SHORTCUT_CONFIG.enabled
    ){
      return;
    }

    /*
     * Podczas konfiguracji skrótu
     * settings.js przejmuje klawisze.
     */

    if(
      event.target
        ?.classList
        ?.contains(
          "shortcut-capture-input"
        )
    ){
      return;
    }

    /*
     * Nie reagujemy podczas
     * pisania w formularzu.
     */

    if(
      isTypingElement(
        event.target
      )
    ){
      return;
    }

    /*
     * AKTYWNA SEKWENCJA
     */

    if(activeShortcutGroup){
      if(
        event.key==="Escape"
      ){
        event.preventDefault();

        cancelShortcut(
          "Anulowano skrót"
        );

        return;
      }

      /*
       * Sekwencje programu nie
       * korzystają z Ctrl/Alt/Meta.
       */

      if(
        event.ctrlKey||
        event.altKey||
        event.metaKey
      ){
        return;
      }

      processShortcutKey(
        event
      );

      return;
    }

    /*
     * PREFIXY grup nie działają
     * razem z modyfikatorami.
     *
     * Globalne Ctrl+H,
     * Ctrl+S itd. obsługuje
     * toolbar / Electron.
     */

    if(
      event.ctrlKey||
      event.altKey||
      event.shiftKey||
      event.metaKey
    ){
      return;
    }

    const group=
      findGroupByPrefix(
        event.key
      );

    if(!group){
      return;
    }

    event.preventDefault();

    activateShortcutGroup(
      group
    );
  }
);

/* =========================
   PUBLIC API
========================= */

window.MillionaireShortcuts={
  register:
    registerShortcutGroup,

  activate:id=>{
    const group=
      shortcutGroups.get(
        id
      );

    if(group){
      activateShortcutGroup(
        group
      );
    }
  },

  deactivate:
    deactivateShortcutGroup,

  cancel:
    cancelShortcut,

  refresh:
    refreshShortcutSettings,

  applySettings:
    applyShortcutSettings,

  getSettings:()=>{
    return structuredClone(
      shortcutsSettings
    );
  },

  getGroupSettings:
    getShortcutGroupSettings,

  getActive:()=>{
    return activeShortcutGroup;
  },

  getSequence:()=>{
    return[
      ...shortcutSequence
    ];
  },

  getGroups:()=>{
    return[
      ...shortcutGroups.values()
    ];
  },

  getDuration:
    getShortcutDuration,

  getConfig:()=>{
    return{
      ...SHORTCUT_CONFIG
    };
  },

  isEnabled:()=>{
    return SHORTCUT_CONFIG.enabled;
  },

  isReady:()=>{
    return shortcutsReady;
  },

  showMessage:
    showShortcutMessage,

  hideMessage:
    hideShortcutMessage
};

/* =========================
   START
========================= */

loadShortcutSettings();