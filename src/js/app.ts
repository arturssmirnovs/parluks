import { Titlebar, Color } from "custom-electron-titlebar";
import { shell, remote } from "electron";
import Device from "./device";
import Store from "./store";

const searchValue = document.getElementById(
  "search-value"
)! as HTMLInputElement;
const settingsMode = document.getElementById(
  "settings-mode"
)! as HTMLSelectElement;
const settingsZoom = document.getElementById(
  "settings-zoom"
)! as HTMLInputElement;
const size = document.getElementById("size")! as HTMLInputElement;
const settingsScroll = document.getElementById(
  "settings-scroll"
)! as HTMLSelectElement;
const settingsBackground = document.getElementById(
  "settings-background"
)! as HTMLSelectElement;
const settingsWidth = document.getElementById(
  "settings-width"
)! as HTMLSelectElement;

// Title bar Config
new Titlebar({
  backgroundColor: Color.fromHex("#222834"),
  icon: "./app.ico",
  titleHorizontalAlignment: "left",
  menu: null,
});

// Input Context Menu
const menu = new remote.Menu();

menu.append(
  new remote.MenuItem({
    label: "Undo",
    accelerator: process.platform === "darwin" ? "Command+Z" : "Ctrl+Z",
    role: "undo",
  })
);

menu.append(
  new remote.MenuItem({
    label: "Redo",
    accelerator: process.platform === "darwin" ? "Command+Y" : "Ctrl+Y",
    role: "redo",
  })
);

menu.append(
  new remote.MenuItem({
    type: "separator",
  })
);

menu.append(
  new remote.MenuItem({
    label: "Cut",
    accelerator: process.platform === "darwin" ? "Command+X" : "Ctrl+X",
    role: "cut",
  })
);
menu.append(
  new remote.MenuItem({
    label: "Copy",
    accelerator: process.platform === "darwin" ? "Command+C" : "Ctrl+C",
    role: "copy",
  })
);
menu.append(
  new remote.MenuItem({
    label: "Paste",
    accelerator: process.platform === "darwin" ? "Command+V" : "Ctrl+V",
    role: "paste",
  })
);
menu.append(
  new remote.MenuItem({
    label: "Delete",
    role: "delete",
  })
);

searchValue.oncontextmenu = e => {
  e.preventDefault();
  menu.popup({
    window: remote.getCurrentWindow(),
  });
};

const $ = document.querySelector.bind(document);

// app general version when compiling to installation files
const VERSION = "1.0.0";

// Build version when compiling app to installable files
const BUILD_VERSION = 11;

// URL where compare BUILD_VERSION and check if update available
const API_URL =
  "https://raw.githubusercontent.com/arturssmirnovs/parluks/main/src/package.json";

// Locally stored user preferences
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

class App {
  devices: Device[];
  version: string | null;
  settings_display_mode: string;
  settings_scroll: number;
  settings_zoom_level: number;
  settings_picture_background: number;
  settings_meta_override: number;

  constructor() {
    let devices = Device.getDevices();

    this.devices = [
      new Device(devices[2], this),
      new Device(devices[22], this),
      new Device(devices[26], this),
      new Device(devices[28], this),
    ];

    this.version = null;

    this.settings_display_mode = store.get<string>("settings_display_mode");

    this.settings_scroll = store.get<number>("settings_scroll");

    this.settings_zoom_level = store.get<number>("settings_zoom_level");

    this.settings_picture_background = store.get<number>(
      "settings_picture_background"
    );

    this.settings_meta_override = store.get<number>("settings_meta_override");

    this.about();

    this.settingsApply();
  }

