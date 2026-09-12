from pathlib import Path
from PIL import Image
import numpy as np,cv2
root=Path(__file__).resolve().parents[1]/'assets/chapter-02';out=root/'cleaned';out.mkdir(exist_ok=True)
for name,rows,anchors in [('black-cat-pirate-poses',3,[[164,590,920,1280],[177,590,950,1330],[165,590,925,1260]]),('kuro-attack-poses',2,[[149,470,850,1285],[185,545,1020,1320]])]:
 a=np.asarray(Image.open(root/(name+'.png')).convert('RGBA')).copy();n,l,stats,c=cv2.connectedComponentsWithStats((a[:,:,3]>200).astype('uint8'),8)
 groups=[i for i in range(1,n) if stats[i,4]>2000];groups.sort(key=lambda i:(int(c[i,1]/(1024/rows)),c[i,0]))
 atlas=Image.new('RGBA',(640*4,576*rows))
 for frame,i in enumerate(groups):
  row=frame//4;col=frame%4;mask=l==i;rgba=a.copy();rgba[:,:,3]=mask.astype('uint8')*255
  ybase=334 if rows==3 and row==0 else 650 if rows==3 and row==1 else 990 if rows==3 else 494 if row==0 else 952
  x,y,w,h=stats[i,:4];crop=Image.fromarray(rgba).crop((x,y,x+w,y+h));atlas.alpha_composite(crop,(col*640+320+int(x)-anchors[row][col],row*576+536+int(y)-ybase))
 atlas.save(out/(name+'.png'))
# Preserve the alpha silhouette while removing the generated faint haze.
for name in ['syrup-village-midground','syrup-woodland-foreground']:
 a=np.asarray(Image.open(root/(name+'.png')).convert('RGBA')).copy();a[:,:,3]=np.where(a[:,:,3]>180,255,0);Image.fromarray(a).save(out/(name+'.png'))
print('Chapter two characters and scene layers exported')
