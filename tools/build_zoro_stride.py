"""Extract complete isolated run silhouettes; source swords cross nominal grid boundaries."""
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
root=Path(__file__).resolve().parents[1]/'assets/characters/zoro'
a=np.array(Image.open(root/'zoro-stride-source.png').convert('RGBA'))
r,g,b=[a[:,:,i].astype(int) for i in range(3)]
mask=(~((r>140)&(b>120)&(r>g*1.6)&(b>g*1.6))).astype('uint8')
_,labels,stats,centers=cv2.connectedComponentsWithStats(mask,8)
figures=[i for i in range(1,len(stats)) if stats[i,4]>2000]
figures.sort(key=lambda i:(int(centers[i,1]//512),centers[i,0]))
assert len(figures)==8, 'Expected eight separate full-body silhouettes'
out=Image.new('RGBA',(384*8,320))
pivots=[210,592,956,1333,205,585,942,1324]
for i,label in enumerate(figures):
 x,y,w,h=map(int,stats[label,:4])
 # Key the entire connected figure BEFORE cropping. Grid slicing admitted a neighbor's
 # sword tip into frames 2 and 6, and cut those tips off their rightful poses.
 rgba=a[y:y+h,x:x+w].copy()
 rgba[:,:,3]=np.where(labels[y:y+h,x:x+w]==label,255,0)
 crop=Image.fromarray(rgba)
 k=.72;crop=crop.resize((round(w*k),round(h*k)),Image.Resampling.NEAREST)
 base=457 if i<4 else 871
 px=192+round((x-pivots[i])*k);py=284+round((y-base)*k)
 assert px>=8 and px+crop.width<=376 and py>=8 and py+crop.height<=312, 'Pose exceeds padded cell'
 out.alpha_composite(crop,(i*384+px,py))
out.save(root/'zoro-stride.png')
print('8 isolated full-body frames exported with complete blades and padded cells')
