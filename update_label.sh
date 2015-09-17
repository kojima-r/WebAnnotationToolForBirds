#work=/export/kojima/birds/birds_suzuki/localized_int_furu_0505_140_init1min2
#main=/home/kojima/Service/WebAnnotationToolForBirds
#project=sample2
#o=/tmp/birds_txt

echo "start"

. ./config.sh

cd ${main}
label=upload/uploaded_label.csv
#./public/${project}/uploaded_label.csv 
ruby event2label.rb ${label} ${work}/classification_mel10/annotation_improve/gmm_event_eval.txt >public/${project}/label_i.csv
ruby event2label.rb ${label} ${work}/classification_mel10/dir/gmm_corrected_event_eval.txt >public/${project}/label_gmm_corrected.csv
ruby event2label.rb ${label} ${work}/classification_mel10/lm/hpylm_sc_event_eval.csv >public/${project}/label_lm_corrected.csv
ruby event2label.rb ${label} ${work}/classification_mel10/lm/hpylm_sc_c_event_eval.csv >public/${project}/label_lm_corrected_c.csv
ruby event2label.rb ${label} ${work}/classification_mel10/dir/gmm_corrected_event_eval_prior.txt >public/${project}/label_gmm_corrected_prior.csv

