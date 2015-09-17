import json
import sys
import os
import numpy

if len(sys.argv)<3:
	print "USAGE: output_type(mfcc/mel) data.json basepath window_size"
	quit()

#fp=open("./data.json","r")
fp=open(sys.argv[2],"r")
data=json.load(fp)
otype=sys.argv[1]
#basepath="/export/sugiyama/speech_classification/sss_network/"
basepath=sys.argv[3]
vfloat=numpy.vectorize(float)
vecs=[]
label=[]
win=int(sys.argv[4])

for k,mapping in data.items():
	for path in mapping[otype]:
		obj=numpy.load(basepath+path)
		o=vfloat(obj)
		l=o.shape[0]
		for i in xrange(l/win):
			wo=o[i*win:(i+1)*win]
			vecs.append(wo.ravel())
		label+=[mapping["label"]]*(l/win)
		
#dataset = numpy.vstack(vecs)
dataset = numpy.array(vecs)
print dataset.shape
print len(label)
numpy.save("dataset_x.npy",dataset)
numpy.save("dataset_y.npy",label)
