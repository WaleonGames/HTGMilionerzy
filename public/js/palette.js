(()=>{
  const paletteModal=
    document.getElementById(
      "colorPaletteModal"
    );

  const palette=
    document.getElementById(
      "colorPalette"
    );

  const shadePalette=
    document.getElementById(
      "colorShadePalette"
    );

  const customColorButton=
    document.getElementById(
      "customColorButton"
    );

  const customColorInput=
    document.getElementById(
      "customColorInput"
    );

  if(
    !paletteModal||
    !palette||
    !shadePalette
  ){
    console.error(
      "[Palette] Nie znaleziono wymaganych elementów HTML."
    );

    return;
  }

  const HEX_REGEX=
    /^#[0-9a-f]{6}$/i;

  let colors=[];
  let groups=[];
  let activeColorInput=null;

  /* =========================
     HELPERS
  ========================= */

  function normalizeHex(value){
    if(
      typeof value!=="string"
    ){
      return null;
    }

    const color=
      value.trim();

    if(
      !HEX_REGEX.test(color)
    ){
      return null;
    }

    return color.toUpperCase();
  }

  function hexToRgb(hex){
    const value=
      normalizeHex(hex);

    if(!value){
      return null;
    }

    return{
      r:parseInt(
        value.slice(1,3),
        16
      ),

      g:parseInt(
        value.slice(3,5),
        16
      ),

      b:parseInt(
        value.slice(5,7),
        16
      )
    };
  }

  function rgbToHsl(
    r,
    g,
    b
  ){
    r/=255;
    g/=255;
    b/=255;

    const max=
      Math.max(
        r,
        g,
        b
      );

    const min=
      Math.min(
        r,
        g,
        b
      );

    let h=0;
    let s=0;

    const l=
      (max+min)/2;

    const difference=
      max-min;

    if(difference!==0){
      s=
        l>.5
          ?difference/(2-max-min)
          :difference/(max+min);

      switch(max){
        case r:
          h=
            (g-b)/difference+
            (
              g<b
                ?6
                :0
            );

          break;

        case g:
          h=
            (b-r)/difference+2;

          break;

        case b:
          h=
            (r-g)/difference+4;

          break;
      }

      h*=60;
    }

    return{
      h,
      s:s*100,
      l:l*100
    };
  }

  function hexToHsl(hex){
    const rgb=
      hexToRgb(hex);

    if(!rgb){
      return null;
    }

    return rgbToHsl(
      rgb.r,
      rgb.g,
      rgb.b
    );
  }

  /* =========================
     COLLECT COLORS
  ========================= */

  function collectColors(
    value,
    result=[]
  ){
    if(
      typeof value==="string"
    ){
      const color=
        normalizeHex(value);

      if(
        color&&
        !result.includes(color)
      ){
        result.push(color);
      }

      return result;
    }

    if(Array.isArray(value)){
      value.forEach(item=>{
        collectColors(
          item,
          result
        );
      });

      return result;
    }

    if(
      value&&
      typeof value==="object"
    ){
      Object.values(
        value
      ).forEach(item=>{
        collectColors(
          item,
          result
        );
      });
    }

    return result;
  }

  /* =========================
     COLOR GROUPS
  ========================= */

  function getColorGroup(hex){
    const hsl=
      hexToHsl(hex);

    if(!hsl){
      return "other";
    }

    const{
      h,
      s,
      l
    }=hsl;

    if(s<12){
      if(l<18){
        return "black";
      }

      if(l>88){
        return "white";
      }

      return "gray";
    }

    if(
      h>=345||
      h<15
    ){
      return "red";
    }

    if(h<40){
      return "orange";
    }

    if(h<65){
      return "yellow";
    }

    if(h<165){
      return "green";
    }

    if(h<195){
      return "cyan";
    }

    if(h<255){
      return "blue";
    }

    if(h<290){
      return "purple";
    }

    if(h<345){
      return "pink";
    }

    return "other";
  }

  function groupColors(list){
    const map=
      new Map();

    list.forEach(color=>{
      const group=
        getColorGroup(color);

      if(
        !map.has(group)
      ){
        map.set(
          group,
          []
        );
      }

      map
        .get(group)
        .push(color);
    });

    return Array.from(
      map.entries()
    ).map(
      ([name,items])=>({
        name,
        colors:items
      })
    );
  }

  /* =========================
     SORT COLORS
  ========================= */

  function sortColors(list){
    return[
      ...list
    ].sort(
      (a,b)=>{
        const first=
          hexToHsl(a);

        const second=
          hexToHsl(b);

        if(
          !first||
          !second
        ){
          return 0;
        }

        if(
          Math.abs(
            first.h-
            second.h
          )>5
        ){
          return(
            first.h-
            second.h
          );
        }

        return(
          first.l-
          second.l
        );
      }
    );
  }

  /* =========================
     COLOR BUTTON
  ========================= */

  function createColorButton(color){
    const button=
      document.createElement(
        "button"
      );

    button.type="button";
    button.className="palette-color";

    button.style.setProperty(
      "--palette-color",
      color
    );

    button.dataset.color=
      color;

    button.title=
      color;

    button.setAttribute(
      "aria-label",
      `Wybierz kolor ${color}`
    );

    return button;
  }

  /* =========================
     PALETTE CENTER
  ========================= */

  function createPaletteCenter(){
    const center=
      document.createElement(
        "div"
      );

    center.className=
      "palette-center";

    const title=
      document.createElement(
        "strong"
      );

    title.textContent=
      activeColorInput?.value
        ?.toUpperCase()||
      "Kolor";

    const description=
      document.createElement(
        "span"
      );

    description.textContent=
      "Wybierz kolor z palety";

    center.append(
      title,
      description
    );

    palette.appendChild(
      center
    );
  }

  /* =========================
     MAIN PALETTE
  ========================= */

  function renderPalette(){
    console.group(
      "[Palette] Renderowanie"
    );

    palette.innerHTML="";

    const visibleGroups=
      groups.slice(
        0,
        12
      );

    const count=
      visibleGroups.length;

    console.log(
      "[Palette] Grupy:",
      visibleGroups
    );

    console.log(
      "[Palette] Liczba grup:",
      count
    );

    if(!count){
      createPaletteCenter();

      console.warn(
        "[Palette] Brak kolorów."
      );

      console.groupEnd();

      return;
    }

    visibleGroups.forEach(
      (group,index)=>{
        if(
          !group.colors.length
        ){
          return;
        }

        const representative=
          group.colors[0];

        const angle=
          index*
          (
            360/count
          );

        const radians=
          (
            angle-90
          )*
          Math.PI/
          180;

        const radius=42;

        const x=
          50+
          Math.cos(
            radians
          )*
          radius;

        const y=
          50+
          Math.sin(
            radians
          )*
          radius;

        const button=
          createColorButton(
            representative
          );

        button.style.left=
          `${x}%`;

        button.style.top=
          `${y}%`;

        button.dataset.group=
          group.name;

        button.dataset.count=
          String(
            group.colors.length
          );

        if(
          group.colors.length>1
        ){
          button.classList.add(
            "has-shades"
          );
        }

        console.log(
          "[Palette] Kolor:",
          {
            group:group.name,
            color:representative,
            colors:group.colors,
            angle,
            x,
            y
          }
        );

        button.addEventListener(
          "click",
          ()=>{
            if(
              group.colors.length===1
            ){
              selectColor(
                representative
              );

              return;
            }

            showShades(
              group
            );
          }
        );

        palette.appendChild(
          button
        );
      }
    );

    createPaletteCenter();

    console.groupEnd();
  }

  /* =========================
     SHADE PALETTE
  ========================= */

  function showShades(group){
    console.log(
      "[Palette] Odcienie:",
      group
    );

    shadePalette.innerHTML="";

    const sorted=
      sortColors(
        group.colors
      );

    sorted.forEach(color=>{
      const button=
        document.createElement(
          "button"
        );

      button.type="button";
      button.className="palette-shade";

      button.style.setProperty(
        "--palette-color",
        color
      );

      button.dataset.color=
        color;

      button.title=
        color;

      button.setAttribute(
        "aria-label",
        `Wybierz kolor ${color}`
      );

      button.addEventListener(
        "click",
        ()=>{
          selectColor(
            color
          );
        }
      );

      shadePalette.appendChild(
        button
      );
    });

    shadePalette.hidden=false;

    palette.dataset.activeGroup=
      group.name;
  }

  function hideShades(){
    shadePalette.hidden=true;

    shadePalette.innerHTML="";

    delete palette.dataset.activeGroup;
  }

  /* =========================
     OPEN PALETTE
  ========================= */

  function openPalette(input){
    if(!input){
      return;
    }

    console.log(
      "[Palette] Otwieranie:",
      input.id,
      input.value
    );

    activeColorInput=
      input;

    hideShades();

    paletteModal.hidden=false;

    document.body.style.overflow=
      "hidden";

    paletteModal.dataset.input=
      input.id||"";

    renderPalette();
  }

  /* =========================
     CLOSE PALETTE
  ========================= */

  function closePalette(){
    console.log(
      "[Palette] Zamknięcie"
    );

    paletteModal.hidden=true;

    document.body.style.overflow="";

    delete paletteModal.dataset.input;

    hideShades();

    activeColorInput=null;
  }

  /* =========================
     SELECT COLOR
  ========================= */

  function selectColor(color){
    const normalized=
      normalizeHex(color);

    if(!normalized){
      console.warn(
        "[Palette] Nieprawidłowy kolor:",
        color
      );

      return;
    }

    const input=
      activeColorInput;

    console.log(
      "[Palette] Zatwierdzono kolor:",
      normalized
    );

    if(input){
      input.value=
        normalized.toLowerCase();

      input.dispatchEvent(
        new Event(
          "input",
          {
            bubbles:true
          }
        )
      );

      input.dispatchEvent(
        new Event(
          "change",
          {
            bubbles:true
          }
        )
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "palette:select",
        {
          detail:{
            color:normalized,
            input
          }
        }
      )
    );

    closePalette();
  }

  /* =========================
     SETTINGS COLOR INPUTS
  ========================= */

  function initializeColorInputs(){
    const inputs=
      document.querySelectorAll(
        'input[type="color"]:not(#customColorInput)'
      );

    console.log(
      "[Palette] Inputy kolorów:",
      inputs.length
    );

    inputs.forEach(input=>{
      if(
        input.dataset.paletteInitialized===
        "true"
      ){
        return;
      }

      input.dataset.paletteInitialized=
        "true";

      input.addEventListener(
        "click",
        event=>{
          event.preventDefault();

          openPalette(
            input
          );
        }
      );

      input.addEventListener(
        "keydown",
        event=>{
          if(
            event.key!=="Enter"&&
            event.key!==" "
          ){
            return;
          }

          event.preventDefault();

          openPalette(
            input
          );
        }
      );
    });
  }

  /* =========================
     CUSTOM COLOR
  ========================= */

  customColorButton?.addEventListener(
    "click",
    ()=>{
      if(!customColorInput){
        console.warn(
          "[Palette] Brak customColorInput."
        );

        return;
      }

      console.log(
        "[Palette] Otwieranie niestandardowego koloru"
      );

      /*
        Ustawiamy aktualny kolor jako
        początkowy kolor systemowego pickera.
      */

      if(activeColorInput?.value){
        customColorInput.value=
          activeColorInput.value;
      }

      customColorInput.click();
    }
  );

  /*
    Używamy CHANGE, a nie INPUT.

    INPUT odpalałby się podczas każdej
    zmiany koloru w systemowym pickerze.

    CHANGE odpali się dopiero po
    zatwierdzeniu wyboru.
  */

  customColorInput?.addEventListener(
    "change",
    ()=>{
      console.log(
        "[Palette] Zatwierdzono niestandardowy kolor:",
        customColorInput.value
      );

      selectColor(
        customColorInput.value
      );
    }
  );

  /* =========================
     MODAL EVENTS
  ========================= */

  paletteModal.addEventListener(
    "click",
    event=>{
      if(
        event.target!==
        paletteModal
      ){
        return;
      }

      closePalette();
    }
  );

  document.addEventListener(
    "keydown",
    event=>{
      if(
        event.key!=="Escape"||
        paletteModal.hidden
      ){
        return;
      }

      event.preventDefault();

      closePalette();
    }
  );

  /* =========================
     LOAD
  ========================= */

  async function loadPalette(){
    console.group(
      "[Palette] Ładowanie"
    );

    palette.innerHTML="";

    hideShades();

    try{
      const api=
        window.millionaireAPI;

      if(
        !api?.settings?.get
      ){
        console.warn(
          "[Palette] Brak millionaireAPI.settings.get"
        );

        console.groupEnd();

        return;
      }

      const settings=
        await api.settings.get();

      console.log(
        "[Palette] Settings:",
        settings
      );

      colors=
        collectColors(
          settings
        );

      console.log(
        "[Palette] Kolory:",
        colors
      );

      groups=
        groupColors(
          colors
        );

      console.log(
        "[Palette] Grupy:",
        groups
      );

      renderPalette();
    }catch(error){
      console.error(
        "[Palette] Błąd:",
        error
      );
    }

    console.groupEnd();
  }

  /* =========================
     PUBLIC API
  ========================= */

  window.MillionairePalette={
    open(input){
      openPalette(
        input
      );
    },

    close(){
      closePalette();
    },

    reload(){
      return loadPalette();
    },

    refreshInputs(){
      initializeColorInputs();
    },

    getColors(){
      return[
        ...colors
      ];
    },

    getGroups(){
      return groups.map(
        group=>({
          name:group.name,

          colors:[
            ...group.colors
          ]
        })
      );
    },

    select(color){
      selectColor(
        color
      );
    },

    closeShades(){
      hideShades();
    }
  };

  /* =========================
     INIT
  ========================= */

  console.log(
    "[Palette] Inicjalizacja"
  );

  initializeColorInputs();

  loadPalette();
})();