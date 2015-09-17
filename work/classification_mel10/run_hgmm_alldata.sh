fold=1
cluster=5
mixture=30

#for fold in `seq 1 5`
#do

python ~/bin/npy2csv.py dataset/data.npy > dataset/data.csv
hgmm -f dataset/data.csv --load cv/gmm_param${fold}.json -c ${cluster} -s ${mixture} --estimate --log -o log/gmm_cluster.csv > log/gmm_result.txt 2>&1

python eval_event.py ./dataset/data_seg_id.npy ./log/gmm_cluster.csv > ./log/gmm_event_eval.txt

#done

