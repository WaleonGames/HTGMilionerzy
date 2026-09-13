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
    order:4,
    format:"semver"
  },

  b:{
    id:"beta",
    name:"Beta",
    order:3,
    format:"semver"
  },

  a:{
    id:"alpha",
    name:"Alfa",
    order:2,
    format:"semver"
  },

  p:{
    id:"prototype",
    name:"Prototyp",
    order:1,
    format:"number"
  }
};

/* =========================
   REQUEST
========================= */

async function githubRequest(
  endpoint
){
  const url=
    `${GITHUB_API}${endpoint}`;

  const response=
    await fetch(
      url,
      {
        method:"GET",

        headers:{
          Accept:
            "application/vnd.github+json",

          "User-Agent":
            "HTGMilionerzy"
        },

        signal:
          AbortSignal.timeout(
            10000
          )
      }
    );

  if(!response.ok){
    let message=
      `GitHub API zwróciło kod ${response.status}.`;

    try{
      const data=
        await response.json();

      if(data?.message){
        message=
          data.message;
      }
    }catch{
      /*
       * Ignorujemy błąd parsowania
       * odpowiedzi błędu.
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
  const value=
    String(
      tag||""
    )
      .trim()
      .toLowerCase();

  const match=
    /^([rbap])-(.+)$/
      .exec(
        value
      );

  if(!match){
    return null;
  }

  const prefix=
    match[1];

  const version=
    match[2];

  const type=
    VERSION_TYPES[
      prefix
    ];

  if(!type){
    return null;
  }

  /*
   * Prototyp:
   *
   * p-1
   * p-2
   * p-15
   */

  if(
    type.format==="number"
  ){
    if(
      !/^\d+$/
        .test(
          version
        )
    ){
      return null;
    }

    return{
      tag:value,
      prefix,
      type:
        type.id,
      typeName:
        type.name,
      version:
        Number(
          version
        ),
      versionText:
        version,
      order:
        type.order
    };
  }

  /*
   * Release / Beta / Alfa:
   *
   * r-1.0.0
   * b-1.0.0
   * a-0.0.1
   */

  const semver=
    /^(\d+)\.(\d+)\.(\d+)$/
      .exec(
        version
      );

  if(!semver){
    return null;
  }

  return{
    tag:value,

    prefix,

    type:
      type.id,

    typeName:
      type.name,

    version:
      {
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

    versionText:
      version,

    order:
      type.order
  };
}

/* =========================
   METADATA
========================= */

function parseReleaseMetadata(
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
    .split(/\r?\n/)
    .map(
      line=>
        line.trim()
    )
    .filter(Boolean)
    .forEach(
      line=>{
        /*
         * Pozwalamy także na komentarze.
         */

        if(
          line.startsWith("#")
        ){
          return;
        }

        const separator=
          line.indexOf("=");

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

function parseMetadataNumber(
  value
){
  if(
    value===null||
    value===undefined||
    value===""
  ){
    return null;
  }

  const number=
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

/* =========================
   BOOLEAN
========================= */

function parseMetadataBoolean(
  value
){
  const normalized=
    String(
      value||""
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
   TECHNICAL INFO
========================= */

function buildTechnicalInfo(
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
        parseMetadataNumber(
          metadata.monitors_min
        ),

      recommended:
        parseMetadataNumber(
          metadata.monitors_recommended
        )
    },

    portable:
      parseMetadataBoolean(
        metadata.portable
      )
  };
}

/* =========================
   REMOVE META FROM BODY
========================= */

function removeMetadataBlock(
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
   RELEASE NORMALIZATION
========================= */

function normalizeRelease(
  release
){
  if(
    !release||
    typeof release!=="object"
  ){
    return null;
  }

  const version=
    parseVersionTag(
      release.tag_name
    );

  if(!version){
    return null;
  }

  const metadata=
    parseReleaseMetadata(
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

    body:
      removeMetadataBlock(
        release.body
      ),

    metadata,

    technical:
      buildTechnicalInfo(
        metadata
      ),

    assets:
      Array.isArray(
        release.assets
      )
        ? release.assets.map(
            asset=>({
              id:
                asset.id,

              name:
                asset.name,

              size:
                asset.size,

              contentType:
                asset.content_type,

              downloadCount:
                asset.download_count,

              downloadUrl:
                asset.browser_download_url
            })
          )
        : []
  };
}

/* =========================
   GET RELEASES
========================= */

async function getReleases(){
  const allReleases=[];

  let page=1;

  while(true){
    const releases=
      await githubRequest(
        `/releases?per_page=100&page=${page}`
      );

    if(
      !Array.isArray(
        releases
      )
    ){
      break;
    }

    allReleases.push(
      ...releases
    );

    if(
      releases.length<100
    ){
      break;
    }

    page++;
  }

  return allReleases
    .map(
      normalizeRelease
    )
    .filter(Boolean);
}

/* =========================
   GET LATEST
========================= */

async function getLatestRelease(){
  const releases=
    await getReleases();

  const published=
    releases
      .filter(
        release=>
          !release.draft
      )
      .sort(
        (a,b)=>{
          const dateA=
            new Date(
              a.publishedAt||
              a.createdAt||
              0
            )
              .getTime();

          const dateB=
            new Date(
              b.publishedAt||
              b.createdAt||
              0
            )
              .getTime();

          return(
            dateB-
            dateA
          );
        }
      );

  return(
    published[0]||
    null
  );
}

/* =========================
   GET RELEASE BY TAG
========================= */

async function getReleaseByTag(
  tag
){
  const normalizedTag=
    String(
      tag||""
    ).trim();

  if(!normalizedTag){
    return null;
  }

  try{
    const release=
      await githubRequest(
        `/releases/tags/${
          encodeURIComponent(
            normalizedTag
          )
        }`
      );

    return normalizeRelease(
      release
    );
  }catch(error){
    if(
      String(
        error?.message||
        ""
      ).includes("Not Found")
    ){
      return null;
    }

    throw error;
  }
}

/* =========================
   REPOSITORY INFO
========================= */

async function getRepositoryInfo(){
  const repository=
    await githubRequest(
      ""
    );

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
   PUBLIC API
========================= */

module.exports={
  VERSION_TYPES,

  parseVersionTag,
  parseReleaseMetadata,
  buildTechnicalInfo,
  normalizeRelease,

  getReleases,
  getLatestRelease,
  getReleaseByTag,
  getRepositoryInfo
};