# -*- coding: utf-8 -*-
import matplotlib.pyplot as plt
import numpy as np

import wave
from pylab import *

#init pygame

filename= sys.argv[1]#"int_furu_0505_140_init1min.wav"
#cutoff= 100
cutoff= 100


wf = wave.open(filename, "rb")

data = wf.readframes(wf.getnframes())
data = frombuffer(data, dtype="int16")

NC= wf.getnchannels()
#NC=7
CNF= int(wf.getnframes())
length = float(wf.getnframes()) / wf.getframerate() 

#SEC= 60
#CNF= wf.getframerate()*SEC
#length= SEC

wf.close()

# FFTのサンプル数
N = 512

cdata= np.zeros((NC, CNF))
for i in range(CNF):
	for j in range(NC):
		cdata[j][i]= data[i*NC+j]
		#cdata[j][i]= abs(data[i*NC+j] - data[i*NC+0])
	

# FFTで用いるハミング窓
hammingWindow = np.hamming(N)

# スペクトログラムを描画
fig= plt.figure(figsize=(10, 18))

pxx= [None for i in range(NC)]
ax= [None for i in range(NC)]
for i in range(NC):
	ax[i]= plt.subplot(NC+1, 1, i+1)
	pxx[i], freqs, bins, im = ax[i].specgram(cdata[i], NFFT=N, Fs=wf.getframerate(), noverlap=0, window=hammingWindow, cmap=plt.cm.binary)

plt.savefig("temp.png")

fig= plt.figure(figsize=(16, 8))
ax[0]= plt.subplot(2, 1, 1)
pxx[0], freqs, bins, im = ax[0].specgram(cdata[0], NFFT=N, Fs=wf.getframerate(), noverlap=0, window=hammingWindow, cmap=plt.cm.binary)

ax[0].set_xlabel("sec")
ax[0].set_ylabel("frequency")
ax[0].set_xlim([0, length])

#separated dist.

infilename= "separated.txt"

data = list(np.loadtxt(infilename))
data.sort(cmp=lambda x,y: cmp(x[1], y[1]))

#data= np.array(data).transpose()

line=[]

c= -1
c2=-1
for d in data:
	if d[1]>c:
		line.append([])
		c= int(d[1])
		c2+=1
	line[c].append([c2, d[0], d[4]])

line2=[d for d in line if (d[-1][1]-d[0][1] > cutoff)]

#fig= plt.figure(figsize=(12, 4))
axs= plt.subplot(2, 1, 2)

t=0
for l in line2:
	l2= np.array(l).transpose()
	axs.plot(l2[1]/100.0, (l2[2])*360.0/(2.0*np.pi))
	if t%2==0:
		axs.text(l2[1][0]/100.0, (l2[2][0])*360.0/(2.0*np.pi), int(l2[0][0]), picker=True)
	else:
		axs.text(l2[1][-1]/100.0, (l2[2][-1])*360.0/(2.0*np.pi), int(l2[0][-1]), picker=True)
	t+=1

axs.set_xlim([0, length])
axs.set_ylim([-180, 180])
axs.set_xlabel("sec")
axs.set_ylabel("degree")

plt.savefig(filename+"_spec_separated.png")
plt.savefig(filename+"_spec_separated.eps")

#fig.canvas.mpl_connect('pick_event', onpick1)
#plt.show()

