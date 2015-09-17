import sys
import os
import csv
import re
import numpy

data=[]
res=[]
res_id=[]
listfile=sys.argv[1]
ext=sys.argv[2]
out_basename=sys.argv[3]
out_postfix=sys.argv[4]
for line in open(listfile):
	arr=line.strip().split(",")
	filename=arr[0]+ext
	cls=int(arr[1])
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
		file_id=int(m.group(1))
		res_id.extend([file_id]*cnt)
	
	res.extend([cls]*cnt)
	#numpy.save("audio_x.npy",numpy.array(data))

numpy.save(out_basename+"data"+out_postfix+".npy",data)
numpy.save(out_basename+"data_ans"+out_postfix+".npy",res)
numpy.save(out_basename+"data_seg_id"+out_postfix+".npy",res_id)


