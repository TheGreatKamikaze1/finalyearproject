// ====== CONFIG ======
const API_BASE = (
  String(window.API_BASE || "").trim() ||
  String(localStorage.getItem("api_base") || "").trim() ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

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

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
  } catch {
    throw new Error(
      `Cannot reach the API at ${API_BASE}. Check frontend/assets/config.js and Railway CORS_ORIGINS.`
    );
  }

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
  document.body.classList.toggle("dyslexia-friendly", !!settings.dyslexia_friendly);
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
  if (!t) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

async function getMe(){
  return api("/users/me");
}

// ====== UI HELPERS ======
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function setStatus(el, msg, isError=false){
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle("is-error", !!isError);
}

function initPasswordToggles(){
  qsa("[data-toggle-password]").forEach((btn) => {
    const target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target) return;
    btn.addEventListener("click", () => {
      const showing = target.type === "text";
      target.type = showing ? "password" : "text";
      btn.textContent = showing ? "Show" : "Hide";
      btn.setAttribute("aria-pressed", String(!showing));
    });
  });
}

if (document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initPasswordToggles);
} else {
  initPasswordToggles();
}

// ====== NAV BAR ======
async function renderHeader(){
  const headerMe = qs("#headerMe");
  const logoutBtn = qs("#logoutBtn");
  const instructorLinks = qsa("[data-instructor-link]");
  if (!headerMe) return;

  const t = getToken();
  if (!t){
    headerMe.textContent = "Not logged in";
    if (logoutBtn) logoutBtn.classList.add("hidden");
    instructorLinks.forEach(link => link.classList.add("hidden"));
    return;
  }

  try{
    const me = await getMe();
    headerMe.textContent = `${me.full_name} (${me.role})`;
    instructorLinks.forEach(link => {
      link.classList.toggle("hidden", !["instructor", "admin"].includes(me.role));
    });
    if (logoutBtn){
      logoutBtn.classList.remove("hidden");
      logoutBtn.onclick = () => {
        clearToken();
        window.location.href = "login.html";
      };
    }
    return me;
  }catch{
    headerMe.textContent = "Session invalid";
    if (logoutBtn) logoutBtn.classList.add("hidden");
    instructorLinks.forEach(link => link.classList.add("hidden"));
  }
}

function redirectForRole(me){
  if (["instructor", "admin"].includes(me.role)){
    window.location.href = "instructor.html";
    return;
  }
  window.location.href = "index.html";
}

function initAccessibilityControls(settings){
  if (!qs("#contrastSelect")) return;

  if (settings){
    qs("#contrastSelect").value = settings.contrast_mode;
    qs("#reduceMotion").checked = !!settings.reduce_motion;
    qs("#ttsEnabled").checked = !!settings.tts_enabled;
    qs("#dyslexiaFriendly").checked = !!settings.dyslexia_friendly;
  }

  let fontScale = settings?.font_scale ?? 1.0;
  const updateFontBadge = () => {
    const el = qs("#fontScaleValue");
    if (el) el.textContent = `Font ${Math.round(fontScale * 100)}%`;
  };
  updateFontBadge();

  qs("#fontPlus").onclick = async () => {
    fontScale = Math.min(2.0, Math.round((fontScale + 0.1) * 10) / 10);
    await updateAccessibility({ font_scale: fontScale });
    updateFontBadge();
  };
  qs("#fontMinus").onclick = async () => {
    fontScale = Math.max(0.7, Math.round((fontScale - 0.1) * 10) / 10);
    await updateAccessibility({ font_scale: fontScale });
    updateFontBadge();
  };
  qs("#contrastSelect").onchange = async (e) => updateAccessibility({ contrast_mode: e.target.value });
  qs("#reduceMotion").onchange = async (e) => updateAccessibility({ reduce_motion: e.target.checked });
  qs("#ttsEnabled").onchange = async (e) => updateAccessibility({ tts_enabled: e.target.checked });
  qs("#dyslexiaFriendly").onchange = async (e) => updateAccessibility({ dyslexia_friendly: e.target.checked });
}

