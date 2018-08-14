function dropFiles(ev) {
    ev.preventDefault();
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
            var file = ev.dataTransfer.items[i].getAsFile();
            addSourceByPath(file.path);
        }
    }
}
function dragOverHandler(ev) {
    ev.preventDefault();
}
function dragEnterHandler(ev) {
    event.dataTransfer.dropEffect = "copy";
    ev.preventDefault();
}
