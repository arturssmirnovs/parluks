const electron = require("electron");
const path = require("path");
const fs = require("fs");

class Device {
    // {
    //     "name": "Galaxy Note 3",
    //     "featured": false,
    //     "width": 360,
    //     "userAgent": "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    //     "touch": true,
    //     "os": "",
    //     "pixelRatio": 3,
    //     "height": 640,
    //     "type": "phone"
    // },
    constructor(attrs, app) {
        this.attrs = attrs;
        this.app = app;
        
        this.webview = null;
        this.webContents = null;
    }

    destroy() {
        this.webview.parentElement.remove();
    }

    create() {

        var div = document.createElement("div");
        div.className = "device-view";

        var label = document.createElement("h2");
        label.innerHTML = this.attrs.name+" <small>"+this.attrs.width+"x"+this.attrs.height+"</small>";

        this.webview = document.createElement("webview");
        if (this.app.settings_picture_background == 1) {
            this.webview.className = "webview "+this.attrs.type+""
        } else {
            this.webview.className = "webview no-background "+this.attrs.type+""
        }
        this.webview.setAttribute("partition", "persist:default");

        var resize = document.getElementById("size").value;
        var size = {
            width: this.attrs.width,
            height: this.attrs.height
        };
        this.webview.style = "width: "+size.width*(resize/100)+"px;height: "+size.height*(resize/100)+"px;";

        this.webview.src = document.getElementById("search-value").value;

        // rotate
        // screenshot
        // developer tools
        var divActionsWrapper = document.createElement("div");
        divActionsWrapper.className = "device-view-header";

        var divActions = document.createElement("div");
        divActions.className = "device-view-actions";

        var rotate = document.createElement("img");
        rotate.src = "images/refresh.svg";
        rotate.alt = "Rotate";
        rotate.addEventListener('click', e => {
            this.rotate();
        });
        divActions.appendChild(rotate);

        var screenshot = document.createElement("img");
        screenshot.src = "images/camera.svg";
        screenshot.alt = "Screenshot";
        screenshot.addEventListener('click', e => {
            this.screenshot();
        });
        divActions.appendChild(screenshot);

        var devTools = document.createElement("img");
        devTools.src = "images/cog.svg";
        devTools.alt = "Developer tools";
        devTools.addEventListener('click', e => {
            this.openDevTools();
        });
        divActions.appendChild(devTools);

        divActionsWrapper.appendChild(label);
        divActionsWrapper.appendChild(divActions);
        div.appendChild(divActionsWrapper);
        div.appendChild(this.webview);

        document.getElementById("main").appendChild(div);

        const preloadFile = 'file://' + require('path').resolve('./js/preload.js');
        this.webview.setAttribute('preload', preloadFile);

        this.webview.addEventListener('dom-ready', e => {
            console.log('webiew dom-ready');

            this.injectCSS();

            this.injectJS();

            if (!this.webContents) {
                this.webContents = this.webview.getWebContents();
                this.webContents.on('dom-ready', e => {
                    console.log('webContents dom-ready');
                });

                this.webview.send('our-secrets', 'ping');

                this.webContents.on('did-navigate', (isMainFrame, pageUrl) => {
                    if (pageUrl) {
                        this.app.navigate(pageUrl);
                    }
                });
                this.webContents.on('did-navigate-in-page', (isMainFrame, pageUrl) => {
                    if (pageUrl) {
                        this.app.navigate(pageUrl);
                    }
                });
            }

            this.webContents.setUserAgent(this.attrs.userAgent);

            this.resize(resize);
        });

        this.webview.addEventListener('ipc-message', (event) => {
            console.log(event.channel)
        })

        this.webview.addEventListener('new-window', e => {
            event.preventDefault();
            this.webview.loadURL(e.url);
        });

        this.webview.addEventListener('console-message', e => {
            try {
                let data = JSON.parse(e.message);
                console.log(data);
                if (data.action == "SCROLL") {
                    this.app.scroll(data.value);
                }
            } catch(err) {
                console.dir(e);
            }
        });
    }

    loadUrl(url) {
        if (this.webview.getURL() !== url) {
            this.webview.loadURL(url);
        }
    }

    openDevTools() {
        if (this.webview.isDevToolsOpened()) {
            this.webview.closeDevTools()
        } else {
            this.webview.openDevTools()
        }
    }

