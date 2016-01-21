import numpy as np; np.random.seed(0)
import seaborn as sns; sns.set()
import matplotlib.pyplot as plt
import matplotlib.cm as cm

mat_list=[]
for line in open("music.txt"):
	arr=line.strip().split("\t")
	mat_list.append(map(float,arr))

data = np.array(mat_list)
print data
print data.shape
col=data.shape[1]
#data=np.c_[data[:,col/2:],data[:,:col/2]]
data=data[:,::-1]

ax = sns.heatmap(data.transpose(),cbar=False,cmap=cm.Greys)
sns.plt.axis("off")
#sns.despine()
sns.despine(fig=None, ax=None, top=False, right=False, left=False, bottom=False, offset=None, trim=False)
plt.tight_layout()
ax.tick_params(labelbottom='off')
ax.tick_params(labelleft='off')
sns.plt.savefig("music.png", bbox_inches="tight", pad_inches=0.0)

