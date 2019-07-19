function preview() {
    if (!timeline.getSelection()[0]) return;

    var selected = getSelected();
    var customTime = back(timeline.getCustomTime());

    bseek = selected.seek || 0;

    ipcRenderer.send("previewSettings", {
        path: selected.path,
        filters: selected.filters,
        seek: bseek + (customTime - back(selected.start)),
    })

    setSource("http://localhost:4000/filtered");
}

// preview including all clips
function previewMulti() {
    var renderArray = tldata.slice();
    var customTimeDate = timeline.getCustomTime();
    var customTime = back(customTimeDate);
    var workFiles = [];
    renderArray.sort(tlCompare);

    // convert timeline data to workFile array
    for (var i = 0; i < renderArray.length; i++) {

        // if it's too early, skip it
        if (renderArray[i].end < customTimeDate)
            continue;

        workFiles.push({
            file: renderArray[i].path,
            properties: {
                duration: (renderArray[i].end - renderArray[i].start) / 1000,
                seek: renderArray[i].seek || 0,
                filters: renderArray[i].filters,
            }
        });
    }

    ipcRenderer.send("previewSettings", workFiles);
    console.log(workFiles);

    setSource("http://localhost:4000/multi");
}

var timer, video, startTime = 0;

function incrementCustom() {
    timeline.setCustomTime(over(startTime + video.currentTime));
    timeline.redraw();
    ontimechange();
}

function setSource(url) {
    $("#preview")[0].innerHTML = '<source src="' + url + '" type="video/mp4">';
    $("#preview")[0].load();
}

function pausePreview() {
    $("#preview")[0].pause();
}
function resumePreview() {
    $("#preview")[0].play();
}
