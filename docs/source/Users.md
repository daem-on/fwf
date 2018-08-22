---
sidebar : auto
---

# Documentation for end users

## Basic usage

For very simple editing tasks, you don't even need to leave the main window,
adding sources, arranging clips and rendering your project can be accomplished
with minimal effort.

### Adding and removing sources, adding a clip to the timeline

Click the `Add source` button on the toolbar and select the clip you want to add.
You can select multiple clips at once. You can also drag & drop video clips from
your filesystem to the *Sources* panel.

Once imported, the source will show up in the *Sources* panel. You can see two
buttons next to it: one adds it to your timeline, the other removes it as a
source from the project.

Sources are how fwf stores imported clips. You can see them on the left in the
Sources panel.

### Rearranging, trimming and removing clips from the timeline

Once you have a clip on your timeline, you can move it by selecting it first,
then dragging it horizontally.

You can trim the end of a clip by selecting it and dragging one of its
edges. No matter which edge you drag, you will be trimming from its end.
To trim from the beginning, see *seeking*.

You can remove a clip from your timeline by selecting it and clicking the
`Delete` button in the toolbar, or by pressing the `Del` or `Backspace` keys.

### Seeking and splitting clips

You can trim from the beginning of a clip by seeking it. Select a clip on your
timeline, set the seek option in the *Inspector* panel to how much you want to
seek, and press the `Done` button next to it.

To split a clip in two, select it on your timeline, drag the cursor to where you
want to split the clip, and press the `Split` button in the toolbar, or press
the `S` key.

### Using the preview

::: warning LIMITATIONS
The preview can only play the selected clip, it cannot play multiple
clips in sequence. There is also a soft limit of 10 seconds after which
the preview will stop. There is a significant delay for starting the
preview, especially on less capable machines.
:::

You can start a live preview of a clip in your timeline by selecting it
and pressing the `Start preview` button in the preview toolbar or pressing
the `P` key.

You can pause and resume the preview with buttons on the preview toolbar.

### Rendering your project

To export your project for sharing, simply press the `Render` button in the
toolbar and select a place where you would like to save the rendered file.
You do **not** need to provide a file format, it will be automatically added
based on the *scheme* you set.

### Setting a scheme

Press the `Scheme` button in the toolbar to bring up the *Scheme editor* panel.
Here you can set various settings about how your project will be rendered.

## Filters

Filters modify your video clips. To add filters, you can use the filter editor,
one of the built-in editors, or a third party plugin. Any video filters supported
by FFMpeg are also supported by fwf.

### Using the filter editor

Select a clip and press the `Filter editor` button in the preview toolbar.
You can choose from the presets to get started quickly or look at
[FFMpeg's filters list](https://ffmpeg.org/ffmpeg-filters.html) for a complete
reference. Most filters do not require an advanced knowledge of video editing
or FFMpeg to use. Click the `Add filter` button to add it to the selected clip.

### Using the text editor

Select a clip and press the `Text editor` button in the preview toolbar. Change
the settings on the right to customize the look of your text. Click
`Add text` when you're done to add it to the selected clip.

### Viewing and removing filters

When you select a clip, the *Inspector* panel on the right will show its information.
At the bottom of the table, you will see the list of filters added to that clip.
To remove a filter, click the `Remove filter` button next to it.

## Plugins

Plugins are created by third-party developers to extend fwf. To install a plugin,
click the `Add plugin` button in the toolbar and select the `.json` file in the
plugin's folder. Restart fwf. The plugin will now show up in the *plugin list
window*.

### Using a plugin

Press the `Plugin list` button in the preview toolbar. Click the plugin you want
to use. If it is configured correctly, the plugin will now open up in its own window.
For further instructions, follow the plugin's documentation.

## Advanced usage

::: warning
This is for advanced users only.
:::

### Launching fwf's preview server with a different port

If the port `4000` is in use on your machine, you can set the preview server's
port with the environment variable `PV_PORT`.

### Seeing FFMpeg's stderr output

If for troubleshooting or other reasons you want to see FFMpeg's stderr output,
you can launch fwf with the environment variable `DEBUG_MODE` set to 1. This only
works while rendering and not in preview.