// ====== COURSES ======
async function loadStudentDashboard(me){
  if (["instructor", "admin"].includes(me.role)){
    window.location.href = "instructor.html";
    return;
  }

  const [courses, enrolledCourses, progress] = await Promise.all([
    api("/courses"),
    api("/courses/me/enrollments"),
    api("/progress/me"),
  ]);
  const enrolledIds = new Set(enrolledCourses.map(course => course.id));

  qs("#enrolledCount").textContent = enrolledCourses.length;
  qs("#completedCount").textContent = progress.filter(x => x.status === "completed").length;
  qs("#progressCount").textContent = progress.filter(x => x.status === "in_progress").length;
  qs("#courseCount").textContent = `${courses.length} ${courses.length === 1 ? "course" : "courses"}`;

  renderCourseCollection(qs("#enrolledCourses"), enrolledCourses, {
    mode: "enrolled",
    emptyTitle: "You have not enrolled in any course yet",
    emptyText: "Browse the course catalog below and enroll in a published course to start learning.",
  });

  renderCourseCollection(qs("#coursesList"), courses, {
    mode: "catalog",
    enrolledIds,
    emptyTitle: "No published courses yet",
    emptyText: "Ask an instructor to publish a course, or use the instructor studio to create demo content.",
  });
}

function renderCourseCollection(container, courses, options = {}){
  const { mode = "catalog", enrolledIds = new Set(), emptyTitle, emptyText } = options;
  container.innerHTML = "";

  if (!courses.length){
    container.innerHTML = `
      <div class="empty-state">
        <strong>${escapeHtml(emptyTitle || "No courses found")}</strong>
        <p class="smallmuted">${escapeHtml(emptyText || "Courses will appear here when they are available.")}</p>
      </div>
    `;
    return;
  }

  courses.forEach(course => {
    const enrolled = enrolledIds.has(course.id) || mode === "enrolled";
    const card = document.createElement("article");
    card.className = "course-card learning-card";
    card.innerHTML = `
      <div class="course-card-top">
        <span class="badge">${escapeHtml(course.course_code || "Course")}</span>
        <span class="badge ${enrolled ? "badge-success" : "badge-muted"}">${enrolled ? "Enrolled" : "Available"}</span>
      </div>
      <h3>${escapeHtml(course.title)}</h3>
      <p>${escapeHtml(course.description || "No description has been added for this course.")}</p>
      <div class="toolbar">
        ${mode === "catalog" && !enrolled ? `<button type="button" data-enroll="${escapeAttr(course.id)}">Enroll</button>` : ""}
        <a class="button-link secondary" href="course.html?id=${encodeURIComponent(course.id)}">${enrolled ? "Continue learning" : "View course"}</a>
      </div>
    `;
    container.appendChild(card);
  });

  qsa("button[data-enroll]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try{
        await api(`/courses/${btn.dataset.enroll}/enroll`, { method:"POST" });
        await loadStudentDashboard(await getMe());
      }catch(e){
        alert(e.message);
      }
    });
  });
}

async function loadCourses(listEl){
  const me = await getMe();
  const courses = await api("/courses");
  listEl.innerHTML = "";

  if (!courses.length){
    listEl.innerHTML = `
      <div class="empty-state">
        <strong>No courses yet</strong>
        <p class="smallmuted">Instructors can create and publish courses from the instructor studio.</p>
      </div>
    `;
    return { me, totalCourses: 0, publishedCourses: 0, draftCourses: 0 };
  }

  courses.forEach(c => {
    const div = document.createElement("div");
    div.className = "course-card";
    div.setAttribute("role", "article");
    div.innerHTML = `
      <div class="course-card-top">
        <span class="badge">${escapeHtml(c.course_code || "Course")}</span>
        <span class="badge ${c.is_published ? "badge-success" : "badge-muted"}">${c.is_published ? "Published" : "Draft"}</span>
      </div>
      <h3>${escapeHtml(c.title)}</h3>
      <p>${escapeHtml(c.description || "No description")}</p>
      <div class="toolbar">
        <a href="course.html?id=${encodeURIComponent(c.id)}">Open course</a>
        ${me.role === "student" ? `<button data-enroll="${c.id}">Enroll</button>` : ""}
        ${["instructor", "admin"].includes(me.role) ? `<a href="instructor.html">Manage</a>` : ""}
      </div>
    `;
    listEl.appendChild(div);
  });

  // enroll buttons
  qsa("button[data-enroll]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try{
        await api(`/courses/${btn.dataset.enroll}/enroll`, { method:"POST" });
        btn.textContent = "Enrolled";
        btn.disabled = true;
      }catch(e){
        alert(e.message);
      }
    });
  });

  return {
    me,
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.is_published).length,
    draftCourses: courses.filter(c => !c.is_published).length,
  };
}

