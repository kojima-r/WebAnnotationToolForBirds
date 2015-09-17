for f in `ls ./sep_files/*.mfcc.htk`
do
	b=`basename $f .mfcc.htk`
	HList -r -s 10 -i 100 ${f} |sed "s/ /,/g" |sed "s/,$//"  > ./sep_files/${b}.mfcc
	ruby ~/programs/SdA/sliding.rb ./sep_files/${b}.mfcc 10 -1 -1 > ./sep_files/${b}.mfcc10
done

#ruby mfcc_data.rb ./audio_output/*.txt >data.csv 

