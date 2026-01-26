# Google Slides Zoom

A Chrome extension that enables zooming in Google Slides presentations during presentation mode.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hcfdipbanljliibhmpambhpcfifbadie?label=Chrome%20Web%20Store&logo=google-chrome)](https://chromewebstore.google.com/detail/google-slides-zoom/hcfdipbanljliibhmpambhpcfifbadie)

![Image](https://github.com/user-attachments/assets/9c51ae25-5b1d-4559-a788-82ebb2189dd3)

## Features

- Zoom in/out with keyboard shortcuts or mouse scroll
- Smooth zoom animations with visual feedback
- Pan around slides when zoomed in by dragging
- Customizable zoom range, steps, and pan boundaries
- Simple popup settings interface
- Configurable limits:
  - Zoom range: adjustable (default 100% to 300%)
  - Keyboard zoom step: adjustable (default 10%)
  - Scroll zoom step: adjustable (default 20%)
  - Pan boundary: adjustable (default 50% of slide)

## Installation

1. Navigate to `chrome://extensions/` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder
4. The extension will activate on Google Slides presentations

## Usage

### Controls

| Function | Shortcut / Gesture |
| --- | --- |
| Zoom in | `Ctrl/Cmd` + `+` or `=` |
| Zoom out | `Ctrl/Cmd` + `-` |
| Smooth zoom | `Ctrl/Cmd` + mouse scroll / touchpad pinch |
| Reset zoom | `Ctrl/Cmd` + `0` or `R`<br>or Double-click (when zoomed) |
| Pan (drag view) | Click and drag (when zoomed) |

### Settings

Click the extension icon to open the settings popup where you can configure:

- **Min Scale**: Minimum zoom level (default: 1.0 = 100%)
- **Max Scale**: Maximum zoom level (default: 3.0 = 300%)
- **Key Step**: Zoom increment for keyboard shortcuts (default: 0.1 = 10%)
- **Scroll Step**: Zoom increment for mouse scroll (default: 0.2 = 20%)
- **Pan Boundary**: How far you can drag the slide off-screen
  - `0` = Can only pan to see content edges (no overflow)
  - `0.5` = Can pan half the slide off-screen (default)
  - `1.0` = Can pan entire slide off-screen

After changing settings, refresh your Google Slides presentation to apply changes.

## Technical Details

- Applies CSS `transform: scale()` to `.sketchyViewerContent` with smooth transitions
- Settings stored in `chrome.storage.sync` for persistence across devices
- Pan limits dynamically calculated based on viewport size and zoom level
- Drag-to-pan overlay prevents interaction with slide elements when zoomed

## Disclaimer

This project is not provided by Google (Alphabet Inc.)

## Acknowledgements

GitHub Copilot (Claude Sonnet 4.5) implemented most of the features

## License

Apache 2.0 License
