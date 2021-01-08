var createDMG = require('electron-installer-dmg')
createDMG({
    appPath: "../../install/mac/source/Parluks-darwin-x64/Parluks.app",
    out: "../../install/mac/",
    title: "Parluks",
    name: "Parluks",
    icon: "../../src/icon_32.icns",
    background: "mac_bg.png",
    overwrite: true
}, function done (err) {
    console.log(err);
});
