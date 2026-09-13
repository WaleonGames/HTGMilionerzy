(()=>{
  /* =========================
     DEFAULTS
  ========================= */

  const DEFAULT_GAME_SHORTCUTS={
    prefix:"G",

    sidebar:"B",
    controls:"A",
    mainScreen:"M",
    showQuestion:"P",
    showAnswer:"O",

    answerA:"1",
    answerB:"2",
    answerC:"3",
    answerD:"4",

    confirm:"Enter",
    nextQuestion:"N",
    exit:"E"
  };

  /* =========================
     REGISTER
  ========================= */

  window.MillionaireShortcuts
    ?.register({
      id:"game",

      prefix:
        DEFAULT_GAME_SHORTCUTS
          .prefix,

      name:"Gra",

      buildShortcuts:settings=>{
        const config={
          ...DEFAULT_GAME_SHORTCUTS,
          ...(settings||{})
        };

        const shortcuts={};

        /* =========================
           SIDEBAR
        ========================= */

        addShortcut(
          shortcuts,
          config.sidebar,
          {
            label:"Pasek boczny",
            message:"Pasek boczny",

            execute:()=>{
              executeGameAction(
                "toggle-sidebar"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .sidebar
        );

        /* =========================
           CONTROLS
        ========================= */

        addShortcut(
          shortcuts,
          config.controls,
          {
            label:"Panel sterowania",
            message:"Panel sterowania",

            execute:()=>{
              executeGameAction(
                "toggle-offcanvas"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .controls
        );

        /* =========================
           MAIN SCREEN
        ========================= */

        addShortcut(
          shortcuts,
          config.mainScreen,
          {
            label:"Główny ekran",
            message:"Główny ekran",

            execute:()=>{
              executeGameAction(
                "show-main-panel"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .mainScreen
        );

        /* =========================
           QUESTION
        ========================= */

        addShortcut(
          shortcuts,
          config.showQuestion,
          {
            label:"Pokaż pytanie",
            message:"Pokaż pytanie",

            execute:()=>{
              executeGameAction(
                "show-question"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .showQuestion
        );

        /* =========================
           ANSWERS
        ========================= */

        addShortcut(
          shortcuts,
          config.showAnswer,
          {
            label:"Pokaż odpowiedź",
            message:"Pokaż odpowiedź",

            execute:()=>{
              executeGameAction(
                "show-answer"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .showAnswer
        );

        /* =========================
           ANSWER A
        ========================= */

        addShortcut(
          shortcuts,
          config.answerA,
          {
            label:"Odpowiedź A",
            message:"Odpowiedź A",

            execute:()=>{
              selectAnswer(
                "A"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .answerA
        );

        /* =========================
           ANSWER B
        ========================= */

        addShortcut(
          shortcuts,
          config.answerB,
          {
            label:"Odpowiedź B",
            message:"Odpowiedź B",

            execute:()=>{
              selectAnswer(
                "B"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .answerB
        );

        /* =========================
           ANSWER C
        ========================= */

        addShortcut(
          shortcuts,
          config.answerC,
          {
            label:"Odpowiedź C",
            message:"Odpowiedź C",

            execute:()=>{
              selectAnswer(
                "C"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .answerC
        );

        /* =========================
           ANSWER D
        ========================= */

        addShortcut(
          shortcuts,
          config.answerD,
          {
            label:"Odpowiedź D",
            message:"Odpowiedź D",

            execute:()=>{
              selectAnswer(
                "D"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .answerD
        );

        /* =========================
           CONFIRM
        ========================= */

        addShortcut(
          shortcuts,
          config.confirm,
          {
            label:"Potwierdź odpowiedź",
            message:"Potwierdź odpowiedź",

            execute:()=>{
              confirmSelectedAnswer();
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .confirm
        );

        /* =========================
           NEXT
        ========================= */

        addShortcut(
          shortcuts,
          config.nextQuestion,
          {
            label:"Następne pytanie",
            message:"Następne pytanie",

            execute:()=>{
              executeGameAction(
                "next-question"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .nextQuestion
        );

        /* =========================
           EXIT
        ========================= */

        addShortcut(
          shortcuts,
          config.exit,
          {
            label:"Zakończ grę",
            message:"Zakończ grę",

            execute:()=>{
              executeGameAction(
                "exit-game"
              );
            }
          },
          DEFAULT_GAME_SHORTCUTS
            .exit
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
     * Prefix grupy jest pierwszym
     * klawiszem, więc dla limitu 4
     * zostają maksymalnie 3 klawisze.
     */

    if(keys.length>3){
      console.warn(
        "Skrót gry jest zbyt długi:",
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
     INSERT SEQUENCE
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
              `Konflikt skrótu gry dla klawisza "${key}".`
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

    /*
     * Ctrl / Alt / Shift / Meta
     * nie są obecnie częścią
     * sekwencji grupowych core.js.
     */

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
        `Modyfikator "${value}" nie może być użyty wewnątrz skrótu grupy Gra.`
      );

      return "";
    }

    if(value.length===1){
      return value.toLowerCase();
    }

    return value;
  }

  /* =========================
     GAME ACTION
  ========================= */

  function executeGameAction(
    action,
    payload={}
  ){
    const game=
      window.MillionaireGame;

    if(
      typeof game
        ?.executeControlAction!==
      "function"
    ){
      window.MillionaireShortcuts
        ?.showMessage?.(
          "Sterowanie grą nie jest dostępne",
          1200
        );

      return false;
    }

    game.executeControlAction(
      action,
      payload
    );

    return true;
  }

  /* =========================
     SELECT ANSWER
  ========================= */

  function selectAnswer(
    answer
  ){
    executeGameAction(
      "select-answer",
      {
        answer
      }
    );
  }

  /* =========================
     CONFIRM ANSWER
  ========================= */

  function confirmSelectedAnswer(){
    const game=
      window.MillionaireGame;

    const state=
      game?.getState?.();

    if(!state){
      window.MillionaireShortcuts
        ?.showMessage?.(
          "Brak aktywnej rozgrywki",
          1200
        );

      return;
    }

    if(
      !state.currentSelectedAnswer
    ){
      window.MillionaireShortcuts
        ?.showMessage?.(
          "Najpierw wybierz odpowiedź",
          1200
        );

      return;
    }

    if(
      !state.answerConfirmReady
    ){
      window.MillionaireShortcuts
        ?.showMessage?.(
          state.answerConfirmHint||
          "Odpowiedź nie jest jeszcze gotowa do potwierdzenia",
          1200
        );

      return;
    }

    if(
      typeof game
        ?.handleHostAnswer!==
      "function"
    ){
      window.MillionaireShortcuts
        ?.showMessage?.(
          "Potwierdzanie odpowiedzi nie jest dostępne",
          1200
        );

      return;
    }

    game.handleHostAnswer(
      state.currentSelectedAnswer
    );
  }
})();