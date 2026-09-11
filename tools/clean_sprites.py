"""Deterministic cleanup of approved source art. Originals are never modified."""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/chapter-01/cleaned'
OUT.mkdir(exist_ok=True)
NAMES=['pirate-cutlass','pirate-brute','pirate-bomber','buggy-melee','buggy-specials']

def remove_checker(rgb):
    arr=np.asarray(rgb.convert('RGB')).astype(np.int16)
    neutral=(arr.max(2)-arr.min(2)<28)&(arr.min(2)>100)
    count,labels,stats,centroids=cv2.connectedComponentsWithStats(neutral.astype('uint8'),8)
    exterior=set(np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]])))
    exterior.discard(0)
    # The checker field is the single large component connected to the sheet edges.
    erase=np.isin(labels,list(exterior))
    rgba=np.dstack([arr.astype('uint8'),np.where(erase,0,255).astype('uint8')])
    return rgba

# Feet/body pivots are authored separately from bounds so a long weapon never
# recentres a frame. Coordinates refer to the unchanged generated source sheets.
PIVOTS={
'pirate-cutlass':[(223,502),(608,502),(979,501),(1356,501),(220,963),(640,963),(1024,963),(1380,963)],
'pirate-brute':[(198,484),(581,484),(976,489),(1350,487),(205,968),(619,968),(1020,972),(1360,971)],
'pirate-bomber':[(202,501),(587,501),(975,498),(1354,501),(220,972),(647,969),(1010,972),(1365,972)],
'buggy-melee':[(223,504),(610,504),(972,504),(1366,502),(220,948),(609,948),(1000,946),(1355,950)],
'buggy-specials':[(217,481),(621,481),(981,481),(1378,481),(208,946),(598,941),(970,941),(1345,941)],
'luffy':[(261,561),(800,562),(1305,562),(327,959),(740,969),(1320,968)]}
HOLE_SEEDS={'pirate-brute':[(272,291),(644,291)],'pirate-cutlass':[(166,316),(559,316),(1411,295),(95,673),(147,732)]}

def make_sprite_pack():
 import json
 registration={}
 for name,pivots in PIVOTS.items():
  path=ROOT/('assets/concepts/luffy-action-sheet.png' if name=='luffy' else f'assets/chapter-01/characters/{name}.png')
  rgb=Image.open(path).convert('RGB');rgba=remove_checker(rgb);arr=np.asarray(rgb).astype('int16')
  neutral=((arr.max(2)-arr.min(2)<28)&(arr.min(2)>100)).astype('uint8')
  _,holelabels,_,_=cv2.connectedComponentsWithStats(neutral,8)
  for x,y in HOLE_SEEDS.get(name,[]):
   label=holelabels[y,x]
   if label: rgba[holelabels==label,3]=0
  count,labels,stats,centroids=cv2.connectedComponentsWithStats((rgba[:,:,3]>0).astype('uint8'),8)
  n=len(pivots);cols=3 if name=='luffy' else 4
  assigned=[[] for _ in range(n)];parts=[[] for _ in range(n)]
  for i in range(1,count):
   x,y,w,h,area=stats[i];cx,cy=centroids[i]
   if area<45: continue
   row=0 if cy<510 else 1
   if name=='luffy': col=0 if cx<515 else 1 if cx<1120 else 2
   else: col=0 if cx<355 else 1 if cx<790 else 2 if cx<1155 else 3
   idx=row*cols+col
   external=False
   if name=='buggy-melee' and row==1:
    external=(area<6000)
   if name=='buggy-specials':
    external=(idx==1 and cx<470) or (idx==3 and cy<135) or (idx==4 and area<5000)
    # Remove only small air streaks from the recombination reference.
    if idx in (5,6) and area<1200: external=True
   if name=='pirate-bomber': external=area<10000
   if name=='pirate-brute': external=area<2000
   if name=='luffy' and area<10000: external=True
   (parts if external else assigned)[idx].append(i)
  cell=(896,576) if name=='luffy' else (768,576);pivot=(cell[0]//2,536)
  atlas=Image.new('RGBA',(cell[0]*cols,cell[1]*2));records=[];folder=OUT/name;folder.mkdir(exist_ok=True)
  for idx,ids in enumerate(assigned):
   mask=np.isin(labels,ids);body=rgba.copy();body[~mask]=0
   if name=='luffy' and idx==3:body[:,:55]=0
   # A one-pixel inward trim removes pale generated fringes; thick navy outlines survive.
   alpha=cv2.erode(body[:,:,3],np.ones((2,2),np.uint8),anchor=(0,0))
   body[:,:,3]=alpha;body[alpha==0]=0
   sprite=Image.fromarray(body);bbox=sprite.getbbox();assert bbox,(name,idx)
   x0,y0,x1,y1=bbox;px,py=pivots[idx];dx=x0-px+pivot[0];dy=y0-py+pivot[1]
   assert dx>=8 and dy>=8 and dx+x1-x0<=cell[0]-8 and dy+y1-y0<=cell[1]-8,(name,idx,bbox,dx,dy)
   frame=Image.new('RGBA',cell);frame.alpha_composite(sprite.crop(bbox),(dx,dy));frame.save(folder/f'{idx:02}.png')
   atlas.alpha_composite(frame,((idx%cols)*cell[0],(idx//cols)*cell[1]))
   effects=[]
   for j,component in enumerate(parts[idx]):
    part=rgba.copy();part[labels!=component]=0;part[part[:,:,3]==0]=0
    pim=Image.fromarray(part);b=pim.getbbox()
    if not b:continue
    fname=f'{idx:02}-part-{j:02}.png';pim.crop(b).save(folder/fname)
    effects.append({'file':f'cleaned/{name}/{fname}','offset':[b[0]-px,b[1]-py],'size':[b[2]-b[0],b[3]-b[1]],'pixel_area':int(stats[component,4])})
   records.append({'file':f'cleaned/{name}/{idx:02}.png','rect':[(idx%cols)*cell[0],(idx//cols)*cell[1],*cell],'pivot':list(pivot),'source_pivot':[px,py],'source_bounds':list(bbox),'parts':effects})
  atlas.save(OUT/f'{name}.png')
  # Review plate is deliberately composited on a solid dark background.
  proof=Image.new('RGBA',atlas.size,(24,44,56,255));proof.alpha_composite(atlas)
  proof.convert('RGB').resize((1536,576),Image.Resampling.NEAREST).save(OUT/f'{name}-review.jpg')
  registration[name]={'file':f'cleaned/{name}.png','grid':[cols,2],'cell_size':list(cell),'pivot':list(pivot),'pixels_per_world_pixel':5 if name.startswith('buggy') else 6,'frames':records}
 (OUT/'registration.json').write_text(json.dumps(registration,indent=2)+'\n')
 print('Exported',sum(len(x['frames']) for x in registration.values()),'registered body frames plus detached parts; originals preserved.')

if __name__=='__main__':make_sprite_pack()
