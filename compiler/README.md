LINUX

npm install electron-packager -g

electron-packager ../src/ Parluks --platform linux --arch x64 --out ../install/linux/source/ --icon ../src/images/icon.png --name Parluks

Redhat

https://github.com/electron-userland/electron-installer-redhat
node build.js

Debian
https://www.npmjs.com/package/electron-installer-debian
node build.js

MAC

electron-packager ../src/ Parluks --platform darwin --arch x64 --out ../install/mac/source/ --icon ../src/icon_32.icns --name Parluks node buider.js --overwrite

