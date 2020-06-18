# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use('Agg')
import sys
import numpy as np; np.random.seed(0)
import seaborn as sns; sns.set()
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from HARK_TF_Parser.sorting_mat import  permutation_hark_tf


tf_filename=sys.argv[1]

permutation=list(permutation_hark_tf(tf_filename).values())
permutation.reverse()


mat_list=[]
for line in open("music.txt"):
	arr=line.strip().split("\t")
	mat_list.append(list(map(float,arr)))

data = np.array(mat_list)
data=data[:,permutation]
#print data
print("# MUSIC spectrogram:",data.shape)
#col=data.shape[1]
###data=np.c_[data[:,col/2:],data[:,:col/2]]
#data=data[:,::-1]

ax = sns.heatmap(data.transpose(),cbar=False,cmap=cm.Greys)
plt.axis("off")
#sns.plt.axis("off")
#sns.despine()
sns.despine(fig=None, ax=None, top=False, right=False, left=False, bottom=False, offset=None, trim=False)
plt.tight_layout()
ax.tick_params(labelbottom='off')
ax.tick_params(labelleft='off')
plt.savefig("music.png", bbox_inches="tight", pad_inches=0.0)

