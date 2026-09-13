(()=>{
  /* =========================
     DEFAULTS
  ========================= */

  const DEFAULT_QUESTION_SHORTCUTS={
    prefix:"P",

    add:"A",
    edit:"E",
    remove:"R",
    toggleActive:"D",

    correctAnswer:{
      prefix:"Q",

      A:"1",
      B:"2",
      C:"3",
      D:"4"
    },

    level:{
      prefix:"L",

      1:"1",
      2:"2",
      3:"3",
      4:"4",
      5:"5",
      6:"6",
      7:"7",
      8:"8",
      9:"9",
      10:"10",
      11:"11",
      12:"12"
    }
  };

  /* =========================
     REGISTER
  ========================= */

  window.MillionaireShortcuts
    ?.register({
      id:"questions",

      prefix:
        DEFAULT_QUESTION_SHORTCUTS
          .prefix,

      name:"Pytania",

      buildShortcuts:settings=>{
        const config=
          mergeQuestionShortcutConfig(
            settings
          );

        const shortcuts={};

        /* =========================
           ADD
        ========================= */

        addShortcut(
          shortcuts,
          config.add,
          {
            label:"Dodaj pytanie",
            message:"Dodaj pytanie",

            execute:()=>{
              openAddQuestion();
            }
          },
          DEFAULT_QUESTION_SHORTCUTS.add
        );

        /* =========================
           EDIT
        ========================= */

        addShortcut(
          shortcuts,
          config.edit,
          {
            label:"Edytuj pytanie",
            message:
              "Wybierz pytanie do edycji",

            execute:()=>{
              openQuestionPicker(
                "edit"
              );
            }
          },
          DEFAULT_QUESTION_SHORTCUTS.edit
        );

        /* =========================
           REMOVE
        ========================= */

        addShortcut(
          shortcuts,
          config.remove,
          {
            label:"Usuń pytanie",
            message:
              "Wybierz pytanie do usunięcia",

            execute:()=>{
              openQuestionPicker(
                "remove"
              );
            }
          },
          DEFAULT_QUESTION_SHORTCUTS.remove
        );

        /* =========================
           ACTIVE
        ========================= */

        addShortcut(
          shortcuts,
          config.toggleActive,
          {
            label:"Aktywne / nieaktywne",
            message:
              "Zmień dostępność pytania",

            execute:()=>{
              toggleQuestionAvailability();
            }
          },
          DEFAULT_QUESTION_SHORTCUTS
            .toggleActive
        );

        /* =========================
           CORRECT ANSWER
        ========================= */

        addCorrectAnswerShortcuts(
          shortcuts,
          config.correctAnswer
        );

        /* =========================
           LEVELS
        ========================= */

        addLevelShortcuts(
          shortcuts,
          config.level
        );

        return shortcuts;
      }
    });

  /* =========================
     CONFIG MERGE
  ========================= */

  function mergeQuestionShortcutConfig(
    settings={}
  ){
    const config=
      structuredClone(
        DEFAULT_QUESTION_SHORTCUTS
      );

    if(
      settings&&
      typeof settings==="object"
    ){
      Object.keys(settings)
        .forEach(
          key=>{
            const value=
              settings[key];

            if(
              value&&
              typeof value==="object"&&
              !Array.isArray(value)
            ){
              config[key]={
                ...(config[key]||{}),
                ...value
              };

              return;
            }

            config[key]=value;
          }
        );
    }

    return config;
  }

  /* =========================
     CORRECT ANSWER
  ========================= */

  function addCorrectAnswerShortcuts(
    target,
    config={}
  ){
    const prefix=
      config.prefix||
      DEFAULT_QUESTION_SHORTCUTS
        .correctAnswer
        .prefix;

    const node={};

    const answers=[
      ["A","Odpowiedź A"],
      ["B","Odpowiedź B"],
      ["C","Odpowiedź C"],
      ["D","Odpowiedź D"]
    ];

    answers.forEach(
      ([answer,label])=>{
        addShortcut(
          node,
          config[answer],
          {
            label,
            message:
              `Poprawna odpowiedź: ${answer}`,

            execute:()=>{
              setCorrectAnswer(
                answer
              );
            }
          },
          DEFAULT_QUESTION_SHORTCUTS
            .correctAnswer[
              answer
            ]
        );
      }
    );

    insertShortcut(
      target,
      parseShortcutSequence(
        prefix
      ),
      {
        label:"Poprawna odpowiedź",

        prompt:
          "Poprawna odpowiedź — wybierz odpowiedź",

        children:node
      }
    );
  }

  /* =========================
     LEVELS
  ========================= */

  function addLevelShortcuts(
    target,
    config={}
  ){
    const prefix=
      config.prefix||
      DEFAULT_QUESTION_SHORTCUTS
        .level
        .prefix;

    const node={};

    for(
      let level=1;
      level<=12;
      level++
    ){
      const value=
        config[level]??
        config[String(level)]??
        DEFAULT_QUESTION_SHORTCUTS
          .level[level];

      addShortcut(
        node,
        value,
        {
          label:
            `Poziom ${level}`,

          message:
            `Poziom pytania: ${level}`,

          execute:()=>{
            setQuestionLevel(
              level
            );
          }
        },
        DEFAULT_QUESTION_SHORTCUTS
          .level[level]
      );
    }

    insertShortcut(
      target,
      parseShortcutSequence(
        prefix
      ),
      {
        label:"Poziom pytania",

        prompt:
          "Poziom pytania — wybierz poziom 1–12",

        children:node
      }
    );
  }

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

    if(keys.length===0){
      keys=
        parseShortcutSequence(
          fallback
        );
    }

    if(keys.length>3){
      console.warn(
        "Skrót pytań jest zbyt długi:",
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
          if(
            node[key]&&
            typeof node[key]==="object"
          ){
            node[key]={
              ...node[key],
              ...action,

              children:
                node[key].children||
                action.children
            };

            return;
          }

          node[key]=action;

          return;
        }

        if(
          !node[key]||
          typeof node[key]!=="object"
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
     PARSE
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
      ].includes(lower)
    ){
      console.warn(
        `Modyfikator "${value}" nie może być użyty wewnątrz skrótu grupy Pytania.`
      );

      return "";
    }

    if(value.length===1){
      return value.toLowerCase();
    }

    return value;
  }

  /* =========================
     ADD
  ========================= */

  function openAddQuestion(){
    const questions=
      window.MillionaireQuestions;

    if(
      typeof questions
        ?.openAddModal===
      "function"
    ){
      questions.openAddModal();

      return;
    }

    document
      .getElementById(
        "addQuestionButton"
      )
      ?.click();
  }

  /* =========================
     PICKER
  ========================= */

  function openQuestionPicker(
    mode
  ){
    const questions=
      window.MillionaireQuestions;

    if(
      typeof questions
        ?.openQuestionPicker===
      "function"
    ){
      questions.openQuestionPicker(
        mode
      );

      return;
    }

    showMessage(
      "Picker pytań nie jest jeszcze dostępny",
      getDuration(2)
    );
  }

  /* =========================
     AVAILABILITY
  ========================= */

  function toggleQuestionAvailability(){
    const questions=
      window.MillionaireQuestions;

    if(
      typeof questions
        ?.toggleCurrentActive===
      "function"
    ){
      questions.toggleCurrentActive();

      return;
    }

    if(
      typeof questions
        ?.toggleActive===
      "function"
    ){
      questions.toggleActive();

      return;
    }

    const checkbox=
      document.getElementById(
        "questionActive"
      );

    if(checkbox){
      checkbox.checked=
        !checkbox.checked;

      checkbox.dispatchEvent(
        new Event(
          "change",
          {
            bubbles:true
          }
        )
      );

      showMessage(
        checkbox.checked
          ? "Pytanie aktywne"
          : "Pytanie nieaktywne",
        getDuration(2)
      );

      return;
    }

    showMessage(
      "Nie znaleziono ustawienia dostępności",
      getDuration(2)
    );
  }

  /* =========================
     CORRECT ANSWER ACTION
  ========================= */

  function setCorrectAnswer(
    answer
  ){
    const questions=
      window.MillionaireQuestions;

    if(
      typeof questions
        ?.setCorrectAnswer===
      "function"
    ){
      questions.setCorrectAnswer(
        answer
      );

      return;
    }

    const select=
      document.getElementById(
        "correctAnswer"
      );

    if(!select){
      showMessage(
        "Nie znaleziono pola poprawnej odpowiedzi",
        getDuration(3)
      );

      return;
    }

    select.value=
      answer;

    select.dispatchEvent(
      new Event(
        "change",
        {
          bubbles:true
        }
      )
    );
  }

  /* =========================
     LEVEL ACTION
  ========================= */

  function setQuestionLevel(
    level
  ){
    if(
      !Number.isInteger(level)||
      level<1||
      level>12
    ){
      return;
    }

    const questions=
      window.MillionaireQuestions;

    if(
      typeof questions
        ?.setLevel===
      "function"
    ){
      questions.setLevel(
        level
      );

      return;
    }

    const input=
      document.getElementById(
        "questionLevel"
      )||
      document.getElementById(
        "level"
      );

    if(!input){
      showMessage(
        "Nie znaleziono pola poziomu pytania",
        getDuration(3)
      );

      return;
    }

    input.value=
      String(level);

    input.dispatchEvent(
      new Event(
        "change",
        {
          bubbles:true
        }
      )
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