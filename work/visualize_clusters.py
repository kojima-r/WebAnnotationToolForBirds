# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

import wave
from pylab import *
import matplotlib.cm as cm
from itertools import chain
import os.path
#init pygame

filename= sys.argv[1]#"int_furu_0505_140_init1min.wav"
#evt_map_filename= None
evt_map_filename= sys.argv[2]
if not os.path.exists(evt_map_filename):
    print >>sys.stderr,"[WARN] event file does not exist:",evt_map_filename
    evt_map_filename=None
frm_map_filename= None
output_postfix= sys.argv[3]
if len(sys.argv)>=5:
	cutoff= int(sys.argv[4])
else:
	cutoff= 150
#frm_map_filename= sys.argv[2]
#cutoff= 100
frame_sec=1.0/100 #10msec

def read_cluster_event(filename):
	res={}
	cls={}
	for line in open(filename,"r"):
		arr=line.strip().split(" ")
		if len(arr)>1:
			res[int(arr[0])]=int(arr[1])
			cls[int(arr[1])]=1
	n_cls=len(cls.items())
	return res,n_cls

def read_cluster_frame(filename):
	res={}
	cls={}
	for line in open(filename,"r"):
		arr=line.strip().split(":")
		if len(arr)>1:
			vec=map(int,arr[1].split(","))
			res[int(arr[0])]=vec
			for cls_i in vec:
				cls[cls_i]=1
			n_cls=len(cls.items())
	return res,n_cls

def extend_frame(fvec,frame_len):
	org_len=len(fvec)
	print org_len,"->",frame_len
	if org_len<frame_len:
		x=frame_len/org_len
		l=[[el]*x for el in fvec]
		lf=list(chain.from_iterable(l))
		lfe=lf+[lf[-1]]*(len(lf)-frame_len)
		return lfe
	elif org_len>frame_len:
		s=org_len*1.0/frame_len
		step=0
		l=[]
		for i in xrange(frame_len):
			index=int(step)
			l.append(fvec[index])
			step+=s
		#print "extend frame error"
		return l
	else:
		return fvec

#print filename
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
ax2= plt.subplot(1, 1, 1)
pxx[0], freqs, bins, im = ax2.specgram(cdata[0], NFFT=N, Fs=wf.getframerate(), noverlap=0, window=hammingWindow, cmap=plt.cm.binary)
#ax2.set_xlabel("sec")
#ax2.set_ylabel("frequency")
ax2.set_xlim([0, length])
plt.tick_params(labelbottom='off')
plt.tick_params(labelleft='off')
plt.savefig("specgram.png", bbox_inches="tight", pad_inches=0.0)


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
new_id=-1
for d in data:
	sid=d[1]
	if sid>c:
		line.append([])
		c= int(sid)
		new_id+=1
	#
	line[c].append([new_id, d[0], d[4]])

#短いイベントの除去(フレーム単位)
line2=[d for d in line if (d[-1][1]-d[0][1] > cutoff)]


if frm_map_filename!=None: frm_mapping,n_frm_cls=read_cluster_frame(frm_map_filename)
if evt_map_filename!=None: evt_mapping,n_evt_cls=read_cluster_event(evt_map_filename)

#fig= plt.figure(figsize=(12, 4))
axs= plt.subplot(2, 1, 2)

t=0
line3=[]
for l in line2:
	l2= np.array(l).transpose()
	seg_id=int(l2[0][0])
	# l2.shape = 3,N
    # ID,時間,角度
	cls_vec=None
	if frm_map_filename!=None and seg_id in frm_mapping:
		frm_cls=frm_mapping[seg_id]
		frm_cls_ex=extend_frame(frm_cls,len(l2[1]))
		color_vec=[float(cls)/n_frm_cls for cls in frm_cls_ex]
		cls_vec=frm_cls_ex
	# evt
	if evt_map_filename!=None and seg_id in evt_mapping:
		evt_cls=evt_mapping[seg_id]
		color_vec=[float(evt_cls)/n_evt_cls]*len(l2[1])
		cls_vec=[evt_cls]*len(l2[1])
	#
	if cls_vec!=None:
		line3.append([seg_id,cls_vec,l2[1]*frame_sec, (l2[2])*360.0/(2.0*np.pi)])
		cv=cm.gist_rainbow(color_vec)
		axs.scatter(l2[1]*frame_sec, (l2[2])*360.0/(2.0*np.pi),marker=u'+',s=10,color=cv,alpha=.5)
		#axs.plot(l2[1]*frame_sec, (l2[2])*360.0/(2.0*np.pi))
	else:
                cls_vec=[0]*len(l2[1])
		line3.append([seg_id,cls_vec,l2[1]*frame_sec, (l2[2])*360.0/(2.0*np.pi)])
		axs.scatter(l2[1]*frame_sec, (l2[2])*360.0/(2.0*np.pi),marker=u'+',s=10,alpha=.5)
	
	if t%2==0:
		axs.text(l2[1][0]*frame_sec, (l2[2][0])*360.0/(2.0*np.pi), seg_id, picker=True)
	else:
		axs.text(l2[1][-1]*frame_sec, (l2[2][-1])*360.0/(2.0*np.pi), seg_id, picker=True)
	t+=1

axs.set_xlim([0, length])
axs.set_ylim([-180, 180])
axs.set_xlabel("sec")
axs.set_ylabel("degree")

plt.savefig(filename+output_postfix+".png")
plt.savefig(filename+output_postfix+".eps")

#fig.canvas.mpl_connect('pick_event', onpick1)
#plt.show()
for l3 in line3:
	seg_id=l3[0]
	cls_vec=l3[1]
	x_vec=l3[2]
	theta=(180-l3[3])/360.0
	for c,v,t in zip(cls_vec,x_vec,theta):
		print ",".join(map(str,[seg_id,c,v,t,seg_id]))

