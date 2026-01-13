# Google Slides Zoom Extension

A Chrome extension that allows you to zoom Google Slides presentations for better viewing during presentations.

## Features

- **Zoom In**: Press `Ctrl + +` or scroll up with `Ctrl + Scroll`
- **Zoom Out**: Press `Ctrl + -` or scroll down with `Ctrl + Scroll`
- **Reset Zoom**: Press `Ctrl + 0` or `Escape`
- **Smooth Transitions**: All zoom actions include smooth animations
- **Visual Feedback**: Temporary zoom level indicator shows current zoom percentage
- **Wide Range**: Zoom from 50% to 300%

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select this folder (`google-slides-zoom`)
5. The extension is now installed and will work on Google Slides presentations

## Usage

1. Open any Google Slides presentation in presentation mode
2. Use the following controls:
   - **Ctrl + +** (or **Ctrl + =**): Zoom in
   - **Ctrl + -**: Zoom out
   - **Ctrl + Mouse Scroll**: Smooth zoom in/out
   - **Ctrl + 0**: Reset to normal size
   - **Escape**: Reset to normal size (if zoomed)

## Technical Details

The extension applies CSS `transform: scale()` to the `.sketchyViewerContent` element with smooth transitions for a better user experience.

## Notes

- Works only on Google Slides presentation URLs (https://docs.google.com/presentation/*)
- The zoom level indicator appears temporarily in the top-right corner
- Minimum zoom: 50%
- Maximum zoom: 300%
- All zoom operations are smooth with 0.2s transitions

## Optional: Add an Icon

To add a custom icon, place a 128x128px PNG image named `icon.png` in this folder. Otherwise, you can remove the `icons` section from [manifest.json](manifest.json).
