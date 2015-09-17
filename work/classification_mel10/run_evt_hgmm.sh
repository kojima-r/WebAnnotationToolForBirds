fold=$1
cluster=5
mixture=30

#for fold in `seq 1 5`
#do

python ~/bin/npy2csv.py evt_cv/data_train${fold}.npy  evt_cv/data_ans_train${fold}.npy > evt_cv/data_train${fold}.csv
python ~/bin/npy2csv.py evt_cv/data_test${fold}.npy  evt_cv/data_ans_test${fold}.npy > evt_cv/data_test${fold}.csv
hgmm -f evt_cv/data_train${fold}.csv --save evt_cv/gmm_param${fold}.json -c ${cluster} -s ${mixture} --supervised 0 --log >evt_cv/gmm_log${fold}.txt 2>&1
hgmm -f evt_cv/data_test${fold}.csv --load evt_cv/gmm_param${fold}.json -c ${cluster} -s ${mixture} --supervised 0 --estimate --log -o evt_cv/gmm_cluster${fold}.csv > evt_cv/gmm_result${fold}.txt 2>&1

#done

