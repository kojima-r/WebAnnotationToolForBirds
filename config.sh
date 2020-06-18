base=$(cd $(dirname $0); pwd)

org_work=$base/work
work=$base/localized_150521_aaai_work
main=$base
project=localized_150521
#target=audio/rec05052013_14_1min.wav
target="audio/localized_150521.wav"

#textgrid=rd150503_35_090530_wav_species_corrected_merged_cleaned.TextGrid
textgrid=localized_150521_6_073407-01_150-800_wav_t295_l2200_moved_all_five.TextGrid

#hark_tf="tamago_rectf.zip"
#hark_tf="dacho_geotf_v3.zip"
hark_tf="microcone_rectf.zip"
hark_tmpl="./localize_sep.n.tmpl"
#annotation="./audacity/2016_04_25 07_31_00 start 40dB x2 pass.txt"
#annotation_mapping="./audacity/P4T1_2016042507/"


hark_src_num=3
hark_thresh=29.5
hark_lowest_freq=2200
hark_ch="&lt;Vector&lt;int&gt; 0 1 2 3 4 5 6&gt;"

hark_pause=1200
hark_min_interval_src=15
hark_lowest_freq_ghdss=1000

