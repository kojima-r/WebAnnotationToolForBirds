

def label2trainset(csv_file,out_file)
	#basename="../sep_files/sep_"

	train_labels={}
	test_labels={}
	open(csv_file).each{|line|
        arr=line.strip.split(",")
		enabled=arr[5].to_i
		if enabled==1
			train_labels[arr[4].to_i]=arr[1].to_i
		else
			test_labels[arr[4].to_i]=arr[1].to_i
		end

	}
	fp=open(out_file,"w")
	train_labels.each{|k,v|
    	#filename=basename+k.to_s
    	#fp.puts filename+","+v.to_s
    	fp.puts k.to_s+","+v.to_s
    }
	test_labels.each{|k,v|
    	#filename=basename+k.to_s
    	#fp.puts filename+",-1"
    	fp.puts k.to_s+",-1"
    }
	fp.close

end


