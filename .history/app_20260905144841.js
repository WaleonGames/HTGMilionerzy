const {app,BrowserWindow,ipcMain}=require("electron");
const path=require("path");
const fs=require("fs");

const questionsFile=path.join(__dirname,"data","quests.json");

function ensureQuestionsFile(){
  const dir=path.dirname(questionsFile);

  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir,{recursive:true});
  }

  if(!fs.existsSync(questionsFile)){
    fs.writeFileSync(questionsFile,"[]","utf8");
  }
}

function readQuestions(){
  ensureQuestionsFile();

  try{
    const raw=fs.readFileSync(questionsFile,"utf8");
    const data=JSON.parse(raw);

    return Array.isArray(data)?data:[];
  }catch(error){
    console.error("Błąd odczytu pytań:",error);
    return [];
  }
}

function writeQuestions(questions){
  ensureQuestionsFile();

  fs.writeFileSync(
    questionsFile,
    JSON.stringify(questions,null,2),
    "utf8"
  );
}

function createWindow(){
  const win=new BrowserWindow({
    width:1200,
    height:800,
    minWidth:800,
    minHeight:600,
    backgroundColor:"#080617",
    webPreferences:{
      preload:path.join(__dirname,"preload.js"),
      contextIsolation:true,
      nodeIntegration:false
    }
  });

  win.loadFile(
    path.join(__dirname,"views","index.html")
  );
}

ipcMain.handle("questions:get",()=>{
  return readQuestions();
});

ipcMain.handle("questions:add",(event,question)=>{
  const questions=readQuestions();

  const newQuestion={
    id:`q_${Date.now()}`,
    question:String(question.question||"").trim(),
    answers:{
      A:String(question.answers?.A||"").trim(),
      B:String(question.answers?.B||"").trim(),
      C:String(question.answers?.C||"").trim(),
      D:String(question.answers?.D||"").trim()
    },
    correctAnswer:String(
      question.correctAnswer||""
    ).trim()
  };

  questions.push(newQuestion);

  writeQuestions(questions);

  return questions;
});

ipcMain.handle("questions:delete",(event,id)=>{
  const questions=readQuestions().filter(
    question=>question.id!==id
  );

  writeQuestions(questions);

  return questions;
});

app.whenReady().then(()=>{
  createWindow();

  app.on("activate",()=>{
    if(BrowserWindow.getAllWindows().length===0){
      createWindow();
    }
  });
});

app.on("window-all-closed",()=>{
  if(process.platform!=="darwin"){
    app.quit();
  }
});