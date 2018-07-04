var video = $("#preview")[0];

function preview() {
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

function setSource(url) {
    video.innerHTML = '<source src="' + url + '" type="video/mp4">';
    video.load();
}

function pausePreview() {
    video.pause();
}
