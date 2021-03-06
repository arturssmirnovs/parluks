import { app, BrowserWindow } from "electron";
import * as path from "path";
import Store from "./js/store";
import * as os from "os"; // top of file
import { WindowBounds } from "./types";

const VERSION = "1.0.0";

const store = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 800, height: 600 },
    key: "",
    settings_display_mode: "dark",
    settings_scroll: 1,
    settings_zoom_level: 50,
    settings_picture_background: 1,
    settings_meta_override: 1,
    version: VERSION,
  },
});

let mainWindow: BrowserWindow | null;

function createWindow() {
  let { width, height } = store.get<WindowBounds>("windowBounds");

  let isRunned = store.get<string>("start");
  if (!isRunned) {
    store.set("start", "1");
    store.set("key", "");
    store.set("settings_display_mode", "dark");
    store.set("settings_scroll", 1);
    store.set("settings_zoom_level", 50);
    store.set("settings_picture_background", 1);
    store.set("settings_meta_override", 1);
    store.set("version", VERSION);
  }

  // comment out frame & titleBarStyle to see electron developer console for debug
  mainWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    titleBarStyle: "hidden",
    simpleFullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      webviewTag: true,
    },
  });

  switch (os.platform()) {
    case "darwin":
      //mainWindow.setIcon('src/app/assets/icons/icon.icns');
      break;
    case "win32":
      mainWindow.setIcon(path.join(__dirname, "../", "app.ico"));
      break;
    default:
      mainWindow.setIcon(path.join(__dirname, "../", "images/icon.png"));
      break;
  }

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  mainWindow.on("resize", () => {
    if (mainWindow) {
      let { width, height } = mainWindow.getBounds();
      store.set("windowBounds", { width, height });
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});