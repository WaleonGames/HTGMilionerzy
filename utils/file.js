const fs=require("fs");
const path=require("path");

/* =========================
   HELPERS
========================= */

function cloneValue(value){
  if(value===undefined){
    return undefined;
  }

  if(value===null){
    return null;
  }

  return structuredClone(value);
}

function normalizePath(targetPath){
  if(
    typeof targetPath!=="string"||
    !targetPath.trim()
  ){
    return null;
  }

  return path.resolve(
    targetPath.trim()
  );
}

/* =========================
   EXISTS
========================= */

function pathExists(targetPath){
  const normalized=
    normalizePath(targetPath);

  if(!normalized){
    return false;
  }

  return fs.existsSync(
    normalized
  );
}

function fileExists(filePath){
  const normalized=
    normalizePath(filePath);

  if(
    !normalized||
    !fs.existsSync(normalized)
  ){
    return false;
  }

  try{
    return fs.statSync(
      normalized
    ).isFile();
  }catch(error){
    return false;
  }
}

function directoryExists(dirPath){
  const normalized=
    normalizePath(dirPath);

  if(
    !normalized||
    !fs.existsSync(normalized)
  ){
    return false;
  }

  try{
    return fs.statSync(
      normalized
    ).isDirectory();
  }catch(error){
    return false;
  }
}

/* =========================
   DIRECTORY
========================= */

function ensureDirectory(dirPath){
  const normalized=
    normalizePath(dirPath);

  if(!normalized){
    throw new Error(
      "Nieprawidłowa ścieżka katalogu."
    );
  }

  if(
    fs.existsSync(normalized)
  ){
    if(
      !fs.statSync(
        normalized
      ).isDirectory()
    ){
      throw new Error(
        `Ścieżka nie jest katalogiem: ${normalized}`
      );
    }

    return normalized;
  }

  fs.mkdirSync(
    normalized,
    {
      recursive:true
    }
  );

  return normalized;
}

/* =========================
   ACCESS
========================= */

function canRead(targetPath){
  const normalized=
    normalizePath(targetPath);

  if(
    !normalized||
    !fs.existsSync(normalized)
  ){
    return false;
  }

  try{
    fs.accessSync(
      normalized,
      fs.constants.R_OK
    );

    return true;
  }catch(error){
    return false;
  }
}

function canWrite(targetPath){
  const normalized=
    normalizePath(targetPath);

  if(!normalized){
    return false;
  }

  let checkPath=
    normalized;

  if(
    !fs.existsSync(checkPath)
  ){
    checkPath=
      path.dirname(
        checkPath
      );
  }

  if(
    !fs.existsSync(checkPath)
  ){
    return false;
  }

  try{
    fs.accessSync(
      checkPath,
      fs.constants.W_OK
    );

    return true;
  }catch(error){
    return false;
  }
}

function canReadWrite(targetPath){
  return Boolean(
    canRead(targetPath)&&
    canWrite(targetPath)
  );
}

/* =========================
   READ TEXT
========================= */

function readText(
  filePath,
  defaultValue=""
){
  const normalized=
    normalizePath(filePath);

  if(
    !normalized||
    !fileExists(normalized)
  ){
    return defaultValue;
  }

  try{
    return fs.readFileSync(
      normalized,
      "utf8"
    );
  }catch(error){
    console.error(
      `Błąd odczytu pliku: ${normalized}`,
      error
    );

    return defaultValue;
  }
}

/* =========================
   WRITE TEXT
========================= */

function writeText(
  filePath,
  data=""
){
  const normalized=
    normalizePath(filePath);

  if(!normalized){
    throw new Error(
      "Nieprawidłowa ścieżka pliku."
    );
  }

  ensureDirectory(
    path.dirname(normalized)
  );

  fs.writeFileSync(
    normalized,
    String(data),
    "utf8"
  );

  return normalized;
}


/* =========================
   READ JSON
========================= */

function readJson(
  filePath,
  defaultValue=null
){
  const normalized=
    normalizePath(filePath);

  if(
    !normalized||
    !fileExists(normalized)
  ){
    return cloneValue(
      defaultValue
    );
  }

  try{
    const raw=
      fs.readFileSync(
        normalized,
        "utf8"
      );

    if(!raw.trim()){
      return cloneValue(
        defaultValue
      );
    }

    return JSON.parse(
      raw
    );
  }catch(error){
    console.error(
      `Błąd odczytu pliku JSON: ${normalized}`,
      error
    );

    return cloneValue(
      defaultValue
    );
  }
}

/* =========================
   READ JSON STRICT
========================= */

function readJsonStrict(filePath){
  const normalized=
    normalizePath(filePath);

  if(
    !normalized||
    !fileExists(normalized)
  ){
    throw new Error(
      `Nie znaleziono pliku JSON: ${normalized||filePath}`
    );
  }

  const raw=
    fs.readFileSync(
      normalized,
      "utf8"
    );

  if(!raw.trim()){
    throw new Error(
      `Plik JSON jest pusty: ${normalized}`
    );
  }

  return JSON.parse(
    raw
  );
}

/* =========================
   WRITE JSON
========================= */

function writeJson(
  filePath,
  data
){
  const normalized=
    normalizePath(filePath);

  if(!normalized){
    throw new Error(
      "Nieprawidłowa ścieżka pliku JSON."
    );
  }

  ensureDirectory(
    path.dirname(normalized)
  );

  fs.writeFileSync(
    normalized,
    JSON.stringify(
      data,
      null,
      2
    ),
    "utf8"
  );

  return data;
}

/* =========================
   UPDATE JSON
========================= */

