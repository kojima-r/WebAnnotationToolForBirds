echo "start"

#. ./config.sh
org_work=/export/kojima/WebAnnotationToolForBirds/DK150501_600_work
work=/export/kojima/WebAnnotationToolForBirds/RD150503_35_090530_work
main=/export/kojima/WebAnnotationToolForBirds
project=RD150503_35_090530
target=audio/rd150503_35_090530_16k.wav

textgrid=rd150503_35_090530_wav_species_corrected_merged_cleaned.TextGrid


cd ${main}
label=./public/${project}/label_textgrid.csv
#./public/${project}/uploaded_label.csv 
ruby event2label.rb ${label} ${work}/classification/rcv_pca/gmm_event1_4_s3i.txt eval >public/${project}/label_o.csv

