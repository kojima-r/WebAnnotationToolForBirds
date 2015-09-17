arr=[]
while line=gets
	str=line.strip.split(",")[0]
	arr<<[str.to_i,line]
end

arr.sort.each{|el|
	puts el[1]
}
