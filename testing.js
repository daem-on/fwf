var ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath("bin/ffmpeg");

var command = ffmpeg();
command.input("wd/gopro.mov")
.on("stderr", console.log)
.videoFilters({
    filter: 'drawtext',
    options: {
        text: 'Hello World',
        fontfile: '/Users/daem_on/Documents/fwf/html/fonts/SourceSansPro-Regular.ttf',
    }
  })
.save("wd/out.mov")
