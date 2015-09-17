seg=ARGV[1].to_i

prev_id=nil
count=0

open(ARGV[0]).each{|line|
	id=line.strip.split(",")[0]
	if id!=prev_id
		count=0	
	end
	if ((count)%seg)==0
			print line
	end
	count+=1
	prev_id=id
}
