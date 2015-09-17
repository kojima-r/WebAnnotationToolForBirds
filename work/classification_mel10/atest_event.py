
import os
import sys
import re
import cPickle
import gzip
import numpy
import csv

a=numpy.load(sys.argv[1])
labels={}
for el in a:
	labels[el]=1
#109,2,54,0.15286799866
spamReader = csv.reader(open(sys.argv[2], 'r'), delimiter=',', quotechar='|')
for line in spamReader:
	seg_id=int(line[0])
	if seg_id in labels:
		print ",".join(line)
	else:
		line[1]="-1"
		print ",".join(line)

