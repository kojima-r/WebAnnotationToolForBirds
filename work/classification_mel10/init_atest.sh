type=".mel10"

b="./annotation_test"
#label_wavlist_ans1.csv 

for i in `seq 0.1 0.1 0.9`
do
ruby wavlist_atest.rb ${b}/label_wavlist ./label_wavlist.csv ${i}
python csvlist2npy.py ${b}/label_wavlist_train${i}.csv ${type} "annotation_test/" "_train${i}"
mv ${b}/data_train${i}.npy ${b}/data_train${i}_org.npy 
python /home/kojima/programs/BMLTool/pca.py -f ${b}/data_train${i}_org.npy --numpy -D 20 --output_data ${b}/data_train${i}.npy --load ./pca_param.pkl

python csvlist2npy.py ${b}/label_wavlist_ans${i}.csv ${type} "annotation_test/" "_test${i}"
mv ${b}/data_test${i}.npy ${b}/data_test${i}_org.npy 
python /home/kojima/programs/BMLTool/pca.py -f ${b}/data_test${i}_org.npy --numpy -D 20 --output_data ${b}/data_test${i}.npy --load ./pca_param.pkl

python dummy.py ${b}/data_ans_test${i}.npy ${b}/data_dummy_test${i}.npy


python atest_event.py ${b}/data_seg_id_train${i}.npy annotated_label.csv > ${b}/label_data_event${i}.csv

done

