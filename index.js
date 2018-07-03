const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const os = require('os')
const DEBUG_MODE = false;
let win;

app.on('ready', () => {
    splash = new BrowserWindow({width: 400, height: 270, transparent: true, frame: false, alwaysOnTop: true, resizable: false});
    splash.loadFile("html/splash.html");

    createWindow();
    win.once('ready-to-show', () => {
        splash.destroy();
        win.show();
    });
});

function createWindow () {
    win = new BrowserWindow({width: 800, height: 600, show: false})

    win.loadFile('html/index.html')
    //win.setProgressBar(0.7)
    win.on('closed', () => {
        win = null
    })
    app.on('window-all-closed', () => {
        app.quit()
    })
}

app.on('ready', createWindow)

const VideoManager = require("./videoManager.js")

var path = app.getAppPath();

if (os.platform() != 'darwin') {
    dialog.showErrorBox("Error", "This sofware is still in development, and only contains ffmpeg binary files for macOS.")
    app.quit()
}

var vidManager = new VideoManager(
    path + "/bin/ffmpeg",
    path + "/bin/ffprobe",
    path + "/wd/");
vidManager.setScheme(
    "1280x720",
    ".mp4",
    "libx264",
    1000,
    24,
    "16:9"
)

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
