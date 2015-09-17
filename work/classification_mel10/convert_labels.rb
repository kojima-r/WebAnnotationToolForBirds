
basename="../sep_files/sep_"

labels={}
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	labels[arr[0].to_i]=arr[1].to_i
}
#p labels
labels.each{|k,v|
	filename=basename+k.to_s
	puts filename+","+v.to_s
}

