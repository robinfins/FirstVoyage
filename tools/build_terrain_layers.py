"""Extract ship railing silhouettes; preserve transparent spaces between balusters."""
from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]/'assets/chapter-01'
im=Image.open(root/'layers/sunny-ship-layer.png').convert('RGBA')
mask=Image.new('L',im.size);d=ImageDraw.Draw(mask)
def railing(left,right,top,bottom,centers,width=7):
 d.rectangle((left,top,right,top+9),fill=255)
 for c in centers:
  d.polygon([(c-width,top+8),(c+width,top+8),(c+width-2,top+15),(c+width-3,bottom-8),(c+width,bottom-3),(c+width,bottom),(c-width,bottom),(c-width,bottom-3),(c-width+3,bottom-8),(c-width-2,top+15)],fill=255)
railing(232,990,407,441,[263,295,328,359,395,431,466,502,541,580,616,667,700,733,766,801,835,884,916,950,980])
railing(1062,1521,422,454,[1066,1088,1124,1158,1193,1226,1259,1292,1319,1355,1389,1422,1452,1481,1510])
railing(223,310,606,653,[231,262,300],9)
railing(1403,1517,605,654,[1414,1458,1499],9)
# Retain source pixels only inside the fence silhouette, never the rectangular scenery strip.
from PIL import ImageChops
im.putalpha(ImageChops.multiply(im.getchannel('A'),mask))
im.save(root/'layers/sunny-rails-foreground.png')
# Regression anchors inside railing gaps, and on the continuous top beam.
assert im.getpixel((280,430))[3]==0
assert im.getpixel((280,410))[3]>0
print('Rail mask: transparent openings verified')
