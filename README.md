# fwf: FFmpeg video editor
![main screenshot](https://imgur.com/2HTMBua.png)

Video editing software in JavaScript, made with Electron, on top of FFmpeg using [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg). Provides a simple GUI for editing videos with FFmpeg with a timeline, preview, and filter editor.

Architecture:
- Fluent-ffmpeg in the main process, starting ffmpeg processes as needed.
- GUI in the renderer process, stores all of the information and only sends render instructions to main over IPC.
- Express HTTP server in main process for streaming preview video.

### Filter editor
![filter editor screenshot](https://imgur.com/G2tLNam.png)

JSON editor GUI using [jsoneditor](https://github.com/josdejong/jsoneditor/), with presets. This lets you edit the filters that are passed to fluent-ffmpeg, which then turns them into FFmpeg options. This means you can use **any** video filter the FFmpeg binary supports.

### License
Released under the MIT license, see LICENSE.
![filter editor screenshot](https://imgur.com/eYh7yqY.png)
