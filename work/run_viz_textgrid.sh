evt_label_file=./Praat2dataset/event.txt
out_label=label_textgrid.csv
sox ./original.wav -c1 ./original1.wav
cutoff=-1
python visualize_clusters.py ./original1.wav ${evt_label_file} "mel10" ${cutoff} > ${out_label}

