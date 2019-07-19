const {dialog} = require('electron')
const express = require('express');
const process = require('process');
const fs = require('fs');
const ss = require('stream-stream');
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

        app.get('/multi', (req, res) => {
            res.contentType('mp4');

            var number1 = this.settings[0];
            var number2 = this.settings[1];

            var imfuckingmad = fs.createWriteStream("/Users/daem_on/Desktop/Video/dick.mp4");
            var buff = ss();

            console.log("file 1")
            console.log(number1)
            videoManager.renderPreview({
                path: number1.file,
                seek: number1.properties.seek,
                filters: number1.properties.filter,
                duration: number1.properties.duration
            }, buff)
            .then(() => {
                console.log("file 2")
                console.log(number2)
                return videoManager.renderPreview({
                    path: number2.file,
                    seek: number2.properties.seek,
                    filters: number2.properties.filter,
                    duration: number2.properties.duration
                }, buff)
            })
            .then(() => {
                console.log("FUCK THIS AND END IT")
                buff.end();
                buff.pipe(imfuckingmad)
            })
            .catch(console.error)
        })

        app.on("error", (e) => {
            dialog.showErrorBox("Preview server error", e);
        })

        app.listen(PV_PORT);
        console.log("Preview server running on " + PV_PORT + ". Change PV_PORT for a different port.");
    }
}

module.exports = PreviewServer;
