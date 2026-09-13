(()=>{
  /* =========================
     CONFIG
  ========================= */

  const GITHUB_OWNER=
    "WaleonGames";

  const GITHUB_REPOSITORY=
    "HTGMilionerzy";

  const GITHUB_API=
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}`;

  /* =========================
     VERSION TYPES
  ========================= */

  const VERSION_TYPES={
    r:{
      id:"release",
      name:"Release",
      format:"semver",
      order:4
    },

    b:{
      id:"beta",
      name:"Beta",
      format:"semver",
      order:3
    },

    a:{
      id:"alpha",
      name:"Alfa",
      format:"semver",
      order:2
    },

    p:{
      id:"prototype",
      name:"Prototyp",
      format:"number",
      order:1
    }
  };

  /* =========================
     REQUEST
  ========================= */

  async function githubRequest(
    endpoint=""
  ){
    const response=
      await fetch(
        `${GITHUB_API}${endpoint}`,
        {
          method:"GET",

          headers:{
            Accept:
              "application/vnd.github+json"
          }
        }
      );

    if(!response.ok){
      let message=
        `GitHub API: ${response.status}`;

      try{
        const data=
          await response.json();

        if(data?.message){
          message=
            data.message;
        }
      }catch{
        /*
         * Odpowiedź nie musi
         * zawierać JSON.
         */
      }

      throw new Error(
        message
      );
    }

    return response.json();
  }

  /* =========================
     VERSION TAG
  ========================= */

  function parseVersionTag(
    tag
  ){
    const originalTag=
      String(
        tag||""
      ).trim();

    const match=
      /^([rbap])-(.+)$/i.exec(
        originalTag
      );

    if(!match){
      return null;
    }

    const prefix=
      match[1]
        .toLowerCase();

    const versionText=
      match[2];

    const type=
      VERSION_TYPES[
        prefix
      ];

    if(!type){
      return null;
    }

    /* =========================
       PROTOTYPE
    ========================= */

    if(
      type.format===
      "number"
    ){
      if(
        !/^[1-9]\d*$/.test(
          versionText
        )
      ){
        return null;
      }

      return{
        tag:
          originalTag,

        prefix,

        type:
          type.id,

        typeName:
          type.name,

        version:
          Number(
            versionText
          ),

        versionText,

        order:
          type.order
      };
    }

    /* =========================
       SEMVER
    ========================= */

    const semver=
      /^(\d+)\.(\d+)\.(\d+)$/
        .exec(
          versionText
        );

    if(!semver){
      return null;
    }

    return{
      tag:
        originalTag,

      prefix,

      type:
        type.id,

      typeName:
        type.name,

      version:{
        major:
          Number(
            semver[1]
          ),

        minor:
          Number(
            semver[2]
          ),

        patch:
          Number(
            semver[3]
          )
      },

      versionText,

      order:
        type.order
    };
  }

  /* =========================
     METADATA
  ========================= */

  function parseMetadata(
    body
  ){
    const text=
      String(
        body||""
      );

    const match=
      /```htg-meta\s*([\s\S]*?)```/i
        .exec(
          text
        );

    if(!match){
      return{};
    }

    const metadata={};

    match[1]
      .split(
        /\r?\n/
      )
      .map(
        line=>
          line.trim()
      )
      .filter(Boolean)
      .forEach(
        line=>{
          /*
           * Komentarze wewnątrz
           * metadanych.
           */

          if(
            line.startsWith(
              "#"
            )
          ){
            return;
          }

          const separator=
            line.indexOf(
              "="
            );

          if(separator===-1){
            return;
          }

          const key=
            line
              .slice(
                0,
                separator
              )
              .trim();

          const value=
            line
              .slice(
                separator+1
              )
              .trim();

          if(!key){
            return;
          }

          metadata[key]=
            value;
        }
      );

    return metadata;
  }

  /* =========================
     REMOVE METADATA
  ========================= */

  function removeMetadata(
    body
  ){
    return String(
      body||""
    )
      .replace(
        /```htg-meta\s*[\s\S]*?```/gi,
        ""
      )
      .trim();
  }

  /* =========================
     SYSTEMS
  ========================= */

  function parseSystems(
    value
  ){
    return String(
      value||""
    )
      .split("|")
      .map(
        system=>
          system.trim()
      )
      .filter(Boolean);
  }

  /* =========================
     NUMBER
  ========================= */

  function parseNumber(
    value
  ){
    if(
      value===undefined||
      value===null||
      value===""
    ){
      return null;
    }

    const number=
      Number(value);

    if(
      !Number.isFinite(
        number
      )
    ){
      return null;
    }

    return number;
  }

  /* =========================
     BOOLEAN
  ========================= */

  function parseBoolean(
    value
  ){
    const normalized=
      String(
        value??""
      )
        .trim()
        .toLowerCase();

    if(
      [
        "true",
        "1",
        "yes",
        "tak"
      ].includes(
        normalized
      )
    ){
      return true;
    }

    if(
      [
        "false",
        "0",
        "no",
        "nie"
      ].includes(
        normalized
      )
    ){
      return false;
    }

    return null;
  }

  /* =========================
     TECHNICAL DATA
  ========================= */

  function parseTechnicalData(
    metadata={}
  ){
    return{
      status:
        metadata.status||
        null,

      systems:
        parseSystems(
          metadata.systems
        ),

      node:
        metadata.node||
        null,

      architecture:
        metadata.architecture||
        null,

      resolution:{
        minimum:
          metadata.resolution_min||
          null,

        recommended:
          metadata.resolution_recommended||
          null
      },

      monitors:{
        minimum:
          parseNumber(
            metadata.monitors_min
          ),

        recommended:
          parseNumber(
            metadata.monitors_recommended
          )
      },

      portable:
        parseBoolean(
          metadata.portable
        )
    };
  }

  /* =========================
     ASSETS
  ========================= */

  function normalizeAssets(
    assets
  ){
    if(
      !Array.isArray(
        assets
      )
    ){
      return[];
    }

    return assets.map(
      asset=>({
        id:
          asset.id,

        name:
          asset.name,

        size:
          asset.size,

        contentType:
          asset.content_type,

        downloads:
          asset.download_count,

        url:
          asset.browser_download_url
      })
    );
  }

  /* =========================
     NORMALIZE RELEASE
  ========================= */

  function normalizeRelease(
    release
  ){
    if(
      !release||
      typeof release!==
        "object"
    ){
      return null;
    }

    const version=
      parseVersionTag(
        release.tag_name
      );

    /*
     * Release bez naszego
     * standardu r/b/a/p
     * pomijamy.
     */

    if(!version){
      return null;
    }

    const metadata=
      parseMetadata(
        release.body
      );

    return{
      id:
        release.id,

      tag:
        release.tag_name,

      name:
        release.name||
        `${version.typeName} ${version.versionText}`,

      type:
        version.type,

      typeName:
        version.typeName,

      prefix:
        version.prefix,

      version:
        version.version,

      versionText:
        version.versionText,

      versionOrder:
        version.order,

      description:
        removeMetadata(
          release.body
        ),

      metadata,

      technical:
        parseTechnicalData(
          metadata
        ),

      draft:
        release.draft===true,

      prerelease:
        release.prerelease===true,

      createdAt:
        release.created_at||
        null,

      publishedAt:
        release.published_at||
        null,

      updatedAt:
        release.updated_at||
        null,

      url:
        release.html_url||
        null,

      assets:
        normalizeAssets(
          release.assets
        )
    };
  }

  /* =========================
     RELEASE DATE
  ========================= */

  function getReleaseTime(
    release
  ){
    const value=
      release?.publishedAt||
      release?.createdAt||
      "";

    const time=
      new Date(
        value
      ).getTime();

    return Number.isFinite(
      time
    )
      ? time
      : 0;
  }

  /* =========================
     GET RELEASES
  ========================= */

  async function getReleases(){
    const releases=[];

    let page=1;

    while(true){
      const data=
        await githubRequest(
          `/releases?per_page=100&page=${page}`
        );

      if(
        !Array.isArray(
          data
        )
      ){
        break;
      }

      releases.push(
        ...data
      );

      if(
        data.length<100
      ){
        break;
      }

      page++;
    }

    return releases
      .map(
        normalizeRelease
      )
      .filter(Boolean)
      .filter(
        release=>
          !release.draft
      )
      .sort(
        (a,b)=>
          getReleaseTime(b)-
          getReleaseTime(a)
      );
  }

  /* =========================
     LATEST RELEASE
  ========================= */

  async function getLatest(){
    const releases=
      await getReleases();

    return(
      releases[0]||
      null
    );
  }

  /* =========================
     GET BY TAG
  ========================= */

  async function getByTag(
    tag
  ){
    const value=
      String(
        tag||""
      ).trim();

    if(!value){
      return null;
    }

    try{
      const release=
        await githubRequest(
          `/releases/tags/${
            encodeURIComponent(
              value
            )
          }`
        );

      return normalizeRelease(
        release
      );
    }catch(error){
      console.error(
        `Nie udało się pobrać wersji "${value}":`,
        error
      );

      return null;
    }
  }

  /* =========================
     REPOSITORY
  ========================= */

  async function getRepository(){
    const repository=
      await githubRequest();

    return{
      id:
        repository.id,

      name:
        repository.name,

      fullName:
        repository.full_name,

      description:
        repository.description||
        "",

      defaultBranch:
        repository.default_branch,

      visibility:
        repository.visibility,

      archived:
        repository.archived===true,

      url:
        repository.html_url,

      createdAt:
        repository.created_at,

      updatedAt:
        repository.updated_at,

      pushedAt:
        repository.pushed_at
    };
  }

  /* =========================
     FORMAT VERSION
  ========================= */

  function formatVersion(
    release
  ){
    if(!release){
      return "";
    }

    return(
      `${release.typeName} ${release.versionText}`
    );
  }

  /* =========================
     FORMAT DATE
  ========================= */

  function formatDate(
    value
  ){
    if(!value){
      return "Brak danych";
    }

    const date=
      new Date(
        value
      );

    if(
      Number.isNaN(
        date.getTime()
      )
    ){
      return "Brak danych";
    }

    return date.toLocaleDateString(
      "pl-PL",
      {
        day:"2-digit",
        month:"2-digit",
        year:"numeric"
      }
    );
  }

  /* =========================
     FORMAT SIZE
  ========================= */

  function formatFileSize(
    bytes
  ){
    const size=
      Number(bytes);

    if(
      !Number.isFinite(size)||
      size<=0
    ){
      return "0 B";
    }

    const units=[
      "B",
      "KB",
      "MB",
      "GB"
    ];

    let value=size;
    let unit=0;

    while(
      value>=1024&&
      unit<
      units.length-1
    ){
      value/=1024;
      unit++;
    }

    return(
      `${
        value>=10||
        unit===0
          ? value.toFixed(0)
          : value.toFixed(1)
      } ${units[unit]}`
    );
  }

  /* =========================
     PUBLIC API
  ========================= */

  window.MillionaireVersions={
    getAll:
      getReleases,

    getLatest,

    getByTag,

    getRepository,

    parseTag:
      parseVersionTag,

    parseMetadata,

    parseTechnicalData,

    formatVersion,

    formatDate,

    formatFileSize,

    getTypes:()=>{
      return{
        ...VERSION_TYPES
      };
    }
  };
})();