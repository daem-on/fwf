const fs = require("fs");
const {app, BrowserWindow} = require("electron");

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

    registerPlugin(name, path, type, width, height) {
        this.pluginList[name] = {
            path: path,
            type: type,
            width: width,
            height: height
        }
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
            title: "fwf: " + name, backgroundColor: "#20242B"});
        this.windowList.push(pluginWindow);
        pluginWindow.on('closed', () => {
            pluginWindow = null
        });
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
