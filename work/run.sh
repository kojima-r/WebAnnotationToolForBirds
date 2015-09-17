target=./original.wav

rm ./sep_files/*
rm ./mel_img/*
./localize_separation_r2_ori.n ${target}
./mel.sh
./mel2mel10.sh
python csv2npy.py "mel10" ./sep_files/sep_*.mel10

#python visualize_clusters.py ./int_furu_0505_140_init1min.wav ./clustering/event.csv > label.csv

