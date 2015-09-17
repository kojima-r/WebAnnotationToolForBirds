
dist=[]
open(ARGV[0]).each{|line|
	d=line.strip.split(",").map{|e| e.to_f}
	dist<<d
}

comb=[]
open(ARGV[1]).each{|line|
	arr=line.strip.split("|")
	pair=arr[0].split(",")
	seg_id=pair[0]
	d=pair[1].to_f
	if arr[1]!=nil
		list=arr[1].split(",").map{|e| e.to_i}
	else
		list=[]
	end
	comb<<[seg_id,d,list]
}
prior=[]
open(ARGV[3]).each{|line|
	pdist=line.strip.split(",")
	prior<<pdist.map{|e| e.to_f}
}


def getPrior(c,d1,prior)
	step=1.0/(prior.size-1)
	h=0
	cnt=0
	while(h<=1)
		if h<=d1 and d1 <h+step
			return Math.log(prior[cnt][c])
		end
		h+=step
		cnt+=1
	end
	return Math.log(0)
end
def measureD(d1,d2)
	#return 1.0-1.0/2.0*(1+Math.cos(2*Math.PI*[(d1-d2).abs,1-(d1-d2).abs].min))
	return [[(d1-d2).abs,1-(d1-d2).abs].min,0].max
end
def argmax(arr)
	return arr.each_with_index.max[1]
end

#correction&estimation
#flags=Array.new(dist.size,0)
newDist=[]
dist.each_with_index{|d,index|
	nd=d.dup
	#q(C=i;d)=p(C=i;d1)*(1-p(C^l=i;d2))**d(d1,d2)*p(d1)
	comb[index][2].each{|l|
		d1=comb[index][1]
		d2=comb[l][1]
		dist[l].each_with_index{|prob,i|
			#begin
				nd[i]+=measureD(d1,d2)*0.5*Math.log(1-Math.exp(prob))+0.5*getPrior(i,d1,prior)
			#rescue
			#	nd[i]=0
			#end
		}
	}
	newDist<<nd
}
fp=nil
if(ARGV.size()>=3)
	fp=open(ARGV[2],"w")
end
newDist.each{|line|
	fp.puts line.join(",")
	puts argmax(line)
}
