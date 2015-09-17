data=[]
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	data<<[arr[0],arr[1].to_f]
}
res=data.sort_by{|x| -x[1]}[0]
print res[0]

