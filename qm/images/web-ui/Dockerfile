# QM web UI pinned by CLI 0.1.13, plus an "Accounting" sidebar tab that shows the Countinghouse
# dashboard inside QM. The script attaches to the prebuilt bundle; the CSP allows framing the dashboard.
FROM ghcr.io/yc-software/qm/web-ui@sha256:eb4fda23cbeba3b7884efdea8fc815558ecfecb1564c8e36f5c6b1ae6f742d8e
ARG DASHBOARD_URL=http://localhost:5190
USER root
COPY countinghouse-tab.js /app/dist-web/countinghouse-tab.js
RUN DASHBOARD_URL="$DASHBOARD_URL" node -e '\
const fs = require("fs"), url = process.env.DASHBOARD_URL; \
const tab = "/app/dist-web/countinghouse-tab.js"; fs.writeFileSync(tab, fs.readFileSync(tab, "utf8").replace("__DASHBOARD_URL__", url)); \
const html = "/app/dist-web/index.html", h = fs.readFileSync(html, "utf8"); \
if (!h.includes("</body>")) throw new Error("index.html has no </body>"); \
fs.writeFileSync(html, h.replace("</body>", "<script type=\"module\" src=\"/countinghouse-tab.js\"></script></body>")); \
const srv = "/app/server/index.ts", s = fs.readFileSync(srv, "utf8"), a = "\"frame-src '"'"'self'"'"' data: https:\""; \
if (s.split(a).length !== 2) throw new Error("frame-src anchor not found once"); \
fs.writeFileSync(srv, s.replace(a, a.slice(0, -1) + " " + url + "\""));'
USER node
