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

function getSelected() {
    return timeline.getItem(timeline.getSelection()[0].row)
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
            advanced: old.advanced,
        })

        timeline.changeItem(
            timeline.getSelection()[0].row,
            { end: customTime }
        )

    }
}

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

window.addEventListener("keyup", keyup)
function keyup(e) {
    if (e.key == "Delete" || e.key == "Backspace") {
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
