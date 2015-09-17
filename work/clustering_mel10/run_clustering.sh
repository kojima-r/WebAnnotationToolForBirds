i=`ruby get_max_bic.rb bic.csv`
./bin/hgmm -f data.csv -c ${i} -s 1 --load log/param_c${i}.json -o output.csv -E

