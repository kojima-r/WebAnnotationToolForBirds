open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	id=arr[0]
	label=arr[2]
	puts id+" "+label
}

