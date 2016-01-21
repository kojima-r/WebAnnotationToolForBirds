#work=/export/vagrant/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#main=/home/vagrant/Service/WebAnnotationToolForBirds
#project=sample2

. ./config.sh

#: <<'#__CO__'
# run HARK
echo "... run HARK"
python setparam.py ${work} ${hark_src_num} ${hark_thresh} ${hark_lowest_freq} ${hark_pause} ${hark_min_interval_src} ${hark_lowest_freq_ghdss} ${hark_tf} 
cd ${work}
sh ./run.sh


# run clustering for initial labels
echo "... initialize classification"
cd ${work}/clustering_mel10
# 20 dimmension gmm
sh ./init.sh 20
# 30 class only
sh ./run_light.sh 30
# 2-30 class 
#sh ./run.sh
sh ./eval_bic.sh
sh ./run_clustering.sh
sh ./eval_event.sh

# initialize classification
echo "... initialize classification"
cd ${work}/classification_mel10
# 4 class 30 mixture
#./run_aimp.sh 4 30


# visualize setting
echo "... visualize"
cd ${work}
sh ./run_viz_mel10.sh
cp specgram.png ${main}/public/${project}/specgram.png
python music.py
cp music.png ${main}/public/${project}/music.png
cd ${main}
ruby ./reduce_label.rb ${work}/label_mel10.csv 10 > ${main}/public/${project}/label.csv

cp config.sh ./public/${project}/config
#__CO__

cp ${work}/sep_files/*.wav  ./public/${project}/sep_files  
cp ${work}/sep_files/*.png  ./public/${project}/sep_files  
