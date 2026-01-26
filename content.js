// Google Slides Zoom Extension
(function () {
    'use strict';

    // Only run in presentation mode
    if (!window.location.href.includes('/present')) {
        return;
    }

    let currentScale = 1.0;
    // Default settings (will be overridden by stored settings)
    let MIN_SCALE = 1.0;
    let MAX_SCALE = 3.0;
    let SCALE_STEP = 0.1;
    let SCROLL_SCALE_STEP = 0.2;
    let PAN_BOUNDARY = 0.5;
    let isApplyingZoom = false;
    let settingsLoaded = false;
    const VIEWER_SELECTORS = [
        '.sketchyViewerContent',
        '.punch-viewer-content',
        '.punch-viewer-container',
        '.punch-viewer-page',
        '.punch-viewer-svgpage'
    ];
    // Pan variables
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastPanX = 0;
    let lastPanY = 0;
    let panOverlay = null;

    // Function to find the viewer content element
    function getViewerContent() {
        for (const selector of VIEWER_SELECTORS) {
            const viewer = document.querySelector(selector);
            if (viewer) {
                return viewer;
            }
        }
        return null;
    }

    function isEditableTarget(target) {
        if (!target) return false;
        if (target.isContentEditable) return true;
        const tag = target.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function clampPan() {
        const viewer = getViewerContent();
        if (!viewer) return;

        const baseWidth = viewer.offsetWidth;
        const baseHeight = viewer.offsetHeight;
        if (!baseWidth || !baseHeight) return;

        // No panning needed at 1x zoom
        if (currentScale <= 1.0) {
            panX = 0;
            panY = 0;
            return;
        }

        const scaledWidth = baseWidth * currentScale;
        const scaledHeight = baseHeight * currentScale;
        
        // Base pan limit: pan until edge of zoomed content reaches edge of viewport
        const basePanX = Math.max(0, (scaledWidth - window.innerWidth) / 2);
        const basePanY = Math.max(0, (scaledHeight - window.innerHeight) / 2);
        
        // Additional pan allowed beyond content edges based on boundary factor
        // PAN_BOUNDARY of 0 = can only pan to see content edges (no overflow)
        // PAN_BOUNDARY of 0.5 = can pan half the slide off-screen
        // PAN_BOUNDARY of 1.0 = can pan entire slide off-screen
        const boundaryFactor = PAN_BOUNDARY || 0;
        const boundaryPanX = baseWidth * boundaryFactor;
        const boundaryPanY = baseHeight * boundaryFactor;
        
        const maxPanX = basePanX + boundaryPanX;
        const maxPanY = basePanY + boundaryPanY;

        panX = clamp(panX, -maxPanX, maxPanX);
        panY = clamp(panY, -maxPanY, maxPanY);
    }

    // Function to create/remove pan overlay
    function updatePanOverlay() {
        if (currentScale > 1.0) {
            // Create overlay if it doesn't exist
            if (!panOverlay) {
                panOverlay = document.createElement('div');
                panOverlay.id = 'slides-zoom-overlay';
                panOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          cursor: grab;
        `;

                // Add event listeners to overlay
                panOverlay.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    lastPanX = panX;
                    lastPanY = panY;
                    panOverlay.style.cursor = 'grabbing';
                    e.preventDefault();
                });

                panOverlay.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;

                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;

                    panX = lastPanX + deltaX;
                    panY = lastPanY + deltaY;

                    clampPan();
                    updatePan();
                    e.preventDefault();
                });

                panOverlay.addEventListener('mouseup', (e) => {
                    isDragging = false;
                    panOverlay.style.cursor = 'grab';
                    e.preventDefault();
                });

                panOverlay.addEventListener('mouseleave', () => {
                    isDragging = false;
                    panOverlay.style.cursor = 'grab';
                });

                panOverlay.addEventListener('dblclick', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resetZoom();
                });

                document.body.appendChild(panOverlay);
            }
        } else {
            // Remove overlay when not zoomed
            if (panOverlay) {
                panOverlay.remove();
                panOverlay = null;
            }
        }
    }

    // Function to apply zoom with smooth transition
    function applyZoom(scale, resetPan = false) {
        if (isApplyingZoom) return;
        isApplyingZoom = true;

        const viewer = getViewerContent();
        if (!viewer) {
            isApplyingZoom = false;
            return;
        }

        currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

        // Reset pan when zooming back to 1.0 or if requested
        if (currentScale === 1.0 || resetPan) {
            panX = 0;
            panY = 0;
        }

        clampPan();
        viewer.style.transition = 'transform 0.2s ease-out';
        viewer.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
        viewer.style.transformOrigin = 'center center';

        showZoomIndicator(currentScale);
        updatePanOverlay();

        setTimeout(() => {
            isApplyingZoom = false;
        }, 50);
    }

    // Function to update pan position
    function updatePan() {
        const viewer = getViewerContent();
        if (!viewer) return;

        clampPan();
        viewer.style.transition = 'none';
        viewer.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
    }

    // Function to show zoom level indicator
    function showZoomIndicator(scale) {
        let indicator = document.getElementById('slides-zoom-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'slides-zoom-indicator';
            indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
            document.body.appendChild(indicator);
        }

        indicator.textContent = `Zoom: ${Math.round(scale * 100)}%`;
        indicator.style.opacity = '1';

        clearTimeout(indicator.hideTimeout);
        indicator.hideTimeout = setTimeout(() => {
            indicator.style.opacity = '0';
        }, 1000);
    }

    // Function to reset zoom
    function resetZoom() {
        panX = 0;
        panY = 0;
        applyZoom(1.0, true);
    }

    // Handle keyboard events
    function handleKeydown(e) {
        if (isEditableTarget(e.target)) return;

        const isModified = e.ctrlKey || e.metaKey;

        if (isModified && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            e.stopPropagation();
            applyZoom(currentScale + SCALE_STEP);
            return false;
        }
        else if (isModified && (e.key === '-' || e.key === '_')) {
            e.preventDefault();
            e.stopPropagation();
            applyZoom(currentScale - SCALE_STEP);
            return false;
        }
        else if (isModified && e.key === '0') {
            e.preventDefault();
            e.stopPropagation();
            resetZoom();
            return false;
        }
        else if (!isModified && (e.key === 'r' || e.key === 'R')) {
            if (currentScale === 1.0) return;
            e.preventDefault();
            e.stopPropagation();
            resetZoom();
            return false;
        }
    }

    // Handle mouse wheel events
    function handleWheel(e) {
        if (!e.ctrlKey && !e.metaKey) return;

        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? -SCROLL_SCALE_STEP : SCROLL_SCALE_STEP;
        applyZoom(currentScale + delta);
        return false;
    }

    // Load settings from storage
    function loadSettings(callback) {
        const defaults = {
            minScale: 1.0,
            maxScale: 3.0,
            scaleStep: 0.1,
            scrollScaleStep: 0.2,
            panBoundary: 0.5
        };

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(defaults, (settings) => {
                MIN_SCALE = settings.minScale;
                MAX_SCALE = settings.maxScale;
                SCALE_STEP = settings.scaleStep;
                SCROLL_SCALE_STEP = settings.scrollScaleStep;
                PAN_BOUNDARY = settings.panBoundary;
                settingsLoaded = true;
                console.log('Google Slides Zoom settings loaded:', settings);
                if (callback) callback();
            });
        } else {
            // Use defaults if storage is not available
            settingsLoaded = true;
            if (callback) callback();
        }
    }

    // Initialize the extension
    function init() {
        // Load settings first, then initialize
        loadSettings(() => {
            // Wait for the viewer to be available
            const checkViewer = setInterval(() => {
                const viewer = getViewerContent();
                if (viewer) {
                    clearInterval(checkViewer);

                    // Add event listeners
                    document.addEventListener('keydown', handleKeydown, true);
                    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
                    window.addEventListener('resize', () => {
                        if (currentScale > 1.0) {
                            clampPan();
                            updatePan();
                        }
                    });

                    console.log('Google Slides Zoom extension activated');
                }
            }, 500);

            // Stop checking after 10 seconds
            setTimeout(() => clearInterval(checkViewer), 10000);
        });
    }

    // Wait for the page to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
