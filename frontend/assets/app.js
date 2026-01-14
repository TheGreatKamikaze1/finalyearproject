// ====== CONFIG ======
const API_BASE = "http://127.0.0.1:8000"; // change if your backend is hosted

// ====== TOKEN HELPERS ======
function setToken(token){ localStorage.setItem("token", token); }
function getToken(){ return localStorage.getItem("token"); }
function clearToken(){ localStorage.removeItem("token"); }

function authHeaders(){
  const t = getToken();
  return t ? { "Authorization": `Bearer ${t}` } : {};
}

// ====== BASIC API ======
async function api(path, { method="GET", body=null, auth=true } = {}){
  const headers = { "Content-Type": "application/json" };
  if (auth) Object.assign(headers, authHeaders());

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok){
    const msg = data?.detail || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ====== ACCESSIBILITY ======
function applySettingsToUI(settings){
  // font
  if (typeof settings.font_scale === "number"){
    document.documentElement.style.setProperty("--fontScale", settings.font_scale.toString());
  }
  // contrast
  document.body.classList.remove("contrast-high", "contrast-dark");
  if (settings.contrast_mode === "high") document.body.classList.add("contrast-high");
  if (settings.contrast_mode === "dark") document.body.classList.add("contrast-dark");

  // reduce motion
  document.body.classList.toggle("reduce-motion", !!settings.reduce_motion);
}

async function loadAccessibility(){
  try{
    const s = await api("/accessibility/me");
    applySettingsToUI(s);

    // Keep a cached copy for pages that want it
    localStorage.setItem("a11y_settings", JSON.stringify(s));
    return s;
  }catch(e){
    // Not logged in or endpoint unavailable
    return null;
  }
}

async function updateAccessibility(patch){
  const s = await api("/accessibility/me", { method:"PUT", body: patch });
  applySettingsToUI(s);
  localStorage.setItem("a11y_settings", JSON.stringify(s));
  return s;
}

// ====== TEXT TO SPEECH (TTS) ======
function speakText(text){
  if (!("speechSynthesis" in window)) {
    alert("Text-to-Speech not supported on this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

function stopSpeaking(){
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

// ====== AUTH GUARDS ======
async function requireLogin(){
  const t = getToken();
  if (!t) window.location.href = "login.html";
}

async function getMe(){
  return api("/users/me");
}

// ====== UI HELPERS ======
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function setStatus(el, msg, isError=false){
  el.textContent = msg;
  el.style.color = isError ? "crimson" : "inherit";
}

// ====== NAV BAR ======
async function renderHeader(){
  const headerMe = qs("#headerMe");
  const logoutBtn = qs("#logoutBtn");
  if (!headerMe) return;

  const t = getToken();
  if (!t){
    headerMe.textContent = "Not logged in";
    if (logoutBtn) logoutBtn.classList.add("hidden");
    return;
  }

  try{
    const me = await getMe();
    headerMe.textContent = `${me.full_name} (${me.role})`;
    if (logoutBtn){
      logoutBtn.classList.remove("hidden");
      logoutBtn.onclick = () => {
        clearToken();
        window.location.href = "login.html";
      };
    }
  }catch{
    headerMe.textContent = "Session invalid";
    if (logoutBtn) logoutBtn.classList.add("hidden");
  }
}

// ====== COURSES ======
async function loadCourses(listEl){
  const me = await getMe();
  const courses = await api("/courses");
  listEl.innerHTML = "";

  courses.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.setAttribute("role", "article");
    div.innerHTML = `
      <h3 style="margin:0 0 6px 0;">${escapeHtml(c.title)}</h3>
      <div class="smallmuted">${escapeHtml(c.course_code || "")}</div>
      <p>${escapeHtml(c.description || "No description")}</p>
      <div class="toolbar">
        <a href="course.html?id=${encodeURIComponent(c.id)}">Open course</a>
        ${me.role === "student" ? `<button data-enroll="${c.id}">Enroll</button>` : ""}
      </div>
    `;
    listEl.appendChild(div);
  });

  // enroll buttons
  qsa("button[data-enroll]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try{
        await api(`/courses/${btn.dataset.enroll}/enroll`, { method:"POST" });
        btn.textContent = "Enrolled ✅";
        btn.disabled = true;
      }catch(e){
        alert(e.message);
      }
    });
  });
}

