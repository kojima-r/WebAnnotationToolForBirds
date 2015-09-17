
$log_buffer=""
def wait_and_read_log(fp)
	if(fp==nil)
		return "pipe error"
	end
	s=""
	while  s==""
		idx=$log_buffer.index("\n")
		if(idx!=nil)
				s=$log_buffer[0..idx]
				$log_buffer=$log_buffer[idx+1..-1]
				break
		end

		ret=IO::select([fp])
		ret[0].each{|rfp|
			$log_buffer += rfp.read
		}
	end
	return s
end

fp=open("/tmp/birds_pipe","r")
while(true)
	s=wait_and_read_log(fp)
	p s
	s
end


