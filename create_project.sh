#org_work=/export/kojima/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#work=/export/kojima/birds/birds_suzuki/localized_20150409_134604
#main=/home/kojima/Service/WebAnnotationToolForBirds
#project=sample3
#target=audio/20150409-134604.wav

. config.sh

#o=/tmp/birds_txt

cp -r ${org_work} ${work}
ln -s ${main}/tf/${hark_tf} ${work}/${hark_tf}
#cp ${target} ${work}/original.wav
sox ${target} -r 16000 ${work}/original.wav
mkdir ./public/${project}
sox ${target} -r 16000 -c 1 ./public/${project}/original.wav
sh get_audio_info.sh ./public/${project}/original.wav >./public/${project}/original.json
cp config.sh ./public/${project}/config
mkdir public/${project}/sep_files                                    


cd ${main}


