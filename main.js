const electron = require("electron");
const url = require("url");
const path = require("path");
const { Menu } = require("electron/main");
const { app, BrowserWindow, ipcMain, webContents } = require("electron");

// SET ENV

process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

//listen for the app to be ready

app.on("ready", function () {
  //create new window
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
  });
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  //Quit app when closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  //BUild menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle createAddWindow

function createAddWindow() {
  //create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add Shopping List Item",
    webPreferences: { nodeIntegration: true },
  });
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // Garbage collection
  addWindow.on("close", function () {
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on("item:add", function (e, item) {
  // console.log(item);
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// Create Menu Template

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Items",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

// If mac, add empty object to menu => to push file to second

if (process.platform == "darwin") {
  mainMenuTemplate.unshift({}); // adds {} to starting of array
}

// Add developer tools item if not in production

if (process.env.NODE_ENV != "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle Devtools",
        accelerator: process.platform == "darwin" ? "command+I" : "Ctrl+I",

        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: "reload",
      },
    ],
  });
}
