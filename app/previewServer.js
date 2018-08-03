const {dialog} = require('electron')
const express = require('express');
const process = require('process');
const PV_PORT = process.env.PV_PORT | 4000;

// HTML video players are kind of hard to deal width
// to stream from FFmpeg to the renderer, we need
// an HTTP server, that you can GET the preview from.

class PreviewServer {
    constructor(videoManager) {
        var app = this.app = express();
        this.settings = {}; // this should be changed when rendering a filtered video

        app.get('/', function(req, res) {
            res.send('fwf preview server');
        });

        app.get('/preview/:file/:seek', function(req, res) {
            res.contentType('mp4');
            var path = __dirname + "/wd/" + req.params.file;
            videoManager.renderPreview({
                path: path,
                seek: req.params.seek,
            }, res)
            .then(() => {res.end();})
        });

        app.get('/filtered', (req, res) => {
            res.contentType('mp4');
            videoManager.renderPreview({
                path: this.settings.path,
                seek: this.settings.seek,
                filters: this.settings.filters,
            }, res)
            .then(() => {res.end();})
        })

        app.on("error", (e) => {
            dialog.showErrorBox("Preview server error", e);
        })

        app.listen(PV_PORT);
        console.log("Preview server running on " + PV_PORT);
    }
}

module.exports = PreviewServer;
