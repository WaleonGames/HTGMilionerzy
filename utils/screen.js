const {
  screen
}=require("electron");

/* =========================
   RESOLUTION PRESETS
========================= */

const RESOLUTION_PRESETS=[
  {
    width:1280,
    height:720,
    name:"HD",
    label:"HD (720p)"
  },

  {
    width:1366,
    height:768,
    name:"WXGA",
    label:"HD / WXGA"
  },

  {
    width:1600,
    height:900,
    name:"HD+",
    label:"HD+ (900p)"
  },

  {
    width:1920,
    height:1080,
    name:"Full HD",
    label:"Full HD (1080p)"
  },

  {
    width:2560,
    height:1080,
    name:"UW-FHD",
    label:"UltraWide Full HD"
  },

  {
    width:2560,
    height:1440,
    name:"QHD",
    label:"QHD (1440p)"
  },

  {
    width:3440,
    height:1440,
    name:"UWQHD",
    label:"UWQHD"
  },

  {
    width:3840,
    height:2160,
    name:"4K UHD",
    label:"4K UHD (2160p)"
  },

  {
    width:5120,
    height:2880,
    name:"5K",
    label:"5K"
  },

  {
    width:5120,
    height:1440,
    name:"DQHD",
    label:"Dual QHD"
  },

  {
    width:7680,
    height:4320,
    name:"8K UHD",
    label:"8K UHD (4320p)"
  }
];

/* =========================
   HELPERS
========================= */

function normalizeDimension(
  value
){
  const number=
    Number(value);

  if(
    !Number.isFinite(number)
  ){
    return 0;
  }

  return Math.round(
    number
  );
}

function getPixelSize(
  display
){
  const scaleFactor=
    Number(
      display?.scaleFactor
    )||1;

  const logicalWidth=
    normalizeDimension(
      display?.size?.width
    );

  const logicalHeight=
    normalizeDimension(
      display?.size?.height
    );

  return{
    width:
      normalizeDimension(
        logicalWidth*
        scaleFactor
      ),

    height:
      normalizeDimension(
        logicalHeight*
        scaleFactor
      )
  };
}

function getAspectRatio(
  width,
  height
){
  if(
    !width||
    !height
  ){
    return 0;
  }

  return width/height;
}

function formatResolution(
  width,
  height
){
  return(
    `${width} × ${height}`
  );
}

/* =========================
   RESOLUTION NAME
========================= */

function getResolutionName(
  width,
  height
){
  const exact=
    RESOLUTION_PRESETS.find(
      item=>
        item.width===width&&
        item.height===height
    );

  if(exact){
    return exact.label;
  }

  return "Niestandardowa";
}

/* =========================
   AVAILABLE RESOLUTIONS
========================= */

function getResolutionOptions(
  width,
  height
){
  const nativeWidth=
    normalizeDimension(
      width
    );

  const nativeHeight=
    normalizeDimension(
      height
    );

  if(
    !nativeWidth||
    !nativeHeight
  ){
    return[];
  }

  const nativeRatio=
    getAspectRatio(
      nativeWidth,
      nativeHeight
    );

  const resolutions=
    RESOLUTION_PRESETS
      .filter(item=>{
        if(
          item.width>
            nativeWidth||
          item.height>
            nativeHeight
        ){
          return false;
        }

        const ratio=
          getAspectRatio(
            item.width,
            item.height
          );

        const difference=
          Math.abs(
            ratio-nativeRatio
          );

        /*
         * Nie pokazujemy np.
         * 16:9 na bardzo szerokim
         * ekranie jako głównej listy,
         * jeśli proporcje są mocno inne.
         */

        return difference<0.15;
      })
      .map(item=>({
        width:item.width,
        height:item.height,

        value:
          `${item.width}x${item.height}`,

        name:item.name,
        label:
          `${item.label} — ${
            formatResolution(
              item.width,
              item.height
            )
          }`,

        native:
          item.width===
            nativeWidth&&
          item.height===
            nativeHeight
      }));

  const nativeValue=
    `${nativeWidth}x${nativeHeight}`;

  const nativeExists=
    resolutions.some(
      item=>
        item.value===
        nativeValue
    );

  if(!nativeExists){
    resolutions.push({
      width:nativeWidth,
      height:nativeHeight,

      value:nativeValue,

      name:
        getResolutionName(
          nativeWidth,
          nativeHeight
        ),

      label:
        `${
          getResolutionName(
            nativeWidth,
            nativeHeight
          )
        } — ${
          formatResolution(
            nativeWidth,
            nativeHeight
          )
        }`,

      native:true
    });
  }

  resolutions.sort(
    (a,b)=>
      (
        a.width*a.height
      )-
      (
        b.width*b.height
      )
  );

  return resolutions;
}

