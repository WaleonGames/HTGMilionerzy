(()=>{
  let shortcutsHelpOpen=false;

  let shortcutsHelpData={};

  /* =========================
     LABELS
  ========================= */

  const SHORTCUT_HELP_GROUP_LABELS={
    general:"Ogólne",
    game:"Gra",
    questions:"Pytania",
    settings:"Ustawienia"
  };

  const SHORTCUT_HELP_LABELS={
    help:"Pokaż / ukryj pomocnik skrótów",
    home:"Otwórz panel główny",
    startGame:"Rozpocznij grę",
    quit:"Wyjdź z programu",
    questions:"Baza pytań",
    settings:"Ustawienia",
    reload:"Odśwież",
    forceReload:"Wymuś odświeżenie",
    fullscreen:"Pełny ekran",
    devTools:"DevTools",

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

    general:"Otwórz zakładkę Ogólne",
    screen:"Otwórz zakładkę Ekran",
    sound:"Otwórz zakładkę Dźwięk",
    prizeTree:"Otwórz zakładkę Drzewko nagród",
    appearance:"Otwórz zakładkę Wygląd",
    dataStorage:"Otwórz zakładkę Zapisy danych",
    shortcuts:"Otwórz zakładkę Skróty",
    save:"Zapisz ustawienia",
    reset:"Przywróć ustawienia domyślne",
    colorPalette:"Otwórz paletę kolorów"
  };

  /* =========================
     HELPERS
  ========================= */

  function formatShortcut(
    value
  ){
    if(
      value===null||
      value===undefined
    ){
      return "";
    }

    return String(value)
      .split("+")
      .map(
        item=>
          item.trim()
      )
      .filter(Boolean)
      .join(" + ");
  }

  function joinShortcutParts(
    ...parts
  ){
    return parts
      .flatMap(
        part=>
          String(
            part||""
          )
            .split("+")
      )
      .map(
        item=>
          item.trim()
      )
      .filter(Boolean)
      .join(" + ");
  }

  /* =========================
     BUILD HELP DATA
  ========================= */

  function buildShortcutsHelpData(
    shortcuts={}
  ){
    const result={};

    /* =========================
       GENERAL
    ========================= */

    const general=
      shortcuts.general||{};

    result[
      SHORTCUT_HELP_GROUP_LABELS
        .general
    ]=[
      [
        formatShortcut(
          general.help
        ),
        SHORTCUT_HELP_LABELS.help
      ],

      [
        formatShortcut(
          general.home
        ),
        SHORTCUT_HELP_LABELS.home
      ],

      [
        formatShortcut(
          general.startGame
        ),
        SHORTCUT_HELP_LABELS.startGame
      ],

      [
        formatShortcut(
          general.quit
        ),
        SHORTCUT_HELP_LABELS.quit
      ],

      [
        formatShortcut(
          general.questions
        ),
        SHORTCUT_HELP_LABELS.questions
      ],

      [
        formatShortcut(
          general.settings
        ),
        SHORTCUT_HELP_LABELS.settings
      ],

      [
        formatShortcut(
          general.reload
        ),
        SHORTCUT_HELP_LABELS.reload
      ],

      [
        formatShortcut(
          general.forceReload
        ),
        SHORTCUT_HELP_LABELS.forceReload
      ],

      [
        formatShortcut(
          general.fullscreen
        ),
        SHORTCUT_HELP_LABELS.fullscreen
      ],

      [
        formatShortcut(
          general.devTools
        ),
        SHORTCUT_HELP_LABELS.devTools
      ]
    ].filter(
      ([shortcut])=>
        shortcut
    );

    /* =========================
       GAME
    ========================= */

    const game=
      shortcuts.game||{};

    const gamePrefix=
      game.prefix||"";

    result[
      SHORTCUT_HELP_GROUP_LABELS
        .game
    ]=[
      [
        joinShortcutParts(
          gamePrefix,
          game.sidebar
        ),
        SHORTCUT_HELP_LABELS.sidebar
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.controls
        ),
        SHORTCUT_HELP_LABELS.controls
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.mainScreen
        ),
        SHORTCUT_HELP_LABELS.mainScreen
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.showQuestion
        ),
        SHORTCUT_HELP_LABELS.showQuestion
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.showAnswer
        ),
        SHORTCUT_HELP_LABELS.showAnswer
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.answerA
        ),
        SHORTCUT_HELP_LABELS.answerA
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.answerB
        ),
        SHORTCUT_HELP_LABELS.answerB
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.answerC
        ),
        SHORTCUT_HELP_LABELS.answerC
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.answerD
        ),
        SHORTCUT_HELP_LABELS.answerD
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.confirm
        ),
        SHORTCUT_HELP_LABELS.confirm
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.nextQuestion
        ),
        SHORTCUT_HELP_LABELS.nextQuestion
      ],

      [
        joinShortcutParts(
          gamePrefix,
          game.exit
        ),
        SHORTCUT_HELP_LABELS.exit
      ]
    ].filter(
      ([shortcut])=>
        shortcut
    );

    /* =========================
       QUESTIONS
    ========================= */

    const questions=
      shortcuts.questions||{};

    const questionsPrefix=
      questions.prefix||"";

    const questionItems=[
      [
        joinShortcutParts(
          questionsPrefix,
          questions.add
        ),
        SHORTCUT_HELP_LABELS.add
      ],

      [
        joinShortcutParts(
          questionsPrefix,
          questions.edit
        ),
        SHORTCUT_HELP_LABELS.edit
      ],

      [
        joinShortcutParts(
          questionsPrefix,
          questions.remove
        ),
        SHORTCUT_HELP_LABELS.remove
      ],

      [
        joinShortcutParts(
          questionsPrefix,
          questions.toggleActive
        ),
        SHORTCUT_HELP_LABELS.toggleActive
      ]
    ];

    /* =========================
       CORRECT ANSWER
    ========================= */

    const correctAnswer=
      questions.correctAnswer||{};

    const correctPrefix=
      correctAnswer.prefix||"";

    [
      "A",
      "B",
      "C",
      "D"
    ].forEach(
      answer=>{
        const value=
          correctAnswer[answer];

        if(!value){
          return;
        }

        questionItems.push([
          joinShortcutParts(
            questionsPrefix,
            correctPrefix,
            value
          ),

          `Ustaw poprawną odpowiedź ${answer}`
        ]);
      }
    );

    /* =========================
       LEVELS
    ========================= */

    const level=
      questions.level||{};

    const levelPrefix=
      level.prefix||"";

    Object.entries(
      level
    )
      .filter(
        ([key])=>
          key!=="prefix"
      )
      .sort(
        ([a],[b])=>
          Number(a)-
          Number(b)
      )
      .forEach(
        ([levelNumber,value])=>{
          questionItems.push([
            joinShortcutParts(
              questionsPrefix,
              levelPrefix,
              value
            ),

            `Ustaw poziom ${levelNumber}`
          ]);
        }
      );

    result[
      SHORTCUT_HELP_GROUP_LABELS
        .questions
    ]=
      questionItems.filter(
        ([shortcut])=>
          shortcut
      );

    /* =========================
       SETTINGS
    ========================= */

    const settings=
      shortcuts.settings||{};

    const settingsPrefix=
      settings.prefix||"";

    result[
      SHORTCUT_HELP_GROUP_LABELS
        .settings
    ]=[
      [
        joinShortcutParts(
          settingsPrefix,
          settings.general
        ),
        SHORTCUT_HELP_LABELS.general
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.screen
        ),
        SHORTCUT_HELP_LABELS.screen
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.sound
        ),
        SHORTCUT_HELP_LABELS.sound
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.prizeTree
        ),
        SHORTCUT_HELP_LABELS.prizeTree
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.appearance
        ),
        SHORTCUT_HELP_LABELS.appearance
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.dataStorage
        ),
        SHORTCUT_HELP_LABELS.dataStorage
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.shortcuts
        ),
        SHORTCUT_HELP_LABELS.shortcuts
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.save
        ),
        SHORTCUT_HELP_LABELS.save
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.reset
        ),
        SHORTCUT_HELP_LABELS.reset
      ],

      [
        joinShortcutParts(
          settingsPrefix,
          settings.colorPalette
        ),
        SHORTCUT_HELP_LABELS.colorPalette
      ]
    ].filter(
      ([shortcut])=>
        shortcut
    );

    return result;
  }

  /* =========================
     LOAD SHORTCUTS
  ========================= */

  async function loadShortcutsHelpData(){
    try{
      const settings=
        await window
          .millionaireAPI
          ?.settings
          ?.get?.();

      shortcutsHelpData=
        buildShortcutsHelpData(
          settings?.shortcuts||{}
        );

      return shortcutsHelpData;
    }catch(error){
      console.error(
        "Błąd pobierania skrótów do pomocy:",
        error
      );

      shortcutsHelpData={};

      return shortcutsHelpData;
    }
  }

  /* =========================
     CREATE
  ========================= */

  async function createShortcutsHelp(){
    if(
      document.getElementById(
        "shortcutsHelp"
      )
    ){
      return;
    }

    injectShortcutsHelpStyles();

    await loadShortcutsHelpData();

    /* =========================
       BACKDROP
    ========================= */

    const backdrop=
      document.createElement(
        "div"
      );

    backdrop.id=
      "shortcutsHelpBackdrop";

    backdrop.className=
      "offcanvas-backdrop";

    backdrop.hidden=true;

    /* =========================
       OFFCANVAS
    ========================= */

    const offcanvas=
      document.createElement(
        "aside"
      );

    offcanvas.id=
      "shortcutsHelp";

    offcanvas.className=
      "offcanvas offcanvas-right shortcuts-help";

    offcanvas.setAttribute(
      "aria-hidden",
      "true"
    );

    /* =========================
       HEADER
    ========================= */

    const header=
      document.createElement(
        "div"
      );

    header.className=
      "offcanvas-header";

    const headerText=
      document.createElement(
        "div"
      );

    const eyebrow=
      document.createElement(
        "span"
      );

    eyebrow.className=
      "eyebrow";

    eyebrow.textContent=
      "POMOC";

    const title=
      document.createElement(
        "h2"
      );

    title.textContent=
      "Skróty klawiszowe";

    headerText.append(
      eyebrow,
      title
    );

    /* =========================
       HEADER ACTIONS
    ========================= */

    const headerActions=
      document.createElement(
        "div"
      );

    headerActions.className=
      "offcanvas-header-actions";

    const closeButton=
      document.createElement(
        "button"
      );

    closeButton.type=
      "button";

    closeButton.className=
      "icon-button";

    closeButton.setAttribute(
      "aria-label",
      "Zamknij"
    );

    closeButton.title=
      "Zamknij";

    closeButton.textContent=
      "×";

    headerActions.appendChild(
      closeButton
    );

    header.append(
      headerText,
      headerActions
    );

    /* =========================
       CONTENT
    ========================= */

    const content=
      document.createElement(
        "div"
      );

    content.className=
      "offcanvas-content shortcuts-help-content";

    renderShortcutsHelpContent(
      content
    );

    /* =========================
       APPEND
    ========================= */

    offcanvas.append(
      header,
      content
    );

    document.body.append(
      backdrop,
      offcanvas
    );

    /* =========================
       EVENTS
    ========================= */

    closeButton.addEventListener(
      "click",
      closeShortcutsHelp
    );

    backdrop.addEventListener(
      "click",
      closeShortcutsHelp
    );
  }

  /* =========================
     RENDER CONTENT
  ========================= */

  function renderShortcutsHelpContent(
    content
  ){
    if(!content){
      return;
    }

    content.innerHTML="";

    Object.entries(
      shortcutsHelpData
    ).forEach(
      ([sectionName,items])=>{
        if(
          !Array.isArray(items)||
          items.length===0
        ){
          return;
        }

        const section=
          document.createElement(
            "section"
          );

        section.className=
          "shortcuts-help-section";

        const sectionTitle=
          document.createElement(
            "h3"
          );

        sectionTitle.textContent=
          sectionName;

        const list=
          document.createElement(
            "div"
          );

        list.className=
          "shortcuts-help-list";

        items.forEach(
          ([shortcut,label])=>{
            const row=
              document.createElement(
                "div"
              );

            row.className=
              "shortcuts-help-row";

            const keys=
              document.createElement(
                "kbd"
              );

            keys.textContent=
              shortcut;

            const description=
              document.createElement(
                "span"
              );

            description.textContent=
              label;

            row.append(
              keys,
              description
            );

            list.appendChild(
              row
            );
          }
        );

        section.append(
          sectionTitle,
          list
        );

        content.appendChild(
          section
        );
      }
    );
  }

  /* =========================
     REFRESH
  ========================= */

  async function refreshShortcutsHelp(){
    await loadShortcutsHelpData();

    const content=
      document.querySelector(
        "#shortcutsHelp .shortcuts-help-content"
      );

    if(content){
      renderShortcutsHelpContent(
        content
      );
    }
  }

  /* =========================
     CUSTOM CSS
  ========================= */

  function injectShortcutsHelpStyles(){
    if(
      document.getElementById(
        "shortcutsHelpStyles"
      )
    ){
      return;
    }

    const style=
      document.createElement(
        "style"
      );

    style.id=
      "shortcutsHelpStyles";

    style.textContent=`
      .shortcuts-help{
        width:min(
          440px,
          calc(100vw - 32px)
        );
      }

      .shortcuts-help-content{
        gap:0;
      }

      .shortcuts-help-section+
      .shortcuts-help-section{
        margin-top:28px;
      }

      .shortcuts-help-section h3{
        margin:0 0 12px;
        font-size:15px;
      }

      .shortcuts-help-list{
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      .shortcuts-help-row{
        display:grid;

        grid-template-columns:
          130px
          minmax(0,1fr);

        align-items:center;

        gap:12px;

        min-height:48px;

        padding:10px 12px;

        border:
          1px solid
          var(--design-border);

        border-radius:10px;

        background:
          var(--design-surface-soft);
      }

      .shortcuts-help-row:hover{
        background:
          var(--design-surface-hover);

        border-color:
          var(--design-border-strong);
      }

      .shortcuts-help-row kbd{
        display:inline-flex;

        align-items:center;
        justify-content:center;

        min-height:30px;

        padding:5px 9px;

        border:
          1px solid
          var(--design-border-strong);

        border-bottom-width:2px;

        border-radius:7px;

        background:
          var(--design-surface);

        color:
          var(--design-text-soft);

        font-family:inherit;
        font-size:12px;
        font-weight:800;

        white-space:nowrap;

        box-shadow:
          var(--design-shadow-sm);
      }

      .shortcuts-help-row span{
        min-width:0;

        color:
          var(--design-text-soft);

        font-size:14px;
        line-height:1.4;
      }

      @media(max-width:520px){
        .shortcuts-help{
          width:min(
            100%,
            calc(100vw - 12px)
          );
        }

        .shortcuts-help-row{
          grid-template-columns:
            110px
            minmax(0,1fr);
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  /* =========================
     OPEN
  ========================= */

  async function openShortcutsHelp(){
    await createShortcutsHelp();

    await refreshShortcutsHelp();

    const offcanvas=
      document.getElementById(
        "shortcutsHelp"
      );

    const backdrop=
      document.getElementById(
        "shortcutsHelpBackdrop"
      );

    if(
      !offcanvas||
      !backdrop
    ){
      return;
    }

    shortcutsHelpOpen=true;

    backdrop.hidden=false;

    requestAnimationFrame(
      ()=>{
        offcanvas
          .classList
          .add(
            "open"
          );
      }
    );

    offcanvas.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  /* =========================
     CLOSE
  ========================= */

  function closeShortcutsHelp(){
    const offcanvas=
      document.getElementById(
        "shortcutsHelp"
      );

    const backdrop=
      document.getElementById(
        "shortcutsHelpBackdrop"
      );

    shortcutsHelpOpen=false;

    offcanvas
      ?.classList
      .remove(
        "open"
      );

    offcanvas
      ?.setAttribute(
        "aria-hidden",
        "true"
      );

    if(backdrop){
      backdrop.hidden=true;
    }
  }

  /* =========================
     TOGGLE
  ========================= */

  async function toggleShortcutsHelp(){
    if(shortcutsHelpOpen){
      closeShortcutsHelp();

      return;
    }

    await openShortcutsHelp();
  }

  /* =========================
     ESC
  ========================= */

  document.addEventListener(
    "keydown",
    event=>{
      if(
        event.key==="Escape"&&
        shortcutsHelpOpen
      ){
        event.preventDefault();

        closeShortcutsHelp();
      }
    }
  );

  /* =========================
     PUBLIC API
  ========================= */

  window.MillionaireShortcutsHelp={
    open:
      openShortcutsHelp,

    close:
      closeShortcutsHelp,

    toggle:
      toggleShortcutsHelp,

    refresh:
      refreshShortcutsHelp
  };

  /* =========================
     PRELOAD API
  ========================= */

  window.millionaireAPI
    ?.shortcutsHelp
    ?.onOpen?.(
      ()=>{
        openShortcutsHelp();
      }
    );

  window.millionaireAPI
    ?.shortcutsHelp
    ?.onClose?.(
      ()=>{
        closeShortcutsHelp();
      }
    );

  window.millionaireAPI
    ?.shortcutsHelp
    ?.onToggle?.(
      ()=>{
        toggleShortcutsHelp();
      }
    );
})();