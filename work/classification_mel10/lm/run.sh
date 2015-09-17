hpylm -f data_sc.dat -o ./out_sc.csv 
ruby eval_event.rb out_sc.csv > hpylm_sc_event_eval.csv
hpylm -f data_sc_c.dat -o ./out_sc_c.csv 
ruby eval_event.rb out_sc_c.csv > hpylm_sc_c_event_eval.csv
