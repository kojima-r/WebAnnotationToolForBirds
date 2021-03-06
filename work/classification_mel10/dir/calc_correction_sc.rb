
dist=[]
open(ARGV[0]).each{|line|
	class_d=line.strip.split("|")
	d=class_d.map{|dd| dd.split(",").map{|e| e.to_f }}
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
	nd=Array.new(d.size).map{ Array.new(d[0].size,0)}
	comb[index][2].each{|l|
		d1=comb[index][1]
		d2=comb[l][1]
		dist[l].each_with_index{|prob,i|
			begin
				prob.each{|prob_el|
					cor=measureD(d1,d2)*0.5*Math.log(1-Math.exp(prob_el))
					nd[i].map!{|now| now+cor }
				}
			rescue
				nd[i]=0
				$stderr.puts "error"
			end
		}
	}
	newDist<<nd
}
fp=nil
if(ARGV.size()>=3)
	fp=open(ARGV[2],"w")
end
newDist.each{|line| 
	fp.puts line.join(",") if fp!=nil
	res=nil
	line.each_with_index{|v,i|
		v.each_with_index{|w,j|
			if res==nil or res[0]<w
				res=[w,i,j]
			end
		}
	}
	if(res!=nil)
		puts res[1].to_s+","+res[2].to_s
	else
		$stderr.puts "error"
	end
}
