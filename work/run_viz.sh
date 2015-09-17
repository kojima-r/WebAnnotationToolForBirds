#evt_label=clustering/event.csv 
#evt_label=classify/event.csv 


#	clustering/event.csv
#	classification_mel10/log/gmm_evt_event_eval.txt 
#	classification_mel10/annotation_test/gmm_event_eval0.1.txt
#	classification_mel10/annotation_test/gmm_event_eval0.2.txt
#	classification_mel10/annotation_test/gmm_event_eval0.3.txt
#	classification_mel10/annotation_test/gmm_event_eval0.4.txt
#	classification_mel10/annotation_test/gmm_event_eval0.5.txt
#	classification_mel10/annotation_test/gmm_event_eval0.6.txt
#	classification_mel10/annotation_test/gmm_event_eval0.7.txt
#	classification_mel10/annotation_test/gmm_event_eval0.8.txt
#	classification_mel10/annotation_test/gmm_event_eval0.9.txt
list=(
	classification_mel10/annotation_test/data_event0.1.txt
	classification_mel10/annotation_test/data_event0.2.txt
	classification_mel10/annotation_test/data_event0.3.txt
	classification_mel10/annotation_test/data_event0.4.txt
	classification_mel10/annotation_test/data_event0.5.txt
	classification_mel10/annotation_test/data_event0.6.txt
	classification_mel10/annotation_test/data_event0.7.txt
	classification_mel10/annotation_test/data_event0.8.txt
	classification_mel10/annotation_test/data_event0.9.txt
	)
for l in ${list[@]}
do
	name=`echo -n "label_"$l | sed 's/\//_/g'`
	b=`basename ${name} .txt`
	python visualize_clusters.py ./int_furu_0505_140_init1min.wav ${l} ${b} > ${b}.csv
done
