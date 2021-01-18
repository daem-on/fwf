const fs = require("fs");
const {app, BrowserWindow} = require("electron");
const path = require("path");

class PluginManager {
    constructor(mainWindow) {
        this.pluginList = {};
        this.windowList = [];

        this.saveFile = app.getPath("userData") + "/plugins.json";

        if (fs.existsSync(this.saveFile)) {
            this.pluginList = JSON.parse(fs.readFileSync(this.saveFile, "utf8"))
        } else {
            this.createDefault();
        }

    }

    addPluginFromPackage(location) {
        var settings = JSON.parse(fs.readFileSync(location, "utf8"));
        settings.path = path.join(path.dirname(location), settings.file);
        this.registerPlugin(settings.name, settings);
    }

    registerPlugin(name, settings) {
        this.pluginList[name] = settings;
        this.saveList();
    }

    removePlugin(name) {
        delete this.pluginList[name];
        this.saveList();
    }

    saveList() {
        fs.writeFile(this.saveFile,
            JSON.stringify(this.pluginList),
            (err) => {
            if (err) throw err;
        });
    }

    createDefault() {
        this.pluginList = {
            textEditor: {
                path: "html/dialogs/textEditor.html",
                type: "filter",
                height: 550,
                width: 900
            },
            filter: {
                path: "html/dialogs/addFilter.html",
                type: "filter",
                height: 600,
                width: 800
            },
            scheme: {
                path: "html/dialogs/schemeManager.html",
                type: "meta",
                height: 250,
                width: 800
            }
        }
        this.saveList();
    }

    openPlugin(name) {
        var pluginWindow = new BrowserWindow({
            width: this.pluginList[name].width,
            height: this.pluginList[name].height,
            parent: this.mainWindow,
            title: "fwf: " + name,
            backgroundColor: "#20242B",
            webPreferences: {nodeIntegration: true, enableRemoteModule: true}
        });
        this.windowList.push(pluginWindow);
        pluginWindow.on('closed', () => {
            pluginWindow = null
        });
        console.log(this.pluginList[name].path);
        pluginWindow.loadFile(this.pluginList[name].path);
    }

    createListWindow(mainWindow) {
        this.listWindow = new BrowserWindow({
            width: 270,
            height: 280,
            title: "fwf: Plugins",
            backgroundColor: "#20242B",
            minimizable: false,
            maximizable: false,
            parent: this.mainWindow,
            show: false,
            thickFrame: false,
            titleBarStyle: "hidden",
            webPreferences: {nodeIntegration: true, enableRemoteModule: true}
        });
        this.listWindow.on('close', (event) => {
            event.preventDefault();
            this.listWindow.hide();
        });
        this.listWindow.webContents.on('did-finish-load', () => {
            this.listWindow.webContents.send('plugin-list', this.pluginList);
        });
        this.listWindow.loadFile("html/dialogs/pluginList.html");
    }
}

module.exports = PluginManager;
