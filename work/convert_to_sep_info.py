
# 0,0.76599997282,0.643000006676,0.0,28.2827777863|1,-0.259000003338,0.966000020504,0.0,29.3901138306
import sys
import os

filename=sys.argv[1]
counter=0
info={}
for line in open(filename):
	line_s=line.strip()
	if(line_s!=""):
		for el in line_s.split("|"):
			source_arr=el.split(",")
			sid=int(source_arr[0])
			sdata=source_arr[1:]
			
			if not sid in info:
				info[sid]={"min_t":counter,"max_t":counter,"data":[sdata]}
			else:
				info[sid]["max_t"]=counter
				info[sid]["data"].append(sdata)
				
			#print counter,",",el
			#
	counter+=1

#
import numpy
#
for k,v in sorted(info.items()):
	data=[ list(map(float,vec)) for vec in v["data"]]
	da=numpy.array(data)
	a= numpy.mean(da,axis=0)
	print(str(k)+":"+str(v["min_t"])+"-"+str(v["max_t"])+":"+",".join(map(str,a)))


