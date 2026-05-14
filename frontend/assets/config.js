// Set this to your deployed backend URL when the frontend is not running locally.
// Example:
// window.API_BASE = "https://your-backend.up.railway.app";
const apiBaseFromUrl = new URLSearchParams(window.location.search).get("api_base");
if (apiBaseFromUrl) {
  localStorage.setItem("api_base", apiBaseFromUrl);
}
window.API_BASE = window.API_BASE || localStorage.getItem("api_base") || "https://finalyearback-production.up.railway.app";
