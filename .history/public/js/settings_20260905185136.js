const backButton=document.getElementById("backButton");
const saveButton=document.getElementById("saveButton");
const resetButton=document.getElementById("resetButton");

const tabs=document.querySelectorAll(".nav-item");
const panels=document.querySelectorAll(".tab-panel");

const statusMessage=document.getElementById("statusMessage");

const gameTitle=document.getElementById("gameTitle");
const questionsCount=document.getElementById("questionsCount");
const autoNextQuestion=document.getElementById("autoNextQuestion");
const confirmAnswer=document.getElementById("confirmAnswer");

const fullscreen=document.getElementById("fullscreen");
const screenIndex=document.getElementById("screenIndex");
const screenWidth=document.getElementById("screenWidth");
const screenHeight=document.getElementById("screenHeight");

const masterVolume=document.getElementById("masterVolume");
const masterVolumeValue=document.getElementById("masterVolumeValue");
const interfaceSounds=document.getElementById("interfaceSounds");
const gameSounds=document.getElementById("gameSounds");

const currency=document.getElementById("currency");
const prizeLevels=document.getElementById("prizeLevels");

const theme=document.getElementById("theme");
const accentColor=document.getElementById("accentColor");
const animations=document.getElementById("animations");

const autoSave=document.getElementById("autoSave");
const autoBackup=document.getElementById("autoBackup");
const backupInterval=document.getElementById("backupInterval");

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

backButton.addEventListener("click",()=>{
  window.location.href="index.html";
});

tabs.forEach(tab=>{
  tab.addEventListener("click",()=>{
    const target=tab.dataset.tab;

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
  });
});

masterVolume.addEventListener("input",()=>{
  masterVolumeValue.textContent=
    `${masterVolume.value}%`;
});

saveButton.addEventListener("click",async()=>{
  const settings=collectSettings();

  await window.millionaireAPI.settings.save(
    settings
  );

  currentSettings=settings;

  showStatus("Ustawienia zapisane.");
});

resetButton.addEventListener("click",async()=>{
  const confirmed=confirm(
    "Czy na pewno chcesz przywrócić ustawienia domyślne?"
  );

  if(!confirmed){
    return;
  }

  const settings=
    await window.millionaireAPI.settings.reset();

  applySettings(settings);

  showStatus(
    "Przywrócono ustawienia domyślne."
  );
});

function createPrizeLevels(prizes){
  prizeLevels.innerHTML="";

  const list=
    Array.isArray(prizes)&&prizes.length
      ? prizes
      : DEFAULT_PRIZES.map((amount,index)=>({
          level:index+1,
          amount,
          guaranteed:
            index===1||
            index===6
        }));

  list.forEach((prize,index)=>{
    const row=document.createElement("div");

    row.className="prize-item";

    const number=document.createElement("div");

    number.className="prize-number";
    number.textContent=`Poziom ${index+1}`;

    const amount=document.createElement("input");

    amount.type="number";
    amount.min="0";
    amount.dataset.prizeAmount="";
    amount.value=Number(
      prize.amount??0
    );

    const guaranteedLabel=
      document.createElement("label");

    guaranteedLabel.className="setting-inline";

    const guaranteed=
      document.createElement("input");

    guaranteed.type="checkbox";
    guaranteed.dataset.prizeGuaranteed="";
    guaranteed.checked=Boolean(
      prize.guaranteed
    );

    const text=document.createElement("span");

    text.textContent="Próg gwarantowany";

    guaranteedLabel.append(
      guaranteed,
      text
    );

    row.append(
      number,
      amount,
      guaranteedLabel
    );

    prizeLevels.appendChild(row);
  });
}

function collectSettings(){
  const prizeRows=[
    ...prizeLevels.querySelectorAll(
      ".prize-item"
    )
  ];

  return{
    general:{
      gameTitle:gameTitle.value.trim(),

      questionsCount:Number(
        questionsCount.value||12
      ),

      autoNextQuestion:
        autoNextQuestion.checked,

      confirmAnswer:
        confirmAnswer.checked
    },

    screen:{
      fullscreen:fullscreen.checked,

      screenIndex:Number(
        screenIndex.value||0
      ),

      width:Number(
        screenWidth.value||1920
      ),

      height:Number(
        screenHeight.value||1080
      )
    },

    sound:{
      masterVolume:Number(
        masterVolume.value||100
      ),

      interfaceSounds:
        interfaceSounds.checked,

      gameSounds:
        gameSounds.checked
    },

    prizeTree:{
      currency:
        currency.value.trim()||"zł",

      levels:prizeRows.map((row,index)=>{
        const amount=row.querySelector(
          "[data-prize-amount]"
        );

        const guaranteed=row.querySelector(
          "[data-prize-guaranteed]"
        );

        return{
          level:index+1,

          amount:Number(
            amount.value||0
          ),

          guaranteed:
            guaranteed.checked
        };
      })
    },

    appearance:{
      theme:theme.value,

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

      backupInterval:Number(
        backupInterval.value||30
      )
    }
  };
}

function applySettings(settings){
  currentSettings=settings;

  const general=
    settings.general||{};

  const screen=
    settings.screen||{};

  const sound=
    settings.sound||{};

  const prizeTree=
    settings.prizeTree||{};

  const appearance=
    settings.appearance||{};

  const dataStorage=
    settings.dataStorage||{};

  gameTitle.value=
    general.gameTitle??"Milionerzy";

  questionsCount.value=
    general.questionsCount??12;

  autoNextQuestion.checked=
    general.autoNextQuestion??false;

  confirmAnswer.checked=
    general.confirmAnswer??true;

  fullscreen.checked=
    screen.fullscreen??true;

  screenIndex.value=
    screen.screenIndex??0;

  screenWidth.value=
    screen.width??1920;

  screenHeight.value=
    screen.height??1080;

  masterVolume.value=
    sound.masterVolume??100;

  masterVolumeValue.textContent=
    `${masterVolume.value}%`;

  interfaceSounds.checked=
    sound.interfaceSounds??true;

  gameSounds.checked=
    sound.gameSounds??true;

  currency.value=
    prizeTree.currency??"zł";

  createPrizeLevels(
    prizeTree.levels
  );

  theme.value=
    appearance.theme??"dark";

  accentColor.value=
    appearance.accentColor??"#356df3";

  animations.checked=
    appearance.animations??true;

  autoSave.checked=
    dataStorage.autoSave??true;

  autoBackup.checked=
    dataStorage.autoBackup??false;

  backupInterval.value=
    dataStorage.backupInterval??30;
}

function showStatus(message){
  statusMessage.textContent=message;
  statusMessage.hidden=false;

  clearTimeout(
    showStatus.timeout
  );

  showStatus.timeout=setTimeout(()=>{
    statusMessage.hidden=true;
  },2200);
}

async function loadSettings(){
  const settings=
    await window.millionaireAPI.settings.get();

  applySettings(settings);
}

loadSettings();