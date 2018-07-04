var imported = []; // store for imported clips, source of truth for sourceManager
var iid = 0; // last id assigned

var timeline = new links.Timeline(
    document.getElementById("timelinecont"),
    { zoomMax: 3600000,
    showMajorLabels: true,
    min: over(0),
    style: "range",
    editable: true,
    eventMargin: 0,
    height: "150px",
    snapEvents: true,
    stackEvents: false,
    animate: false,
    showCustomTime: true,
    showCurrentTime: false,
});

links.events.addListener(timeline, 'select', onselect);
links.events.addListener(timeline, 'delete', ondelete);
links.events.addListener(timeline, 'changed', onchanged);
links.events.addListener(timeline, 'change', onchange);

function ondelete() {}
function onchanged() {
    if (!liveCheckValidLength())
        timeline.cancelChange();
}
function onselect() {
    updateInspect();
}
function onchange() {
    updateInspect();

    if (liveCheckValidLength())
        timeline.changeItem(timeline.getSelection()[0].row, {valid: true})
    else
        timeline.changeItem(timeline.getSelection()[0].row, {valid: false})
}

// main data storage for timeline
tldata = []

timeline.draw(tldata);
timeline.setCustomTime(over(0));
timeline.setVisibleChartRange(over(0), over(120))

function getTitle(path) {
    let exp;

    // this is ridiculous
    if (os.platform == "darwin") // forward slash
        exp = RegExp(/\/([^/]*)\.\w*$/)
    else if (os.platform == "win32") // backslash
        exp = RegExp(/\\([^\\]*)\.\w*$/)
    return exp.exec(path)[1];
}

ipcRenderer.send("previewFilters", ["vflip"])

function over(s) {
    d = new Date(1970, 0, 1);
    d.setMilliseconds(s*1000)
    return d;
}

function back(d) {
    return (d - new Date(1970, 0, 1)) / 1000;
}

function getSelected() {
    return timeline.getItem(timeline.getSelection()[0].row)
}

let filterWin;
function openFilterWindow() {
    filterWin = new BrowserWindow({width: 800, height: 600})
    filterWin.on('closed', () => {
        filterWin = null
    });
    filterWin.loadFile("html/dialogs/addFilter.html");
}

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

function split() {
    if (timeline.getSelection()[0]) {
        old = getSelected();
        customTime = timeline.getCustomTime();
        // customTime.setMilliseconds(0);

        // JS doesn't let you copy, so this is a dirty way of doing it
        bseek = old.seek || 0;
        timeline.addItem({
            start: customTime,
            end: old.end,
            content: old.content,
            maxduration: old.maxduration,
            seek: bseek + (back(customTime) - back(old.start)),
            path: old.path,
            valid: true,
            filters: old.filters,
            inputs: old.inputs,
        })

        timeline.changeItem(
            timeline.getSelection()[0].row,
            { end: customTime }
        )

    }
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
                inputs: renderArray[i].inputs,
                filters: renderArray[i].filters,
            }
        });
    }

    ipcRenderer.send("setWorkFiles", workFiles);
    ipcRenderer.send("make");
}

ipcRenderer.on("progress", (e, m) => {
    console.dir(m);
    $("#bar")[0].value = m.percent;
})

ipcRenderer.on("done", () => {
    alert("Rendering done!");
})

ipcRenderer.on("relay", (event, arg) => {
    if (arg.channel == "addFilter") {
        addFilter(arg.value);
    }
})

ipcRenderer.on("error", (event, arg) => {
    dialog.showErrorBox("Rendering Error", arg)
})

window.addEventListener("keyup", keyup)

function addItemTimeline(index) {
    var clip = imported[index];
    var endTime = getEndTime();
    timeline.addItem({
        start: over(endTime),
        end: over(endTime + clip.duration),
        content: clip.title,
        maxduration: clip.duration,
        seek: undefined,
        path: clip.path,
        valid: true,
        filters: [],
        inputs: undefined,
    })
}

function getMeta(path) {
    return new Promise((resolve, reject) => {
        ipcRenderer.send("getMeta", path);
        ipcRenderer.once("meta", (e, m) => {
            resolve(m);
        })
    })
}

function liveCheckValidLength() {
    var clip = getSelected();
    var seek = clip.seek ? clip.seek : 0;
    if (((clip.end - clip.start)/1000) + seek <= clip.maxduration)
        return true;
    return false;
}

function tlCompare(a, b) { // comparison for sorting by start time
    if (a.start < b.start)
        return -1;
    if (a.start > b.start)
        return 1;
    return 0;
}

function getEndTime() {
    var time = 0;
    for (var i = 0; i < tldata.length; i++) {
        if (back(tldata[i].end) > time)
            time = back(tldata[i].end)
    }
    return time;
}

function keyup(e) {
    if (e.key == "Delete") {
        timeline.deleteItem(timeline.getSelection()[0].row)
        updateInspect();
    }
    if (e.key == "s") {
        split();
        updateInspect();
    }
    if (e.key == "p") {
        preview();
    }
}

function openFile() {
    var array = dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        title: 'Add a source'
    })

    if (!array) return;

    for (var i = 0; i < array.length; i++) {
        var path = array[i];
        getMeta(path).then((meta) => {
            imported.push({
                id: ++iid,
                duration: meta.format.duration,
                path: path,
                title: getTitle(path),
            })
        })
    }
}

function save() {
    var data = {
        imported: imported,
        iid: iid,
        tldata: tldata,
    }

    clipboard.writeText(JSON.stringify(data));
}

function load() {
    data = JSON.parse(clipboard.readText())
    console.log(data)

    imported = data.imported;
    sourceManager.sources = data.imported;
    iid = data.iid;
    timeline.setData(data.tldata);

    timeline.redraw();
}