    screenshot() {
        const dialog = electron.remote.dialog;
        this.webContents.capturePage(img => {
            dialog.showSaveDialog( null, {
                    title: "Select the File Path to save",
                    defaultPath: path.join(__dirname, "image.png"),
                    buttonLabel: "Save",
                    filters: [
                        {
                            name: "Image Files",
                            extensions: ["png", "jpeg", "jpg"],
                        },
                    ],
                    properties: [],
                }, (file) => {
                if (file) {
                    fs.writeFile(file, img.toPNG(), "base64", function (err) {
                        if (err) throw err;
                        console.log("Saved!");
                    });
                }
            });
        });
    }

    rotate() {
        var resize = document.getElementById("size").value;

        if (this.webview.classList.contains("rotated")) {
            this.webview.classList.remove("rotated");
            this.resize(resize);
        } else {
            this.webview.classList.add("rotated");
            this.resize(resize);
        }
    }

    resize(resize) {
        if (this.webview.classList.contains("rotated")) {
            var size = {
                width: this.attrs.height,
                height: this.attrs.width
            };
        } else {
            var size = {
                width: this.attrs.width,
                height: this.attrs.height
            };
        }

        this.webview.style = "width: "+size.width*(resize/100)+"px;height: "+size.height*(resize/100)+"px;";

        this.webContents.enableDeviceEmulation({
            screenPosition: (this.attrs.type == "tablet" || this.attrs.type == "phone" ? 'mobile' : 'desktop'), // @TODO
            screenSize: size,
            scale: (resize/100),
            fitToView: false,
            viewSize: size
        });

        this.webview.parentElement.style = "width: "+this.webview.offsetWidth+"px;height: auto;";
    }

    goForward() {
        if (this.webview.canGoForward()) {
            this.webview.goForward();
        }
    }
    goBack() {
        if (this.webview.canGoBack()) {
            this.webview.goBack();
        }
    }
    reload() {
        this.webview.reload();
    }

    injectCSS() {
        //this.webview.insertCSS(``);
    }

    injectJS() {

        if (this.app.settings_meta_override == 1) {
            this.webview.executeJavaScript(`const metas = document.getElementsByTagName('meta');
            for (let i = 0; i < metas.length; i++) {
                if (metas[i].getAttribute('name') === "viewport") {
                    metas[i].setAttribute('content', 'width=device-width');
                }
            }
            
            var meta = document.createElement('meta');
            meta.name = "viewport";
            meta.content = "width=device-width";
            document.getElementsByTagName('head')[0].appendChild(meta);
            
            `, true);
        }

        if (this.app.settings_scroll == 1) {
            this.webview.executeJavaScript(`window.onscroll = function() { console.log(JSON.stringify({action:"SCROLL", "value": this.scrollY})) }`, true);
        }
    }

    scroll(value) {
        if (this.app.settings_scroll == 1) {
            this.webview.executeJavaScript(`window.scrollTo(0, ${value});`, true);
        }
    }

