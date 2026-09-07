document.addEventListener("DOMContentLoaded",async()=>{
  await initializeDesign();
});

async function initializeDesign(){
  const appearance=await loadAppearance();

  applyDesign(appearance);

  normalizeButtons();
  normalizeInputs();
  normalizeCards();
  normalizeModals();

  document.body.classList.add("design-loaded");
}

async function loadAppearance(){
  const defaults={
    theme:"light",
    accentColor:"#356df3"
  };

  try{
    if(
      !window.millionaireAPI?.settings?.get
    ){
      return defaults;
    }

    const settings=
      await window.millionaireAPI.settings.get();

    return{
      ...defaults,
      ...(settings?.appearance||{})
    };
  }catch(error){
    console.error(
      "Błąd odczytu ustawień wyglądu:",
      error
    );

    return defaults;
  }
}

function applyDesign(appearance={}){
  const theme=
    appearance.theme==="dark"
      ? "dark"
      : "light";

  const accentColor=
    normalizeColor(
      appearance.accentColor
    )||"#356df3";

  document.documentElement.dataset.design="custom";
  document.documentElement.dataset.theme=theme;

  document.documentElement.style.setProperty(
    "--design-primary",
    accentColor
  );

  document.documentElement.style.setProperty(
    "--design-primary-hover",
    darkenColor(
      accentColor,
      18
    )
  );

  document.documentElement.style.setProperty(
    "--design-primary-light",
    mixWithWhite(
      accentColor,
      .88
    )
  );
}

function normalizeButtons(){
  document.querySelectorAll(
    "button"
  ).forEach(button=>{
    button.classList.add(
      "design-button"
    );
  });
}

function normalizeInputs(){
  document.querySelectorAll(
    "input,select,textarea"
  ).forEach(input=>{
    input.classList.add(
      "design-input"
    );
  });
}

function normalizeCards(){
  document.querySelectorAll(
    ".card,.panel,.list-item,.action-card"
  ).forEach(card=>{
    card.classList.add(
      "design-surface"
    );
  });
}

function normalizeModals(){
  document.querySelectorAll(
    ".modal,.modal-content"
  ).forEach(modal=>{
    modal.classList.add(
      "design-modal"
    );
  });
}

function normalizeColor(value){
  const color=String(
    value||""
  ).trim();

  if(
    /^#[0-9a-fA-F]{6}$/.test(color)
  ){
    return color.toLowerCase();
  }

  return null;
}

function darkenColor(color,amount){
  const hex=color.replace("#","");

  const r=Math.max(
    0,
    parseInt(hex.slice(0,2),16)-amount
  );

  const g=Math.max(
    0,
    parseInt(hex.slice(2,4),16)-amount
  );

  const b=Math.max(
    0,
    parseInt(hex.slice(4,6),16)-amount
  );

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixWithWhite(color,amount){
  const hex=color.replace("#","");

  const r=parseInt(
    hex.slice(0,2),
    16
  );

  const g=parseInt(
    hex.slice(2,4),
    16
  );

  const b=parseInt(
    hex.slice(4,6),
    16
  );

  const newR=Math.round(
    r+(255-r)*amount
  );

  const newG=Math.round(
    g+(255-g)*amount
  );

  const newB=Math.round(
    b+(255-b)*amount
  );

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

function toHex(value){
  return value
    .toString(16)
    .padStart(2,"0");
}

window.millionaireDesign={
  apply:applyDesign
};