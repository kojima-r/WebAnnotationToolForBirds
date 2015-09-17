python make_lm_seq.py ../dataset/data_seg_id.npy ../annotation_improve/gmm_cluster.csv  ../annotation_improve/src_ans.npy > data.dat
python make_lm_seq.py ../dataset/data_seg_id.npy ../annotation_improve/gmm_subcluster.csv ../annotation_improve/src_ans.npy > data_sc.dat
python make_lm_seq.py ../dataset/data_seg_id.npy ../dir/gmm_subcluster_corrected.csv ../annotation_improve/src_ans.npy > data_sc_c.dat

