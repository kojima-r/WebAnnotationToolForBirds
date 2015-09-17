import sys
import os
import csv
import re
import numpy

#n=int(sys.argv[1])
ifile=sys.argv[1]
ofile=sys.argv[2]

obj=numpy.load(ifile)
n=obj.shape[0]
data=numpy.array([-1]*n)
numpy.save(ofile,data)

