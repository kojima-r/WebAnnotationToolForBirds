
import os
import sys
import re
import cPickle
import gzip
import numpy

a=numpy.load(sys.argv[1])
print a
print a.shape
