const API_BASE = window.ACCESSLEARN_API_BASE || "http://127.0.0.1:8000";
const TOKEN_KEY = "accesslearn_token";
const USER_KEY = "accesslearn_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  applyAccessibility(user);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function cachedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setStatus(message, type = "") {
  const status = document.querySelector("[data-status]");
  if (!status) return;
  status.textContent = message;
  status.className = `status ${type}`.trim();
}

function applyAccessibility(user) {
  if (!user) return;
  
  // High contrast
  document.body.classList.toggle("high-contrast", Boolean(user.high_contrast));
  
  // Reduce motion
  document.body.classList.toggle("reduce-motion", Boolean(user.reduce_motion));
  
  // Dyslexia font
  document.body.classList.toggle("dyslexia-font", Boolean(user.dyslexia_font));
  
  // Font size
  const html = document.documentElement;
  html.classList.remove("text-size-sm", "text-size-md", "text-size-lg", "text-size-xl");
  html.classList.add(`text-size-${user.font_size || 'md'}`);
}

function collectPreferences(scope = document) {
  return {
    disability_profile: [...scope.querySelectorAll("input[name='disability_profile']:checked")].map((input) => input.value),
    preferred_format: scope.querySelector("[name='preferred_format']")?.value || "mixed",
    high_contrast: Boolean(scope.querySelector("[name='high_contrast']")?.checked),
    reduce_motion: Boolean(scope.querySelector("[name='reduce_motion']")?.checked),
    captions_required: Boolean(scope.querySelector("[name='captions_required']")?.checked),
    screen_reader_optimized: Boolean(scope.querySelector("[name='screen_reader_optimized']")?.checked),
    dyslexia_font: Boolean(scope.querySelector("[name='dyslexia_font']")?.checked),
    font_size: scope.querySelector("[name='font_size']")?.value || "medium",
  };
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token && options.auth !== false) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.detail || data.message || "Something went wrong.");
  }

  return data;
}

function bindPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      button.textContent = showing ? "Show" : "Hide";
      button.setAttribute("aria-pressed", String(!showing));
    });
  });
}

function fillPreferenceForm(user, scope = document) {
  if (!user) return;
  
  // Disability profile checkboxes
  scope.querySelectorAll("input[name='disability_profile']").forEach((input) => {
    input.checked = Boolean(user.disability_profile?.includes(input.value));
  });
  
  // Checkboxes/switches
  ["high_contrast", "reduce_motion", "captions_required", "screen_reader_optimized", "dyslexia_font"].forEach((name) => {
    const input = scope.querySelector(`[name='${name}']`);
    if (input) input.checked = Boolean(user[name]);
  });
  
  // Format selector
  const format = scope.querySelector("[name='preferred_format']");
  if (format) format.value = user.preferred_format || "mixed";
  
  // Font size selector
  const fontSize = scope.querySelector("[name='font_size']");
  if (fontSize) fontSize.value = user.font_size || "medium";
}

// ====== TEXT-TO-SPEECH (TTS) ENGINE ======
let speechUtterance = null;
let currentTextToRead = "";

function speakText(text, onBoundaryCallback = null, rate = 1.0) {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-Speech is not supported in this browser.");
    return;
  }
  
  window.speechSynthesis.cancel();
  
  if (!text) return;
  currentTextToRead = text;
  
  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.rate = rate;
  
  speechUtterance.onend = () => {
    speechUtterance = null;
    if (onBoundaryCallback) onBoundaryCallback(null);
  };
  
  speechUtterance.onerror = () => {
    speechUtterance = null;
    if (onBoundaryCallback) onBoundaryCallback(null);
  };

  if (onBoundaryCallback) {
    speechUtterance.onboundary = (event) => {
      if (event.name === "word") {
        onBoundaryCallback(event.charIndex);
      }
    };
  }
  
  window.speechSynthesis.speak(speechUtterance);
}

function pauseSpeaking() {
  if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      return "resumed";
    } else {
      window.speechSynthesis.pause();
      return "paused";
    }
  }
  return null;
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    speechUtterance = null;
  }
}

// ====== DYSLEXIA READING RULER ======
let rulerElement = null;

function setupReadingRuler() {
  rulerElement = document.createElement("div");
  rulerElement.className = "reading-ruler";
  document.body.appendChild(rulerElement);
  
  document.addEventListener("mousemove", (event) => {
    if (document.body.classList.contains("ruler-active") && rulerElement) {
      rulerElement.style.top = `${event.clientY - 12}px`;
    }
  });
}

function toggleReadingRuler(active) {
  document.body.classList.toggle("ruler-active", active);
}

// ====== SANITIZE HELPERS ======
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  bindPasswordToggles();
  const user = cachedUser();
  if (user) {
    applyAccessibility(user);
  }
  setupReadingRuler();
});
