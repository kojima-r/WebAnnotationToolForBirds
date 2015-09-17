fold=$1
cluster=5
mixture=30

#for fold in `seq 1 5`
#do

python ~/bin/npy2csv.py dataset_cv/dataset_train${fold}.npy  dataset_cv/dataset_train${fold}_ans.npy > dataset_cv/dataset_train${fold}.csv
python ~/bin/npy2csv.py dataset_cv/dataset_test${fold}.npy  dataset_cv/dataset_test${fold}_ans.npy > dataset_cv/dataset_test${fold}.csv
hgmm -f dataset_cv/dataset_train${fold}.csv --save cv/gmm_param${fold}.json -c ${cluster} -s ${mixture} --supervised 0 --log >cv/gmm_log${fold}.txt 2>&1
hgmm -f dataset_cv/dataset_test${fold}.csv --load cv/gmm_param${fold}.json -c ${cluster} -s ${mixture} --supervised 0 --estimate --log -o cv/gmm_cluster${fold}.csv > cv/gmm_result${fold}.txt 2>&1

#done

