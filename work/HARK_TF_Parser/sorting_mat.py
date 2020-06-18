import sys
import numpy as np
import zipfile
from . import read_source
import math


def apply_permutation_row(permutation,mat):
	a=list(permutation.values())
	return mat[a]

def permutation_hark_tf(tf_filename):
	config=read_source.read_hark_tf_source(tf_filename)
	# main
	tf_dict={}
	tf_pair=[]
	with zipfile.ZipFile(tf_filename, 'r') as zf:
		for el in config["positions"]:
			index=el[0]
			theta=math.atan2(el[2],el[1])# -pi ~ pi
			tf_pair.append((theta,index))
	sorted_pairs=sorted(tf_pair)
	for index,pair in enumerate(sorted_pairs):
		tf_dict[index]=pair[1]
	return tf_dict

if __name__ == '__main__':
	if len(sys.argv)<2:
		print("Usage: read_param.py <in: tf.zip(HARK2 transfer function file)>", file=sys.stderr)
		quit()
	tf_filename=sys.argv[1]
	permutation=permutation_hark_tf(tf_filename)
	print(permutation)
