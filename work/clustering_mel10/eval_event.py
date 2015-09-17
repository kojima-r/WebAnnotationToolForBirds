import sys
import os
import csv
import re
import numpy
import collections

data=[]
res=collections.defaultdict(collections.Counter)
spamReader1 = csv.reader(open(sys.argv[1], 'r'), delimiter=',', quotechar='|')
spamReader2 = csv.reader(open(sys.argv[2], 'r'), delimiter=',', quotechar='|')
for r1,r2 in zip(spamReader1,spamReader2):
	rid1=int(r1[0])
	rid2=int(r2[0])
	res[rid1][rid2]+=1

for k,v in res.items():
	s=0
	for cid,n in v.items():
		s+=n
	
	arr=sorted([[cid,n*1.0/s] for cid,n in v.items()],key=lambda el: -el[1])
	print k,arr[0][0]

