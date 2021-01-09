# Compiling to installation files

## LINUX

npm install electron-packager -g

```electron-packager ../src/ Parluks --platform linux --arch x64 --out ../install/linux/source/ --icon ../src/images/icon.png --name Parluks```

### Redhat

https://github.com/electron-userland/electron-installer-redhat
```node build.js```

### Debian
https://www.npmjs.com/package/electron-installer-debian
```node build.js```

## MAC

```electron-packager ../src/ Parluks --platform darwin --arch x64 --out ../install/mac/source/ --icon ../src/icon_32.icns --name Parluks node buider.js --overwrite```
```node builder.js```

## WINDOWS

```electron-packager ../src/ Parluks --platform win32 --arch x64 --out ../install/windows/source/ --icon ../src/app.ico --name Parluks```
```node builder.js```

https://ourcodeworld.com/articles/read/927/how-to-create-a-msi-installer-in-windows-for-an-electron-framework-application
