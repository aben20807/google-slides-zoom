# Google Slides Zoom

A Chrome extension that enables zooming in Google Slides presentations during presentation mode.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hcfdipbanljliibhmpambhpcfifbadie?label=Chrome%20Web%20Store&logo=google-chrome)](https://chromewebstore.google.com/detail/google-slides-zoom/hcfdipbanljliibhmpambhpcfifbadie)

![Image](https://github.com/user-attachments/assets/9c51ae25-5b1d-4559-a788-82ebb2189dd3)

## Features

- Zoom in/out with keyboard shortcuts or mouse scroll
- Smooth zoom animations with visual feedback
- Pan around slides when zoomed in
- Zoom range: 100% to 300%

## Installation

1. Navigate to `chrome://extensions/` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder
4. The extension will activate on Google Slides presentations

## Usage

| Function | Shortcut / Gesture |
| --- | --- |
| Zoom in | `Ctrl/Cmd` + `+` or `=` |
| Zoom out | `Ctrl/Cmd` + `-` |
| Smooth zoom | `Ctrl/Cmd` + mouse scroll |
| Reset zoom | `Ctrl/Cmd` + `0`<br>or `R`<br>or Double-click (when zoomed) |
| Pan (drag view) | Click and drag (when zoomed) |

## Technical Details

Applies CSS `transform: scale()` to `.sketchyViewerContent` with smooth transitions.

## Optional Icon

To add a custom icon, place a 128x128px PNG image named `icon.png` in this folder. Otherwise, remove the `icons` section from [manifest.json](manifest.json).

## Disclaimer

This project is not provided by Google (Alphabet Inc.)

## Acknowledgements

GitHub Copilot (Claude Sonnet 4.5) implemented most of the features

## License

Apache 2.0 License
