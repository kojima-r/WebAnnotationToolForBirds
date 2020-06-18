import sys
import numpy as np
import zipfile
from .parse_mat import parse_mat
from . import read_source

#TF_FILE="transferFunction/separation/tf%05d.mat"
TF_FILE="transferFunction/localization/tf%05d.mat"

def read_hark_tf(tf_filename):
	config=read_source.read_hark_tf_source(tf_filename)
	# main
	tf_dict={}
	with zipfile.ZipFile(tf_filename, 'r') as zf:
		for el in config["positions"]:
			index=el[0]
			path=TF_FILE%index
			#print path
			fp=zf.open(path)
			np_mat,info=parse_mat(fp)
			#print info
			#print np_mat.shape
			tf_dict[index]={"info":info,"mat":np_mat,"position":el[1:4]}
	config["tf"]=tf_dict
	#print "# config:",config
	return config

if __name__ == '__main__':
	if len(sys.argv)<2:
		print("Usage: read_param.py <in: tf.zip(HARK2 transfer function file)>", file=sys.stderr)
		quit()
	tf_filename=sys.argv[1]
	#np.save(out_filename,np_mat)
	config=read_hark_tf(tf_filename)
	print(config)
