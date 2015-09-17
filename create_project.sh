#org_work=/export/kojima/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#work=/export/kojima/birds/birds_suzuki/localized_20150409_134604
#main=/home/kojima/Service/WebAnnotationToolForBirds
#project=sample3
#target=audio/20150409-134604.wav

. config.sh

#o=/tmp/birds_txt

cp -r ${org_work} ${work}
python setparam.py ${work} ${hark_src_num} ${hark_thresh} ${hark_lowest_freq}
#cp ${target} ${work}/original.wav
sox ${target} -r 16000 ${work}/original.wav
mkdir ./public/${project}
cp ${target} ./public/${project}/original.wav
cp config.sh ./public/${project}/config
mkdir public/${project}/sep_files                                    

cd ${main}


