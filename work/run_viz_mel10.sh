evt_label_file=./clustering_mel10/event.csv
out_label=label_mel10.csv
sox ./original.wav -c1 ./original1.wav
cutoff=-1
python visualize_clusters.py ./original1.wav ${evt_label_file} "mel10" ${cutoff}> ${out_label}

