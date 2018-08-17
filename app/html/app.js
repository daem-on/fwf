var imported = []; // store for imported clips, source of truth for sourceManager
var iid = 0; // last id assigned

function getTitle(path) {
    let exp;

    // this is ridiculous
    if (os.platform == "darwin") // forward slash
        exp = RegExp(/\/([^/]*)\.\w*$/)
    else if (os.platform == "win32") // backslash
        exp = RegExp(/\\([^\\]*)\.\w*$/)
    return exp.exec(path)[1];
}

function over(s) {
    d = new Date(1970, 0, 1);
    d.setMilliseconds(s*1000)
    return d;
}

function back(d) {
    return (d - new Date(1970, 0, 1)) / 1000;
}

var pluginMan = new PluginManager();

function addFilter(filter) {
    if (timeline.getSelection()[0]) {
        var old = getSelected().filters.slice();
        old.push(filter);
        timeline.changeItem(timeline.getSelection()[0].row,
        {filters: old})
        updateInspect();
        filterWin.close();
    }
}

function updateInspect() {
    if (timeline.getSelection()[0]) {
        inspectorManager.properties = getSelected()
    }
    else
        inspectorManager.properties = {};
}

function initRender() {
    var renderArray = tldata.slice();
    var workFiles = [];
    renderArray.sort(tlCompare);

    // convert timeline data to workFile array
    for (var i = 0; i < renderArray.length; i++) {
        workFiles.push({
            file: renderArray[i].path,
            properties: {
                duration: (renderArray[i].end - renderArray[i].start) / 1000,
                seek: renderArray[i].seek,
                advanced: renderArray[i].advanced,
                filters: renderArray[i].filters,
            }
        });
    }

    path = dialog.showSaveDialog();
    if (!path) return;
    ipcRenderer.send("setOutput", path);
    ipcRenderer.send("setWorkFiles", workFiles);
    ipcRenderer.send("make");
}

ipcRenderer.on("progress", (e, m) => {
    $("#bar")[0].value = m.percent;
    $("#status").html(Math.round(m.percent) + "%");
})

ipcRenderer.on("done", () => {
    alert("Rendering done!");
})

ipcRenderer.on("relay", (event, arg) => {
    if (arg.channel == "addFilter") {
        addFilter(arg.value);
    }
    if (arg.channel == "setAdvancedProp") {
        if (timeline.getSelection()[0])
            tldata[timeline.getSelection()[0]].advanced[arg.key] = arg.value;
    }
})

ipcRenderer.on("error", (event, arg) => {
    dialog.showErrorBox("Rendering Error", arg)
})

// add souce once meta is retreived
ipcRenderer.on("meta", (event, arg) => {
        imported.push({
            id: ++iid,
            duration: arg.format.duration,
            path: arg.format.filename,
            title: getTitle(arg.format.filename),
        })
})

function addSourceByPath(path) {
    ipcRenderer.send("getMeta", path);
}

function openFile() {
    var array = dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        title: 'Add a source'
    })

    if (!array) return;

    for (var i = 0; i < array.length; i++) {
        addSourceByPath(array[i]);
    }
}

function showSplash() {
    ipcRenderer.send("showSplash");
}

function save() {
    for (var i = 0; i < tldata.length; i++) {
        tldata[i].startSec = back(tldata[i].start);
        tldata[i].endSec = back(tldata[i].end);
    }

    var data = {
        imported: imported,
        iid: iid,
        tldata: tldata,
    }

    var savePath = dialog.showSaveDialog({
        filters: [
            {name: "fwf Project", extensions: ["fwf"]},
            {name: "JSON file", extensions: ["json"]}
        ]
    });

    if (!savePath) return;

    fs.writeFile(savePath, JSON.stringify(data), (err) => {
        if (err) alert(err);
        else console.log("Saved successfully.");
    })
}

function load() {
    var openPath = dialog.showOpenDialog({
        filters: [
            {name: "fwf Project", extensions: ["fwf"]},
            {name: "JSON file", extensions: ["json"]}
        ], multiSelections: false
    });

    if (!openPath) return;

    var data = JSON.parse(fs.readFileSync(openPath[0], "utf8"));

    imported = data.imported;
    sourceManager.sources = data.imported;
    iid = data.iid;

    for (var i = 0; i < data.tldata.length; i++) {
        data.tldata[i].start = over(data.tldata[i].startSec);
        data.tldata[i].end = over(data.tldata[i].endSec);
    }

    tldata = data.tldata;
    timeline.setData(data.tldata);

    timeline.redraw();
}

window.addEventListener("resize", () => {
    timeline.checkResize();
})
