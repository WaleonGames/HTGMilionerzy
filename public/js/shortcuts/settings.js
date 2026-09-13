(()=>{
  /* =========================
     DEFAULTS
  ========================= */

  const DEFAULT_SETTINGS_SHORTCUTS={
    prefix:"U",

    general:"O",
    screen:"E",
    sound:"D",
    prizeTree:"N",
    appearance:"W",
    dataStorage:"Z",
    shortcuts:"S",

    save:"U",
    reset:"P",
    colorPalette:"K"
  };

  /* =========================
     REGISTER
  ========================= */

  window.MillionaireShortcuts
    ?.register({
      id:"settings",

      prefix:
        DEFAULT_SETTINGS_SHORTCUTS
          .prefix,

      name:"Ustawienia",

      buildShortcuts:settings=>{
        const config={
          ...DEFAULT_SETTINGS_SHORTCUTS,
          ...(settings||{})
        };

        const shortcuts={};

        /* =========================
           GENERAL
        ========================= */

        addShortcut(
          shortcuts,
          config.general,
          {
            label:"Ogólne",
            message:"Zakładka: Ogólne",

            execute:()=>{
              openSettingsTab(
                "general"
              );
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .general
        );

        /* =========================
           SCREEN
        ========================= */

        addShortcut(
          shortcuts,
          config.screen,
          {
            label:"Ekran",
            message:"Zakładka: Ekran",

            execute:()=>{
              openSettingsTab(
                "screen"
              );
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .screen
        );

        /* =========================
           SOUND
        ========================= */

        addShortcut(
          shortcuts,
          config.sound,
          {
            label:"Dźwięk",
            message:"Zakładka: Dźwięk",

            execute:()=>{
              openSettingsTab(
                "sound"
              );
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .sound
        );

        /* =========================
           PRIZE TREE
        ========================= */

        addShortcut(
          shortcuts,
          config.prizeTree,
          {
            label:"Drzewko nagród",
            message:"Zakładka: Drzewko nagród",

            execute:()=>{
              openSettingsTab(
                "prizeTree"
              );
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .prizeTree
        );

        /* =========================
           APPEARANCE
        ========================= */

        addShortcut(
          shortcuts,
          config.appearance,
          {
            label:"Wygląd",
            message:"Zakładka: Wygląd",

            execute:()=>{
              openSettingsTab(
                "appearance"
              );
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .appearance
        );

        /* =========================
           DATA STORAGE
        ========================= */

        addShortcut(
          shortcuts,
          config.dataStorage,
          {
            label:"Zapisy danych",
            message:"Zakładka: Zapisy danych",

            execute:()=>{
              openSettingsTab(
                "dataStorage"
              );
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .dataStorage
        );

        /* =========================
           SHORTCUTS
        ========================= */

        addShortcut(
          shortcuts,
          config.shortcuts,
          {
            label:"Skróty",
            message:"Zakładka: Skróty",

            execute:()=>{
              openSettingsTab(
                "shortcuts"
              );
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .shortcuts
        );

        /* =========================
           SAVE
        ========================= */

        addShortcut(
          shortcuts,
          config.save,
          {
            label:"Zapisz ustawienia",
            message:"Zapisywanie ustawień",

            execute:()=>{
              saveSettings();
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .save
        );

        /* =========================
           RESET
        ========================= */

        addShortcut(
          shortcuts,
          config.reset,
          {
            label:"Przywróć ustawienia",
            message:"Przywracanie ustawień",

            execute:()=>{
              resetSettings();
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .reset
        );

        /* =========================
           COLOR PALETTE
        ========================= */

        addShortcut(
          shortcuts,
          config.colorPalette,
          {
            label:"Paleta kolorów",
            message:"Paleta kolorów",

            execute:()=>{
              openColorPalette();
            }
          },
          DEFAULT_SETTINGS_SHORTCUTS
            .colorPalette
        );

        return shortcuts;
      }
    });

  /* =========================
     ADD SHORTCUT
  ========================= */

  function addShortcut(
    target,
    value,
    action,
    fallback
  ){
    let keys=
      parseShortcutSequence(
        value
      );

    if(
      keys.length===0
    ){
      keys=
        parseShortcutSequence(
          fallback
        );
    }

    /*
     * Prefix U jest pierwszym
     * klawiszem sekwencji.
     *
     * Przy limicie 4 zostają
     * maksymalnie 3 kolejne.
     */

    if(keys.length>3){
      console.warn(
        "Skrót ustawień jest zbyt długi:",
        value
      );

      keys=
        parseShortcutSequence(
          fallback
        );
    }

    insertShortcut(
      target,
      keys,
      action
    );
  }

  /* =========================
     INSERT
  ========================= */

  function insertShortcut(
    target,
    keys,
    action
  ){
    if(
      !target||
      !Array.isArray(keys)||
      keys.length===0
    ){
      return;
    }

    let node=target;

    keys.forEach(
      (key,index)=>{
        const isLast=
          index===
          keys.length-1;

        if(isLast){
          if(node[key]){
            console.warn(
              `Konflikt skrótu ustawień dla klawisza "${key}".`
            );
          }

          node[key]=action;

          return;
        }

        if(
          !node[key]||
          typeof node[key]!=="object"||
          typeof node[key].execute===
            "function"
        ){
          node[key]={
            children:{}
          };
        }

        if(
          !node[key].children||
          typeof node[key].children!==
            "object"
        ){
          node[key].children={};
        }

        node=
          node[key].children;
      }
    );
  }

  /* =========================
     PARSE SEQUENCE
  ========================= */

  function parseShortcutSequence(
    value
  ){
    return String(
      value??""
    )
      .split("+")
      .map(
        key=>
          normalizeConfiguredKey(
            key
          )
      )
      .filter(Boolean);
  }

  /* =========================
     NORMALIZE CONFIG KEY
  ========================= */

  function normalizeConfiguredKey(
    key
  ){
    const value=
      String(
        key||""
      ).trim();

    if(!value){
      return "";
    }

    const aliases={
      esc:"Escape",
      escape:"Escape",

      return:"Enter",
      enter:"Enter",

      space:" ",

      arrowup:"ArrowUp",
      arrowdown:"ArrowDown",
      arrowleft:"ArrowLeft",
      arrowright:"ArrowRight"
    };

    const lower=
      value.toLowerCase();

    if(aliases[lower]){
      return aliases[lower];
    }

    if(
      [
        "ctrl",
        "control",
        "alt",
        "shift",
        "meta",
        "cmd",
        "command"
      ].includes(
        lower
      )
    ){
      console.warn(
        `Modyfikator "${value}" nie może być użyty wewnątrz skrótu grupy Ustawienia.`
      );

      return "";
    }

    if(value.length===1){
      return value.toLowerCase();
    }

    return value;
  }

  /* =========================
     OPEN TAB
  ========================= */

  function openSettingsTab(
    tab
  ){
    const settings=
      window.MillionaireSettings;

    if(
      typeof settings
        ?.openTab===
      "function"
    ){
      const opened=
        settings.openTab(
          tab
        );

      if(opened===false){
        showMessage(
          "Nie znaleziono zakładki ustawień",
          getDuration(2)
        );
      }

      return;
    }

    const button=
      document.querySelector(
        `[data-tab="${tab}"]`
      );

    if(button){
      button.click();

      return;
    }

    showMessage(
      "Nie znaleziono zakładki ustawień",
      getDuration(2)
    );
  }

  /* =========================
     SAVE
  ========================= */

  async function saveSettings(){
    const settings=
      window.MillionaireSettings;

    if(
      typeof settings
        ?.save===
      "function"
    ){
      await settings.save();

      return;
    }

    document
      .getElementById(
        "saveButton"
      )
      ?.click();
  }

  /* =========================
     RESET
  ========================= */

  async function resetSettings(){
    const settings=
      window.MillionaireSettings;

    if(
      typeof settings
        ?.reset===
      "function"
    ){
      await settings.reset();

      return;
    }

    document
      .getElementById(
        "resetButton"
      )
      ?.click();
  }

  /* =========================
     COLOR PALETTE
  ========================= */

  function openColorPalette(){
    const palette=
      window.MillionaireColorPalette;

    if(
      typeof palette
        ?.open===
      "function"
    ){
      palette.open();

      return;
    }

    openSettingsTab(
      "appearance"
    );

    showMessage(
      "Paleta kolorów nie jest jeszcze dostępna",
      getDuration(2)
    );
  }

  /* =========================
     MESSAGE
  ========================= */

  function showMessage(
    message,
    duration=null
  ){
    window.MillionaireShortcuts
      ?.showMessage?.(
        message,
        duration
      );
  }

  function getDuration(
    keyCount
  ){
    return(
      window.MillionaireShortcuts
        ?.getDuration?.(
          keyCount
        )||
      1000
    );
  }
})();