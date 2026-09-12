"""Publish explicit source/cleaned assets and registered frame metadata."""
from pathlib import Path
from PIL import Image
import json,hashlib
ROOT=Path(__file__).resolve().parent.parent;BASE=ROOT/'assets/chapter-01'
# as_posix, not str: on Windows str() yields backslashes, which end up in pack.js as asset
# URLs the browser cannot load.
sources={p.stem:p.relative_to(BASE).as_posix() for folder in ['characters','layers','props'] for p in sorted((BASE/folder).glob('*.png'))}
files=dict(sources);frames={};entries=[]
for key,file in sources.items():
 with Image.open(BASE/file) as im:
  w,h=im.size;alpha=im.getchannel('A') if 'A' in im.getbands() else None
  cols,rows=(4,2) if file.startswith('characters') else (4,1) if file.startswith('props') else (1,4) if key=='ocean-wave-cycle' else (1,1)
  frames[key]=[[round(w*c/cols),round(h*r/rows),round(w*(c+1)/cols)-round(w*c/cols),round(h*(r+1)/rows)-round(h*r/rows)] for r in range(rows) for c in range(cols)]
  entries.append({'id':key,'file':file,'size':[w,h],'mode':im.mode,'has_transparent_pixels':bool(alpha is not None and alpha.getextrema()[0]<255),'status':'preserved-source','sha256':hashlib.sha256((BASE/file).read_bytes()).hexdigest()})
sprites=json.loads((BASE/'cleaned/registration.json').read_text());props=json.loads((BASE/'cleaned/environment-registration.json').read_text())
for key,data in sprites.items():
 files[key]=data['file'];frames[key]=[f['rect'] for f in data['frames']]
 for i,f in enumerate(data['frames']):
  for j,part in enumerate(f['parts']):
   part['id']=f'{key}-part-{i}-{j}';files[part['id']]=part['file']
for key,data in props.items():files[key]=data['file'];frames[key]=data['frames']
labels={k:['Idle A','Idle B','Walk A','Walk B','Wind-up','Strike / release','Recovery','Hurt'] for k in ['pirate-cutlass','pirate-brute','pirate-bomber']}
labels['buggy-melee']=['Idle A','Idle B','Lunge wind-up','Lunge strike','Lunge recovery','Hand sweep wind-up','Hand sweep strike','Hand return']
labels['buggy-specials']=['Knife fan wind-up','Knife fan release','Bomb wind-up','Bomb release','Split','Recombine','Hurt','Defeat']
labels['luffy']=['Idle','Run key pose','Jump','Dash','Gum-Gum Pistol','Gear 2 stance reference']
anims={k:{'Idle':[0,1],'Walk':[2,3],'Attack':[4,5,6,0],'Hurt':[7,0],'All poses':list(range(8))} for k in ['pirate-cutlass','pirate-brute','pirate-bomber']}
anims['buggy-melee']={'Idle':[0,1],'Lunge':[2,3,4,0],'Hand sweep':[5,6,7,0],'All poses':list(range(8))}
anims['buggy-specials']={'Knife fan':[0,1],'Bomb toss':[2,3],'Split / recombine':[4,5],'Hurt / defeat':[6,7],'All poses':list(range(8))}
anims['luffy']={'Idle':[0],'Movement poses':[0,1,2,3],'Pistol':[0,4,0],'All poses':list(range(6))}
pack={'files':files,'sources':sources,'frames':frames,'labels':labels,'animations':anims,'sprites':sprites,'props':props}
(ROOT/'preview/pack.js').write_text('const PACK = '+json.dumps(pack,indent=2)+';\n')
cleaned=[]
for key,data in {**sprites,**props}.items():
 p=BASE/data['file']
 with Image.open(p) as im:cleaned.append({'id':key,'file':data['file'],'size':list(im.size),'mode':im.mode,'has_transparent_pixels':im.getchannel('A').getextrema()[0]==0,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
manifest={'version':2,'source_assets':entries,'assets':cleaned,'sprites':sprites,'props':props,'animations':anims,'labels':labels,'cleanup':'User-authorized deterministic Python pixel cleanup; generated originals preserved. Fixed padded frames and authored pivots. Detached parts are separate PNGs.','ui':{'layout':'ui/hud-layout.json'},'scene_scope':{'sea':['sunny'],'foreground_surf':['sunny'],'checkpoint_A':'dock','checkpoint_B':'streets, before circus'},'preview':'../../preview/index.html'}
(BASE/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Published',len(cleaned),'cleaned atlases with exact frame/pivot metadata.')
