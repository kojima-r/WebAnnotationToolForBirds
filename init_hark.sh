#work=/export/vagrant/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#main=/home/vagrant/Service/WebAnnotationToolForBirds
#project=sample2

. ./config.sh

# run HARK
echo "... run HARK"
python setparam.py ${hark_tmpl} ${work} ${hark_src_num} ${hark_thresh} ${hark_lowest_freq} ${hark_pause} ${hark_min_interval_src} ${hark_lowest_freq_ghdss} ${hark_tf} "${hark_ch}"
cd ${work}
sh ./run.sh


echo "... visualize"
cd ${work}
sh ./run_viz_mel10.sh
cp specgram.png ${main}/public/${project}/specgram.png
python music.py $hark_tf
cp music.png ${main}/public/${project}/music.png
cd ${main}
ruby ./reduce_label.rb ${work}/label_mel10.csv 10 > ${main}/public/${project}/label.csv

cd ${main}
echo "cp ${work}/sep_files/*.wav  ./public/${project}/sep_files/"
rm ./public/${project}/sep_files/*
cp ${work}/sep_files/*.wav  ./public/${project}/sep_files/
cp ${work}/sep_files/*.png  ./public/${project}/sep_files/
cp config.sh ./public/${project}/config

