
import os
import sys
import re
import cPickle
import gzip
import numpy

data=numpy.load(sys.argv[1])
#print data
print data.shape
maxv=data.max(0)
minv=data.min(0)
epsilon=1.0e-10
f=numpy.vectorize(lambda vec: (vec-minv)/(maxv-minv))

nd=(data-minv)/(maxv-minv+epsilon)
#print nd
out_file, ext1=os.path.splitext(sys.argv[1])
numpy.save(out_file+"_n.npy",nd)

