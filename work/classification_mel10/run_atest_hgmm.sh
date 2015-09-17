cluster=5
mixture=30
b="./annotation_test"

for fold in `seq 0.1 0.1 0.9`
do

python ~/bin/npy2csv.py ${b}/data_train${fold}.npy  ${b}/data_ans_train${fold}.npy > ${b}/data_train${fold}.csv
python ~/bin/npy2csv.py ${b}/data_test${fold}.npy  ${b}/data_dummy_test${fold}.npy >> ${b}/data_train${fold}.csv
#python ~/bin/npy2csv.py ${b}/data_test${fold}.npy  ${b}/data_ans_test${fold}.npy > ${b}/data_test${fold}.csv
hgmm -f ${b}/data_train${fold}.csv --save ${b}/gmm_param${fold}.json -c ${cluster} -s ${mixture} --supervised 0 --log >${b}/gmm_log${fold}.txt 2>&1
hgmm -f ${b}/data_train${fold}.csv --load ${b}/gmm_param${fold}.json -c ${cluster} -s ${mixture} --supervised 0 --estimate --log -o ${b}/gmm_cluster${fold}.csv > ${b}/gmm_result${fold}.txt 2>&1

 python cat_label.py ${b}/data_seg_id${fold}.npy ${b}/data_seg_id_train${fold}.npy ${b}/data_seg_id_test${fold}.npy

#done

python eval_event.py ${b}/data_seg_id${fold}.npy ${b}/gmm_cluster${fold}.csv > ${b}/gmm_event_eval${fold}.txt

done