  about() {
    // Rendering devices
    this.renderDevices();

    // check if update available based on BUILD_VERSION
    const formData = new FormData();
    fetch(API_URL, {
      method: "GET",
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (session: any) {
          if (session.build > BUILD_VERSION) {
            document.getElementById("about-update")!.style.display = "block";
            document
              .getElementById("about-update")!
              .addEventListener("click", () => {
                shell.openExternal("https://github.com/arturssmirnovs/parluks");
              });
          }
        }.bind(this)
      )
      .catch(function (error) {});

    // displaying start block
    document.getElementById("about")!.style.display = "block";
    document.getElementById("about-start")!.addEventListener("click", () => {
      document.getElementById("about")!.style.display = "none";
    });
  }

  run() {
    // creating devices and attaching events @see device.js
    this.devices.forEach(function (device) {
      device.create();
    });
    this.renderDevices();
    this.events();
  }

  renderDevices() {
    document.getElementById("devices-list")!.innerHTML = "";

    let activeDevices: string[] = [];
    this.devices.forEach(function (device, index) {
      activeDevices.push(device.attrs.name);
    });

    let devices = Device.getDevices();
    devices.forEach((device, index) => {
      const input = document.createElement("input");

      input.setAttribute("type", "checkbox");
      input.className = "form-check-input";
      input.setAttribute("name", "device[]");
      input.setAttribute("id", "device-" + index);

      input.setAttribute("value", `${index}`);
      if (activeDevices.includes(device.name)) {
        input.setAttribute("checked", "checked");
      }

      const label = document.createElement("label");
      label.setAttribute("for", "device-" + index);
      label.innerText =
        device.name + " (" + device.height + "x" + device.width + ")";

      const div = document.createElement("div");
      div.className = "device form-check";
      div.appendChild(input);
      div.appendChild(label);
      document.getElementById("devices-list")!.appendChild(div);
    });
    // }.bind(this));
  }

  settingsApply() {
    if (this.settings_display_mode) {
      const body = document.getElementById("body")!;

      if (this.settings_display_mode == "dark") {
        body.classList.remove("light");
        body.classList.add("dark");
      } else {
        body.classList.remove("dark");
        body.classList.add("light");
      }
    }

    settingsMode.value = this.settings_display_mode;
    settingsZoom.value = this.settings_zoom_level.toString();
    size.value = this.settings_zoom_level.toString();
    settingsScroll.value = String(this.settings_scroll);
    settingsBackground.value = String(this.settings_picture_background);
    settingsWidth.value = String(this.settings_meta_override);
  }

  settings() {
    store.set("settings_display_mode", settingsMode.value);
    this.settings_display_mode = store.get("settings_display_mode");

    store.set("settings_scroll", settingsScroll.value);
    this.settings_scroll = store.get("settings_scroll");

    store.set("settings_zoom_level", settingsZoom.value);
    this.settings_zoom_level = store.get("settings_zoom_level");

    store.set("settings_picture_background", settingsBackground.value);
    this.settings_picture_background = store.get("settings_picture_background");

    store.set("settings_meta_override", settingsWidth.value);
    this.settings_meta_override = store.get("settings_meta_override");

    this.settingsApply();
    this.addDevices();
  }

  events() {
    const size = $("#size")! as HTMLSelectElement;
    size.addEventListener("change", () => {
      store.set("settings_zoom_level", size.value);
      this.settings_zoom_level = +size.value;
      settingsZoom.value = String(this.settings_zoom_level);
      this.devices.forEach(function (device) {
        device.resize(+size.value);
      });
    });

    const actionBack = $("#action-back")!;
    actionBack.addEventListener("click", () => {
      this.devices.forEach(function (device) {
        device.goBack();
      });
    });

    const actionForward = $("#action-forward")!;
    actionForward.addEventListener("click", () => {
      this.devices.forEach(function (device) {
        device.goForward();
      });
    });

    const actionRefresh = $("#action-refresh")!;
    actionRefresh.addEventListener("click", () => {
      this.devices.forEach(function (device) {
        device.reload();
      });
    });

    const actionZoom = $("#action-zoom")!;
    actionZoom.addEventListener("click", () => {
      const actionZoomWrapper = $("#zoom-input-wrapper")! as HTMLDivElement;
      if (actionZoomWrapper.style.display === "none") {
        actionZoomWrapper.style.display = "block";
      } else {
        actionZoomWrapper.style.display = "none";
      }
    });

    const actionBackground = $("#action-background")!;
    actionBackground.addEventListener("click", () => {
      if (this.settings_picture_background == 1) {
        store.set("settings_picture_background", 0);
        settingsBackground.value = "0";
        this.settings_picture_background = store.get(
          "settings_picture_background"
        );
      } else {
        store.set("settings_picture_background", 1);
        settingsBackground.value = "1";
        this.settings_picture_background = store.get(
          "settings_picture_background"
        );
      }

      var x = document.getElementsByClassName("webview");
      var i;
      for (i = 0; i < x.length; i++) {
        if (this.settings_picture_background == 1) {
          x[i].classList.remove("no-background");
        } else {
          x[i].classList.add("no-background");
        }
      }

      this.devices.forEach(function (device) {
        device.resize(+size.value);
      });
    });

    const actionDevicesWrapper = $("#devices-wrapper")! as HTMLDivElement;
    const actionDevicesOpen = $("#action-devices")!;
    actionDevicesOpen.addEventListener("click", () => {
      actionDevicesWrapper.style.display = "block";
    });

    const actionDevicesClose = $("#action-devices-close")!;
    actionDevicesClose.addEventListener("click", () => {
      actionDevicesWrapper.style.display = "none";
      this.addDevices();
    });

    const actionSettingsWrapper = $("#settings-wrapper")! as HTMLDivElement;
    const actionSettingsOpen = $("#action-settings")!;
    actionSettingsOpen.addEventListener("click", () => {
      actionSettingsWrapper.style.display = "block";
    });

    const actionSettingsClose = $("#action-settings-close")!;
    actionSettingsClose.addEventListener("click", () => {
      actionSettingsWrapper.style.display = "none";
      this.settings();
    });

    const actionDonate = $("#action-donate")!;
    actionDonate.addEventListener("click", () => {
      shell.openExternal("https://github.com/arturssmirnovs/parluks");
    });

    const search = $("#search")! as HTMLFormElement;
    search.addEventListener("submit", e => {
      e.preventDefault();

      const url: string = search.url.value;

      this.devices.forEach(function (device) {
        device.loadUrl(url);
      });
    });
  }

  navigate(url: string) {
    searchValue.value = url;
    this.devices.forEach(function (device) {
      device.loadUrl(url);
    });
  }

  addDevices() {
    const newDevices = [];
    const devices = document.getElementsByName(
      "device[]"
    ) as NodeListOf<HTMLInputElement>;
    let k = 0;
    for (k = 0; k < devices.length; k++) {
      if (devices[k].checked) {
        newDevices.push(devices[k].value);
      }
    }

    this.devices.forEach(function (device) {
      device.destroy();
    });

    this.devices = [];

    var _devices = Device.getDevices();
    newDevices.forEach(index => {
      this.devices.push(new Device(_devices[+index], this));
    });
    // }.bind(this));

    this.devices.forEach(function (device) {
      device.create();
    });
  }

  scroll(value: number) {
    this.devices.forEach(function (device) {
      device.scroll(value);
    });
  }
}

const app = new App();
app.run();
export default App;
