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
  document.getElementById("fullscreen");

const technicalInfo=
  document.getElementById("technicalInfo");

const screenIndex=
  document.getElementById("screenIndex");

const screenWidth=
  document.getElementById("screenWidth");

const screenHeight=
  document.getElementById("screenHeight");

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
   APPEARANCE
========================= */

const theme=
  document.getElementById("theme");

const accentColor=
  document.getElementById("accentColor");

const animations=
  document.getElementById("animations");

/* =========================
   DATA STORAGE
========================= */

const autoSave=
  document.getElementById("autoSave");

const autoBackup=
  document.getElementById("autoBackup");

const backupInterval=
  document.getElementById("backupInterval");

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

let currentSettings=null;

/* =========================
   NAVIGATION
========================= */

backButton.addEventListener(
  "click",
  ()=>{
    window.location.href=
      "index.html";
  }
);

tabs.forEach(tab=>{
  tab.addEventListener(
    "click",
    ()=>{
      const target=
        tab.dataset.tab;

      tabs.forEach(item=>{
        item.classList.toggle(
          "active",
          item===tab
        );
      });

      panels.forEach(panel=>{
        panel.classList.toggle(
          "active",
          panel.dataset.panel===target
        );
      });
    }
  );
});

/* =========================
   SOUND
========================= */

masterVolume.addEventListener(
  "input",
  ()=>{
    masterVolumeValue.textContent=
      `${masterVolume.value}%`;
  }
);

/* =========================
   SAVE
========================= */

saveButton.addEventListener(
  "click",
  async()=>{
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

      window
        .millionaireDesign
        ?.apply({
          theme:
            savedSettings
              .appearance
              ?.theme??"light",

          accentColor:
            savedSettings
              .appearance
              ?.accentColor??
            "#356df3"
        });

      showStatus(
        "Ustawienia zapisane."
      );
    }catch(error){
      console.error(
        "Błąd zapisu ustawień:",
        error
      );

      showStatus(
        "Nie udało się zapisać ustawień."
      );
    }
  }
);

/* =========================
   RESET
========================= */

resetButton.addEventListener(
  "click",
  async()=>{
    const confirmed=
      confirm(
        "Czy na pewno chcesz przywrócić ustawienia domyślne?"
      );

    if(!confirmed){
      return;
    }

    try{
      const settings=
        await window
          .millionaireAPI
          .settings
          .reset();

      applySettings(
        settings
      );

      window
        .millionaireDesign
        ?.apply({
          theme:
            settings
              .appearance
              ?.theme??"light",

          accentColor:
            settings
              .appearance
              ?.accentColor??
            "#356df3"
        });

      showStatus(
        "Przywrócono ustawienia domyślne."
      );
    }catch(error){
      console.error(
        "Błąd resetowania ustawień:",
        error
      );

      showStatus(
        "Nie udało się przywrócić ustawień."
      );
    }
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

      amount.type=
        "number";

      amount.min=
        "0";

      amount.dataset.prizeAmount=
        "";

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
        .prizeGuaranteed=
        "";

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
      theme:
        theme.value,

      accentColor:
        accentColor.value,

      animations:
        animations.checked
    },

    dataStorage:{
      autoSave:
        autoSave.checked,

      autoBackup:
        autoBackup.checked,

      backupInterval:
        normalizeNumber(
          backupInterval.value,
          30,
          1
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
    settings?.appearance||{};

  const dataStorage=
    settings?.dataStorage||{};

  /* =========================
     GENERAL
  ========================= */

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

  /* =========================
     SCREEN
  ========================= */

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

  /* =========================
     SOUND
  ========================= */

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

  /* =========================
     PRIZE TREE
  ========================= */

  currency.value=
    prizeTree.currency??
    "zł";

  createPrizeLevels(
    prizeTree.levels
  );

  /* =========================
     APPEARANCE
  ========================= */

  theme.value=
    appearance.theme??
    "light";

  accentColor.value=
    appearance.accentColor??
    "#356df3";

  animations.checked=
    appearance.animations??
    true;

  /* =========================
     DATA STORAGE
  ========================= */

  autoSave.checked=
    dataStorage.autoSave??
    true;

  autoBackup.checked=
    dataStorage.autoBackup??
    false;

  backupInterval.value=
    dataStorage.backupInterval??
    30;
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
    number=
      fallback;
  }

  if(
    min!==null&&
    number<min
  ){
    number=
      min;
  }

  if(
    max!==null&&
    number>max
  ){
    number=
      max;
  }

  return number;
}

/* =========================
   STATUS
========================= */

function showStatus(message){
  statusMessage.textContent=
    message;

  statusMessage.hidden=
    false;

  clearTimeout(
    showStatus.timeout
  );

  showStatus.timeout=
    setTimeout(()=>{
      statusMessage.hidden=
        true;
    },2200);
}

/* =========================
   LOAD
========================= */

async function loadSettings(){
  try{
    const settings=
      await window
        .millionaireAPI
        .settings
        .get();

    applySettings(
      settings
    );

    window
      .millionaireDesign
      ?.apply({
        theme:
          settings
            .appearance
            ?.theme??
          "light",

        accentColor:
          settings
            .appearance
            ?.accentColor??
          "#356df3"
      });
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

loadSettings();