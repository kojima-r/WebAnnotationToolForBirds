#ruby histo.rb data_dir.csv ../annotation_improve/data.csv

step=0.1
classNum=10
alpha=1
ans=[]
open(ARGV[1]).each{|line|
	l=line.split(",")[0]
	ans<<l.to_i
}
#
h=0
hist={}
while(h<=1)
	hist[h]=Array.new(classNum,alpha)
	h+=step
end
#
line_cnt=0
open(ARGV[0]).each{|line|
	arr=line.strip.split(",")
	d=arr[2].to_f
	h=0
	while(1)
		if h<=d and d<h+step
			if ans[line_cnt]>=0
				hist[h][ans[line_cnt]]+=1
			end
			break
		end
		h+=step
	end
	line_cnt+=1
}
hist.sort.each{|k,bin|
	sum=0
	bin.each{|e|
		sum+=e
	}
	puts bin.map{|e| e*1.0/sum}.join(",")
}

