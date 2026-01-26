// Options page script for Google Slides Zoom extension

const DEFAULT_SETTINGS = {
  minScale: 1.0,
  maxScale: 3.0,
  scaleStep: 0.1,
  scrollScaleStep: 0.2,
  panBoundary: 0.5
};

// DOM elements
const minScaleInput = document.getElementById('minScale');
const maxScaleInput = document.getElementById('maxScale');
const scaleStepInput = document.getElementById('scaleStep');
const scrollScaleStepInput = document.getElementById('scrollScaleStep');
const panBoundaryInput = document.getElementById('panBoundary');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');

// Preview elements
const previewRange = document.getElementById('previewRange');
const previewKeyStep = document.getElementById('previewKeyStep');
const previewScrollStep = document.getElementById('previewScrollStep');
const previewPan = document.getElementById('previewPan');

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    minScaleInput.value = settings.minScale;
    maxScaleInput.value = settings.maxScale;
    scaleStepInput.value = settings.scaleStep;
    scrollScaleStepInput.value = settings.scrollScaleStep;
    panBoundaryInput.value = settings.panBoundary;
    updatePreview();
  });
}

// Helper to parse float with fallback (handles 0 correctly)
function parseValue(inputValue, defaultValue) {
  const parsed = parseFloat(inputValue);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Save settings to storage
function saveSettings() {
  const settings = {
    minScale: parseValue(minScaleInput.value, DEFAULT_SETTINGS.minScale),
    maxScale: parseValue(maxScaleInput.value, DEFAULT_SETTINGS.maxScale),
    scaleStep: parseValue(scaleStepInput.value, DEFAULT_SETTINGS.scaleStep),
    scrollScaleStep: parseValue(scrollScaleStepInput.value, DEFAULT_SETTINGS.scrollScaleStep),
    panBoundary: parseValue(panBoundaryInput.value, DEFAULT_SETTINGS.panBoundary)
  };

  // Validate settings
  if (settings.minScale > settings.maxScale) {
    showStatus('error', 'Minimum scale cannot be greater than maximum scale!');
    return;
  }

  if (settings.minScale < 0.1) {
    showStatus('error', 'Minimum scale must be at least 0.1');
    return;
  }

  if (settings.maxScale > 10) {
    showStatus('error', 'Maximum scale cannot exceed 10');
    return;
  }

  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime.lastError) {
      showStatus('error', 'Failed to save settings: ' + chrome.runtime.lastError.message);
    } else {
      showStatus('success', 'Settings saved successfully! Refresh your Google Slides presentation to apply changes.');
    }
  });
}

// Reset to default settings
function resetSettings() {
  minScaleInput.value = DEFAULT_SETTINGS.minScale;
  maxScaleInput.value = DEFAULT_SETTINGS.maxScale;
  scaleStepInput.value = DEFAULT_SETTINGS.scaleStep;
  scrollScaleStepInput.value = DEFAULT_SETTINGS.scrollScaleStep;
  panBoundaryInput.value = DEFAULT_SETTINGS.panBoundary;
  updatePreview();
  
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    showStatus('success', 'Settings reset to defaults!');
  });
}

// Show status message
function showStatus(type, message) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 4000);
}

// Update preview display
function updatePreview() {
  const minScale = parseValue(minScaleInput.value, DEFAULT_SETTINGS.minScale);
  const maxScale = parseValue(maxScaleInput.value, DEFAULT_SETTINGS.maxScale);
  const scaleStep = parseValue(scaleStepInput.value, DEFAULT_SETTINGS.scaleStep);
  const scrollScaleStep = parseValue(scrollScaleStepInput.value, DEFAULT_SETTINGS.scrollScaleStep);
  const panBoundary = parseValue(panBoundaryInput.value, DEFAULT_SETTINGS.panBoundary);

  previewRange.textContent = `${Math.round(minScale * 100)}% - ${Math.round(maxScale * 100)}%`;
  previewKeyStep.textContent = `${Math.round(scaleStep * 100)}%`;
  previewScrollStep.textContent = `${Math.round(scrollScaleStep * 100)}%`;
  
  if (panBoundary === 0) {
    previewPan.textContent = 'No panning beyond edges';
  } else {
    previewPan.textContent = `${Math.round(panBoundary * 100)}% of slide`;
  }
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetSettings);

// Update preview on input change
[minScaleInput, maxScaleInput, scaleStepInput, scrollScaleStepInput, panBoundaryInput].forEach(input => {
  input.addEventListener('input', updatePreview);
});

// Load settings when page opens
document.addEventListener('DOMContentLoaded', loadSettings);
