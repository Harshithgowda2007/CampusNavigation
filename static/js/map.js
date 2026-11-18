const startSelect = document.getElementById("start");
const endSelect = document.getElementById("end");
const map = document.getElementById("map");
const svg = document.getElementById("paths");
const result = document.getElementById("result");
let campus = null;
let currentRoute = [];

async function init() {
  const response = await fetch("/api/campus");
  campus = await response.json();
  campus.locations.forEach(loc => {
    [startSelect, endSelect].forEach(select => {
      const option = document.createElement("option");
      option.value = loc.id;
      option.textContent = loc.name;
      select.appendChild(option);
    });
  });
  startSelect.value = "gate";
  endSelect.value = "library";
  drawMap();
}
function locationById(id) { return campus.locations.find(loc => loc.id === id); }
function drawMap() {
  svg.innerHTML = "";
  campus.paths.forEach(edge => {
    const a = locationById(edge.from), b = locationById(edge.to);
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
    line.setAttribute("class","path-line");
    svg.appendChild(line);
  });
  if (currentRoute.length > 1) {
    const points = currentRoute.map(loc => `${loc.x},${loc.y}`).join(" ");
    const poly = document.createElementNS("http://www.w3.org/2000/svg","polyline");
    poly.setAttribute("points", points); poly.setAttribute("class","route-line");
    svg.appendChild(poly);
  }
  map.querySelectorAll(".marker").forEach(el => el.remove());
  campus.locations.forEach(loc => {
    const marker = document.createElement("button");
    marker.className = "marker";
    marker.type = "button";
    marker.textContent = loc.name;
    marker.style.left = `${loc.x}%`; marker.style.top = `${loc.y}%`;
    marker.setAttribute("aria-label", `Select ${loc.name}`);
    if (loc.id === startSelect.value) marker.classList.add("active-start");
    if (loc.id === endSelect.value) marker.classList.add("active-end");
    if (currentRoute.some(p => p.id === loc.id)) marker.classList.add("on-route");
    marker.addEventListener("click", () => {
      if (document.activeElement === startSelect) startSelect.value = loc.id;
      else if (document.activeElement === endSelect) endSelect.value = loc.id;
      else endSelect.value = loc.id;
      drawMap();
    });
    map.appendChild(marker);
  });
}
function showError(message) {
  result.innerHTML = `<div class="result-heading">Unable to calculate route</div><p>${message}</p>`;
}
document.getElementById("routeBtn").addEventListener("click", async () => {
  const response = await fetch("/api/route", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({start:startSelect.value,end:endSelect.value})
  });
  const data = await response.json();
  if (!response.ok) { showError(data.error || "Something went wrong."); currentRoute=[]; drawMap(); return; }
  currentRoute = data.route;
  drawMap();
  const names = data.route.map(loc => loc.name);
  result.innerHTML = `
    <div class="result-heading">Shortest route found ✓</div>
    <div class="metrics">
      <div class="metric"><b>${data.distance_m} m</b><small>Walking distance</small></div>
      <div class="metric"><b>${data.walking_minutes} min</b><small>Estimated time</small></div>
    </div>
    <p>${data.message}</p>
    <ol class="steps">${names.map(name => `<li>${name}</li>`).join("")}</ol>`;
});
document.getElementById("resetBtn").addEventListener("click", () => {
  currentRoute = []; startSelect.value = "gate"; endSelect.value = "library";
  result.innerHTML = '<div class="result-heading">Your route will appear here</div><p>Select two locations to get directions.</p>';
  drawMap();
});
[startSelect,endSelect].forEach(el => el.addEventListener("change", drawMap));
init().catch(() => showError("Could not load campus data. Check that the Flask server is running."));
