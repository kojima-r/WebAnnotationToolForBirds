import os
import sys
import json
import pickle
import numpy
#../../sources/sources.json 
fp=open(sys.argv[1],"r")
data=json.load(fp)
print data
#pickle.dump("source.dump",data)
fp = open("source.dump", "w")
pickle.dump(data,fp)
#numpy.save(data,fp)

