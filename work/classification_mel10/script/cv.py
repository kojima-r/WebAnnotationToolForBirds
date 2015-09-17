
import os
import sys
import re
import cPickle
import gzip
import numpy

if len(sys.argv)<4:
	print >>sys.stderr, "USAGE: cv.py data_file answer_file basename"
	quit()
n_fold=5
data_x=numpy.load(sys.argv[1])
data_y=numpy.load(sys.argv[2])
basename=sys.argv[3]
dataset=zip(data_x,data_y)
numpy.random.seed([1234])
numpy.random.shuffle(dataset)
for k in xrange(n_fold):
	cnt=0
	trainset_x=[]
	trainset_y=[]
	testset_x=[]
	testset_y=[]
	for v,a in dataset:
		if (cnt%n_fold)==k:
			testset_x.append(v)
			testset_y.append(a)
		else:
			trainset_x.append(v)
			trainset_y.append(a)
		cnt+=1
	numpy.save(basename+"train"+str(k+1),numpy.array(trainset_x))
	numpy.save(basename+"train"+str(k+1)+"_ans",numpy.array(trainset_y))
	numpy.save(basename+"test"+str(k+1),numpy.array(testset_x))
	numpy.save(basename+"test"+str(k+1)+"_ans",numpy.array(testset_y))
#data=numpy.save("cv/test1")
#dat
#data=numpy.save("cv/train1")
#data=numpy.save("cv/test1")
#dat
