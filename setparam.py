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
if len(sys.argv)>5:
	p4=sys.argv[5]
else:
	p4=1000

if len(sys.argv)>6:
	p5=sys.argv[6]
else:
	p5=15

if len(sys.argv)>7:
	p6=sys.argv[7]
else:
	p6=1000

if len(sys.argv)>8:
	p7=sys.argv[8]
else:
	p7="microcone_rectf.zip"


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
		line = line.replace('pmt6', p6)
		print line
	elif line.find('Parameter name="PAUSE_LENGTH"')>=0:
		line = line.replace('pmt4', p4)
		print line
	elif line.find('Parameter name="MIN_SRC_INTERVAL"')>=0:
		line = line.replace('pmt5', p5)
		print line
	elif line.find('Parameter name="A_MATRIX"')>=0:
		line = line.replace('pmt7', p7)
		print line
	elif line.find('Parameter name="TF_CONJ_FILENAME"')>=0:
		line = line.replace('pmt7', p7)
		print line
		

	o_file.write(line)
o_file.close()
i_file.close()


