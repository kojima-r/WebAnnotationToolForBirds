# -*- coding: utf-8 -*-
import numpy as np

import wave
from pylab import *
from itertools import chain

#init pygame

filename= sys.argv[1]#"int_furu_0505_140_init1min.wav"
#evt_map_filename= None
evt_map_filename= sys.argv[2]
frm_map_filename= None
output_postfix= sys.argv[3]
#frm_map_filename= sys.argv[2]
#cutoff= 100
cutoff= 150
frame_sec=1.0/100 #10msec

def read_cluster_event(filename):
	res={}
	cls={}
	for line in open(filename,"r"):
		arr=line.strip().split(" ")
		if len(arr)>1:
			res[int(arr[0])]=int(arr[1])
			cls[int(arr[1])]=1
	n_cls=len(list(cls.items()))
	return res,n_cls

def read_cluster_frame(filename):
	res={}
	cls={}
	for line in open(filename,"r"):
		arr=line.strip().split(":")
		if len(arr)>1:
			vec=list(map(int,arr[1].split(",")))
			res[int(arr[0])]=vec
			for cls_i in vec:
				cls[cls_i]=1
			n_cls=len(list(cls.items()))
	return res,n_cls

def extend_frame(fvec,frame_len):
	org_len=len(fvec)
	print(org_len,"->",frame_len)
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
		for i in range(frame_len):
			index=int(step)
			l.append(fvec[index])
			step+=s
		#print "extend frame error"
		return l
	else:
		return fvec

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
		cls_vec=frm_cls_ex
	# evt
	if evt_map_filename!=None and seg_id in evt_mapping:
		evt_cls=evt_mapping[seg_id]
		cls_vec=[evt_cls]*len(l2[1])
	#
	if cls_vec!=None:
		line3.append([seg_id,cls_vec,l2[1]*frame_sec, (l2[2])*360.0/(2.0*np.pi)])

for l3 in line3:
	seg_id=l3[0]
	cls_vec=l3[1]
	x_vec=l3[2]
	theta=(180-l3[3])/360.0
	for c,v,t in zip(cls_vec,x_vec,theta):
		print(",".join(map(str,[seg_id,c,v,t])))

