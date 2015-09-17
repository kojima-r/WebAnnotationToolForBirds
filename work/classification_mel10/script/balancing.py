import cPickle
import gzip
import os
import sys
import time

import numpy
import collections
import random

random.seed(1)
labels=numpy.load(sys.argv[2])
counter=collections.defaultdict(list)
cnt=0
for l in labels.tolist():
	counter[l].append(cnt)
	cnt+=1

print counter.keys()
vals = map(len,counter.values())
print vals
mval = min(vals)
print mval

cnt_dict={}
for k,v in counter.items():
	#d=zip(xrange(len(v)),v)
	d=v
	random.shuffle(d)
	#print d
	selected_d=d[0:mval]
	#selected_d.sort(key=lambda tup: tup[0])
	selected_d.sort()
	cnt_dict[k]=selected_d

data=numpy.load(sys.argv[1])
out_data=[]
out_label=[]
cnt=0
for l,v in zip(labels.tolist(),data.tolist()):
	if len(cnt_dict[l])>0:
		x=cnt_dict[l][0]
		if cnt==x:
			cnt_dict[l].pop(0)
			out_data.append(data[x])
			out_label.append(labels[x])
	cnt+=1
#print len(out_label)
#print len(out_data)

out_file, ext1=os.path.splitext(os.path.basename(sys.argv[1]))
out_file_label,ext2=os.path.splitext(os.path.basename(sys.argv[2]))

numpy.save(out_file+"_b.npy",out_data)
numpy.save(out_file_label+"_b.npy",out_label)

