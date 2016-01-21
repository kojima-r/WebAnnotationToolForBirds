import sys
import os
import csv
import re
import numpy
import collections

listfile=sys.argv[1]
seg_id_v=numpy.load(sys.argv[2])

res=[]

counter=collections.defaultdict(int)
all_counter=collections.defaultdict(int)
data=collections.defaultdict(list)
#interpolating listfile(including time and direction):../../../upload/uploaded_label.csv
#
for line in open(listfile):
	arr=line.strip().split(",")
	seg_id=int(arr[0])
	t=float(arr[2])
	d=float(arr[3])
	data[seg_id].append([t,d])

#seg_id file:../dataset/data_seg_id.npy
#seg_id file consits of a list of IDs corresponding to frames in dataset
#counts #frames in each ID
for el in seg_id_v:
	all_counter[el]+=1

#calcurate interpolation rate r to interpolate time and direction data for frames in each ID
for el in seg_id_v:
	m=counter[el]
	n=all_counter[el]
	r=(m*1.0/n-0.0001)*(len(data[el])-1)
	# res=[seg_id,previous(t,d),next(t,d),rate]
	res.append([el,data[el][int(r)],data[el][int(r)+1],r-int(r)])
	counter[el]+=1
# interpolate and set results
result=[]
for seg_id,prev,nxt,r in res:
	now_t=(nxt[0]-prev[0])*r+prev[0]
	now_d=(nxt[1]-prev[1])*r+prev[1]
	result.append([seg_id,now_t,now_d])

for v in result:
	print ",".join(map(str,v))

