#work=/export/kojima/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#main=/home/kojima/Service/WebAnnotationToolForBirds
#project=sample2
#o=/tmp/birds_txt

echo "start"

. ./config.sh

echo "cd ${work}/classification_mel10" # > $o
cd ${work}/classification_mel10
echo "./init_aimp.sh" #>$o
./init.sh
# 4 class 30 mixture
./run_aimp.sh 4 30
cd dir
./run.sh
cd ../lm
./init.sh
./run.sh
echo "cd ${main}" #> $o
cd ${main}
echo "./event2label.sh" #> $o
label=upload/uploaded_label.csv
#./public/${project}/uploaded_label.csv 
ruby event2label.rb ${label} ${work}/classification_mel10/annotation_improve/gmm_event_eval.txt >public/${project}/label_i.csv
ruby event2label.rb ${label} ${work}/classification_mel10/dir/gmm_corrected_event_eval.txt >public/${project}/label_gmm_corrected.csv

