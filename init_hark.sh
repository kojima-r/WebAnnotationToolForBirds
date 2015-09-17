#work=/export/vagrant/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#main=/home/vagrant/Service/WebAnnotationToolForBirds
#project=sample2

. ./config.sh

# run HARK
echo "... run HARK"
cd ${work}
sh ./run.sh

# visualize setting
echo "... visualize"
cd ${work}
sh ./run_viz_mel10.sh
cp specgram.png ${main}/public/${project}/specgram.png
cd ${main}
ruby ./reduce_label.rb ${work}/label_mel10.csv 10 > ${main}/public/${project}/label.csv

cp ${work}/sep_files/*.wav  ./public/${project}/sep_files  

