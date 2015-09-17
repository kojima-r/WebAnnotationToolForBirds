
dataset={}
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	dataset[arr[0]]||=[]
	# time,direction
	dataset[arr[0]]<<[arr[2].to_f,arr[3].to_f]
}

mapping={}
sum=0
dataset.each{|k,v|
	puts k +":"+v.length.to_s
	sum+=v.length
	v.each{|t,d|
		mapping[t]||=0
		mapping[t]+=1
	}
}
p sum
#p mapping

#sorted_times=mapping.keys.sort
#sorted_times.each_cons(2)
#}
