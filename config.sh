base=$(cd $(dirname $0); pwd)

org_work=$base/work
work=$base/test_td00_work
main=$base
project=test_td00
target=audio/test_td00.wav

#textgrid=rd150503_35_090530_wav_species_corrected_merged_cleaned.TextGrid

#hark_tf="microcone_rectf.zip"
hark_tf="microcone_geotf.zip"

hark_src_num=1
hark_thresh=27
hark_lowest_freq=2400

hark_pause=1200
hark_min_interval_src=10
hark_lowest_freq_ghdss=1000

