if [ $# -ne 1 ]; then
	echo "The number of arguments is  $#" 1>&2
	echo "usage: run_light.sh <#class>" 1>&2
	exit 1
fi
i=$1
./bin/hgmm -f data.csv -c ${i} -s 1 --save log/param_c${i}.json >log/em_log${i}.txt 2>log/log${i}.txt

