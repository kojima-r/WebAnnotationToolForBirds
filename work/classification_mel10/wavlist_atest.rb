FOLD=5
srand(312414)

if ARGV.length<1
	$stderr.print "USAGE: ruby cv.rb <base filename( without .csv )> <input file>" 
end

basename=ARGV[0]
input=ARGV[1]
labeled_rate=ARGV[2].to_f

data={}
data_num=0
open(input) {|file|
	while l = file.gets
		arr=l.strip.split(",")
		data[arr[1].to_i]||=[]
		data[arr[1].to_i]<<l
		data_num+=1
	end
}

data_shuffled={}
data.map{|k,v|
	data_shuffled[k]=v.shuffle
}
print "data num:"+ data_num.to_s+"\n"



open(basename+"_train"+labeled_rate.to_s+".csv","w") {|file|
	open(basename+"_ans"+(labeled_rate.to_s).to_s+".csv","w") {|ans|
		count_sect=0
		data_shuffled.each{|k,v|
			count=0
			sect=(v.length*labeled_rate).ceil
			print "labeled num("+k.to_s+"):"+sect.to_s+"\n"
			count_sect+=sect
			v.each_slice(sect){|s|
				if(count==0)
					s.each{|line|
						file.print line
					}
				else
					s.each{|line|
						ans.print line
					}
				end
				count+=1
			}
		}
		print "# labeled num:"+count_sect.to_s+"\n"
	}
}

