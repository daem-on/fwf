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
