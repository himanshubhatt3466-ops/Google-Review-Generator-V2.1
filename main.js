
const {app,BrowserWindow,ipcMain,shell,safeStorage,clipboard,dialog}=require('electron');
const path=require('path'),fs=require('fs'),os=require('os'),crypto=require('crypto'),express=require('express'),QR=require('qrcode');
const adminSessions=new Set();
function requireAdmin(e){if(!adminSessions.has(e.sender.id))throw new Error('Admin login required.');}
function hashPassword(p,salt){return crypto.scryptSync(p,salt,64).toString('hex');}
let businesses=[],settings={},server;
const db=()=>path.join(app.getPath('userData'),'data.json');
function load(){try{let d=JSON.parse(fs.readFileSync(db(),'utf8'));businesses=d.businesses||[];settings=d.settings||{}}catch{settings={}}}
function save(){fs.mkdirSync(path.dirname(db()),{recursive:true});fs.writeFileSync(db(),JSON.stringify({businesses,settings},null,2))}
function ip(){for(const a of Object.values(os.networkInterfaces()))for(const n of a||[])if(n.family==='IPv4'&&!n.internal)return n.address;return '127.0.0.1'}
function ideas(name,cat){let s=(name+' '+cat).toLowerCase(),w=[...new Set(s.split(/[^a-z0-9]+/).filter(x=>x.length>2))],a=[`best ${cat}`,`${cat} near me`,`trusted ${cat}`,`professional ${cat}`,`${cat} in my area`];if(/dent|clinic/.test(s))a.push('dental care','teeth cleaning','dentist consultation');if(/restaurant|cafe|food/.test(s))a.push('food quality','dining experience','restaurant service');if(/salon|beauty|spa/.test(s))a.push('hair styling','beauty services','customer service');if(w.length)a.push(w.slice(0,2).join(' ')+' services');return [...new Set(a)].slice(0,12)}
async function gen(p){
 let b=businesses.find(x=>x.id===p.businessId);if(!b)throw Error('Business not found');if(!p.experience?.trim())throw Error('Enter the customer’s genuine experience.');
 let prompt=`Create one natural, honest Google review draft based ONLY on the customer's real experience. Do not invent details, claims, services, dates, prices or outcomes. Use relevant keywords naturally, never stuff them. Language: ${p.language||'English'}. Length: ${p.length||'Medium'}. Business: ${b.name}. Category: ${b.category}. Actual experience: ${p.experience}. Relevant optional keywords: ${(p.keywords||[]).join(', ')}. Output only the draft.`;
 let mode=p.mode||settings.aiMode||'offline';
 if(mode==='offline'){let u=(settings.ollamaEndpoint||'http://127.0.0.1:11434').replace(/\/+$/,'');let r=await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:settings.ollamaModel||'llama3.2:3b',prompt,stream:false}),signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('Ollama error '+r.status+'. Check Ollama and installed model.');return (await r.json()).response||''}
 if(!settings.key)throw Error('Save API key in AI Settings.');if(!safeStorage.isEncryptionAvailable())throw Error('Secure key storage unavailable.');
 let key=safeStorage.decryptString(Buffer.from(settings.key,'base64')),url=(settings.apiEndpoint||'https://api.openai.com/v1').replace(/\/+$/,'');
 let r=await fetch(url+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:settings.apiModel||'gpt-4o-mini',messages:[{role:'user',content:prompt}]}),signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw Error('API error '+r.status+': '+(await r.text()).slice(0,250));return (await r.json()).choices?.[0]?.message?.content||''
}
function webserver(){let x=express();x.use(express.json({limit:'1mb'}));x.get('/',(q,r)=>r.sendFile(path.join(__dirname,'customer.html')));x.get('/customer.js',(q,r)=>r.sendFile(path.join(__dirname,'customer.js')));x.get('/customer.css',(q,r)=>r.sendFile(path.join(__dirname,'customer.css')));
x.get('/api/business/:id',(q,r)=>{let b=businesses.find(z=>z.id===q.params.id);if(!b)return r.status(404).json({error:'Business not found'});r.json({id:b.id,name:b.name,category:b.category,keywords:b.keywords,reviewLink:b.reviewLink})});
x.post('/api/generate',async(q,r)=>{try{r.json({text:await gen({...q.body,mode:q.body.mode||settings.aiMode})})}catch(e){r.status(400).json({error:e.message})}});
server=x.listen(0,'0.0.0.0',()=>{settings.port=server.address().port;save()})}
app.whenReady().then(()=>{load();webserver();let w=new BrowserWindow({width:1200,height:880,minWidth:850,minHeight:650,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});w.loadFile('index.html')});
app.on('before-quit',()=>server?.close());app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
ipcMain.handle('admin-status',()=>({configured:!!settings.adminSalt}));
ipcMain.handle('admin-setup',(e,p)=>{if(settings.adminSalt)throw Error('Admin password is already configured.');if(typeof p!=='string'||p.length<8)throw Error('Password must be at least 8 characters.');const salt=crypto.randomBytes(16).toString('hex');settings.adminSalt=salt;settings.adminHash=hashPassword(p,salt);save();adminSessions.add(e.sender.id);return true;});
ipcMain.handle('admin-login',(e,p)=>{if(!settings.adminSalt)throw Error('Create an admin password first.');const actual=Buffer.from(hashPassword(String(p||''),settings.adminSalt),'hex'),expected=Buffer.from(settings.adminHash,'hex');if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))throw Error('Incorrect admin password.');adminSessions.add(e.sender.id);return true;});
ipcMain.handle('admin-logout',(e)=>{adminSessions.delete(e.sender.id);return true;});
ipcMain.handle('data',(e)=>{requireAdmin(e);const {key,adminSalt,adminHash,...safeSettings}=settings;return ({businesses,settings:{...safeSettings,keySet:!!key},ip:ip(),port:server.address().port});});
ipcMain.handle('savebiz',(e,b)=>{requireAdmin(e);if(!b.name?.trim())throw Error('Business name required');let id=b.id||Date.now().toString(36);let v={id,name:b.name.trim(),category:b.category||'',reviewLink:b.reviewLink||'',keywords:b.keywords||[]},i=businesses.findIndex(x=>x.id===id);if(i<0)businesses.push(v);else businesses[i]=v;save();return v});
ipcMain.handle('delbiz',(e,id)=>{requireAdmin(e);businesses=businesses.filter(b=>b.id!==id);save()});
ipcMain.handle('ideas',(e,d)=>{requireAdmin(e);return ideas(d.name,d.category)});
ipcMain.handle('settings', (e,s)=>{requireAdmin(e);settings={...settings,aiMode:s.aiMode,ollamaEndpoint:s.ollamaEndpoint,ollamaModel:s.ollamaModel,apiEndpoint:s.apiEndpoint,apiModel:s.apiModel};if(s.apiKey){if(!safeStorage.isEncryptionAvailable())throw Error('Secure storage unavailable');settings.key=safeStorage.encryptString(s.apiKey).toString('base64')}save()});
ipcMain.handle('gen',(e,p)=>{requireAdmin(e);return gen(p)});
ipcMain.handle('qr',async(e,id)=>{requireAdmin(e);if(!businesses.some(b=>b.id===id))throw Error('Save business first');let url=`http://${ip()}:${server.address().port}/?business=${encodeURIComponent(id)}`;return {url,data:await QR.toDataURL(url,{width:650,margin:2})}});
ipcMain.handle('copy',(e,t)=>{requireAdmin(e);return clipboard.writeText(String(t))});
ipcMain.handle('saveqr',async(e,data)=>{requireAdmin(e);let r=await dialog.showSaveDialog({defaultPath:'review-qr.png',filters:[{name:'PNG',extensions:['png']}]});if(!r.canceled)fs.writeFileSync(r.filePath,Buffer.from(data.split(',')[1],'base64'))});
ipcMain.handle('open',async(e,u)=>{requireAdmin(e);if(!/^https:\/\/(www\.)?google\.com\/|^https:\/\/g\.page\//i.test(u))throw Error('Enter a valid Google review link');shell.openExternal(u)});
