
if ARGV.size!=4
	$stderr.puts "ruby sliding input_sliding_size csv id_col ignore_col"
	exit
end
sliding_size=ARGV[1].to_i
id_col=ARGV[2].to_i
if ARGV[3]=="-1"
ignore_cols=[]
else
ignore_cols=ARGV[3].strip.split(",").map{|e| e.to_i}
end
first=true
vec_num=0
data=[]
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	id=nil
	ignore=[]
	vec=[]
	arr.each_index{|i|
		if i==id_col
			id=arr[i]
		elsif ignore_cols.include? i
			ignore<<arr[i]
		else
			vec<<arr[i]
		end
	}
	if first
		vec_num=vec.length
		first=false
	end
	data<<[id,ignore,vec]
}
old_id=nil
sliding=[]
data.each{|id,ignore,vec|
	if old_id==id
		sliding<<vec
	else
		sliding.shift if(sliding_size<sliding.size)
		while (sliding.size>0)
			w=Array.new(sliding_size)
			dummy=Array.new(vec_num,0)
			w.fill(dummy)
			w[0,sliding.size]=sliding
			
			if ignore.size==0
				if id!=nil
					puts id+","+w.join(",")
				else
					puts w.join(",")
				end
			else
				if id!=nil
					puts id+","+ignore.join(",")+","+w.join(",")
				else
					puts ignore.join(",")+","+w.join(",")
				end
			end
			sliding.shift
		end
		sliding=[]
		sliding<<vec
		old_id=id
	end
	sliding.shift if(sliding_size<sliding.size)
	if(sliding_size==sliding.size)
		if ignore.size!=0
			if id!=nil
				puts id+","+ignore.join(",")+","+sliding.join(",")
			else
				puts ignore.join(",")+","+sliding.join(",")
			end
		else
			if id!=nil
				puts id+","+sliding.join(",")
			else
				puts sliding.join(",")
			end
		end
	end
}

