
bin=work/bin/pca.py 
python ${bin} -f ./data.npy -A  data_ans.npy --numpy -o data_lda.png --lda
python ${bin} -f ./data.npy -A  data_ans.npy --numpy -o data_pca.png
