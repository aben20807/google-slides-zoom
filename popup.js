// Popup script for Google Slides Zoom extension

const DEFAULT_SETTINGS = {
  minScale: 1.0,
  maxScale: 3.0,
  scaleStep: 0.1,
  scrollScaleStep: 0.2,
  panBoundary: 0.3
};

const minScaleInput = document.getElementById('minScale');
const maxScaleInput = document.getElementById('maxScale');
const scaleStepInput = document.getElementById('scaleStep');
const scrollScaleStepInput = document.getElementById('scrollScaleStep');
const panBoundaryInput = document.getElementById('panBoundary');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');

function parseValue(inputValue, defaultValue) {
  const parsed = parseFloat(inputValue);
  return isNaN(parsed) ? defaultValue : parsed;
}

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    minScaleInput.value = settings.minScale;
    maxScaleInput.value = settings.maxScale;
    scaleStepInput.value = settings.scaleStep;
    scrollScaleStepInput.value = settings.scrollScaleStep;
    panBoundaryInput.value = settings.panBoundary;
  });
}

function saveSettings() {
  const settings = {
    minScale: parseValue(minScaleInput.value, DEFAULT_SETTINGS.minScale),
    maxScale: parseValue(maxScaleInput.value, DEFAULT_SETTINGS.maxScale),
    scaleStep: parseValue(scaleStepInput.value, DEFAULT_SETTINGS.scaleStep),
    scrollScaleStep: parseValue(scrollScaleStepInput.value, DEFAULT_SETTINGS.scrollScaleStep),
    panBoundary: parseValue(panBoundaryInput.value, DEFAULT_SETTINGS.panBoundary)
  };

  if (settings.minScale > settings.maxScale) {
    showStatus('error', 'Min cannot be greater than max');
    return;
  }

  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime.lastError) {
      showStatus('error', 'Failed to save');
    } else {
      showStatus('success', 'Saved! Refresh slides to apply.');
    }
  });
}

function resetSettings() {
  minScaleInput.value = DEFAULT_SETTINGS.minScale;
  maxScaleInput.value = DEFAULT_SETTINGS.maxScale;
  scaleStepInput.value = DEFAULT_SETTINGS.scaleStep;
  scrollScaleStepInput.value = DEFAULT_SETTINGS.scrollScaleStep;
  panBoundaryInput.value = DEFAULT_SETTINGS.panBoundary;
  
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    showStatus('success', 'Reset to defaults');
  });
}

function showStatus(type, message) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}

saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetSettings);

document.addEventListener('DOMContentLoaded', loadSettings);
