const url = require('url');
const { shell } = require('electron')
const Device = require('./device.js');
const Store = require('./store.js');

const $ = document.querySelector.bind(document);

const VERSION = "1.0.0";

const BUILD_VERSION = 10;

const STORE_VERSION = false;

const API_URL = "https://raw.githubusercontent.com/arturssmirnovs/parluks/main/src/package.json?token=ABWPH6CMSXZBBIG5DD5U76S76XHXW&v=2";

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 800, height: 600 },
    key: '',
    settings_display_mode: 'dark',
    settings_scroll: 1,
    settings_zoom_level: 50,
    settings_picture_background: 1,
    settings_meta_override: 1,
    version: VERSION
  }
});

class App {

  constructor() {

    let devices = Device.getDevices();

    this.devices = [
      new Device(devices[2], this),
      new Device(devices[22], this),
      new Device(devices[26], this),
      new Device(devices[28], this),
    ];

    this.version = null;

    this.settings_display_mode = store.get("settings_display_mode");

    this.settings_scroll = store.get("settings_scroll");

    this.settings_zoom_level = store.get("settings_zoom_level");

    this.settings_picture_background = store.get("settings_picture_background");

    this.settings_meta_override = store.get("settings_meta_override");

    this.about();

    this.settingsApply();
  }

  about() {
    document.getElementById("about").style.display = "block";

    this.renderDevices();

    const formData = new FormData();
    fetch(API_URL, {
      method: "GET"
    }).then(function (response) {
      return response.json();
    }).then(function (session) {
      if (session.build > BUILD_VERSION) {
        document.getElementById("about-update").style.display = "block";
        document.getElementById("about-update").addEventListener('click', () => {
          shell.openExternal("https://github.com/arturssmirnovs/parluks");
        });
      }

    }.bind(this)).catch(function (error) {

    });

    document.getElementById("about-start").addEventListener('click', () => {
      document.getElementById("about").style.display = "none";
    });
  }

  run() {
    this.devices.forEach(function(device) {
      device.create();
    });
    this.renderDevices();
    this.events();
  }

  renderDevices() {
    document.getElementById("devices-list").innerHTML = "";
    let activeDevices = [];
    this.devices.forEach(function(device, index) {
      activeDevices.push(device.attrs.name)
    });

    let devices = Device.getDevices();
    devices.forEach(function(device, index) {

      var input = document.createElement("input");
      input.setAttribute("type", "checkbox");
      input.className = "form-check-input";
      input.setAttribute("name", "device[]");
      input.setAttribute("id", "device-"+index);

      input.setAttribute("value", index);
      if (activeDevices.includes(device.name)) {
        input.setAttribute("checked", "checked");
      }

      var label = document.createElement("label");
      label.setAttribute("for","device-"+index);
      label.innerText = device.name+" ("+device.height+"x"+device.width+")";

      var div = document.createElement("div");
      div.className = "device form-check";
      div.appendChild(input);
      div.appendChild(label);
      document.getElementById("devices-list").appendChild(div);

    }.bind(this));
  }

  settingsApply() {

    if (this.settings_display_mode) {
      let body = document.getElementById("body");

      if (this.settings_display_mode == 'dark') {
        body.classList.remove("light");
        body.classList.add("dark");
      } else {
        body.classList.remove("dark");
        body.classList.add("light");
      }
    }

    document.getElementById("settings-mode").value = this.settings_display_mode;
    document.getElementById("settings-zoom").value = this.settings_zoom_level;
    document.getElementById("size").value = this.settings_zoom_level;
    document.getElementById("settings-scroll").value = this.settings_scroll;
    document.getElementById("settings-background").value = this.settings_picture_background;
    document.getElementById("settings-width").value = this.settings_meta_override;
  }

  settings() {

    store.set("settings_display_mode", document.getElementById("settings-mode").value);
    this.settings_display_mode = store.get("settings_display_mode");

    store.set("settings_scroll", document.getElementById("settings-scroll").value);
    this.settings_scroll = store.get("settings_scroll");

    store.set("settings_zoom_level", document.getElementById("settings-zoom").value);
    this.settings_zoom_level = store.get("settings_zoom_level");

    store.set("settings_picture_background", document.getElementById("settings-background").value);
    this.settings_picture_background = store.get("settings_picture_background");

    store.set("settings_meta_override", document.getElementById("settings-width").value);
    this.settings_meta_override = store.get("settings_meta_override");

    this.settingsApply();
    this.addDevices();
  }

