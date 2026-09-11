"""Register approved prop/wave pixels without regenerating their designs."""
from pathlib import Path
from PIL import Image
import cv2,json,numpy as np
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'assets/chapter-01';OUT=BASE/'cleaned'
records={}
for name,cell,pivot,source_pivot in [('sunny-flag-cycle',(512,448),(16,64),(50,209)),('checkpoint-snail',(576,704),(288,656),(288,641))]:
 src=Image.open(BASE/'props'/f'{name}.png').convert('RGBA');atlas=Image.new('RGBA',(cell[0]*4,cell[1]));frames=[]
 for i in range(4):
  a=np.array(src.crop((i*543,0,(i+1)*543,724)))
  a[a[:,:,3]<48]=0
  im=Image.fromarray(a);bbox=im.getbbox();x,y,x1,y1=bbox
  dx=x-source_pivot[0]+pivot[0];dy=y-source_pivot[1]+pivot[1]
  assert dx>=0 and dy>=0 and dx+x1-x<=cell[0] and dy+y1-y<=cell[1],(name,i)
  frame=Image.new('RGBA',cell);frame.alpha_composite(im.crop(bbox),(dx,dy));atlas.alpha_composite(frame,(i*cell[0],0))
  folder=OUT/name;folder.mkdir(exist_ok=True);frame.save(folder/f'{i:02}.png');frames.append([i*cell[0],0,*cell])
 atlas.save(OUT/f'{name}.png');records[name]={'file':f'cleaned/{name}.png','frames':frames,'cell_size':cell,'pivot':pivot}

# Actual crest intervals, rather than the incorrect equal-height original grid.
src=np.array(Image.open(BASE/'layers/ocean-wave-cycle.png').convert('RGBA'))
bands=[(152,266),(380,516),(620,779),(871,1018)]
w,h=768,64;atlas=Image.new('RGBA',(w,h*4));audits=[]
for i,(top,bottom) in enumerate(bands):
 a=src[top:bottom].copy();g=a[:,:,1].astype('float32')
 detail=g-cv2.GaussianBlur(g,(0,0),3)
 sharp=(detail>9)&(g>94)&(a[:,:,2]>105)
 surface=[]
 for x in range(a.shape[1]):
  ys=np.flatnonzero(sharp[:,x]);surface.append(int(ys[0]) if len(ys) else int(a.shape[0]*.55))
 surface=np.array(surface,dtype='uint8')
 surface=cv2.medianBlur(surface.reshape(1,-1),9).ravel().astype(int)
 median=int(np.median(surface));surface=np.maximum(surface,median-48)
 # Transparent above the crisp crest; opaque water below. No generated sky haze.
 result=np.zeros((160,1536,4),dtype='uint8')
 for x,y0 in enumerate(surface):
  ydest=64+y0-median
  if ydest<0:continue
  column=a[y0:,x,:3]
  available=min(len(column),160-ydest)
  result[ydest:ydest+available,x,:3]=column[:available]
  result[ydest:,x,3]=255
  if available:
   result[ydest+available:,x,:3]=column[available-1]
 # Blend submerged water to the exact base color, eliminating a rectangle at the bottom.
 base=np.array([8,39,64])
 for y in range(102,160):
  blend=(y-102)/57;result[y,:,:3]=np.round(result[y,:,:3]*(1-blend)+base*blend).astype('uint8')
 im=Image.fromarray(result).resize((w,h),Image.Resampling.NEAREST)
 im.paste((8,39,64,255),(0,h-1,w,h))
 atlas.alpha_composite(im,(0,i*h));folder=OUT/'ocean-wave-cycle';folder.mkdir(exist_ok=True);im.save(folder/f'{i:02}.png')
 audits.append({'source_band':[0,top,1536,bottom-top],'source_surface_median':top+median})
atlas.save(OUT/'ocean-wave-cycle.png');records['ocean-wave-cycle']={'file':'cleaned/ocean-wave-cycle.png','frames':[[0,i*h,w,h] for i in range(4)],'cell_size':[w,h],'pivot':[0,26],'base_color':'#082740','source_registration':audits,'stage_scope':['sunny']}
(OUT/'environment-registration.json').write_text(json.dumps(records,indent=2)+'\n')
proof=Image.new('RGBA',atlas.size,(40,65,76,255));proof.alpha_composite(atlas);proof.convert('RGB').save(OUT/'ocean-review.jpg')
print('Registered flag hoists, checkpoint bases and four wave crests. Removed wave haze.')
