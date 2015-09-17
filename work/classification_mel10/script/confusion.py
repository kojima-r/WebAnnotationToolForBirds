import numpy
import os
import sys
import csv
import collections

## bash setting
tab_space=8
cell_tab=1
## Vim setting
#tab_space=4
#cell_tab=2
mapping_filename=None
if len(sys.argv)==4:
	mapping_filename=sys.argv[1]
	label1_filename=sys.argv[2]
	label2_filename=sys.argv[3]
else:
	label1_filename=sys.argv[1]
	label2_filename=sys.argv[2]

def read_label(filename):
	path, ext = os.path.splitext( os.path.basename(filename))
	if(ext==".txt" or ext==".csv"):
		#csv
		data=[]
		spamReader = csv.reader(open(filename, 'r'), delimiter=',')
		for line in spamReader:
			data.append(int(line[0]))
		return data
	else:
		#numpy
		a=numpy.load(filename)
		return a.ravel().tolist()

def confusion(data1,data2):
	mat=collections.Counter()
	for d1,d2 in zip(data1,data2):
		mat[(d1,d2)]+=1
	return mat

arr1=read_label(label1_filename)
arr2=read_label(label2_filename)

m={}
if mapping_filename!=None:
	m=numpy.load(mapping_filename)
else:
	for el in arr2:
		m[str(el)]=el
	for el in arr1:
		m[str(el)]=el

print "# col :",label1_filename
print "# # of col data :",len(arr1)
print "# row :",label2_filename
print "# # of row data :",len(arr2)

mat=confusion(arr1,arr2)
items=m.items()
items.sort()
max_tab=0
for key,val in items:
	ntab=(len(key)+1)/tab_space
	if max_tab<ntab: max_tab=ntab

def split_str(s, n):
	length = len(s)
	return [s[i:i+n] for i in range(0, length, n)]

def print_cell(s,cell_tab,tab_space):
	ntab=cell_tab-(len(s)+1)/tab_space
	print s,"\t"*ntab,

def map2mat(items):
	data=numpy.zeros([len(items),len(items)])
	for key2,val2 in items:
		for key1,val1 in items:
			data[val1,val2]=mat[(val1,val2)]
	return data

col_names=[ split_str(key,tab_space*cell_tab-2) for key,val in items]
for line_i in xrange(max(map(len,col_names))):
	print "\t"*(max_tab+1),
	for name in col_names:
		if line_i<len(name):
			print_cell(name[line_i],cell_tab,tab_space)
			#print name[line_i],"\t",
		else:
			print "\t"*cell_tab,
	print ""


acc=0
for key2,val2 in items:
	ntab=max_tab+1-(len(key2)+1)/tab_space
	print key2,"\t"*ntab,
	for key1,val1 in items:
		print_cell(str(mat[(val1,val2)]),cell_tab,tab_space)
		if val1==val2: acc+=mat[(val1,val2)]
	print ""
print "# correct: ",str(acc)
print "# accuracy :",str(acc*1.0/len(arr1))

if len(sys.argv)<5:
	quit()

import matplotlib.pyplot as plt

image_filename=sys.argv[4]
mat=map2mat(items)
label_names=[ key for key,val in items]

def save_heatmap(image_filename,data, row_labels, column_labels):
    fig, ax = plt.subplots()
    heatmap = ax.pcolor(data, cmap=plt.cm.Blues)

    ax.set_xticks(numpy.arange(data.shape[0]) + 0.5, minor=False)
    ax.set_yticks(numpy.arange(data.shape[1]) + 0.5, minor=False)

    ax.invert_yaxis()
    ax.xaxis.tick_top()

    ax.set_xticklabels(row_labels, minor=False)
    ax.set_yticklabels(column_labels, minor=False)
    plt.show()
    plt.savefig(image_filename)
    return heatmap

save_heatmap(image_filename,mat,label_names,label_names)
