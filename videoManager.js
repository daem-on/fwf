var ffmpeg = require("fluent-ffmpeg");
var fs = require('fs');

class VideoManager {
    constructor(path1=null, path2=null, workdir) {
        if (path1) ffmpeg.setFfmpegPath(path1);
        if (path2) ffmpeg.setFfprobePath(path2);
        this.masterOutput = "wd/masterOutput";
        this.wd = workdir; // working directory, master files in subdirectory master
        this.scheme = {}; // common properties that all master files are rendered with

        this.workFiles = []; // files imported in current project
        this.masterFiles = []; // list of processed "master" files

        this.postProcessing = []; // TBA
    }

    getMeta(path, callback) {
        ffmpeg.ffprobe(path, callback);
    }

    addWorkFile(file, properties) {
        var cont = {
            file: file,
            properties: properties
        }
        this.workFiles.push(cont);
    }

    setCallbacks(command, cb) {
        if (cb.progress) command.on("progress", cb.progress)
        if (cb.start) command.on("start", cb.start)
        if (cb.end) command.on("end", cb.end)
        if (cb.error) command.on("error", cb.error)
        if (cb.stderr) command.on("stderr", cb.stderr)
    }

    addWorkFileFilter(index, filter, options=undefined) {
        var cont = {
            filter: filter,
            options: options
        }
        if (!this.workFiles[index].properties.filters) {
            this.workFiles[index].properties.filters = [];
        }

        this.workFiles[index].properties.filters.push(cont);
    }

    // go through all workFiles and render
    renderAll(index, callbacks) {
        if (this.workFiles.length <= 0)
            return Promise.reject(new Error("Files list empty"));

        if (index >= this.workFiles.length)
            return Promise.resolve(); // at the end

        // not at the end, rendering "index"
        return this.render(index, callbacks)
        .then(() => {
            return this.renderAll(index+1, callbacks);
        })
    }

    // renders a workFile to be a masterFile
    render(index, callbacks) {
        return new Promise((resolve, reject) => {
            callbacks.end = resolve;
            callbacks.error = reject;

            var command = ffmpeg()
            var workFile = this.workFiles[index];

            if (workFile.properties.duration) // set duration
                command.duration(workFile.properties.duration);
            if (workFile.properties.inputs) { // add multiple inputs
                var inputs = workFile.properties.inputs;
                for (var i = 0; i < inputs.length; i++) {
                    command.input(inputs[i]);
                }
            }

            this.setCallbacks(command, callbacks);

            if (workFile.properties.complex) { // use complex filtergraph
                if (workFile.properties.complexFilter)
                    command.complexFilter(workFile.properties.complexFilter);
            } else { // don't use complex filtergraph
                this.fromScheme(command);
                if (workFile.properties.filters)
                    command.videoFilters(workFile.properties.filters);
            }

            // render input to single file
            command.input(workFile.file)

            if (workFile.properties.seek) // set start time
                command.seekInput(workFile.properties.seek);

            command.keepDAR()
            .output(this.wd + "/master/master" + index + this.scheme.format)
            .run();

            this.masterFiles.push("master" + index + this.scheme.format);
        });
    }

    // create complete master file from processed files in master folder
    stitchMaster(callbacks) {
        return new Promise((resolve, reject) => {
            callbacks.end = resolve;
            callbacks.error = reject;

            var command = ffmpeg()
            this.setCallbacks(command, callbacks);

            var fileList = this.masterFiles;
            var listFileName = 'wd/master/list.txt', fileNames = '';

            // create list with filenames
            fileList.forEach(function(fileName, index) {
                fileNames = fileNames + 'file ' + fileName + '\n';
            });

            fs.writeFileSync(listFileName, fileNames);

            command.input(listFileName)
            .inputOptions(['-f concat', '-safe 0'])
            .outputOptions('-c copy')
            .save(this.masterOutput + this.scheme.format);
        })
    }

    renderPreview(options, stream) {
        return new Promise((resolve, reject) => {
            var command = ffmpeg()
            if (options.filters) command.videoFilters(options.filters);

            command.input(options.path)
            .on("end", resolve)
            .on("error", reject)
            .size("480x?")
            .format("mp4")
            .outputOptions('-movflags frag_keyframe+empty_moov') // seekability magic
            .videoCodec("libx264")
            .seekInput(options.seek)
            .pipe(stream, {end:true});
        })
    }

    fromScheme(command) {
        let sch = this.scheme;

        command.size(sch.size)
            .fps(sch.fps)
            .videoBitrate(sch.bitrate)
            .videoCodec(sch.codec)
    }

    setScheme(size, format, codec, bitrate, fps) {
        this.scheme = {
            size: size,
            format: format,
            codec: codec,
            bitrate: bitrate,
            fps: fps
        }
    }

    convertToCompliant(input, name) {
        var command = ffmpeg();
        this.fromScheme(command);

        command.input(input)
            .save(this.wd + name + sch.format);
    }
}

module.exports = VideoManager;
