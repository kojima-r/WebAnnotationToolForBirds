def convert_evt2label(org_label_file,evt_file,eval_mode)
	mapping={}
	open(evt_file).each{|line|
		arr=line.strip.split(" ")
		mapping[arr[0]]=arr[1]
	}

			$stderr.puts mapping.to_s
	open(org_label_file).each{|line|
		arr=line.strip.split(",")
		k=nil
		if arr.length==4
			k=arr[0]
			arr.push(arr[0])
			if eval_mode
				arr.push(1)
			else
				arr.push(0)
			end
		else
			k=arr[4]
		end
		if mapping.key? k
			arr[1]=mapping[k]
			arr[5]=0
		else
			#$stderr.puts "[INFO] "+k.to_s+" does not exist"
		end
		puts arr.join(",")
	}
end
eval_mode=false
if ARGV.length>=3 and ARGV[2]=="eval"
	eval_mode=true
end
convert_evt2label(ARGV[0],ARGV[1],eval_mode)



