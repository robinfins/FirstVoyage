"""Rebuild original pixel-geometry HUD, signpost and scenery SVG assets; no raster inputs required."""
from pathlib import Path
import json, math
OUT=Path(__file__).resolve().parent
NAVY='#111a2c'; GOLD='#efbe64'; DARKGOLD='#93603d'; RED='#d94443'; LIGHT='#ff8270'
def svg(w,h,body,label):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" shape-rendering="crispEdges" role="img" aria-label="{label}">{body}</svg>\n'
def rect(x,y,w,h,c,o=1):
 alpha='' if o==1 else f' fill-opacity="{o}"'
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"{alpha}/>'

# ---------------------------------------------------------------- 3x5 pixel font
FONT={'A':'.#.|#.#|###|#.#|#.#','B':'##.|#.#|##.|#.#|##.','C':'.##|#..|#..|#..|.##',
 'D':'##.|#.#|#.#|#.#|##.','E':'###|#..|##.|#..|###','F':'###|#..|##.|#..|#..',
 'G':'.##|#..|#.#|#.#|.##','H':'#.#|#.#|###|#.#|#.#','I':'###|.#.|.#.|.#.|###',
 'J':'..#|..#|..#|#.#|.#.','K':'#.#|#.#|##.|#.#|#.#','L':'#..|#..|#..|#..|###',
 'M':'#.#|###|###|#.#|#.#',
 # N keeps an unbroken middle column: thinning row 2 leaves a hole in the diagonal.
 'N':'#.#|##.|###|.##|#.#','O':'.#.|#.#|#.#|#.#|.#.',
 'P':'##.|#.#|##.|#..|#..','Q':'.#.|#.#|#.#|#.#|.##','R':'##.|#.#|##.|#.#|#.#',
 'S':'.##|#..|.#.|..#|##.','T':'###|.#.|.#.|.#.|.#.','U':'#.#|#.#|#.#|#.#|###',
 'V':'#.#|#.#|#.#|#.#|.#.','W':'#.#|#.#|###|###|#.#','X':'#.#|#.#|.#.|#.#|#.#',
 'Y':'#.#|#.#|.#.|.#.|.#.','Z':'###|..#|.#.|#..|###',
 '0':'###|#.#|#.#|#.#|###','1':'.#.|##.|.#.|.#.|###','2':'##.|..#|.#.|#..|###',
 '3':'##.|..#|.#.|..#|##.','4':'#.#|#.#|###|..#|..#','5':'###|#..|##.|..#|##.',
 '6':'.##|#..|###|#.#|###','7':'###|..#|.#.|#..|#..','8':'###|#.#|###|#.#|###',
 '9':'###|#.#|###|..#|##.','/':'..#|..#|.#.|#..|#..','+':'...|.#.|###|.#.|...',
 '-':'...|...|###|...|...','x':'...|#.#|.#.|#.#|...','.':'...|...|...|...|.#.',
 ' ':'...|...|...|...|...'}
# Runtime strip; game.js indexes this exact order. Digits stay first so their indices never move.
GLYPH_ORDER='0123456789/+-x. ABCDEFGHIJKLMNOPQRSTUVWXYZ'
def bitmap(rows,x,y,s,colors):
 """Blit a character-grid bitmap as runs of same-colour pixels."""
 out=[]
 for row,line in enumerate(rows):
  col=0
  while col<len(line):
   ch=line[col]
   if ch=='.': col+=1; continue
   run=1
   while col+run<len(line) and line[col+run]==ch: run+=1
   out.append(rect(x+col*s,y+row*s,run*s,s,colors[ch]))
   col+=run
 return ''.join(out)
def label(s,x,y,scale,color):
 """Draw a string in the 3x5 font. Advance is 4 cells so glyphs keep one pixel apart."""
 out=[]
 for i,ch in enumerate(s):
  glyph=FONT.get(ch if ch in FONT else ch.upper(),FONT[' ']).split('|')
  out.append(bitmap(glyph,x+i*4*scale,y,scale,{'#':color}))
 return ''.join(out)
def oval(cx,cy,rx,ry,color,o=1):
 """Filled pixel ellipse from horizontal runs, so edges stay square."""
 out=[]
 for dy in range(-ry,ry+1):
  w=int(round(rx*math.sqrt(max(0,1-(dy/ry)**2))))
  if w: out.append(rect(cx-w,cy+dy,w*2,1,color,o))
 return ''.join(out)
