*{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

:root{
  --bg:#f4f6f8;
  --surface:#ffffff;
  --surface-hover:#f8fafc;
  --text:#172033;
  --muted:#667085;
  --border:#e4e7ec;
  --primary:#356df3;
  --primary-hover:#285bd4;
  --danger:#b42318;
}

html,
body{
  min-height:100%;
}

body{
  min-height:100vh;
  font-family:Arial,sans-serif;
  background:var(--bg);
  color:var(--text);
}

button,
input,
select{
  font:inherit;
}

button{
  cursor:pointer;
}

.app{
  min-height:100vh;
}

.topbar{
  position:sticky;
  top:0;
  z-index:20;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  min-height:82px;
  padding:16px 28px;
  background:var(--surface);
  border-bottom:1px solid var(--border);
}

.topbar-left{
  display:flex;
  align-items:center;
  gap:16px;
}

.topbar-left h1{
  font-size:24px;
}

.topbar-left p{
  margin-top:3px;
  font-size:14px;
  color:var(--muted);
}

.topbar-actions{
  display:flex;
  align-items:center;
  gap:10px;
}

.icon-button{
  width:42px;
  height:42px;
  border:1px solid var(--border);
  border-radius:10px;
  background:#fff;
  font-size:22px;
}

.icon-button:hover{
  background:var(--surface-hover);
}

.button{
  min-height:42px;
  padding:0 18px;
  border-radius:9px;
  border:1px solid transparent;
  font-weight:700;
}

.button-primary{
  background:var(--primary);
  color:#fff;
}

.button-primary:hover{
  background:var(--primary-hover);
}

.button-secondary{
  background:#fff;
  color:var(--text);
  border-color:var(--border);
}

.button-secondary:hover{
  background:var(--surface-hover);
}

.settings-layout{
  display:grid;
  grid-template-columns:250px minmax(0,1fr);
  min-height:calc(100vh - 82px);
}

.settings-sidebar{
  position:sticky;
  top:82px;
  align-self:start;
  display:flex;
  flex-direction:column;
  gap:6px;
  height:calc(100vh - 82px);
  padding:22px 16px;
  background:#fff;
  border-right:1px solid var(--border);
}

.settings-tab{
  width:100%;
  padding:12px 14px;
  border:0;
  border-radius:9px;
  background:transparent;
  color:var(--text);
  text-align:left;
  font-weight:700;
}

.settings-tab:hover{
  background:var(--surface-hover);
}

.settings-tab.active{
  background:#eaf0ff;
  color:var(--primary);
}

.settings-content{
  width:100%;
  max-width:1000px;
  padding:32px;
}

.settings-panel{
  display:none;
}

.settings-panel.active{
  display:block;
}

.section-header{
  margin-bottom:22px;
}

.section-header h2{
  font-size:28px;
}

.section-header p{
  margin-top:6px;
  color:var(--muted);
}

.settings-card{
  display:flex;
  flex-direction:column;
  gap:22px;
  padding:24px;
  background:#fff;
  border:1px solid var(--border);
  border-radius:14px;
}

.field{
  display:flex;
  flex-direction:column;
  gap:8px;
}

.field label{
  display:flex;
  justify-content:space-between;
  gap:10px;
  font-size:14px;
  font-weight:700;
}

.field label span{
  color:var(--muted);
}

.field input,
.field select{
  width:100%;
  min-height:44px;
  padding:9px 12px;
  border:1px solid var(--border);
  border-radius:9px;
  background:#fff;
  color:var(--text);
  outline:none;
}

.field input:focus,
.field select:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 3px rgba(53,109,243,.12);
}

.field input[type="range"]{
  padding:0;
  border:0;
  box-shadow:none;
}

.field input[type="color"]{
  width:100px;
  padding:4px;
}

.field-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
}

.switch-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:16px;
  border:1px solid var(--border);
  border-radius:10px;
}

.switch-row>div{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.switch-row strong{
  font-size:15px;
}

.switch-row span{
  font-size:13px;
  color:var(--muted);
}

.switch-row input{
  width:20px;
  height:20px;
  flex:0 0 auto;
}

.prize-levels{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.prize-level{
  display:grid;
  grid-template-columns:70px minmax(0,1fr) 160px;
  gap:12px;
  align-items:center;
}

.prize-level-number{
  font-weight:700;
}

.prize-level input[type="number"]{
  width:100%;
  min-height:42px;
  padding:8px 10px;
  border:1px solid var(--border);
  border-radius:8px;
}

.guaranteed-row{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:14px;
}

.status-message{
  position:fixed;
  right:24px;
  bottom:24px;
  z-index:50;
  padding:13px 18px;
  border-radius:10px;
  background:#172033;
  color:#fff;
  box-shadow:0 12px 30px rgba(0,0,0,.18);
}

@media(max-width:850px){
  .settings-layout{
    grid-template-columns:1fr;
  }

  .settings-sidebar{
    position:static;
    flex-direction:row;
    overflow-x:auto;
    height:auto;
    border-right:0;
    border-bottom:1px solid var(--border);
  }

  .settings-tab{
    width:auto;
    white-space:nowrap;
  }

  .settings-content{
    padding:22px;
  }

  .field-grid{
    grid-template-columns:1fr;
  }

  .prize-level{
    grid-template-columns:1fr;
  }
}