let bs=[],kw=[],qr=null;const $=x=>document.getElementById(x),msg=(id,t)=>$(id).textContent=t;
function chips(){let box=$('keywords');box.innerHTML='';kw.forEach(k=>{let s=document.createElement('span');s.className='chip';s.textContent=k;s.onclick=()=>s.classList.toggle('on');box.appendChild(s)})}
function selected(){return [...document.querySelectorAll('#keywords .chip.on')].map(x=>x.textContent)}
function selects(){['which','qrBusiness'].forEach(id=>{let el=$(id),old=el.value;el.innerHTML='<option value="">Select business</option>';bs.forEach(b=>{let o=document.createElement('option');o.value=b.id;o.textContent=b.name;el.appendChild(o)});if(bs.some(b=>b.id===old))el.value=old})}
async function refresh(){let d=await window.api.data();bs=d.businesses;selects();$('defaultEngine').value=d.settings.aiMode||'offline';$('engine').value=d.settings.aiMode||'offline';$('ollama').value=d.settings.ollamaEndpoint||'http://127.0.0.1:11434';$('ollamaModel').value=d.settings.ollamaModel||'llama3.2:3b';$('apiEndpoint').value=d.settings.apiEndpoint||'https://api.openai.com/v1';$('apiModel').value=d.settings.apiModel||'gpt-4o-mini';$('keymsg').textContent=d.settings.keySet?'API key saved encrypted on this PC.':'No API key saved.';let l=$('list');l.innerHTML='';bs.forEach(b=>{let d=document.createElement('div');d.className='biz';let t=document.createElement('strong');t.textContent=b.name;let s=document.createElement('span');s.textContent=b.category+' · '+(b.keywords||[]).join(', ');let e=document.createElement('button');e.textContent='Edit';e.onclick=()=>{ $('bid').value=b.id;$('name').value=b.name;$('category').value=b.category;$('link').value=b.reviewLink;kw=[...(b.keywords||[])];chips()};let del=document.createElement('button');del.textContent='Delete';del.onclick=async()=>{await window.api.delBiz(b.id);refresh()};d.append(t,s,e,del);l.appendChild(d)})}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));t.classList.add('active');$(t.dataset.tab).classList.add('active')});
$('suggest').onclick=async()=>{kw=await window.api.ideas({name:$('name').value,category:$('category').value});chips();msg('bizmsg','Click only relevant keywords to select them, then save.')};
$('custom').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();let v=e.target.value.trim();if(v&&!kw.includes(v))kw.push(v);e.target.value='';chips()}};
$('save').onclick=async()=>{try{let b=await window.api.saveBiz({id:$('bid').value,name:$('name').value,category:$('category').value,reviewLink:$('link').value,keywords:selected()});msg('bizmsg','Business saved.');await 
async function initAuth(){
 if(!window.api){msg('loginMessage','Desktop bridge is not loaded. Please open this app using the installed Windows application, not in Chrome/Edge. Reinstall the latest build if needed.');return;}
 try{
  const state=await window.api.authStatus();
  $('loginIntro').textContent=state.configured?'Enter your administrator password to continue.':'Create your administrator password (minimum 8 characters).';
  $('confirmLabel').hidden=state.configured;
  $('adminEnter').textContent=state.configured?'Login as admin':'Create admin account';
  $('adminEnter').onclick=async()=>{
   const pass=$('adminPassword').value;
   if(!state.configured && pass!==$('adminConfirm').value){msg('loginMessage','Passwords do not match.');return;}
   try{if(state.configured)await window.api.loginAdmin(pass);else await window.api.setupAdmin(pass);$('loginGate').hidden=true;$('adminApp').hidden=false;await refresh();}
   catch(e){msg('loginMessage',e.message);}
  };
 }catch(e){msg('loginMessage',e.message);}
}
$('logout').onclick=async()=>{await window.api.logoutAdmin();$('adminApp').hidden=true;$('loginGate').hidden=false;$('adminPassword').value='';msg('loginMessage','Logged out.');};
initAuth();
$('bid').value=b.id}catch(e){msg('bizmsg',e.message)}};
$('clear').onclick=()=>{['bid','name','category','link','custom'].forEach(x=>$(x).value='');kw=[];chips()};
$('saveSettings').onclick=async()=>{try{await window.api.settings({aiMode:$('defaultEngine').value,ollamaEndpoint:$('ollama').value,ollamaModel:$('ollamaModel').value,apiEndpoint:$('apiEndpoint').value,apiModel:$('apiModel').value,apiKey:$('apiKey').value});$('apiKey').value='';msg('setmsg','Settings saved.');refresh()}catch(e){msg('setmsg',e.message)}};
$('generate').onclick=async()=>{let id=$('which').value;if(!id){msg('genmsg','Select a business.');return}$('generate').disabled=true;msg('genmsg','Generating…');try{let r=await window.api.gen({businessId:id,experience:$('experience').value,language:$('language').value,length:$('length').value,mode:$('engine').value,keywords:bs.find(b=>b.id===id)?.keywords||[]});$('draft').value=r;msg('genmsg','Draft ready. Check every detail for accuracy.')}catch(e){msg('genmsg',e.message)}finally{$('generate').disabled=false}};
$('copy').onclick=async()=>{if($('draft').value){await window.api.copy($('draft').value);msg('genmsg','Copied to clipboard.')}};
$('makeqr').onclick=async()=>{try{qr=await window.api.qr($('qrBusiness').value);$('qr').innerHTML='';let i=document.createElement('img');i.src=qr.data;$('qr').appendChild(i);$('qrurl').textContent=qr.url;$('saveqr').disabled=false}catch(e){msg('qrurl',e.message)}};
$('saveqr').onclick=()=>qr&&window.api.saveQr(qr.data);

async function initAuth(){
 if(!window.api){msg('loginMessage','Desktop bridge is not loaded. Please open this app using the installed Windows application, not in Chrome/Edge. Reinstall the latest build if needed.');return;}
 try{
  const state=await window.api.authStatus();
  $('loginIntro').textContent=state.configured?'Enter your administrator password to continue.':'Create your administrator password (minimum 8 characters).';
  $('confirmLabel').hidden=state.configured;
  $('adminEnter').textContent=state.configured?'Login as admin':'Create admin account';
  $('adminEnter').onclick=async()=>{
   const pass=$('adminPassword').value;
   if(!state.configured && pass!==$('adminConfirm').value){msg('loginMessage','Passwords do not match.');return;}
   try{if(state.configured)await window.api.loginAdmin(pass);else await window.api.setupAdmin(pass);$('loginGate').hidden=true;$('adminApp').hidden=false;await refresh();}
   catch(e){msg('loginMessage',e.message);}
  };
 }catch(e){msg('loginMessage',e.message);}
}
$('logout').onclick=async()=>{await window.api.logoutAdmin();$('adminApp').hidden=true;$('loginGate').hidden=false;$('adminPassword').value='';msg('loginMessage','Logged out.');};
initAuth();
