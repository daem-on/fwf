var ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath("bin/ffmpeg");

var fs = require('fs');
var fileList = ['master0.mp4', 'master1.mp4', 'master2.mp4']; // files to merge
var listFileName = 'wd/master/list.txt', fileNames = '';

// ffmpeg -f concat -i mylist.txt -c copy output
fileList.forEach(function(fileName, index){
fileNames = fileNames + 'file ' + fileName + '\n';
});

fs.writeFileSync(listFileName, fileNames);

var merge = ffmpeg();
merge.on("stderr", console.log)
.input(listFileName)
.inputOptions(['-f concat', '-safe 0'])
.outputOptions('-c copy')
.save('wd/merged.mp4');
