# Google Review Generator v2.1

## Admin-only desktop dashboard
On first launch, create an administrator password (minimum 8 characters). After that, the dashboard requires this password. The password is stored as a salted scrypt hash. Admin IPC actions are rejected until login.

Customers do not log into the admin dashboard. They use the separate mobile page opened by scanning the business QR.

## Fix for `Cannot read properties of undefined (reading 'saveBiz')`
This project must be opened as the Electron desktop application, not by double-clicking `index.html` or opening it in Chrome/Edge. The `window.api` bridge is supplied by Electron's `preload.js`. If the login screen says the desktop bridge is not loaded, close the app and install/run the latest Electron build.

## Features
- Business profile: name, category, official Google review URL
- Automatic keyword suggestions and optional custom keywords
- Offline AI via Ollama, or OpenAI-compatible API AI
- API key encrypted locally using Electron safeStorage
- QR code for each saved business and customer mobile landing page
- Customer drafts are copied to clipboard and the saved Google review page opens; customers paste, edit and submit manually

## QR networking limitation
Without web hosting, the QR contains the desktop PC's private Wi-Fi address. The PC and customer's phone must be on the same Wi-Fi/LAN, the desktop app must remain open, and Windows Firewall may need to allow the app. It will not work for remote customers or mobile data. Public QR access requires hosting/domain or a secure public tunnel.

## Offline AI
Install Ollama on the desktop PC and download a model once:
```powershell
ollama pull llama3.2:3b
```
Keep Ollama running. In AI Settings choose Offline AI.

## API AI
Choose API AI, enter an OpenAI-compatible endpoint, model and API key. API use requires internet and may incur provider charges.

## Build installer
A build machine needs Node.js 20+ and internet to fetch dependencies:
```powershell
npm install
npm run dist
```
The Windows NSIS installer is created under `dist/`. End users installing the packaged `.exe` do not need Node.js.

## Review integrity
Use only genuine customer experience. Keywords are suggestions and should be included only when relevant. Do not fabricate reviews, gate reviews by star rating, incentivize positive reviews, or automatically submit on a customer's behalf.
