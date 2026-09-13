const DEFAULT_SETTINGS={
  general:{
    gameTitle:"Milionerzy",
    questionsCount:12,
    autoNextQuestion:false,
    confirmAnswer:true,
    randomQuestions:false,
    randomAnswers:false
  },

  screen:{
    fullscreen:false,

    mode:"select",

    displayId:null,
    resolution:"native",

    screenIndex:0,
    width:1920,
    height:1080,

    technicalInfo:false
  },

  sound:{
    masterVolume:100,
    interfaceSounds:true,
    gameSounds:true
  },

  prizeTree:{
    currency:"zł",

    levels:[
      {
        level:1,
        amount:1000,
        guaranteed:false
      },
      {
        level:2,
        amount:2000,
        guaranteed:true
      },
      {
        level:3,
        amount:5000,
        guaranteed:false
      },
      {
        level:4,
        amount:10000,
        guaranteed:false
      },
      {
        level:5,
        amount:15000,
        guaranteed:false
      },
      {
        level:6,
        amount:25000,
        guaranteed:false
      },
      {
        level:7,
        amount:50000,
        guaranteed:true
      },
      {
        level:8,
        amount:75000,
        guaranteed:false
      },
      {
        level:9,
        amount:125000,
        guaranteed:false
      },
      {
        level:10,
        amount:250000,
        guaranteed:false
      },
      {
        level:11,
        amount:500000,
        guaranteed:false
      },
      {
        level:12,
        amount:1000000,
        guaranteed:false
      }
    ]
  },

  appearance:{
    general:{
      theme:"light",
      accentColor:"#356df3",
      animations:true
    },

    game:{
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
    }
  },

  shortcuts:{
    enabled:true,

    general:{
      help:"Ctrl+S",
      home:"Ctrl+H",
      startGame:"Ctrl+G",
      quit:"Ctrl+Q",
      questions:"Ctrl+P",
      settings:"Ctrl+,",
      reload:"F5",
      forceReload:"Ctrl+F5",
      fullscreen:"F11",
      devTools:"F12"
    },

    game:{
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
    },

    questions:{
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
    },

    settings:{
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
    },

    timing:{
      base:1000,
      additionalPerKey:250,
      maxKeys:4
    }
  },

  dataStorage:{
    autoSave:true,
    autoBackup:false,
    backupInterval:30
  }
};

module.exports={
  DEFAULT_SETTINGS
};