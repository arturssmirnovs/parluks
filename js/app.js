const url = require('url');
const { shell } = require('electron')
const Device = require('./device.js');

const $ = document.querySelector.bind(document);

class App {

  constructor() {
    let devices = Device.getDevices();
    this.devices = [
      new Device(devices[2], this),
      new Device(devices[22], this),
      new Device(devices[26], this),
      new Device(devices[28], this),
    ];
  }

  run() {
    this.devices.forEach(function(device) {
      device.create();
    });
    this.renderDevices();
    this.events();
  }

  renderDevices() {
    let activeDevices = [];
    this.devices.forEach(function(device, index) {
      activeDevices.push(device.attrs.name)
    });

    let devices = Device.getDevices();
    devices.forEach(function(device, index) {

      var input = document.createElement("input");
      input.setAttribute("type", "checkbox");
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
      div.className = "device";
      div.appendChild(input);
      div.appendChild(label);
      document.getElementById("devices-list").appendChild(div);

    });
  }

  events() {
    const size = $('#size');
    size.addEventListener('change', () => {
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
      var x = document.getElementsByClassName("webview");
      var i;
      for (i = 0; i < x.length; i++) {
        if (x[i].classList.contains("no-background")) {
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

    const actionDonate = $('#action-donate');
    actionDonate.addEventListener('click', () => {
      shell.openExternal("https://google.com/");
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