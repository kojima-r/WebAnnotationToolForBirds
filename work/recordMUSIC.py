import harkpython.harkbasenode as harkbasenode
import numpy
import pylab
pylab.ion()

class RecordMUSIC(harkbasenode.HarkBaseNode):
    def __init__(self):
        self.outputNames = ("output",)
        self.outputTypes = ("prim_int",)
        self.x = numpy.arange(0,360,10)
	self.f = open("music.txt", "w")

    def calculate(self):
	if(self.count % 50 == 0):
	        spectrum = numpy.array(self.SPECTRUM)	
		#print spectrum
		print len(spectrum)
		for d in range(len(spectrum)/1):
			self.f.write(str(spectrum[d*1]) + "\t")
		self.f.write("\n")
        self.outputValues["output"] = 1
