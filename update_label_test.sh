echo "start"

. ./config.sh
#org_work=/export/kojima/WebAnnotationToolForBirds/DK150501_600_work
#work=/export/kojima/WebAnnotationToolForBirds/RD150503_35_090530_work
#main=/export/kojima/WebAnnotationToolForBirds
#project=RD150503_35_090530
#target=audio/rd150503_35_090530_16k.wav



cd ${main}
label=./public/${project}/label_textgrid.csv
#./public/${project}/uploaded_label.csv 
#f=${work}/classification/cv_pca/gmm_event1.txt
#ruby event2label.rb ${label} ${f} eval >public/${project}/label_i.csv

#f=${work}/classification/cv_pca/gmm_event1_s3i.txt
#ruby event2label.rb ${label} ${f} eval >public/${project}/label_o.csv

f=${work}/classifier4/cv_pca_ss2/gmm_event_v1_1_1.0_1.0.txt
ruby event2label.rb ${label} ${f} eval >public/${project}/label_o2.csv
