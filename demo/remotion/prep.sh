#!/bin/sh
# Copy raw inputs in, measure speech spans, render. Usage: ./prep.sh [render]
set -e; cd "$(dirname "$0")"; R=../out/raw
cp $R/screen.mp4 $R/narration.mp3 public/; cp $R/timeline.json src/timeline.json
D=$(/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -of csv=p=0 public/screen.mp4)
/opt/homebrew/bin/ffmpeg -hide_banner -nostats -i public/narration.mp3 -af silencedetect=noise=-35dB:d=0.35 -f null - 2>&1 | grep -E "silence_(start|end)" > /tmp/sil.txt || true
python3 - "$D" <<'PY'
import json,re,sys
D=float(sys.argv[1]); ev=[(m.group(1),float(m.group(2))) for m in re.finditer(r'silence_(start|end): ([\d.]+)',open('/tmp/sil.txt').read())]
sp=[];cur=0.0
for k,v in ev:
  if k=='start': sp.append((cur,v))
  else: cur=v
sp.append((cur,D)); sp=[s for s in sp if s[1]-s[0]>0.15]
tl=json.load(open('src/timeline.json')); spans=[]
for s in tl:
  ins=[x for x in sp if x[1]>s['start']+0.1 and x[0]<s['end']-0.1]
  spans.append([max(ins[0][0],s['start']),min(ins[-1][1],s['end'])] if ins and s['text'] else [s['start'],s['end']])
json.dump({"duration":D,"spans":spans},open('src/meta.json','w'))
print(spans)
PY
[ "$1" = render ] && npx remotion render Demo ~/Desktop/countinghouse-demo-v3.mp4 --codec h264 --concurrency 8 --log=error 2>&1 | grep -v "network requests"
exit 0
