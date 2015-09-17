import sys
import os
import csv
import re
import numpy

data=[]
res=[]
postfix=sys.argv[1]
for filename in sys.argv[2:]:
	spamReader = csv.reader(open(filename, 'r'), delimiter=',', quotechar='|')
	cnt=0
	for row in spamReader:
		vec=numpy.array(map(float,row))
		data.append(vec)
		cnt+=1
	
	#root,ext = os.path.splitext(filename)
	#numpy.save(basepath+".npy",data)
	m=re.search(r'sep_(\d*)\.',filename)
	if m:
		print filename
		file_id=int(m.group(1))
		res.extend([file_id]*cnt)
	#numpy.save("audio_x.npy",numpy.array(data))

numpy.save("data"+postfix+".npy",data)
numpy.save("data"+postfix+"_seg_id.npy",res)


