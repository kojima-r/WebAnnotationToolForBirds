python get_direction.py ../../../upload/uploaded_label.csv ../dataset/data_seg_id.npy > data_dir.csv
ruby calc_combination.rb data_dir.csv > data_dir_comb.csv 
ruby calc_correction.rb ../annotation_improve/gmm_dist.csv ./data_dir_comb.csv correctted_dist.csv > gmm_cluster_corrected.csv
python ../eval_event.py ../dataset/data_seg_id.npy ./gmm_cluster_corrected.csv > ./gmm_corrected_event_eval.txt

ruby histo.rb data_dir.csv ../annotation_improve/data.csv > prior_d.csv
ruby calc_correction2.rb ../annotation_improve/gmm_dist.csv ./data_dir_comb.csv correctted_dist.csv ./prior_d.csv > gmm_cluster_corrected_prior.csv
python ../eval_event.py ../dataset/data_seg_id.npy ./gmm_cluster_corrected_prior.csv > ./gmm_corrected_event_eval_prior.txt
#grep piA ../annotation_improve/gmm_param.json | sed -e 's/.*\[\(.*\)\].*/\1/g' > pi_a.csv
