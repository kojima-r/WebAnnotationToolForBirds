f=open(ARGV[0])
s=""
while true
	begin
	c=f.sysread(1)
	s+=c
	if(c=="\n")
		print s
		if s=~/### end/
			break
		end
		s=""
	end
	rescue
		nil
	end
end


