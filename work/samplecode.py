import harkpython.harkbasenode as harkbasenode

class HarkNode(harkbasenode.HarkBaseNode):
    def __init__(self):
        self.outputNames=("output",)  # one output terminal named "output"
        self.outputTypes=("prim_int",)  # one output terminal named "output"
        self.sourceDict={}
    def calculate(self):
        d=self.TRACKING
        print "#",
        arr=[str(el['id'])+","+(",".join(map(str,el['x'])))+","+str(el['power']) for el in d]
        print "|".join(arr)
        self.outputValues["output"] =0# self.tracking
       # set output value
       # from two inputs: input1 and input2.
