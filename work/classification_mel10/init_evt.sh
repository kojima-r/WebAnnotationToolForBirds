type=".mel10"

ruby evt_cv.rb ./evt_cv/label_wavlist ./label_wavlist.csv
#label_wavlist_ans1.csv 

for i in `seq 1 5`
do
python csvlist2npy.py ./evt_cv/label_wavlist_train${i}.csv ${type} "evt_cv/" "_train${i}"
mv evt_cv/data_train${i}.npy evt_cv/data_train${i}_org.npy 
python /home/kojima/programs/BMLTool/pca.py -f evt_cv/data_train${i}_org.npy --numpy -D 20 --output_data evt_cv/data_train${i}.npy --save evt_cv/pca_param${i}.pkl

python csvlist2npy.py ./evt_cv/label_wavlist_ans${i}.csv ${type} "evt_cv/" "_test${i}"
mv evt_cv/data_test${i}.npy evt_cv/data_test${i}_org.npy 
python /home/kojima/programs/BMLTool/pca.py -f evt_cv/data_test${i}_org.npy --numpy -D 20 --output_data evt_cv/data_test${i}.npy --load evt_cv/pca_param${i}.pkl

done