// ====== COURSE PAGE ======
async function loadCoursePage(courseId){
  const course = await api(`/courses/${courseId}`);
  qs("#courseTitle").textContent = course.title;
  qs("#courseDesc").textContent = course.description || "No description";

  const mats = await api(`/courses/${courseId}/materials`);
  const wrap = qs("#materialsWrap");
  wrap.innerHTML = "";

  mats.forEach(m => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3 style="margin:0 0 6px 0;">${escapeHtml(m.title)}</h3>
      <div class="smallmuted">Type: ${escapeHtml(m.material_type)}</div>
      <div class="toolbar">
        <button data-open="${m.id}">Open</button>
        <button data-progress="${m.id}" data-status="in_progress">Mark in progress</button>
        <button data-progress="${m.id}" data-status="completed">Mark completed</button>
      </div>
      <div id="viewer-${m.id}" class="hidden" style="margin-top:10px;"></div>
    `;
    wrap.appendChild(card);
  });

  // open material
  qsa("button[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openMaterial(btn.dataset.open));
  });

  // progress
  qsa("button[data-progress]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try{
        await api(`/progress/materials/${btn.dataset.progress}`, {
          method:"PUT",
          body:{ status: btn.dataset.status }
        });
        alert("Saved ✅");
      }catch(e){
        alert(e.message);
      }
    });
  });
}

async function openMaterial(materialId){
  const m = await api(`/materials/${materialId}`);
  const viewer = qs(`#viewer-${materialId}`);
  viewer.classList.remove("hidden");
  viewer.innerHTML = "";

  if (m.material_type === "text"){
    const text = m.content_text || "";
    viewer.innerHTML = `
      <div class="toolbar">
        <button id="tts-${materialId}">Read aloud</button>
        <button id="ttsstop-${materialId}">Stop</button>
      </div>
      <div id="text-${materialId}" tabindex="0" aria-label="Text content">
        ${escapeHtml(text).replaceAll("\n","<br>")}
      </div>
    `;
    qs(`#tts-${materialId}`).onclick = () => speakText(text);
    qs(`#ttsstop-${materialId}`).onclick = () => stopSpeaking();
    return;
  }

  if (m.material_type === "pdf"){
    viewer.innerHTML = `
      <p><a href="${escapeAttr(m.file_url)}" target="_blank" rel="noopener">Open PDF in new tab</a></p>
      <iframe title="PDF viewer" src="${escapeAttr(m.file_url)}" style="width:100%;height:520px;border:1px solid var(--border);border-radius:10px;"></iframe>
    `;
    return;
  }

  if (m.material_type === "audio"){
    viewer.innerHTML = `
      <audio controls src="${escapeAttr(m.file_url)}" style="width:100%"></audio>
    `;
    return;
  }

  if (m.material_type === "video"){
    // Load captions/transcripts records
    const acc = await api(`/materials/${materialId}/accessibility`);
    const caption = acc.find(x => x.kind === "captions");
    const transcript = acc.find(x => x.kind === "transcript");

    viewer.innerHTML = `
      <video controls style="width:100%; border-radius: 10px; border:1px solid var(--border);" src="${escapeAttr(m.file_url)}">
        ${caption ? `<track kind="captions" src="${escapeAttr(caption.file_url)}" srclang="${escapeAttr(caption.language)}" default />` : ""}
      </video>

      <div class="card" style="margin-top:12px;">
        <strong>Accessibility</strong>
        <ul>
          <li>Captions: ${caption ? `<a target="_blank" rel="noopener" href="${escapeAttr(caption.file_url)}">Open captions file</a>` : "Not provided"}</li>
          <li>Transcript: ${transcript ? `<a target="_blank" rel="noopener" href="${escapeAttr(transcript.file_url)}">Open transcript</a>` : "Not provided"}</li>
        </ul>
      </div>
    `;
    return;
  }

  viewer.innerHTML = `<p>Unknown material type.</p>`;
}

// ====== INSTRUCTOR PAGE ======
async function initInstructor(courseSelect){
  const me = await getMe();
  if (!["instructor", "admin"].includes(me.role)){
    qs("#instructorOnly").textContent = "This page is only for instructors/admins.";
    return;
  }

  const courses = await api("/courses");
  courseSelect.innerHTML = courses.map(c => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.title)}</option>`).join("");
}

// ====== SANITIZE HELPERS ======
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(str){ return escapeHtml(str); }