    static getDevices() {
        return [
            {
                "name": "Galaxy Note 3",
                "featured": false,
                "width": 360,
                "userAgent": "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
                "touch": true,
                "os": "",
                "pixelRatio": 3,
                "height": 640,
                "type": "phone"
            },
            {
                "name": "Galaxy Note 9",
                "width": 414,
                "height": 846,
                "pixelRatio": 3.5,
                "userAgent": "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "Android",
                "type": "phone"
            },
            {
                "name": "Galaxy S5",
                "featured": false,
                "width": 360,
                "userAgent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 3,
                "height": 640,
                "type": "phone"
            },
            {
                "name": "Galaxy S9/S9+",
                "featured": true,
                "width": 360,
                "userAgent": "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "Android",
                "pixelRatio": 4,
                "height": 740,
                "type": "phone"
            },
            {
                "name": "LG Optimus L70",
                "featured": false,
                "width": 384,
                "userAgent": "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 1.25,
                "height": 640,
                "type": "phone"
            },
            {
                "name": "Microsoft Lumia 550",
                "featured": false,
                "width": 360,
                "userAgent": "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 550) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 640,
                "type": "phone"
            },
            {
                "name": "Microsoft Lumia 950",
                "featured": false,
                "width": 360,
                "userAgent": "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263",
                "touch": true,
                "os": "",
                "pixelRatio": 4,
                "height": 640,
                "type": "phone"
            },
            {
                "name": "Nexus 5X",
                "featured": false,
                "width": 412,
                "userAgent": "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR4.170623.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 2.625,
                "height": 732,
                "type": "phone"
            },
            {
                "name": "Nexus 6P",
                "featured": false,
                "width": 412,
                "userAgent": "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 3.5,
                "height": 732,
                "type": "phone"
            },
            {
                "name": "Nokia 8110 4G",
                "width": 240,
                "height": 320,
                "pixelRatio": 1,
                "userAgent": "Mozilla/5.0 (Mobile; Nokia 8110 4G; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5",
                "touch": true,
                "os": "KaiOS",
                "type": "phone"
            },
            {
                "name": "Pixel 2",
                "featured": false,
                "width": 411,
                "userAgent": "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 2.625,
                "height": 731,
                "type": "phone"
            },
            {
                "name": "Pixel 2 XL",
                "featured": false,
                "width": 411,
                "userAgent": "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 3.5,
                "height": 823,
                "type": "phone"
            },
            {
                "name": "iPhone 5/SE",
                "featured": false,
                "width": 320,
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 568,
                "type": "phone"
            },
            {
                "name": "iPhone 6/7/8",
                "featured": true,
                "width": 375,
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 667,
                "type": "phone"
            },
            {
                "name": "iPhone 6/7/8 Plus",
                "featured": true,
                "width": 414,
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
                "touch": true,
                "os": "",
                "pixelRatio": 3,
                "height": 736,
                "type": "phone"
            },
            {
                "name": "iPhone X/XS",
                "featured": true,
                "width": 375,
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/12.0 Mobile/15A372 Safari/604.1",
                "touch": true,
                "os": "",
                "pixelRatio": 3,
                "height": 812,
                "type": "phone"
            },
            {
                "name": "iPhone XR",
                "featured": false,
                "width": 414,
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/12.0 Mobile/15A372 Safari/604.1",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 896,
                "type": "phone"
            },
            {
                "name": "iPhone XS Max",
                "featured": false,
                "width": 414,
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/12.0 Mobile/15A372 Safari/604.1",
                "touch": true,
                "os": "",
                "pixelRatio": 3,
                "height": 896,
                "type": "phone"
            },
            {
                "name": "Kindle Fire HDX",
                "featured": true,
                "width": 800,
                "userAgent": "Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 1280,
                "type": "tablet"
            },
            {
                "name": "Nexus 10",
                "featured": false,
                "width": 800,
                "userAgent": "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 1280,
                "type": "tablet"
            },
            {
                "name": "Nexus 7",
                "featured": false,
                "width": 600,
                "userAgent": "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 960,
                "type": "tablet"
            },
            {
                "name": "iPad",
                "featured": true,
                "width": 768,
                "userAgent": "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 1024,
                "type": "tablet"
            },
            {
                "name": "iPad Mini",
                "featured": false,
                "width": 768,
                "userAgent": "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
                "touch": true,
                "os": "",
                "pixelRatio": 2,
                "height": 1024,
                "type": "tablet"
            },
            {
                "name": "iPad Pro (10.5-inch)",
                "width": 834,
                "height": 1112,
                "pixelRatio": 2,
                "userAgent": "Mozilla/5.0 (iPad; CPU OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1",
                "touch": true,
                "os": "iOS",
                "type": "tablet"
            },
            {
                "name": "iPad Pro (12.9-inch)",
                "width": 1024,
                "height": 1366,
                "pixelRatio": 2,
                "userAgent": "Mozilla/5.0 (iPad; CPU OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1",
                "touch": true,
                "os": "iOS",
                "type": "tablet"
            },
            {
                "name": "Laptop with HiDPI screen",
                "featured": false,
                "width": 1440,
                "height": 900,
                "userAgent": "",
                "touch": false,
                "os": "",
                "pixelRatio": 2,
                "type": "laptop"
            },
            {
                "name": "Laptop with MDPI screen",
                "featured": false,
                "width": 1280,
                "height": 800,
                "userAgent": "",
                "touch": false,
                "os": "",
                "pixelRatio": 1,
                "type": "laptop"
            },
            {
                "name": "Laptop with touch",
                "featured": false,
                "width": 1280,
                "height": 950,
                "userAgent": "",
                "touch": true,
                "os": "",
                "pixelRatio": 1,
                "type": "laptop"
            },
            {
                "name": "1080p Full HD Television",
                "width": 1920,
                "height": 1080,
                "pixelRatio": 1,
                "userAgent": "",
                "touch": false,
                "os": "custom",
                "type": "television"
            },
            {
                "name": "4K Ultra HD Television",
                "width": 3840,
                "height": 2160,
                "pixelRatio": 1,
                "userAgent": "",
                "touch": false,
                "os": "custom",
                "type": "television"
            },
            {
                "name": "720p HD Television",
                "width": 1280,
                "height": 720,
                "pixelRatio": 1,
                "userAgent": "",
                "touch": false,
                "os": "custom",
                "type": "television"
            }
        ];
    }
}

module.exports = Device;
