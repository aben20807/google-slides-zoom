// Google Slides Zoom Extension
(function () {
    'use strict';

    // Only run in presentation mode
    if (!window.location.href.includes('/present')) {
        return;
    }

    let currentScale = 1.0;
    const MIN_SCALE = 1.0;
    const MAX_SCALE = 3.0;
    const SCALE_STEP = 0.1;
    const SCROLL_SCALE_STEP = 0.2;
    let isApplyingZoom = false;
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

        const scaledWidth = baseWidth * currentScale;
        const scaledHeight = baseHeight * currentScale;
        
        // Limit panning to half the slide dimensions
        // This allows users to drag to show 1/4 of the slide in each corner
        const maxPanX = scaledWidth / 2;
        const maxPanY = scaledHeight / 2;

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

    // Initialize the extension
    function init() {
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
    }

    // Wait for the page to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
