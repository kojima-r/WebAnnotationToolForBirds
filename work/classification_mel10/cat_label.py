
import os
import sys
import re
import cPickle
import gzip
import numpy

if len(sys.argv)<4:
	print "USAGE: python cat_label.py output input1 input2 "
a=numpy.load(sys.argv[2])
b=numpy.load(sys.argv[3])
o=numpy.hstack((a,b))
print a.shape
print b.shape
print o.shape
numpy.save(sys.argv[1],o)