def disc(cx,cy,r,color,o=1):
 """Filled pixel circle built from horizontal runs, so edges stay square."""
 out=[]
 for dy in range(-r,r+1):
  w=int(round(math.sqrt(max(0,r*r-dy*dy))))
  if w: out.append(rect(cx-w,cy+dy,w*2,1,color,o))
 return ''.join(out)

# ---------------------------------------------------------------- legacy 640x360 study bars
player=''.join([rect(0,4,204,28,NAVY),rect(4,0,196,36,NAVY),rect(4,4,196,28,GOLD),rect(8,8,188,20,DARKGOLD),rect(36,10,156,16,NAVY),rect(4,32,28,4,DARKGOLD),rect(8,12,24,8,'#ffda82'),rect(12,4,16,12,'#e6ad50'),rect(12,12,16,4,RED),rect(4,18,32,4,'#f8cb69')])
boss=''.join([rect(0,8,460,16,NAVY),rect(8,4,444,24,NAVY),rect(16,0,428,32,NAVY),rect(8,10,444,12,GOLD),rect(16,6,428,20,GOLD),rect(22,10,416,12,NAVY),rect(0,12,8,8,RED),rect(452,12,8,8,RED),rect(12,10,4,12,DARKGOLD),rect(444,10,4,12,DARKGOLD)])
pfill=rect(0,0,152,12,RED)+rect(0,0,152,3,LIGHT)+rect(0,10,152,2,'#8e2940')
bfill=rect(0,0,412,8,RED)+rect(0,0,412,2,LIGHT)+rect(0,6,412,2,'#8e2940')

# ---------------------------------------------------------------- gameplay console, 960x540 screen space
EDGE='#070c16'; RIM='#a2743c'; RIM_HI='#e7bd76'; BODY='#132038'; DIVIDE='#2b3b55'
WELL='#0a1120'; WELL_TOP='#04080f'; WELL_LIP='#31445f'; PARCH='#f7e7c3'; MUTED='#7f93a8'
W,H=300,100
BW,BH=560,46
def octagon(inset,color,o=1,w=W,h=H):
 """Chamfered plate: two overlapping rectangles leave square-cut corners."""
 return rect(inset,inset+3,w-inset*2,h-(inset+3)*2,color,o)+rect(inset+3,inset,w-(inset+3)*2,h-inset*2,color,o)
def well(x,y,w,h):
 return (rect(x-2,y-2,w+4,h+4,EDGE)+rect(x-1,y-1,w+2,h+2,WELL_LIP)
  +rect(x,y,w,h,WELL)+rect(x,y,w,1,WELL_TOP)+rect(x,y,1,h,WELL_TOP))
def hat_row(pad,*runs):
 """Centre-padded bitmap row, so the straw hat cannot drift off its 21-pixel grid."""
 mid=''.join(ch*n for ch,n in runs)
 return '.'*pad+mid+'.'*(21-pad-len(mid))
HAT=[hat_row(6,('o',9)),
 *[hat_row(5,('o',1),('c',9),('o',1)) for _ in range(3)],
 hat_row(5,('o',1),('C',9),('o',1)),
 hat_row(5,('o',1),('r',9),('o',1)),
 hat_row(5,('o',1),('R',9),('o',1)),
 hat_row(3,('o',1),('b',13),('o',1)),
 hat_row(0,('o',1),('b',19),('o',1)),
 hat_row(0,('o',1),('B',19),('o',1)),
 hat_row(1,('o',19))]
HAT_COLORS={'o':'#39291b','c':'#f7dca6','C':'#e0bd7f','r':'#dc4740','R':'#a02a35','b':'#eec788','B':'#bf8d46'}
LOCK=['...#####...','..#.....#..','..#.....#..','..#.....#..','.#########.',
 '.#########.','.####.####.','.###...###.','.####.####.','.#########.','.#########.']
assert all(len(r)==21 for r in HAT) and all(len(r)==11 for r in LOCK)

console=[octagon(0,EDGE,.92),octagon(1,RIM,.95),octagon(3,BODY,.88),
 rect(5,3,290,1,DIVIDE,.7),rect(60,14,1,74,DIVIDE,.8)]
# Straw-hat medallion in the left column.
console+= [disc(31,50,24,EDGE,.95),disc(31,50,22,RIM),disc(31,50,20,'#17263f'),
 bitmap(HAT,31-21,50-len(HAT),2,HAT_COLORS)]