  events() {
    const size = $('#size');
    size.addEventListener('change', () => {
      store.set("settings_zoom_level", size.value);
      this.settings_zoom_level = size.value;
      document.getElementById("settings-zoom").value = this.settings_zoom_level;
      this.devices.forEach(function(device) {
        device.resize(size.value);
      });
    });

    const actionBack = $('#action-back');
    actionBack.addEventListener('click', () => {
      this.devices.forEach(function(device) {
        device.goBack();
      });
    });

    const actionForward = $('#action-forward');
    actionForward.addEventListener('click', () => {
      this.devices.forEach(function(device) {
        device.goForward();
      });
    });

    const actionRefresh = $('#action-refresh');
    actionRefresh.addEventListener('click', () => {
      this.devices.forEach(function(device) {
        device.reload();
      });
    });

    const actionZoom = $('#action-zoom');
    actionZoom.addEventListener('click', () => {
      const actionZoomWrapper = $('#zoom-input-wrapper');
      if (actionZoomWrapper.style.display === "none") {
        actionZoomWrapper.style.display = "block";
      } else {
        actionZoomWrapper.style.display = "none";
      }
    });

    const actionBackground = $('#action-background');
    actionBackground.addEventListener('click', () => {

      if (this.settings_picture_background == 1) {
        store.set("settings_picture_background", 0);
        document.getElementById("settings-background").value = "0"
        this.settings_picture_background = store.get("settings_picture_background");
      } else {
        store.set("settings_picture_background", 1);
        document.getElementById("settings-background").value = "1"
        this.settings_picture_background = store.get("settings_picture_background");
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

      this.devices.forEach(function(device) {
        device.resize(size.value);
      });
    });

    const actionDevicesWrapper = $('#devices-wrapper');
    const actionDevicesOpen = $('#action-devices');
    actionDevicesOpen.addEventListener('click', () => {
      actionDevicesWrapper.style.display = "block";
    });

    const actionDevicesClose = $('#action-devices-close');
    actionDevicesClose.addEventListener('click', () => {
      actionDevicesWrapper.style.display = "none";
      this.addDevices();
    });

    const actionSettingsWrapper = $('#settings-wrapper');
    const actionSettingsOpen = $('#action-settings');
    actionSettingsOpen.addEventListener('click', () => {
      actionSettingsWrapper.style.display = "block";
    });

    const actionSettingsClose = $('#action-settings-close');
    actionSettingsClose.addEventListener('click', () => {
      actionSettingsWrapper.style.display = "none";
      this.settings();
    });

    const actionDonate = $('#action-donate');
    actionDonate.addEventListener('click', () => {
      shell.openExternal("https://github.com/arturssmirnovs/parluks");
    });

    const search = $('#search');
    search.addEventListener('submit', (e) => {
      e.preventDefault();

      const url = search.url.value;

      this.devices.forEach(function(device) {
        device.loadUrl(url);
      });
    });
  }

  navigate(url) {
    $("#search-value").value = url;
    this.devices.forEach(function(device) {
      device.loadUrl(url);
    });
  }

  addDevices() {
    var newDevices = [];
    var devices =  document.getElementsByName("device[]");
    var k = 0;
    for(k=0;k< devices.length;k++) {
      if (devices[k].checked) {
        newDevices.push(devices[k].value);
      }
    }

    this.devices.forEach(function(device) {
      device.destroy();
    });

    this.devices = [];

    var devices = Device.getDevices();
    newDevices.forEach(function(index) {
      this.devices.push(new Device(devices[index], this));
    }.bind(this));

    this.devices.forEach(function(device) {
      device.create();
    });
  }

  scroll(value) {
    this.devices.forEach(function(device) {
      device.scroll(value);
    });
  }
}

app = new App();
app.run();