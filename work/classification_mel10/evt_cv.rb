FOLD=5
srand(312414)

if ARGV.length<1
	$stderr.print "USAGE: ruby cv.rb <base filename( without .csv )> <input file>" 
end

basename=ARGV[0]
input=ARGV[1]

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
print "fold num:"+FOLD.to_s+"\n"


FOLD.times{|i|
	open(basename+"_train"+(i+1).to_s+".csv","w") {|file|
		open(basename+"_ans"+(i+1).to_s+".csv","w") {|ans|
			data_shuffled.each{|k,v|
				count=0
				sect=v.length/FOLD
				v.each_slice(sect){|s|
					if(count!=i)
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
		}
	}
}