// ====== COURSE PAGE ======
async function loadCoursePage(courseId){
  const course = await api(`/courses/${courseId}`);
  qs("#courseTitle").textContent = course.title;
  qs("#courseDesc").textContent = course.description || "No description";
  qs("#courseCode").textContent = course.course_code || "Course";
  qs("#coursePublished").textContent = course.is_published ? "Published" : "Draft";
  qs("#coursePublished").classList.toggle("badge-success", !!course.is_published);

  const wrap = qs("#materialsWrap");
  wrap.innerHTML = "";
  let mats = [];
  try{
    mats = await api(`/courses/${courseId}/materials`);
  }catch(e){
    wrap.innerHTML = `
      <div class="empty-state">
        <strong>Enroll to access course materials</strong>
        <p class="smallmuted">This course is available, but materials are unlocked after enrollment.</p>
        <div class="toolbar" style="margin-top:12px;">
          <button type="button" id="courseEnrollBtn">Enroll in course</button>
        </div>
      </div>
    `;
    const enrollBtn = qs("#courseEnrollBtn");
    if (enrollBtn){
      enrollBtn.onclick = async () => {
        await api(`/courses/${courseId}/enroll`, { method: "POST" });
        await loadCoursePage(courseId);
      };
    }
    return;
  }

  if (!mats.length){
    wrap.innerHTML = `
      <div class="empty-state">
        <strong>No materials in this course yet</strong>
        <p class="smallmuted">Instructors can add text, PDF, audio, and video resources with transcripts or captions.</p>
      </div>
    `;
    return;
  }

  mats.forEach(m => {
    const card = document.createElement("div");
    card.className = "material-card";
    card.innerHTML = `
      <div>
        <span class="badge">${escapeHtml(typeLabel(m.material_type))}</span>
        <h3>${escapeHtml(m.title)}</h3>
      </div>
      <div class="toolbar">
        <button data-open="${m.id}">Open</button>
        <button data-progress="${m.id}" data-status="in_progress">Mark in progress</button>
        <button data-progress="${m.id}" data-status="completed">Mark completed</button>
      </div>
      <div id="viewer-${m.id}" class="material-viewer hidden"></div>
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
        alert("Saved");
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
    qsa(".instructor-panel").forEach((el) => el.classList.add("hidden"));
    return false;
  }

  const courses = await api("/courses");
  courseSelect.innerHTML = courses.map(c => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.title)}</option>`).join("");
  return true;
}

async function refreshInstructorWorkspace(selectedCourseId=null){
  const courses = await api("/courses");
  const courseSelect = qs("#courseSelect");
  courseSelect.innerHTML = courses.map(c => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.title)}</option>`).join("");
  if (selectedCourseId && courses.some(c => c.id === selectedCourseId)){
    courseSelect.value = selectedCourseId;
  }

  qs("#instructorCourseCount").textContent = courses.length;
  qs("#instructorPublishedCount").textContent = courses.filter(c => c.is_published).length;
  qs("#instructorDraftCount").textContent = courses.filter(c => !c.is_published).length;

  renderCourseManager(courses);
  renderSelectedCourseStatus(courses.find(course => course.id === courseSelect.value) || null);
  await renderSelectedMaterials(courseSelect.value);
}

function renderCourseManager(courses){
  const wrap = qs("#courseManager");
  if (!courses.length){
    wrap.innerHTML = `
      <div class="empty-state">
        <strong>No courses yet</strong>
        <p class="smallmuted">Create a course manually or use the demo course button for your presentation.</p>
      </div>
    `;
    return;
  }

  wrap.innerHTML = "";
  courses.forEach((course) => {
    const card = document.createElement("article");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-card-top">
        <span class="badge">${escapeHtml(course.course_code || "Course")}</span>
        <span class="badge ${course.is_published ? "badge-success" : "badge-muted"}">${course.is_published ? "Published" : "Draft"}</span>
      </div>
      <h3>${escapeHtml(course.title)}</h3>
      <p>${escapeHtml(course.description || "No description")}</p>
      <div class="toolbar">
        <button type="button" data-select-course="${escapeAttr(course.id)}">Select</button>
        <a href="course.html?id=${encodeURIComponent(course.id)}">Preview</a>
        <button type="button" data-publish-course="${escapeAttr(course.id)}" data-published="${course.is_published ? "true" : "false"}">
          ${course.is_published ? "Unpublish" : "Publish"}
        </button>
      </div>
    `;
    wrap.appendChild(card);
  });

  qsa("[data-select-course]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      qs("#courseSelect").value = btn.dataset.selectCourse;
      const courses = await api("/courses");
      renderSelectedCourseStatus(courses.find(course => course.id === btn.dataset.selectCourse) || null);
      await renderSelectedMaterials(btn.dataset.selectCourse);
    });
  });

  qsa("[data-publish-course]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const isPublished = btn.dataset.published === "true";
      await api(`/courses/${btn.dataset.publishCourse}`, {
        method: "PATCH",
        body: { is_published: !isPublished }
      });
      await refreshInstructorWorkspace(btn.dataset.publishCourse);
    });
  });
}

