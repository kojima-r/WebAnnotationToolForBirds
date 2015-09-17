fold=1
cluster=5
mixture=30

#for fold in `seq 1 5`
#do

python /home/kojima/programs/BMLTool/pca.py -f dataset/data_org.npy --numpy -D 20 --output_data evt_cv/data_all${fold}.npy --load evt_cv/pca_param${fold}.pkl
python ~/bin/npy2csv.py evt_cv/data_all${fold}.npy > evt_cv/data_all${fold}.csv
hgmm -f evt_cv/data_all${fold}.csv --load evt_cv/gmm_param${fold}.json -c ${cluster} -s ${mixture} --estimate --log -o log/gmm_evt_cluster.csv > log/gmm_evt_result.txt 2>&1

python eval_event.py ./dataset/data_seg_id.npy ./log/gmm_evt_cluster.csv > ./log/gmm_evt_event_eval.txt

#done

