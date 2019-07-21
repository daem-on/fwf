const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const os = require('os');
const fs = require('fs');
const process = require('process');
const DEBUG_MODE = process.env.DEBUG_MODE | false;
let win;
let splash;

app.on('ready', () => {
    showSplash();
    createWindow();
    pluginMan.mainWindow = win;
    pluginMan.createListWindow();
    win.once('ready-to-show', () => {
        splash.destroy();
		splash = null;
        win.show();
    });
});

function showSplash() {
    splash = new BrowserWindow({width: 400, height: 270, transparent: true,
        frame: false, alwaysOnTop: true, resizable: false, title: "fwf"});
    splash.loadFile("html/splash.html");
}

function createWindow () {
    win = new BrowserWindow({width: 1000, height: 800, show: false, title: "fwf"})

    win.loadFile('html/index.html')
    win.on('closed', () => {
        win = null;
        pluginMan.listWindow = null;
    })
}

app.on('window-all-closed', function () {
    app.quit()
})

ipcMain.on('showSplash', (event, arg) => {
    showSplash();
})

const VideoManager = require("./videoManager.js")
const PluginManager = require("./plugins.js")
const PreviewServer = require("./previewServer.js")

var path = app.getAppPath().replace('app.asar', 'app.asar.unpacked');
var workdir = app.getPath("userData");

var masterDir = workdir + "/master";

if (!fs.existsSync(masterDir)){
    if (!fs.existsSync(workdir)) fs.mkdirSync(workdir);
    fs.mkdirSync(masterDir);
}

var vidManager;

if (os.platform() == "darwin") {
    console.log(path + "/bin/darwin/ffmpeg");
    vidManager = new VideoManager(
        path + "/bin/darwin/ffmpeg",
        path + "/bin/darwin/ffprobe",
        workdir);
} else if (os.platform() == "win32" && os.arch() == "x64") {
    vidManager = new VideoManager(
        path + "/bin/win64/ffmpeg.exe",
        path + "/bin/win64/ffprobe.exe",
        workdir);
} else {
    dialog.showErrorBox(
        "System not supported",
        "This platform or architecture is currently not supported."
    );
    app.quit();
}

vidManager.scheme = {
    size: "1280x720",
    format: ".mp4",
    codec: "libx264",
    bitrate: 1000,
    fps: 24,
    pad: true
}

var pluginMan = new PluginManager();

// Plugins

ipcMain.on('pluginListWin', () => {
    pluginMan.listWindow.show();
})
ipcMain.on('openPlugin', (event, arg) => {
    pluginMan.openPlugin(arg);
})
ipcMain.on('addPluginFromPackage', (event, arg) => {
    pluginMan.addPluginFromPackage(arg);
})

let server = new PreviewServer(vidManager);

// Settings for preview server

ipcMain.on('previewSettings', (event, arg) => {
    server.settings = arg;
})

// Messaging between windows

ipcMain.on('toMainWindow', (event, arg) => {
    win.webContents.send("relay", arg);
})

// Interface
ipcMain.on('setScheme', (event, arg) => {
    vidManager.scheme = arg;
})
ipcMain.on('setWorkFiles', (event, arg) => {
    vidManager.workFiles = arg;
})
ipcMain.on('setOutput', (event, arg) => {
    vidManager.masterOutput = arg;
})
ipcMain.on('getMeta', (event, arg) => {
    vidManager.getMeta(arg, (err, meta) => {
        if (!err) event.sender.send("meta", meta);
    });
})

// Render
ipcMain.on('make', (event) => {
    var callback = { progress: (p) => {
            event.sender.send("progress", p)
        }, };

    if (DEBUG_MODE) {
        callback.stderr = console.log
    }

    vidManager.masterFiles = [];
    vidManager.renderAll(0, callback)
    .then(() => {return vidManager.stitchMaster(callback)})
    .then(() => {event.sender.send("done")})
    .catch((err) => {event.sender.send("error", err.message)})
})
