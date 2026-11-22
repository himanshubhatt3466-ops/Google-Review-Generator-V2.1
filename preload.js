const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('api',{
 authStatus:()=>ipcRenderer.invoke('admin-status'),
 setupAdmin:p=>ipcRenderer.invoke('admin-setup',p),
 loginAdmin:p=>ipcRenderer.invoke('admin-login',p),
 logoutAdmin:()=>ipcRenderer.invoke('admin-logout'),
 data:()=>ipcRenderer.invoke('data'),saveBiz:b=>ipcRenderer.invoke('savebiz',b),
 delBiz:id=>ipcRenderer.invoke('delbiz',id),ideas:d=>ipcRenderer.invoke('ideas',d),
 settings:s=>ipcRenderer.invoke('settings',s),gen:p=>ipcRenderer.invoke('gen',p),
 qr:id=>ipcRenderer.invoke('qr',id),copy:t=>ipcRenderer.invoke('copy',t),
 saveQr:d=>ipcRenderer.invoke('saveqr',d),open:u=>ipcRenderer.invoke('open',u)
});
