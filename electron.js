const { app, BrowserWindow, session, systemPreferences, shell } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;
let mainWindow;

// ── Single-instance lock (prevents ghost processes on Windows reinstall) ───────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // If someone tries to open a second instance, focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ── Windows: set App User Model ID for proper taskbar / Start-menu pinning ────
if (process.platform === "win32") {
  app.setAppUserModelId("com.tyho.app");
}

// ── Set up Electron permission handler ────────────────────────────────────────
// Must be called before createWindow so it's in place when the page loads.
function setupPermissions() {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      // Grant all permissions — this is a trusted internal app
      callback(true);
    }
  );

  session.defaultSession.setPermissionCheckHandler(() => true);
}

// ── Request macOS camera + mic access ─────────────────────────────────────────
// Returns false if the user previously denied access in System Preferences.
async function requestMacOSPermissions() {
  if (process.platform !== "darwin") return;

  const camera = await systemPreferences.askForMediaAccess("camera");
  const mic = await systemPreferences.askForMediaAccess("microphone");

  console.log("[Electron] macOS permissions — camera:", camera, "| mic:", mic);

  if (!camera || !mic) {
    // Open System Preferences → Privacy so the user can grant access manually
    console.warn("[Electron] Permissions denied — opening System Preferences");
    shell.openExternal(
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera"
    );
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "VideoSDK Meeting",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "build/index.html"));
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

// Required for screen share (getDisplayMedia)
app.commandLine.appendSwitch("enable-usermedia-screen-capturing");

app.on("ready", async () => {
  // 1. Register permission handler FIRST
  setupPermissions();

  // 2. Request macOS-level permissions (shows system dialog on first launch)
  await requestMacOSPermissions();

  // 3. Create the window only after permissions are set up
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});