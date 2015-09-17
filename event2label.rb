def convert_evt2label(org_label_file,evt_file)
	mapping={}
	open(evt_file).each{|line|
		arr=line.strip.split(" ")
		mapping[arr[0]]=arr[1]
	}
	open(org_label_file).each{|line|
		arr=line.strip.split(",")
		arr[1]=mapping[arr[4]]
		puts arr.join(",")
	}
end

convert_evt2label(ARGV[0],ARGV[1])



