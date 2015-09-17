
for f in `ls ./sep_files/*.mel`
do
ruby clustering_mel10/bin/sliding.rb ${f} 10 -1 -1 > ${f}10
done

