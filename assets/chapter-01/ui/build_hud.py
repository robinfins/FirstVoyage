"""Rebuild original pixel-geometry HUD SVG assets; no raster inputs required."""
from pathlib import Path
import json
OUT=Path(__file__).resolve().parent
NAVY='#111a2c'; GOLD='#efbe64'; DARKGOLD='#93603d'; RED='#d94443'; LIGHT='#ff8270'
def svg(w,h,body,label):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" shape-rendering="crispEdges" role="img" aria-label="{label}">{body}</svg>\n'
def rect(x,y,w,h,c): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>'
player=''.join([rect(0,4,204,28,NAVY),rect(4,0,196,36,NAVY),rect(4,4,196,28,GOLD),rect(8,8,188,20,DARKGOLD),rect(36,10,156,16,NAVY),rect(4,32,28,4,DARKGOLD),rect(8,12,24,8,'#ffda82'),rect(12,4,16,12,'#e6ad50'),rect(12,12,16,4,RED),rect(4,18,32,4,'#f8cb69')])
boss=''.join([rect(0,8,460,16,NAVY),rect(8,4,444,24,NAVY),rect(16,0,428,32,NAVY),rect(8,10,444,12,GOLD),rect(16,6,428,20,GOLD),rect(22,10,416,12,NAVY),rect(0,12,8,8,RED),rect(452,12,8,8,RED),rect(12,10,4,12,DARKGOLD),rect(444,10,4,12,DARKGOLD)])
pfill=rect(0,0,152,12,RED)+rect(0,0,152,3,LIGHT)+rect(0,10,152,2,'#8e2940')
bfill=rect(0,0,412,8,RED)+rect(0,0,412,2,LIGHT)+rect(0,6,412,2,'#8e2940')
for name,w,h,body in [('player-frame',204,36,player),('player-fill',152,12,pfill),('boss-frame',460,32,boss),('boss-fill',412,8,bfill),('player-full',204,36,player+f'<g transform="translate(38 12)">{pfill}</g>'),('boss-full',460,32,boss+f'<g transform="translate(24 12)">{bfill}</g>')]:
 (OUT/(name+'.svg')).write_text(svg(w,h,body,name.replace('-',' ')))
config={'viewport':[640,360],'player':{'frame':'player-frame.svg','fill':'player-fill.svg','frame_size':[204,36],'fill_rect':[38,12,152,12],'screen_anchor':[12,12],'starting_max_health':5,'segments':5},'boss':{'frame':'boss-frame.svg','fill':'boss-fill.svg','frame_size':[460,32],'fill_rect':[24,12,412,8],'screen_anchor':[90,314],'label':'BUGGY THE CLOWN','trail_delay_seconds':0.35},'fill_behavior':'clip width from left by clamp(current / maximum, 0, 1); keep frame unchanged','screen_space':True}
(OUT/'hud-layout.json').write_text(json.dumps(config,indent=2)+'\n')
print('Created six transparent SVG HUD assets and hud-layout.json')
