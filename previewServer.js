const express = require('express');

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
            if (DEBUG_MODE) console.log(this.settings)

            res.contentType('mp4');
            videoManager.renderPreview({
                path: this.settings.path,
                seek: this.settings.seek,
                filters: this.settings.filters,
            }, res)
            .then(() => {res.end();})
        })

        app.listen(4000);
        console.log("Should be fine");
    }
}

module.exports = PreviewServer;
