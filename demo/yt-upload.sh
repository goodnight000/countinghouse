#!/usr/bin/env bash
# Uploads a video as Unlisted through the user's signed-in Chrome (AppleScript + page JS).
# usage: demo/yt-upload.sh /path/video.mp4 "Title"
set -euo pipefail
VIDEO=$1 TITLE=$2
DIR=$(cd "$(dirname "$0")" && pwd)
lsof -tiTCP:8765 -sTCP:LISTEN | xargs kill 2>/dev/null || true
python3 "$DIR/serve-video.py" "$VIDEO" & SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1

js() { # run JS in the upload tab; the tab is found by URL each time
  osascript - "$1" <<'OSA'
on run argv
  tell application "Google Chrome"
    repeat with w in windows
      repeat with t in tabs of w
        if URL of t contains "studio.youtube.com" then return execute t javascript (item 1 of argv)
      end repeat
    end repeat
  end tell
  return "no-studio-tab"
end run
OSA
}
wait_for() { # $1 = JS expression that returns "ok" when ready
  for _ in $(seq 1 90); do [ "$(js "$1" 2>/dev/null)" = "ok" ] && return 0; sleep 2; done
  echo "timed out waiting for: $1" >&2; return 1
}

osascript -e 'tell application "Google Chrome" to tell front window to make new tab with properties {URL:"https://www.youtube.com/upload"}' >/dev/null
wait_for 'document.querySelector("input[type=file]") ? "ok" : "no"'

js "(async () => {
  const blob = await (await fetch('http://127.0.0.1:8765/video.mp4')).blob();
  const file = new File([blob], 'countinghouse-demo.mp4', { type: 'video/mp4' });
  const dt = new DataTransfer(); dt.items.add(file);
  const input = document.querySelector('input[type=file]');
  input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  window.__chUpload = 'started';
})(); 'queued'" >/dev/null
wait_for 'document.querySelector("#title-textarea #textbox") ? "ok" : "no"'

DESC='Countinghouse: an open-source finance team for startups. It pulls Mercury, Brex, Ramp, Stripe, Gusto, AWS and Carta into one ledger, adds an Accounting tab inside QM, keeps its memory in GBrain, and puts a GPT-6 Luna CFO agent on top that reasons over your finances, suggests what to cut or build, and reminds you what is due. https://github.com/goodnight000/countinghouse'
js "(() => {
  const set = (sel, text) => { const el = document.querySelector(sel); el.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, text); };
  set('#title-textarea #textbox', $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$TITLE"));
  set('#description-textarea #textbox', $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$DESC"));
  document.querySelector('tp-yt-paper-radio-button[name=VIDEO_MADE_FOR_KIDS_NOT_MFK]').click();
  return 'ok';
})()" >/dev/null

for _ in 1 2 3; do
  wait_for '(b => b && !b.hasAttribute("disabled") ? "ok" : "no")(document.querySelector("#next-button"))'
  js 'document.querySelector("#next-button").click(); "ok"' >/dev/null; sleep 2
done
wait_for 'document.querySelector("tp-yt-paper-radio-button[name=UNLISTED]") ? "ok" : "no"'
js 'document.querySelector("tp-yt-paper-radio-button[name=UNLISTED]").click(); "ok"' >/dev/null
sleep 1
URL=$(js '(a => a ? a.href : "")(document.querySelector("span.video-url-fadeable a, a.style-scope.ytcp-video-info"))')
# Keep the tab open until the file finishes uploading, then save.
wait_for '(b => b && !b.hasAttribute("disabled") ? "ok" : "no")(document.querySelector("#done-button"))'
js 'document.querySelector("#done-button").click(); "ok"' >/dev/null
echo "UNLISTED URL: $URL"
