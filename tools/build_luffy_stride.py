from pathlib import Path
from PIL import Image
import numpy as np, cv2
root=Path(__file__).resolve().parents[1]/'assets/chapter-01/motion'
im=Image.open(root/'luffy-stride-source.png').convert('RGB');w,h=im.size
out=Image.new('RGBA',(384*3,384*2))
for i in range(6):
 a=np.asarray(im.crop((round(i%3*w/3),round(i//3*h/2),round((i%3+1)*w/3),round((i//3+1)*h/2)))).copy()
 rgb=a.astype(int);bg=(rgb[:,:,0]>140)&(rgb[:,:,2]>140)&(rgb[:,:,1]<110)&(rgb[:,:,0]+rgb[:,:,2]>rgb[:,:,1]*3+170)
 mask=(~bg).astype('uint8');n,labels,stats,_=cv2.connectedComponentsWithStats(mask,8);mask=labels==(1+np.argmax(stats[1:,cv2.CC_STAT_AREA]))
 rgba=np.dstack((a,mask.astype('uint8')*255));ys,xs=np.where(mask)
 crop=Image.fromarray(rgba).crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
 # Common height preserves continuity with the existing 64-world-pixel character.
 scale=236/crop.height;crop=crop.resize((round(crop.width*scale),236),Image.Resampling.NEAREST)
 arr=np.asarray(crop);red=(arr[:,:,0]>arr[:,:,1]*1.6)&(arr[:,:,0]>arr[:,:,2]*1.4)&(arr[:,:,3]>0);ry,rx=np.where(red)
 pivot=round(float(np.median(rx)));out.alpha_composite(crop,(i%3*384+192-pivot,i//3*384+340-crop.height))
out.save(root/'luffy-stride.png');print('Six full-body stride frames exported')
