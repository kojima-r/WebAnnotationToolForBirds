import os
import sys
import glob
from datetime import datetime

if len(sys.argv)<5:
	quit()
o_base=sys.argv[1]
p1=sys.argv[2]
p2=sys.argv[3]
p3=sys.argv[4]
	

i_file = open("./localize_sep.n.tmpl")
o_file = open(o_base+"/localize_separation_r2_ori.n", "w")
lines = i_file.readlines()
for line in lines:
	if line.find('Parameter name="NUM_SOURCE"') >= 0:
		line = line.replace("pmt1", p1)
		print line
	elif line.find('Parameter name="THRESH"') >= 0:
		line = line.replace('pmt2', p2)
		print line
	elif line.find('Parameter name="LOWER_BOUND_FREQUENCY"') >= 0:
		line = line.replace('pmt3', p3)
		print line
	o_file.write(line)
o_file.close()
i_file.close()


