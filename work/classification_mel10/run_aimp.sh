if [ $# -ne 2 ]; then
	echo "The number of arguments is  $#" 1>&2
	echo "usage: init_aimp.sh <#class> <#mixture>" 1>&2
	exit 1
fi
type=".mel10"
b="./annotation_improve"
target=../../upload/uploaded_dataset.csv
o=/tmp/birds_txt
cluster=$1
mixture=$2

echo "python csvlist2ans_npy.py ${target} './dataset/data_seg_id.npy' 'annotation_improve/src_ans.npy'" >$o
python csvlist2ans_npy.py ${target} "./dataset/data_seg_id.npy" "annotation_improve/src_ans.npy"
echo "python ~/bin/npy2csv.py ./dataset/data.npy annotation_improve/src_ans.npy > annotation_improve/data.csv" >$o
python ~/bin/npy2csv.py ./dataset/data.npy ./annotation_improve/src_ans.npy > ./annotation_improve/data.csv

echo "hgmm -f ${b}/data.csv --save ${b}/gmm_param.json -c ${cluster} -s ${mixture} --supervised 0 --log -o ${b}/gmm_cluster.csv -l 10 >${b}/gmm_log.txt 2>&1"  #>$o
hgmm -f ${b}/data.csv --save ${b}/gmm_param.json -c ${cluster} -s ${mixture} --supervised 0 --log -o ${b}/gmm_cluster.csv -l 10 > ${o} 2>&1
hgmm -f ${b}/data.csv --load ${b}/gmm_param.json -c ${cluster} -s ${mixture} --supervised 0 --log --viterbi -o ${b}/gmm_subcluster.csv -E >${o} 2>&1
hgmm -f ${b}/data.csv --load ${b}/gmm_param.json -c ${cluster} -s ${mixture} --supervised 0 --log --dist -o ${b}/gmm_dist.csv -E >${o} 2>&1
hgmm2 -f ${b}/data.csv --load ${b}/gmm_param.json -c ${cluster} -s ${mixture} --supervised 0 --log --dist_sc -o ${b}/gmm_dist_sc.csv -E >${o} 2>&1

echo "python eval_event.py dataset/data_seg_id.npy ${b}/gmm_cluster.csv > ${b}/gmm_event_eval.txt" >${o}
python eval_event.py dataset/data_seg_id.npy ${b}/gmm_cluster.csv > ${b}/gmm_event_eval.txt
echo "### end"  > ${o}


