# coding: UTF-8

import os
import matplotlib
matplotlib.use('Agg')
from sklearn.decomposition import PCA
from sklearn.lda import LDA
import matplotlib.pyplot as plt
from optparse import OptionParser
import array
import csv
import numpy as np
import pickle

parser = OptionParser()

parser.add_option(
	"-f", "--file", dest="input_file",
	help="input FILE",
	metavar="FILE")
parser.add_option(
	"-A", "--ans", dest="ans_file",
	help="answer FILE(numpy mode only)",
	metavar="FILE")
parser.add_option(
	"--lda",action="store_true", dest="lda",
	help="use linear discriminant analysis",
	default=False)
parser.add_option(
	"--numpy",action="store_true", dest="numpy",
	help="load parameter from numpy",
	default=False)
parser.add_option(
	"-d", "--dat", dest="dat",
	default="",
	help="input data from dat file",
	metavar="FILE")
parser.add_option(
	"-a", "--ans_col", dest="ans_col",
	default=None,
	help="answer collumn (comma-separated values)")
parser.add_option(
	"-e", "--enable_col", dest="e_col",
	default=None,
	help="answer collumn (comma-separated values)")
parser.add_option(
	"-n", "--n_out", dest="n_out",
	default="0",
	help="number of output classes",
	metavar="FILE")
parser.add_option(
	"-o", "--output_file", dest="output_file",
	default="output.png",
	help="output file name",
	metavar="FILE")
parser.add_option(
	"-O", "--output_data", dest="output_data",
	default=None,
	help="output csv file name",
	metavar="FILE")
parser.add_option(
	"-D", "--dim", dest="output_dim",
	default=2,
	type=int,
	help="output dim",
	metavar="D")
parser.add_option(
	"-s", "--save", dest="save_file",
	default=None,
	help="save param file",
	metavar="FILE")
parser.add_option(
	"-l", "--load", dest="load_file",
	default=None,
	help="load param file",
	metavar="FILE")


(options, args) = parser.parse_args()

def getValues(arr):
	data={}
	for el in arr:
		data[el]=1
	return sorted(data.keys())

## データの読み込み
X = None
y = None
max_y=10
plot_enable=True

if options.numpy:
	X=np.load(options.input_file)
	if(options.ans_file!=None):
		y=np.load(options.ans_file)
		max_y= np.max(y)
else:
	data=[]
	ans=[]
	s_col=0
	t_col=None
	if options.ans_col!=None:
		ans_col=int(options.ans_col)
	if options.e_col!=None:
		arr=options.e_col.split(",")
		s_col=int(arr[0])
		if len(arr)>1: t_col=int(arr[1])
	print "input file:"+options.input_file
	spamReader=csv.reader(open(options.input_file,'r'),delimiter=',')
	for row in spamReader:
		r=map(float,row[s_col:t_col])
		if ans_col!=None: ans.append(row[ans_col])
		data.append(r)
	
	X= np.array(data)
	y= np.array(ans)
	max_y= np.max(ans)
title=""
if options.lda:
	## LDA
	lda=LDA(n_components=options.output_dim)
	X_r=lda.fit(X,y).transform(X)
	title="LDA"
else:
	## PCA
	pca=None
	if options.load_file!=None:
		pca=pickle.load(open(options.load_file, 'rb'))
	else:
		pca=PCA(n_components=options.output_dim)
		pca.fit(X)
	X_r=pca.transform(X)
	if options.save_file!=None:
		pickle.dump(pca, open(options.save_file, 'wb'))
	title="PCA"


if plot_enable and options.output_dim==2:
	## colors
	colors = [plt.cm.nipy_spectral(i*1.0/max_y, 1) for i in range(max_y)]
	print "color:",colors
	
	## plot
	plt.figure()
	target_names=getValues(y)
	print "label     :"+str(target_names)
	print y
	#print X_r
	for c,target_name in zip(colors,target_names):
		plt.scatter(X_r[y==target_name, 0], X_r[y==target_name, 1], c=c, label = target_name)
	#plt.scatter(X_r[:,0], X_r[:,1])
	plt.legend()
	plt.title(title)
	filename = options.output_file
	plt.savefig(filename)
	#plt.show()
	

if options.output_data!=None:
	path, ext = os.path.splitext(options.output_data)
	if(ext==".npy"):
		np.save(options.output_data, X_r)
	else:
		np.savetxt(options.output_data, X_r, delimiter=",")

