import sys
import os
import csv
import re
import numpy

res=[]
mapping={}
listfile=sys.argv[1]
seg_id_v=numpy.load(sys.argv[2])
out_file=sys.argv[3]
mapping_hash_ans={}
mapping_hash_ans[-1]=-1
count_id=0
for line in open(listfile):
	arr=line.strip().split(",")
	a=int(arr[0])
	cls=int(arr[1])
	mapping[a]=cls
	if not cls in mapping_hash_ans:
		mapping_hash_ans[cls]=count_id
		count_id+=1;

for el in seg_id_v:
	if el in mapping:
		res.append(mapping[el])
	else:
		res.append(-1)


numpy.save(out_file,res)

fp=open("mapping_hash_ans.csv","w")
for k,v in mapping_hash_ans.items():
	fp.write(str(k)+","+str(v)+"\n")

