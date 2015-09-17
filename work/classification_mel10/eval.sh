#ruby eval_labels.rb ./annotated_label.csv ./log/gmm_event_eval.txt
#ruby eval_labels.rb ./annotated_label.csv ./log/gmm_evt_event_eval.txt

for fold in `seq 0.1 0.1 0.9`
do
ruby wavlist_atest.rb ./annotation_test/label_wavlist ./label_wavlist.csv ${fold}
echo -n "# "
ruby eval_labels.rb ./annotated_label.csv ./annotation_test/gmm_event_eval${fold}.txt
done
