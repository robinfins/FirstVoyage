"""Remove exterior generated checkerboard; align source kick poses to support-foot pivots."""
from pathlib import Path
import cv2,numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]/'assets/chapter-01/motion'
a=np.array(Image.open(root/'luffy-jet-stamp-source.png').convert('RGB'))
atlas=Image.new('RGBA',(768*4,512))
regions=[(0,0,700,512,306,482),(768,0,1536,512,978,482),(0,512,930,1024,266,973),(930,512,1536,1024,1123,977)]
for frame,(x0,y0,x1,y1,footx,footy) in enumerate(regions):
 rgb=a[y0:y1,x0:x1].copy();hi=rgb.max(2).astype(int);lo=rgb.min(2).astype(int)
 candidate=((hi-lo<29)&(lo>85)).astype('uint8')
 n,labels,stats,_=cv2.connectedComponentsWithStats(candidate,4)
 border=set(np.r_[labels[0],labels[-1],labels[:,0],labels[:,-1]])-{0}
 outside=np.isin(labels,list(border))
 opaque=(~outside).astype('uint8');n,l,st,_=cv2.connectedComponentsWithStats(opaque,8)
 keep=1+np.argmax(st[1:,4]);alpha=(l==keep).astype('uint8')*255
 rgba=Image.fromarray(np.dstack([rgb,alpha]));box=rgba.getbbox();crop=rgba.crop(box)
 k=400/(footy-y0-box[1]);crop=crop.resize((round(crop.width*k),round(crop.height*k)),Image.Resampling.NEAREST)
 px=frame*768+200+round((x0+box[0]-footx)*k);py=456+round((y0+box[1]-footy)*k)
 atlas.alpha_composite(crop,(px,py))
atlas.save(root/'luffy-jet-stamp.png')
print('Exported 4 aligned kick poses, 768×512 cells; pivot 200,456')
