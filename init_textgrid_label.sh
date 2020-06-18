#work=/export/vagrant/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#main=/home/vagrant/Service/WebAnnotationToolForBirds
#project=sample2

. ./config.sh

# run HARK
echo "... making label from text grid"
echo "... copying from textgrid/${textgrid} to ${work}/Praat2dataset/original.TextGrid"
if [ ! -z "${textgrid+x}" ]
then
cp textgrid/${textgrid} ${work}/Praat2dataset/original.TextGrid
cd ${work}/Praat2dataset
sh ./run4sep.sh
cd ${work}
echo "... visualize"

cd ${main}
ruby ./event2label.rb ${work}/label_mel10.csv ${work}/Praat2dataset/event.txt -r -o > ${work}/label_textgrid.csv
ruby ./reduce_label.rb ${work}/label_textgrid.csv 10 > ${main}/public/${project}/label_textgrid.csv

#sh run_viz_textgrid.sh 
#cp specgram.png ${main}/public/${project}/specgram.png
#cp ${work}/label_textgrid.csv ${main}/public/${project}/label_textgrid.csv
fi

