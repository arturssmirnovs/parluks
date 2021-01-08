var createDMG = require('electron-installer-dmg')
createDMG({
    appPath: "../../parluks/release-builds/Parluks-darwin-x64/Parluks.app",
    title: "Parluks",
    name: "Parluks",
    icon: "../../parluks/icon_32.icns",
    background: "mac_bg.png",
    overwrite: true
}, function done (err) {
    console.log(err);
});