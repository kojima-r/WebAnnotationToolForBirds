if [ $# -ne 1 ]; then
	echo "The number of arguments is  $#" 1>&2
	echo "usage: init.sh <#dim for PCA>" 1>&2
	exit 1
fi

dim=$1

python bin/pca.py -f ../datamel10.npy --numpy -D ${dim} --output_data data.npy --save pca_param.pkl
python bin/npy2csv.py ./data.npy >data.csv
python bin/npy2csv.py ../datamel10_seg_id.npy >data_ans.csv
echo -n "" > run_gmm.list
for i in `seq 2 30`
do
	echo "./bin/hgmm -f data.csv -c ${i} -s 1 --save log/param_c${i}.json >log/em_log${i}.txt 2>log/log${i}.txt" >> run_gmm.list

done

rm log/*

