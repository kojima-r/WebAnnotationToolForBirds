

labels={}
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	labels[arr[0].to_i]=arr[1].to_i
}
p labels
result={}
open(ARGV[1]).each{|line|
	arr=line.strip.split(",")
	#puts arr[0].to_s+","+labels[arr[0].to_i].to_s+","+arr[1].to_s
	#result<<[arr[0].to_i,labels[arr[0].to_i].to_i,arr[1].to_i]
	result[arr[0].to_i]=arr[1].to_i
}
p result


match_count=0
conf={}
labels.each{|k,c1|
	c2=result[k]
	if c2!=nil
	if c1==c2
		match_count+=1
	end
	conf[c1]||={}
	conf[c1][c2]||=0
	conf[c1][c2]+=1
	end
}
puts match_count.to_s+"/"+labels.size.to_s
puts match_count*1.0/labels.size
p conf

