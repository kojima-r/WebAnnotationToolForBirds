import sys
import os
import csv
import re
import numpy
import collections

data=[]
ans={}
res=collections.defaultdict(list)
spamReader1 = numpy.load(sys.argv[1])
spamReader2 = csv.reader(open(sys.argv[2], 'r'), delimiter=' ', quotechar='|')
spamReader3 = numpy.load(sys.argv[3])
for r1,r2,a in zip(spamReader1,spamReader2,spamReader3):
	rid1=int(r1)
	rid2=r2[0]
	res[rid1].append(rid2)
	ans[rid1]=a

for seg_id,v in res.items():
	print str(seg_id)+":" +str(ans[seg_id]) +":"+" ".join(map(str,v))

