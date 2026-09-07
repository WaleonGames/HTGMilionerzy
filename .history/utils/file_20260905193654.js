const fs=require("fs");
const path=require("path");

/* =========================
   DIRECTORY
========================= */

function ensureDirectory(dirPath){
  if(!fs.existsSync(dirPath)){
    fs.mkdirSync(
      dirPath,
      {
        recursive:true
      }
    );
  }
}

/* =========================
   FILE
========================= */

function ensureFile(filePath,defaultValue){
  const dirPath=path.dirname(filePath);

  ensureDirectory(dirPath);

  if(fs.existsSync(filePath)){
    return;
  }

  writeJson(
    filePath,
    defaultValue
  );
}

/* =========================
   READ JSON
========================= */

function readJson(filePath,defaultValue=null){
  try{
    if(!fs.existsSync(filePath)){
      return cloneValue(
        defaultValue
      );
    }

    const raw=fs.readFileSync(
      filePath,
      "utf8"
    );

    if(!raw.trim()){
      return cloneValue(
        defaultValue
      );
    }

    return JSON.parse(raw);
  }catch(error){
    console.error(
      `Błąd odczytu pliku JSON: ${filePath}`,
      error
    );

    return cloneValue(
      defaultValue
    );
  }
}

/* =========================
   WRITE JSON
========================= */

function writeJson(filePath,data){
  const dirPath=path.dirname(filePath);

  ensureDirectory(dirPath);

  fs.writeFileSync(
    filePath,
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
  const data=readJson(
    filePath,
    defaultValue
  );

  const updated=callback(data);

  writeJson(
    filePath,
    updated
  );

  return updated;
}

/* =========================
   EXISTS
========================= */

function fileExists(filePath){
  return fs.existsSync(filePath);
}

/* =========================
   DELETE
========================= */

function deleteFile(filePath){
  if(!fs.existsSync(filePath)){
    return false;
  }

  fs.unlinkSync(filePath);

  return true;
}

/* =========================
   CLONE
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

/* =========================
   EXPORTS
========================= */

module.exports={
  ensureDirectory,
  ensureFile,
  readJson,
  writeJson,
  updateJson,
  fileExists,
  deleteFile
};