async function renderSelectedMaterials(courseId){
  const wrap = qs("#selectedMaterials");
  if (!wrap) return;
  if (!courseId){
    wrap.innerHTML = `
      <div class="empty-state">
        <strong>No course selected</strong>
        <p class="smallmuted">Choose a course from the material form or create a new course.</p>
      </div>
    `;
    return;
  }

  const mats = await api(`/courses/${courseId}/materials`);
  if (!mats.length){
    wrap.innerHTML = `
      <div class="empty-state">
        <strong>No materials yet</strong>
        <p class="smallmuted">Add text, PDF, audio, or video content from the material form.</p>
      </div>
    `;
    return;
  }

  wrap.innerHTML = "";
  mats.forEach((m) => {
    const card = document.createElement("article");
    card.className = "material-card";
    card.innerHTML = `
      <div>
        <span class="badge">${escapeHtml(typeLabel(m.material_type))}</span>
        <h3>${escapeHtml(m.title)}</h3>
        <p class="smallmuted">${escapeHtml(m.content_text ? m.content_text.slice(0, 120) : (m.file_url || ""))}</p>
      </div>
      <div class="toolbar">
        <button type="button" data-fill-a11y="${escapeAttr(m.id)}">Use for captions</button>
        <button type="button" data-delete-material="${escapeAttr(m.id)}">Delete</button>
      </div>
    `;
    wrap.appendChild(card);
  });

  qsa("[data-fill-a11y]").forEach((btn) => {
    btn.addEventListener("click", () => {
      qs("#a11y_mat_id").value = btn.dataset.fillA11y;
      qs("#a11y_url").focus();
    });
  });

  qsa("[data-delete-material]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await api(`/materials/${btn.dataset.deleteMaterial}`, { method: "DELETE" });
      await renderSelectedMaterials(qs("#courseSelect").value);
    });
  });
}

function renderSelectedCourseStatus(course){
  const wrap = qs("#selectedCourseStatus");
  if (!wrap) return;
  if (!course){
    wrap.innerHTML = `<span class="badge badge-muted">No course selected</span>`;
    return;
  }
  wrap.innerHTML = `
    <span class="badge">${escapeHtml(course.course_code || "Course")}</span>
    <span class="badge ${course.is_published ? "badge-success" : "badge-muted"}">${course.is_published ? "Published" : "Draft"}</span>
  `;
}

async function createDemoCourse(){
  const suffix = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const course = await api("/courses", {
    method: "POST",
    body: {
      course_code: "DIS-201",
      title: `Inclusive Digital Learning Demo (${suffix})`,
      description: "A demonstration course showing accessible text lessons, keyboard-friendly navigation, learner progress tracking, captions, transcripts, and personal accessibility settings."
    }
  });

  const materials = [
    {
      title: "Lesson 1: What inclusive e-learning means",
      material_type: "text",
      content_text: "Inclusive e-learning gives students with visual, hearing, motor, cognitive, and reading disabilities equal access to learning materials. This platform demonstrates adjustable text size, high contrast, reduced motion, text-to-speech support, captions, transcripts, and progress tracking."
    },
    {
      title: "Lesson 2: Accessible study checklist",
      material_type: "text",
      content_text: "Before publishing a lesson, check that headings are clear, text has good contrast, videos include captions, audio includes transcripts, buttons can be reached with the keyboard, and students can save their learning progress."
    },
    {
      title: "Audio resource: Course orientation",
      material_type: "audio",
      file_url: "https://www.w3schools.com/html/horse.mp3"
    }
  ];

  for (const material of materials){
    await api(`/courses/${course.id}/materials`, { method: "POST", body: material });
  }

  return api(`/courses/${course.id}`, {
    method: "PATCH",
    body: { is_published: true }
  });
}

function typeLabel(type){
  return {
    text: "Text lesson",
    pdf: "PDF",
    video: "Video",
    audio: "Audio",
  }[type] || type;
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
