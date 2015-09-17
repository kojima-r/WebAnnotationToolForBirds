

labels={}
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	labels[arr[0].to_i]=arr[1].to_i
}
p labels
result=[]
open(ARGV[1]).each{|line|
	arr=line.strip.split(" ")
	#puts arr[0].to_s+","+labels[arr[0].to_i].to_s+","+arr[1].to_s
	result<<[arr[0].to_i,labels[arr[0].to_i].to_i,arr[1].to_i]
}

match_count=0
conf={}
result.each{|i,c1,c2|
	if c1==c2
		match_count+=1
	end
	conf[c1]||={}
	conf[c1][c2]||=0
	conf[c1][c2]+=1
}
puts match_count.to_s+"/"+result.size.to_s
conf.to_a.sort.each{|k1,v1|
	v1.to_a.sort.each{|k2,v2|
		#k1,k2
	}
}
