grep "^BIC" log/*.txt | sed "s/log\/log\([0-9]*\)\.txt/\\1/" |sed "s/:BIC\[.*\]/,/" | ruby bic_sort.rb> bic.csv
