from pathlib import Path
import numpy as np, cv2, json
from PIL import Image
from clean_sprites import remove_checker
root=Path(__file__).resolve().parents[1]/'assets/chapter-01/motion'
im=Image.open(root/'luffy-motion-source.png');w,h=im.size
atlas=Image.new('RGBA',(384*4,384*4));records=[]
for i in range(16):
 x0=round(i%4*w/4);x1=round((i%4+1)*w/4);y0=round(i//4*h/4);y1=round((i//4+1)*h/4)
 a=remove_checker(im.crop((x0,y0,x1,y1)))
 n,l,stats,_=cv2.connectedComponentsWithStats((a[:,:,3]>0).astype('uint8'),8)
 largest=1+np.argmax(stats[1:,cv2.CC_STAT_AREA]);a[l!=largest,3]=0
 rgb=a[:,:,:3].astype(int);blue=(rgb[:,:,2]>rgb[:,:,0]*1.35)&(rgb[:,:,2]>rgb[:,:,1]*1.1)&(a[:,:,3]>0)
 yy,xx=np.where(blue);cx=float(np.median(xx))
 ys,xs=np.where(a[:,:,3]>0);bottom=int(ys.max())+1
 # Keep hips centred rather than centring the variable arm/leg silhouette.
 baseline=bottom if i<12 else int(np.median(yy)+100)
 tile=Image.fromarray(a);dx=round(192-cx);dy=340-baseline
 atlas.alpha_composite(tile,(i%4*384+dx,i//4*384+dy))
 records.append({'index':i,'source':[x0,y0,x1-x0,y1-y0],'hip_x':cx,'baseline':baseline})
atlas.save(root/'luffy-motion.png');(root/'registration.json').write_text(json.dumps(records,indent=2))
print('Exported 16 registered movement poses')