# Rows: name, health, special meter, dash, move keys.
console+= [label('LUFFY',66,10,2,PARCH)]
console+= [well(64,29,225,14),well(64,51,73,10),well(140,51,73,10),well(216,51,73,10)]
console+= [well(64,67,187,4),label('DASH',257,64,2,MUTED)]
for cx,key,name,cost in [(64,'Q','BAZOOKA',2),(166,'R','GATLING',3)]:
 console.append(well(cx,79,14,14))
 console.append(label(key,cx+4,81,2,'#ffe0a0'))
 console.append(label(name,cx+18,81,2,PARCH))
 for pip in range(cost):
  console.append(rect(cx+76+pip*7,83,5,5,EDGE)+rect(cx+77+pip*7,84,3,3,'#e0a95f'))
console=''.join(console)

health_fill=(rect(0,0,225,14,'#cf3a44')+rect(0,0,225,1,'#ffab86')+rect(0,1,225,2,'#ef5f54')
 +rect(0,11,225,3,'#8c2a3d')+rect(0,13,225,1,'#6b1d30'))
HEALTH_SEGMENTS=(5,6,7)   # one per LEVELS tier in play/core.js
def health_grid(segments):
 out=[]
 for i in range(1,segments):
  x=round(225*i/segments)
  out.append(rect(x-1,0,2,14,'#08101c')+rect(x+1,0,1,14,'#33465f',.8))
 return ''.join(out)
def meter_cell(base,lit,top,low,edge):
 return (rect(0,0,73,10,base)+rect(0,0,73,1,top)+rect(0,1,73,2,lit)
  +rect(0,7,73,2,low)+rect(0,9,73,1,edge))
meter_fill=meter_cell('#dda03a','#f6cd77','#ffe9b4','#96611f','#6d4413')
meter_hot=meter_cell('#ee7c3c','#ffb277','#ffd9a8','#a54520','#77290f')
dash_fill=rect(0,0,187,4,'#6fc9b6')+rect(0,0,187,1,'#c9f2e7')+rect(0,3,187,1,'#38796f')
glyphs=''.join(label(ch,i*8,0,2,PARCH) for i,ch in enumerate(GLYPH_ORDER))
lock=bitmap(LOCK,0,0,1,{'#':'#f2cf8e'})

def plate(w,h,body,rim,opacity=.88):
 return (rect(0,2,w,h-4,EDGE,.92)+rect(2,0,w-4,h,EDGE,.92)
  +rect(1,2,w-2,h-4,rim)+rect(2,1,w-4,h-2,rim)
  +rect(3,2,w-6,h-4,body,opacity)+rect(2,3,w-4,h-6,body,opacity))
# Boss console: same plate language as the player console, with circus-red end caps.
CIRCUS='#d0392f'
boss_plate=''.join([octagon(0,EDGE,.92,BW,BH),octagon(1,RIM,.95,BW,BH),octagon(3,BODY,.88,BW,BH),
 rect(5,3,BW-10,1,DIVIDE,.7),rect(3,17,6,12,CIRCUS),rect(BW-9,17,6,12,CIRCUS),
 label('BUGGY THE CLOWN',16,8,2,PARCH),label('PHASE',496,8,2,MUTED),well(16,24,528,14)])
boss_bar_fill=(rect(0,0,528,14,'#d23a3f')+rect(0,0,528,1,'#ff9d8a')+rect(0,1,528,2,'#f2615a')
 +rect(0,11,528,3,'#8a2638')+rect(0,13,528,1,'#66182c'))
# Pale trail sits behind the red fill and drains a beat later, so a big hit stays readable.
boss_trail=rect(0,0,528,14,'#efd0a6')+rect(0,0,528,2,'#fff1d9')+rect(0,12,528,2,'#bd9a6c')
# Gold tick marks the half-health point where Buggy splits into phase two.
boss_grid=(rect(262,0,1,14,'#08101c')+rect(263,0,2,14,'#f0c273')+rect(265,0,1,14,'#08101c'))

coin=(disc(7,7,7,EDGE)+disc(7,7,6,'#f0c273')+disc(7,7,5,'#e0ae59')
 +disc(7,7,3,'#c98c3d')+label('B',6,5,1,'#4f3412'))
