sox ./original.wav -c1 ./original1.wav
python visualize_clusters.py ./original1.wav ./clustering_mel10/event.csv "mel10" > label_mel10.csv

