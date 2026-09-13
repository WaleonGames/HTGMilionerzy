const DEFAULT_GAME_DESIGN = {
  background: {
    image: "../public/assets/background/glowne.png",
    size: "cover",
    position: "center",
    brightness: 100,
    overlayEnabled: false,
    overlayColor: "#000000",
    overlayOpacity: 0,
  },
  colors: {
    primary: "#8b5cf6",
    primaryHover: "#a778ff",
    secondary: "#536dfe",
    accent: "#a855f7",
    text: "#ffffff",
    muted: "#b9b5d4",
    success: "#22c55e",
    danger: "#ef4444",
  },
  sidebar: {
    background: "rgba(7, 8, 32, 0.94)",
    surface: "rgba(24, 20, 65, 0.88)",
    surfaceHover: "rgba(48, 35, 105, 0.92)",
    border: "rgba(145, 112, 255, 0.28)",
    borderStrong: "rgba(165, 132, 255, 0.55)",
  },
  question: {
    background: "rgba(9, 10, 38, 0.90)",
    border: "rgba(157, 128, 255, 0.42)",
    text: "#ffffff",
    blur: 8,
  },
  answers: {
    background: "rgba(15, 16, 52, 0.92)",
    backgroundHover: "rgba(35, 29, 88, 0.94)",
    border: "rgba(145, 112, 255, 0.34)",
    text: "#ffffff",
    letterBackground: "rgba(139, 92, 246, 0.18)",
    letterText: "#bda1ff",
    selected: {
      background: "rgba(83, 109, 254, 0.30)",
      border: "#8b5cf6",
    },
    correct: {
      background: "rgba(34, 197, 94, 0.20)",
      text: "#8ef0ae",
    },
    wrong: {
      background: "rgba(239, 68, 68, 0.20)",
      text: "#ff9a9a",
    },
  },
  buttons: {
    active: "#8b5cf6",
    activeHover: "#a778ff",
    inactive: "rgba(24, 20, 65, 0.88)",
    inactiveHover: "rgba(48, 35, 105, 0.92)",
    disabledOpacity: 0.5,
  },
  endScene: {
    background: "rgba(7, 8, 32, 0.88)",
    surface: "rgba(24, 20, 65, 0.92)",
    border: "rgba(165, 132, 255, 0.55)",
    amountColor: "#ffffff",
  },
  animations: {
    enabled: true,
    sidebarDuration: 1000,
    questionDuration: 900,
    answerDuration: 750,
    endSceneDuration: 1000,
  },
};

function resolveGameAssetUrl(value){
  const source=
    String(
      value||""
    ).trim();

  if(!source){
    return "";
  }

  try{
    return new URL(
      source,
      window.location.href
    ).href;
  }catch(error){
    console.error(
      "Nieprawidłowa ścieżka zasobu gry:",
      source,
      error
    );

    return "";
  }
}