/* =========================
   SERIALIZE DISPLAY
========================= */

function serializeDisplay(
  display,
  index,
  primaryDisplay
){
  const logicalWidth=
    normalizeDimension(
      display?.size?.width
    );

  const logicalHeight=
    normalizeDimension(
      display?.size?.height
    );

  const pixelSize=
    getPixelSize(
      display
    );

  const isPrimary=
    display.id===
    primaryDisplay?.id;

  const name=
    String(
      display?.label||""
    ).trim()||
    `Monitor ${index+1}`;

  return{
    index,

    id:
      String(
        display.id
      ),

    name,

    label:
      `${name} — ${
        formatResolution(
          pixelSize.width,
          pixelSize.height
        )
      }${
        isPrimary
          ? " — główny"
          : ""
      }`,

    primary:isPrimary,

    internal:
      Boolean(
        display?.internal
      ),

    scaleFactor:
      Number(
        display?.scaleFactor
      )||1,

    rotation:
      Number(
        display?.rotation
      )||0,

    logicalSize:{
      width:
        logicalWidth,

      height:
        logicalHeight
    },

    pixelSize,

    bounds:{
      x:
        normalizeDimension(
          display?.bounds?.x
        ),

      y:
        normalizeDimension(
          display?.bounds?.y
        ),

      width:
        normalizeDimension(
          display?.bounds?.width
        ),

      height:
        normalizeDimension(
          display?.bounds?.height
        )
    },

    workArea:{
      x:
        normalizeDimension(
          display?.workArea?.x
        ),

      y:
        normalizeDimension(
          display?.workArea?.y
        ),

      width:
        normalizeDimension(
          display?.workArea?.width
        ),

      height:
        normalizeDimension(
          display?.workArea?.height
        )
    },

    resolution:{
      width:
        pixelSize.width,

      height:
        pixelSize.height,

      value:
        `${pixelSize.width}x${pixelSize.height}`,

      name:
        getResolutionName(
          pixelSize.width,
          pixelSize.height
        ),

      label:
        `${
          getResolutionName(
            pixelSize.width,
            pixelSize.height
          )
        } — ${
          formatResolution(
            pixelSize.width,
            pixelSize.height
          )
        }`
    },

    resolutions:
      getResolutionOptions(
        pixelSize.width,
        pixelSize.height
      )
  };
}

/* =========================
   GET DISPLAYS
========================= */

function getDisplays(){
  const displays=
    screen.getAllDisplays();

  const primaryDisplay=
    screen.getPrimaryDisplay();

  return displays.map(
    (display,index)=>
      serializeDisplay(
        display,
        index,
        primaryDisplay
      )
  );
}

/* =========================
   GET PRIMARY DISPLAY
========================= */

function getPrimaryDisplay(){
  const displays=
    getDisplays();

  return(
    displays.find(
      display=>
        display.primary
    )||
    displays[0]||
    null
  );
}

/* =========================
   GET DISPLAY
========================= */

function getDisplayById(
  id
){
  const target=
    String(id);

  return(
    getDisplays().find(
      display=>
        display.id===
        target
    )||
    null
  );
}

function getDisplayByIndex(
  index
){
  const target=
    Number(index);

  return(
    getDisplays().find(
      display=>
        display.index===
        target
    )||
    null
  );
}

/* =========================
   EXPORTS
========================= */

module.exports={
  RESOLUTION_PRESETS,

  getDisplays,
  getPrimaryDisplay,

  getDisplayById,
  getDisplayByIndex,

  getResolutionOptions,
  getResolutionName,

  formatResolution
};