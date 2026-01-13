// Google Slides Zoom Extension
(function() {
  'use strict';

  // Only run in presentation mode
  if (!window.location.href.includes('/present')) {
    return;
  }

  let currentScale = 1.0;
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3.0;
  const SCALE_STEP = 0.1;
  const SCROLL_SCALE_STEP = 0.2;
  let isApplyingZoom = false;

  // Function to find the viewer content element
  function getViewerContent() {
    return document.querySelector('.sketchyViewerContent');
  }

  // Function to apply zoom with smooth transition
  function applyZoom(scale) {
    if (isApplyingZoom) return;
    isApplyingZoom = true;

    const viewer = getViewerContent();
    if (!viewer) {
      isApplyingZoom = false;
      return;
    }

    currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
    
    viewer.style.transition = 'transform 0.2s ease-out';
    viewer.style.transform = `scale(${currentScale})`;
    viewer.style.transformOrigin = 'center center';
    
    showZoomIndicator(currentScale);
    
    setTimeout(() => {
      isApplyingZoom = false;
    }, 50);
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
    applyZoom(1.0);
  }

  // Handle keyboard events
  function handleKeydown(e) {
    if (!e.ctrlKey && !e.metaKey) return;

    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      e.stopPropagation();
      applyZoom(currentScale + SCALE_STEP);
      return false;
    }
    else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      e.stopPropagation();
      applyZoom(currentScale - SCALE_STEP);
      return false;
    }
    else if (e.key === '0') {
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

  // Handle Escape key to reset zoom
  function handleEscape(e) {
    if (e.key === 'Escape' && currentScale !== 1.0) {
      resetZoom();
    }
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
        document.addEventListener('keydown', handleEscape, true);
        document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
        
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
