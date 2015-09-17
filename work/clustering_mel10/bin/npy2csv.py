
import os
import sys
import re
import cPickle
import gzip
import numpy

data=numpy.load(sys.argv[1])

#print data.shape
#print ans.shape
if len(sys.argv)==3:
	ans=numpy.load(sys.argv[2])
	for x,y in zip(data,ans):
		print str(y)+","+",".join(map(str,x))
else:
	for x in data:
		if(x.shape!=()):
			print ",".join(map(str,x))
		else:
			print x

