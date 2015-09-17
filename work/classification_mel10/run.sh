
cat run_gmm.list | xargs -P16 -I{} -t bash -c '{}'

