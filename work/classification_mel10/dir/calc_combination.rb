data=[]
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	seg_id=arr[0]
	t=arr[1].to_f
	d=arr[2]
	data<<[seg_id,t,d]
}

data.each{|target|
	related_seg={}
	data.each_with_index{|dest,index|
		if(target[0]!=dest[0])
			if((target[1]-dest[1]).abs<0.1)
				id=dest[0]
				related_seg[id]||=[]
				related_seg[id]<<index
			end
		end
	}
	if related_seg.empty?
		puts target[0]+","+target[2]
	else
		# same deg id
		s=related_seg.map{|k,v| v }
		puts target[0]+","+target[2]+"|"+s.map{|v| v.join(",")}.join(",")
	end
}