LEVEL_W=56
level_badge=(plate(LEVEL_W,22,'#2b4a3c',RIM_HI,.9)+label('LVL',9,6,2,'#ffe6bd'))
# Gear 2 sits beside the level badge on the same row, in the same plate language. The well on the
# right drains while the transformation runs; the label is baked so it stays as crisp as the HUD.
GEAR_W=150
gear_badge=(plate(GEAR_W,22,'#5a2320',RIM_HI,.9)+well(7,4,14,14)+label('X',11,6,2,'#ffd0a8')
 +label('GEAR 2',26,6,2,'#ffe6bd')+well(78,7,64,8))
gear_fill=(rect(0,0,64,8,'#e8623c')+rect(0,0,64,1,'#ffd0a0')+rect(0,1,64,2,'#ff8a5c')
 +rect(0,6,64,2,'#8d2f1c'))

# Meat on the bone. The old icon read as a brown rock; this one leads with the silhouette —
# two knuckles and a shaft on the left, one heavy round of meat on the right.
BONE_EDGE='#2a2331'; BONE='#f2e8cf'; BONE_LO='#c6b795'
MEAT_EDGE='#2b191d'; MEAT_LO='#7c3220'; MEAT='#ab4b28'; MEAT_HI='#c96a38'; MEAT_LIT='#e59a5c'
def meat_icon():
 # The bone reads from its silhouette, so the knuckles have to clearly stand proud of the shaft:
 # an earlier version used a thick shaft with small knobs and the whole end merged into one blob.
 out=[rect(7,26,18,7,BONE_EDGE),disc(7,24,6,BONE_EDGE),disc(7,33,6,BONE_EDGE)]
 out+=[rect(8,27,17,5,BONE),disc(7,24,4,BONE),disc(7,33,4,BONE)]
 out+=[rect(8,31,16,1,BONE_LO),disc(6,23,2,'#ffffff')]
 # One heavy round of meat, wider than tall, sitting over the far end of the bone.
 out+=[oval(32,16,15,13,MEAT_EDGE),oval(32,16,13,11,MEAT_LO),oval(32,15,12,10,MEAT)]
 out+=[oval(34,20,9,5,MEAT_LO),oval(28,11,7,5,MEAT_HI),oval(26,10,4,3,MEAT_LIT)]
 return ''.join(out)

# ---------------------------------------------------------------- world signposts
WOOD='#8d5c33'; WOOD_HI='#b8824a'; WOOD_LO='#5d3a1e'; WOOD_EDGE='#33200f'
IRON='#474350'; IRON_HI='#6f6a7c'; NAIL='#cdc6b2'
# Widest label is CIRCUS: 6 glyphs at advance 10 is 56px, and the straps eat 20px of the board.
SIGN_W,SIGN_H,BOARD_H=84,76,30
def signpost():
 c,top=SIGN_W//2,BOARD_H-2                                       # post follows the centre
 # The post runs the whole way to the bottom row. The sign is drawn with its bottom edge on the
 # ground line, so empty rows here read as the post hovering above the floor.
 out=[rect(c-6,top,12,SIGN_H-top,WOOD_EDGE)]                     # post silhouette
 out+=[rect(c-5,top,10,SIGN_H-top-1,WOOD),rect(c-5,top,2,SIGN_H-top-1,WOOD_HI),
       rect(c+3,top,2,SIGN_H-top-1,WOOD_LO)]
 for y in range(BOARD_H+4,SIGN_H-6,7): out.append(rect(c-3,y,6,1,WOOD_LO))  # grain
 # Angled braces at the foot instead of an earth mound: carpentry reads correctly on planking,
 # stone and the Sunny's grass alike, where a pile of dirt would not.
 for i in range(7):
  hgt=7-i
  out.append(rect(c-7-i,SIGN_H-hgt,1,hgt,WOOD if i<4 else WOOD_LO))
  out.append(rect(c+6+i,SIGN_H-hgt,1,hgt,WOOD_LO))
 out.append(rect(c-13,SIGN_H-2,26,2,'#000000',.22))              # contact shadow
 out+=[rect(0,0,SIGN_W,BOARD_H,WOOD_EDGE)]                        # board silhouette
 out+=[rect(1,1,SIGN_W-2,BOARD_H-2,WOOD),rect(1,1,SIGN_W-2,2,WOOD_HI),rect(1,BOARD_H-4,SIGN_W-2,3,WOOD_LO)]
 for y in (8,15,22): out.append(rect(3,y,SIGN_W-6,1,WOOD_LO))     # plank seams
 out+=[rect(4,0,6,BOARD_H,IRON),rect(SIGN_W-10,0,6,BOARD_H,IRON), # iron straps
       rect(4,0,2,BOARD_H,IRON_HI),rect(SIGN_W-10,0,2,BOARD_H,IRON_HI)]
 for x,y in [(6,3),(6,BOARD_H-6),(SIGN_W-8,3),(SIGN_W-8,BOARD_H-6)]:
  out+=[rect(x,y,3,3,'#2a2730'),rect(x,y,2,2,NAIL)]               # nail heads
 return ''.join(out)
