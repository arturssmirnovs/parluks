const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const Store = require('./js/store.js');

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 800, height: 600 }
  }
});

let mainWindow

function createWindow () {
  let { width, height } = store.get('windowBounds');

  mainWindow = new BrowserWindow({ width, height });
  mainWindow.setIcon(__dirname + "/images/icon.png");

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds();
    store.set('windowBounds', { width, height });
  });

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})