function updateJson(
  filePath,
  defaultValue,
  callback
){
  if(
    typeof callback!=="function"
  ){
    throw new TypeError(
      "callback musi być funkcją."
    );
  }

  const data=
    readJson(
      filePath,
      defaultValue
    );

  const updated=
    callback(data);

  writeJson(
    filePath,
    updated
  );

  return updated;
}

/* =========================
   ENSURE FILE
========================= */

function ensureFile(
  filePath,
  defaultValue
){
  const normalized=
    normalizePath(filePath);

  if(!normalized){
    throw new Error(
      "Nieprawidłowa ścieżka pliku."
    );
  }

  ensureDirectory(
    path.dirname(normalized)
  );

  if(
    fileExists(normalized)
  ){
    return normalized;
  }

  writeJson(
    normalized,
    defaultValue
  );

  return normalized;
}

/* =========================
   COPY
========================= */

function copyFile(
  sourcePath,
  destinationPath,
  {
    overwrite=true
  }={}
){
  const source=
    normalizePath(sourcePath);

  const destination=
    normalizePath(destinationPath);

  if(
    !source||
    !fileExists(source)
  ){
    throw new Error(
      "Nie znaleziono pliku źródłowego."
    );
  }

  if(!destination){
    throw new Error(
      "Nieprawidłowa ścieżka docelowa."
    );
  }

  if(
    fileExists(destination)&&
    !overwrite
  ){
    return false;
  }

  ensureDirectory(
    path.dirname(destination)
  );

  fs.copyFileSync(
    source,
    destination
  );

  return true;
}

function copyDirectory(
  sourcePath,
  destinationPath,
  {
    overwrite=true
  }={}
){
  const source=
    normalizePath(sourcePath);

  const destination=
    normalizePath(destinationPath);

  if(
    !source||
    !directoryExists(source)
  ){
    throw new Error(
      "Nie znaleziono katalogu źródłowego."
    );
  }

  if(!destination){
    throw new Error(
      "Nieprawidłowa ścieżka docelowa."
    );
  }

  fs.cpSync(
    source,
    destination,
    {
      recursive:true,
      force:overwrite,
      errorOnExist:!overwrite
    }
  );

  return true;
}

/* =========================
   MOVE
========================= */

function movePath(
  sourcePath,
  destinationPath,
  {
    overwrite=false
  }={}
){
  const source=
    normalizePath(sourcePath);

  const destination=
    normalizePath(destinationPath);

  if(
    !source||
    !pathExists(source)
  ){
    throw new Error(
      "Nie znaleziono ścieżki źródłowej."
    );
  }

  if(!destination){
    throw new Error(
      "Nieprawidłowa ścieżka docelowa."
    );
  }

  if(
    pathExists(destination)
  ){
    if(!overwrite){
      return false;
    }

    deletePath(
      destination
    );
  }

  ensureDirectory(
    path.dirname(destination)
  );

  try{
    fs.renameSync(
      source,
      destination
    );
  }catch(error){
    if(
      error?.code!=="EXDEV"
    ){
      throw error;
    }

    const stats=
      fs.statSync(source);

    if(stats.isDirectory()){
      copyDirectory(
        source,
        destination,
        {
          overwrite:true
        }
      );
    }else{
      copyFile(
        source,
        destination,
        {
          overwrite:true
        }
      );
    }

    deletePath(
      source
    );
  }

  return true;
}

/* =========================
   DELETE
========================= */

function deleteFile(filePath){
  const normalized=
    normalizePath(filePath);

  if(
    !normalized||
    !fileExists(normalized)
  ){
    return false;
  }

  fs.unlinkSync(
    normalized
  );

  return true;
}

function deleteDirectory(
  dirPath,
  {
    recursive=false
  }={}
){
  const normalized=
    normalizePath(dirPath);

  if(
    !normalized||
    !directoryExists(normalized)
  ){
    return false;
  }

  if(recursive){
    fs.rmSync(
      normalized,
      {
        recursive:true,
        force:true
      }
    );
  }else{
    fs.rmdirSync(
      normalized
    );
  }

  return true;
}

function deletePath(targetPath){
  const normalized=
    normalizePath(targetPath);

  if(
    !normalized||
    !pathExists(normalized)
  ){
    return false;
  }

  const stats=
    fs.statSync(
      normalized
    );

  if(stats.isDirectory()){
    fs.rmSync(
      normalized,
      {
        recursive:true,
        force:true
      }
    );
  }else{
    fs.unlinkSync(
      normalized
    );
  }

  return true;
}

/* =========================
   FILE INFO
========================= */

function getPathInfo(targetPath){
  const normalized=
    normalizePath(targetPath);

  if(!normalized){
    return{
      exists:false,
      path:null
    };
  }

  if(
    !fs.existsSync(normalized)
  ){
    return{
      exists:false,
      path:normalized
    };
  }

  const stats=
    fs.statSync(
      normalized
    );

  return{
    exists:true,
    path:normalized,
    name:
      path.basename(normalized),
    directory:
      path.dirname(normalized),
    isFile:
      stats.isFile(),
    isDirectory:
      stats.isDirectory(),
    size:
      stats.size,
    createdAt:
      stats.birthtime,
    modifiedAt:
      stats.mtime,
    readable:
      canRead(normalized),
    writable:
      canWrite(normalized)
  };
}

/* =========================
   EXPORTS
========================= */

module.exports={
  normalizePath,

  pathExists,
  fileExists,
  directoryExists,

  ensureDirectory,
  ensureFile,

  canRead,
  canWrite,
  canReadWrite,

  readText,
  writeText,

  readJson,
  readJsonStrict,
  writeJson,
  updateJson,

  copyFile,
  copyDirectory,
  movePath,

  deleteFile,
  deleteDirectory,
  deletePath,

  getPathInfo
};
