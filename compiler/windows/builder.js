// ./build_installer.js

// 1. Import Modules
const { MSICreator } = require('electron-wix-msi');
const path = require('path');

// 2. Define input and output directory.
// Important: the directories must be absolute, not relative e.g
// appDirectory: "C:\\Users\sdkca\Desktop\OurCodeWorld-win32-x64", 
const APP_DIR = path.resolve(__dirname, './../../parluks/parluks-win32-x64');
// outputDirectory: "C:\\Users\sdkca\Desktop\windows_installer", 
const OUT_DIR = path.resolve(__dirname, './windows_installer');
const ICON = path.join(__dirname, 'app.ico');
const ICON_32 = path.join(__dirname, 'app.ico');
const ICON_16 = path.join(__dirname, 'app.ico');
const BACKGROUND = path.join(__dirname, 'background.png');
const TOP = path.join(__dirname, 'top.png');

// 3. Instantiate the MSICreator
const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    iconPath: ICON,
    description: 'Browser for developers',
    exe: 'parluks',
    name: 'Parluks',
    manufacturer: 'Parluks',
    version: '1.0.0',
    ui: {
        chooseDirectory: true,
        images: {
            exclamationIcon: ICON_32,
            infoIcon: ICON_32,
            newIcon: ICON_16,
            banner: TOP,
            background: BACKGROUND,
            upIcon: ICON_16
        }
    },
});

// 4. Create a .wxs template file
msiCreator.create().then(function(){

    // Step 5: Compile the template to a .msi file
    msiCreator.compile();
});
