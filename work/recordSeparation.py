import harkpython.harkbasenode as harkbasenode
import numpy
import pylab
import math
pylab.ion()

def cxp(x):
	r= math.sqrt(x[0]**2+x[1]**2+x[2]**2)
	theta=math.atan2(x[2], (math.sqrt(x[0]**2+x[1]**2)))
	phi= math.atan2(x[1], x[0])
	return([r, theta, phi])


class RecordSeparation(harkbasenode.HarkBaseNode):
    def __init__(self):
        self.outputNames = ("output",)
        self.outputTypes = ("prim_int",)
        self.x = numpy.arange(0,360,10)
	self.f = open("separated.txt", "w")
	self.cid= -1
	self.currentID= -1

    def calculate(self):
	if(self.count % 2 == 0):
		if (self.TRACKING != []):
			cid= (self.TRACKING[0])["id"]
			for d in self.TRACKING:
				dp= cxp(d["x"])
				#print dp
				self.f.write(str(self.count)+"\t"+str(d["id"])+"\t"+str(dp[0])+"\t"+str(dp[1])+"\t"+str(dp[2])+"\n")
		else:
			cid= -1
		if(cid > self.currentID):
			self.currentID= cid
			print((self.currentID))
			#self.f.write(str(self.currentID))
		#self.f.write("\n")
	self.outputValues["output"] = 1
