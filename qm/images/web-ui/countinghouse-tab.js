// Adds an "Accounting" row to QM's sidebar that shows the Countinghouse dashboard in the main pane.
// QM's web UI is a prebuilt bundle, so this attaches from outside: it re-inserts its row whenever the
// sidebar re-renders and overlays the dashboard frame exactly on top of #main.
const DASHBOARD = "__DASHBOARD_URL__/?embed=1";
const KEY = "countinghouse:accounting-open";
const ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 12V3.5A8.5 8.5 0 1 0 20.5 12z"/><path d="M13.2 10.8V2.3a8.5 8.5 0 0 1 8.5 8.5z"/></svg>';

let frame;
let open = sessionStorage.getItem(KEY) === "1";

function row() {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "navrow";
  b.id = "countinghouse-accounting";
  b.setAttribute("aria-label", "Accounting");
  b.innerHTML = `${ICON}<span>Accounting</span>`;
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(true);
  });
  return b;
}

function ensureRow() {
  const nav = document.querySelector("nav.quick-nav");
  if (!nav) return;
  let b = document.getElementById("countinghouse-accounting");
  if (!b) nav.appendChild((b = row()));
  b.classList.toggle("active", open);
  if (open) nav.querySelectorAll(".navrow.active:not(#countinghouse-accounting)").forEach((n) => n.classList.remove("active"));
}

function place() {
  const main = document.getElementById("main");
  if (!frame || !main) return;
  const r = main.getBoundingClientRect();
  Object.assign(frame.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
}

function setOpen(next) {
  open = next;
  sessionStorage.setItem(KEY, open ? "1" : "0");
  if (open && !frame) {
    frame = document.createElement("iframe");
    frame.src = DASHBOARD;
    frame.title = "Accounting";
    Object.assign(frame.style, { position: "fixed", border: "0", zIndex: "5", background: "var(--bg, transparent)", opacity: "0", transition: "opacity 180ms ease-out" });
    document.body.appendChild(frame);
    frame.addEventListener("load", () => (frame.style.opacity = "1"));
  }
  if (frame) frame.style.display = open ? "block" : "none";
  place();
  ensureRow();
}

// Any other sidebar navigation (Home, Search, a session, New session) leaves Accounting.
document.addEventListener(
  "click",
  (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!open || !t || t.closest("#countinghouse-accounting")) return;
    if (t.closest("#sidebar-top, .sidebar a, .sidebar button, .navrow")) setOpen(false);
  },
  true,
);

new MutationObserver(ensureRow).observe(document.documentElement, { childList: true, subtree: true });
new ResizeObserver(place).observe(document.documentElement);
addEventListener("resize", place);
const tick = () => {
  place();
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick); // follows the sidebar resize handle and collapse animation
if (open) setOpen(true);
ensureRow();
