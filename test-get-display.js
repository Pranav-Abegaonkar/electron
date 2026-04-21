const { app, BrowserWindow, session, desktopCapturer } = require("electron");

app.commandLine.appendSwitch("enable-usermedia-screen-capturing");

app.on("ready", () => {
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then(sources => {
      callback({ video: sources[0], audio: "loopback" });
    }).catch(err => {
      callback();
    });
  });

  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL("https://bot.sannysoft.com"); // any https page to test
  // Wait a bit, then execute JS to see if getDisplayMedia is available
  setTimeout(() => {
    win.webContents.executeJavaScript(`
      typeof navigator.mediaDevices.getDisplayMedia
    `).then(res => {
      console.log("getDisplayMedia type:", res);
      app.quit();
    }).catch(err => {
      console.error(err);
      app.quit();
    });
  }, 2000);
});
