#target=./annotated_label.csv 
target=../../upload/uploaded_dataset.csv

cp ../datamel10.npy ./dataset/data.npy

ruby convert_labels.rb ${target}> label_wavlist.csv
python csvlist2npy.py ./label_wavlist.csv ".mel10" "dataset/" ""
mv dataset/data.npy dataset/data_org.npy
sh dim_reduction.sh 
