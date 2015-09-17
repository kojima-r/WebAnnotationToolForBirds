import sys
import os
import csv
import re
import numpy
import collections

data=[]
res=collections.defaultdict(list)
spamReader1 = csv.reader(open(sys.argv[1], 'r'), delimiter=',', quotechar='|')
spamReader2 = csv.reader(open(sys.argv[2], 'r'), delimiter=',', quotechar='|')
for r1,r2 in zip(spamReader1,spamReader2):
	rid1=int(r1[0])
	rid2=int(r2[0])
	res[rid1].append(rid2)

for k,v in res.items():
	print str(k)+":"+",".join(map(str,v))

