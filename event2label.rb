require 'optparse'

flag_event_is_obs=false
flag_remove_nonevent=false

opt = OptionParser.new

opt.on('-o') {|v| flag_event_is_obs = v }
opt.on('-r') {|v| flag_remove_nonevent = v }


def convert_evt2label(org_label_file,evt_file,flag_event_is_obs,flag_rm_nonevent)
	mapping={}
	# reading event file => mapping: event_id -> class
	open(evt_file).each{|line|
		arr=line.strip.split(" ")
		mapping[arr[0]]=arr[1]
	}

	$stderr.puts mapping.to_s
	# reading label file
	open(org_label_file).each{|line|
		arr=line.strip.split(",")
		# k = event_id
		k=nil
		# which label formats?
		if arr.length==4 # no seg_id(=arr[4])
			k=arr[0]
			arr.push(arr[0])
			arr.push(0)
		elsif arr.length>4 # no seg_id(=arr[4])
			k=arr[4]
		elsif arr.length==0
			next
		else
			$stderr.puts "[ERROR] Label format error"
			return
		end
		# output
		if mapping.key? k
			arr[1]=mapping[k]
			if flag_event_is_obs
				arr[5]=1
			end
			puts arr.join(",")
		else
			if not flag_rm_nonevent
				puts arr.join(",")
			else
				#$stderr.puts "[INFO] "+k.to_s+" does not exist"
			end
		end
	}
end

opt.parse!(ARGV)
convert_evt2label(ARGV[0],ARGV[1],flag_event_is_obs,flag_remove_nonevent)



