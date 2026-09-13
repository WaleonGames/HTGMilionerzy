const {
  Menu,
  app,
  shell
}=require("electron");

let currentMainWindow=null;
let currentReadSettings=null;

function createToolbar({
  mainWindow,
  readSettings
}={}){
  currentMainWindow=
    mainWindow||
    currentMainWindow;

  currentReadSettings=
    readSettings||
    currentReadSettings;

  const settings=
    typeof currentReadSettings==="function"
      ? currentReadSettings()
      : {};

  const shortcuts=
    settings?.shortcuts?.general||
    {};

  const getShortcut=(
    key,
    fallback
  )=>{
    const value=
      String(
        shortcuts?.[key]||
        ""
      ).trim();

    return value||fallback;
  };

  const template=[
    {
      label:"Gra",

      submenu:[
        {
          label:"Panel główny",

          accelerator:
            getShortcut(
              "home",
              "CmdOrCtrl+H"
            ),

          click:()=>{
            navigate(
              currentMainWindow,
              "index.html"
            );
          }
        },

        {
          label:"Rozpocznij grę",

          accelerator:
            getShortcut(
              "startGame",
              "CmdOrCtrl+G"
            ),

          click:()=>{
            navigate(
              currentMainWindow,
              "game.html"
            );
          }
        },

        {
          type:"separator"
        },

        {
          label:"Wyjdź",

          accelerator:
            getShortcut(
              "quit",
              process.platform==="darwin"
                ? "Cmd+Q"
                : "Ctrl+Q"
            ),

          click:()=>{
            app.quit();
          }
        }
      ]
    },

    {
      label:"Zarządzanie",

      submenu:[
        {
          label:"Pytania",

          accelerator:
            getShortcut(
              "questions",
              "CmdOrCtrl+P"
            ),

          click:()=>{
            navigate(
              currentMainWindow,
              "questions.html"
            );
          }
        },

        {
          label:"Ustawienia",

          accelerator:
            getShortcut(
              "settings",
              "CmdOrCtrl+,"
            ),

          click:()=>{
            navigate(
              currentMainWindow,
              "settings.html"
            );
          }
        }
      ]
    },

    {
      label:"Program",

      submenu:[
        {
          label:"GitHub",

          click:async()=>{
            try{
              await shell.openExternal(
                "https://github.com/WaleonGames/HTGMilionerzy"
              );
            }catch(error){
              console.error(
                "Nie udało się otworzyć GitHub:",
                error
              );
            }
          }
        },

        {
          label:"Feedback",

          click:async()=>{
            try{
              await shell.openExternal(
                "https://forms.gle/d9km3BGH59gGnsEB8"
              );
            }catch(error){
              console.error(
                "Nie udało się otworzyć Feedback:",
                error
              );
            }
          }
        },

        {
          type:"separator"
        },

        {
          label:"O programie",
          enabled:false
        }
      ]
    },

    {
      label:"Pomoc",

      submenu:[
        {
          label:"Skróty klawiszowe",

          accelerator:
            getShortcut(
              "help",
              "CmdOrCtrl+S"
            ),

          click:()=>{
            toggleShortcutsHelp(
              currentMainWindow
            );
          }
        }
      ]
    },

    {
      label:"Narzędzia deweloperskie",

      submenu:[
        {
          role:"reload",

          label:"Odśwież",

          accelerator:
            getShortcut(
              "reload",
              "F5"
            )
        },

        {
          role:"forceReload",

          label:"Wymuś odświeżenie",

          accelerator:
            getShortcut(
              "forceReload",
              "Ctrl+F5"
            )
        },

        {
          type:"separator"
        },

        {
          role:"toggleDevTools",

          label:"Narzędzia deweloperskie",

          accelerator:
            getShortcut(
              "devTools",
              "F12"
            )
        },

        {
          type:"separator"
        },

        {
          role:"resetZoom",
          label:"Resetuj powiększenie"
        },

        {
          role:"zoomIn",
          label:"Powiększ"
        },

        {
          role:"zoomOut",
          label:"Pomniejsz"
        },

        {
          type:"separator"
        },

        {
          role:"togglefullscreen",

          label:"Pełny ekran",

          accelerator:
            getShortcut(
              "fullscreen",
              "F11"
            )
        }
      ]
    }
  ];

  if(
    process.platform==="darwin"
  ){
    template.unshift({
      label:app.name,

      submenu:[
        {
          role:"about"
        },

        {
          type:"separator"
        },

        {
          role:"services"
        },

        {
          type:"separator"
        },

        {
          role:"hide"
        },

        {
          role:"hideOthers"
        },

        {
          role:"unhide"
        },

        {
          type:"separator"
        },

        {
          role:"quit"
        }
      ]
    });
  }

  const menu=
    Menu.buildFromTemplate(
      template
    );

  Menu.setApplicationMenu(
    menu
  );

  return menu;
}

function updateToolbar(){
  if(
    !currentMainWindow||
    currentMainWindow.isDestroyed()
  ){
    return null;
  }

  return createToolbar({
    mainWindow:
      currentMainWindow,

    readSettings:
      currentReadSettings
  });
}

function navigate(
  mainWindow,
  page
){
  if(
    !mainWindow||
    mainWindow.isDestroyed()
  ){
    return;
  }

  mainWindow.loadFile(
    require("path").join(
      __dirname,
      "views",
      page
    )
  );
}

function toggleShortcutsHelp(
  mainWindow
){
  if(
    !mainWindow||
    mainWindow.isDestroyed()
  ){
    return;
  }

  mainWindow
    .webContents
    .send(
      "shortcuts-help:toggle"
    );
}

function removeToolbar(){
  Menu.setApplicationMenu(
    null
  );
}

module.exports={
  createToolbar,
  updateToolbar,
  removeToolbar
};