# Arrow points right by default, so drawExits can flip it with the travel direction.
# A shaft plus a solid triangular head, carved in the same parchment as the lettering.
ARROW_W,ARROW_H=14,9
def sign_chevron(color=PARCH):
 cy,head=ARROW_H//2,7
 out=[rect(1,cy-1,head,3,color)]
 for y in range(ARROW_H):
  w=6-abs(y-cy)
  if w>0: out.append(rect(head,y,w,1,color))
 return ''.join(out)
sign_arrow=sign_chevron()
pistol=signpost()

# ---------------------------------------------------------------- circus tent footing
# The tent art stops at world y 413.6 while the arena floor is at 430, so the tent hung in mid-air.
# This band fills the gap: the tent's own dark hem, a striped valance, then the earth berm it stands on.
BASE_W,BASE_H=1160,36
TENT_DARK='#0d0b19'; VAL_RED='#b8323a'; VAL_CREAM='#e4d8c0'; VAL_SHADE='#7d1f28'
EARTH_TOP='#8a6a44'; EARTH='#6b5136'; EARTH_LO='#4a3826'; EARTH_DARK='#2f2318'
ROPE='#8a7a5e'; STAKE='#5a4028'; STAKE_HI='#7d5c3c'
def circus_base():
 # Only about 28 of these rows clear the arena floor, so the band stays flat and legible: dark tent
 # underside, striped valance, then the earth berm. A scalloped hem is lost at this size.
 out=[rect(0,0,BASE_W,11,TENT_DARK)]                       # the tent underside carries on down
 out.append(rect(0,17,BASE_W,BASE_H-17,EARTH))             # packed earth berm
 out.append(rect(0,17,BASE_W,2,EARTH_TOP))
 out.append(rect(0,27,BASE_W,3,EARTH_LO))
 out.append(rect(0,30,BASE_W,BASE_H-30,EARTH_DARK))
 for i in range(0,BASE_W,29):                              # sawdust speckle, deterministic
  out.append(rect(i+(i//29*7)%23,21+(i//29)%4,2,1,EARTH_TOP))
 for i in range(0,BASE_W,145):                             # stakes roped back up to the tent
  x=i+34
  out.append(rect(x,19,3,8,STAKE)+rect(x,19,1,8,STAKE_HI))
  for d in range(8): out.append(rect(x-d*2,19-d,2,1,ROPE))
 for i in range(0,BASE_W,40):                              # striped valance hanging over the berm
  out.append(rect(i,9,40,8,VAL_RED if (i//40)%2==0 else VAL_CREAM))
 out.append(rect(0,9,BASE_W,1,VAL_SHADE))                  # crease where fabric meets tent
 out.append(rect(0,16,BASE_W,1,'#2a1f16'))                 # shadow the valance casts on the earth
 return ''.join(out)
LAYER_ASSETS=[('circus-base',BASE_W,BASE_H,circus_base())]

assets=[('player-frame',204,36,player),('player-fill',152,12,pfill),
 ('boss-frame',460,32,boss),('boss-fill',412,8,bfill),
 ('player-full',204,36,player+f'<g transform="translate(38 12)">{pfill}</g>'),
 ('boss-full',460,32,boss+f'<g transform="translate(24 12)">{bfill}</g>'),
 ('hud-console',W,H,console),('hud-health-fill',225,14,health_fill),
 *[('hud-health-grid-%d'%n,225,14,health_grid(n)) for n in HEALTH_SEGMENTS],('hud-meter-fill',73,10,meter_fill),
 ('hud-meter-fill-hot',73,10,meter_hot),('hud-dash-fill',187,4,dash_fill),
 ('hud-glyphs',len(GLYPH_ORDER)*8-2,10,glyphs),('hud-lock',11,11,lock),
 ('hud-coin',14,14,coin),('hud-level-badge',LEVEL_W,22,level_badge),
 ('hud-gear-badge',GEAR_W,22,gear_badge),('hud-gear-fill',64,8,gear_fill),
 ('meat',48,38,meat_icon()),
 ('hud-boss-frame',BW,BH,boss_plate),('hud-boss-fill',528,14,boss_bar_fill),
 ('hud-boss-trail',528,14,boss_trail),('hud-boss-grid',528,14,boss_grid)]
SIGN_ASSETS=[('sign-post',SIGN_W,SIGN_H,signpost()),('sign-arrow',ARROW_W,ARROW_H,sign_arrow)]
for name,w,h,body in assets:
 (OUT/(name+'.svg')).write_text(svg(w,h,body,name.replace('-',' ')))
PROPS=OUT.parent/'props'
for name,w,h,body in SIGN_ASSETS:
 (PROPS/(name+'.svg')).write_text(svg(w,h,body,name.replace('-',' ')))
LAYERS=OUT.parent/'layers'
for name,w,h,body in LAYER_ASSETS:
 (LAYERS/(name+'.svg')).write_text(svg(w,h,body,name.replace('-',' ')))

config={'viewport':[640,360],
 'player':{'frame':'player-frame.svg','fill':'player-fill.svg','frame_size':[204,36],'fill_rect':[38,12,152,12],'screen_anchor':[12,12],'starting_max_health':5,'segments':5,'used_by':'preview/preview.js art study'},
 'boss':{'frame':'boss-frame.svg','fill':'boss-fill.svg','frame_size':[460,32],'fill_rect':[24,12,412,8],'screen_anchor':[90,314],'label':'BUGGY THE CLOWN','trail_delay_seconds':0.35},
 'console':{'used_by':'play/game.js, drawn 1:1 in 960x540 screen space','frame':'hud-console.svg','frame_size':[W,H],'screen_anchor':[16,14],
  'health':{'fill':'hud-health-fill.svg','grid':'hud-health-grid-<segments>.svg','rect':[64,29,225,14],'segments':list(HEALTH_SEGMENTS)},
  'meter':{'fill':'hud-meter-fill.svg','last_segment_fill':'hud-meter-fill-hot.svg','rect':[64,51,73,10],'pitch':76,'segments':3},
  'dash':{'fill':'hud-dash-fill.svg','rect':[64,67,187,4]},
  'name_anchor':[66,10],'value_right':289,
  'keys':[{'move':'bazooka','cap':[64,79,14,14],'label':[82,81],'cost':2},{'move':'gatling','cap':[166,79,14,14],'label':[184,81],'cost':3,'lock':'hud-lock.svg'}],
  'glyphs':{'file':'hud-glyphs.svg','order':GLYPH_ORDER,'cell':[6,10],'advance':8},
  'berries':{'coin':'hud-coin.svg','coin_anchor':[110,8],'value_anchor':[128,10]},
  'level':{'file':'hud-level-badge.svg','size':[LEVEL_W,22],'screen_anchor':[16,120],'value_anchor':[41,6]},
  'gear':{'file':'hud-gear-badge.svg','fill':'hud-gear-fill.svg','size':[GEAR_W,22],'screen_anchor':[80,120],'fill_rect':[78,7,64,8]}},
 'signpost':{'used_by':'play/game.js drawExits','board':'../props/sign-post.svg','size':[SIGN_W,SIGN_H],'label_anchor':[SIGN_W//2,7],'label_advance':10,'arrow':'../props/sign-arrow.svg','arrow_size':[ARROW_W,ARROW_H],'arrow_anchor':[SIGN_W//2,17],'foot_offset':SIGN_H-4},
 'boss_console':{'used_by':'play/game.js, drawn 1:1 in 960x540 screen space','frame':'hud-boss-frame.svg','frame_size':[BW,BH],'screen_anchor':[200,484],
  'health':{'fill':'hud-boss-fill.svg','trail':'hud-boss-trail.svg','grid':'hud-boss-grid.svg','rect':[16,24,528,14],'trail_delay_seconds':0.35,'phase_two_marker':0.5},
  'phase_value_anchor':[540,8]},
 'fill_behavior':'clip width from left by clamp(current / maximum, 0, 1); keep frame unchanged','screen_space':True}
(OUT/'hud-layout.json').write_text(json.dumps(config,indent=2)+'\n')
print(f'Created {len(assets)} HUD, {len(SIGN_ASSETS)} signpost and {len(LAYER_ASSETS)} scenery SVG assets, plus hud-layout.json')