function applyGameDesign(gameAppearance = {}) {
  const game = deepMergeGameDesign(
    structuredClone(DEFAULT_GAME_DESIGN),
    gameAppearance,
  );

  const root = document.documentElement;
  const app = document.querySelector(".game-app");

  const backgroundImage = resolveGameAssetUrl(game.background.image);

  setGameVariable(
    "--game-background",
    backgroundImage ? `url("${backgroundImage}")` : "none",
  );

  setGameVariable("--game-background-size", game.background.size);

  setGameVariable("--game-background-position", game.background.position);

  setGameVariable(
    "--game-background-brightness",
    `${game.background.brightness}%`,
  );

  setGameVariable(
    "--game-background-overlay-color",
    game.background.overlayColor,
  );

  setGameVariable(
    "--game-background-overlay-opacity",
    game.background.overlayEnabled
      ? String(game.background.overlayOpacity / 100)
      : "0",
  );

  setGameVariable("--game-sidebar-bg", game.sidebar.background);

  setGameVariable("--game-sidebar-surface", game.sidebar.surface);

  setGameVariable("--game-sidebar-surface-hover", game.sidebar.surfaceHover);

  setGameVariable("--game-sidebar-border", game.sidebar.border);

  setGameVariable("--game-sidebar-border-strong", game.sidebar.borderStrong);

  setGameVariable("--game-sidebar-text", game.colors.text);

  setGameVariable("--game-sidebar-muted", game.colors.muted);

  setGameVariable("--game-sidebar-primary", game.colors.primary);

  setGameVariable("--game-sidebar-primary-hover", game.colors.primaryHover);

  setGameVariable("--game-sidebar-blue", game.colors.secondary);

  setGameVariable("--game-sidebar-purple", game.colors.accent);

  setGameVariable("--game-sidebar-success", game.colors.success);

  setGameVariable("--game-sidebar-danger", game.colors.danger);

  setGameVariable("--game-question-bg", game.question.background);

  setGameVariable("--game-question-border", game.question.border);

  setGameVariable("--game-question-text", game.question.text);

  setGameVariable("--game-question-muted", game.colors.muted);

  setGameVariable("--game-question-blur", `${game.question.blur}px`);

  setGameVariable("--game-answer-bg", game.answers.background);

  setGameVariable("--game-answer-bg-hover", game.answers.backgroundHover);

  setGameVariable("--game-answer-border", game.answers.border);

  setGameVariable("--game-answer-border-hover", game.sidebar.borderStrong);

  setGameVariable("--game-answer-text", game.answers.text);

  setGameVariable("--game-answer-letter-bg", game.answers.letterBackground);

  setGameVariable("--game-answer-letter-text", game.answers.letterText);

  setGameVariable(
    "--game-answer-selected-bg",
    game.answers.selected.background,
  );

  setGameVariable(
    "--game-answer-selected-border",
    game.answers.selected.border,
  );

  setGameVariable("--game-answer-correct-bg", game.answers.correct.background);

  setGameVariable("--game-answer-correct-border", game.colors.success);

  setGameVariable("--game-answer-correct-text", game.answers.correct.text);

  setGameVariable("--game-answer-wrong-bg", game.answers.wrong.background);

  setGameVariable("--game-answer-wrong-border", game.colors.danger);

  setGameVariable("--game-answer-wrong-text", game.answers.wrong.text);

  setGameVariable("--game-button-active", game.buttons.active);

  setGameVariable("--game-button-active-hover", game.buttons.activeHover);

  setGameVariable("--game-button-inactive", game.buttons.inactive);

  setGameVariable("--game-button-inactive-hover", game.buttons.inactiveHover);

  setGameVariable(
    "--game-button-disabled-opacity",
    game.buttons.disabledOpacity,
  );

  setGameVariable("--game-end-background", game.endScene.background);

  setGameVariable("--game-end-surface", game.endScene.surface);

  setGameVariable("--game-end-border", game.endScene.border);

  setGameVariable("--game-end-amount-color", game.endScene.amountColor);

  setGameVariable(
    "--game-sidebar-animation-duration",
    `${game.animations.sidebarDuration}ms`,
  );

  setGameVariable(
    "--game-question-animation-duration",
    `${game.animations.questionDuration}ms`,
  );

  setGameVariable(
    "--game-answer-animation-duration",
    `${game.animations.answerDuration}ms`,
  );

  setGameVariable(
    "--game-end-animation-duration",
    `${game.animations.endSceneDuration}ms`,
  );

  root.classList.toggle(
    "game-animations-disabled",
    game.animations.enabled !== true,
  );

  if (app) {
    app.dataset.gamePreset = game.preset || "custom";
  }

  return game;
}

function setGameVariable(name, value) {
  if (value === undefined || value === null) {
    return;
  }

  document.documentElement.style.setProperty(name, String(value));
}

function deepMergeGameDesign(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }

  Object.keys(source).forEach((key) => {
    const value = source[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (
        !target[key] ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        target[key] = {};
      }

      deepMergeGameDesign(target[key], value);
    } else {
      target[key] = value;
    }
  });

  return target;
}

window.MillionaireGameDesign = {
  defaults: DEFAULT_GAME_DESIGN,
  apply: applyGameDesign,
};
