
binary=~/programs/BMLTool/BasicMLTools-CNN/src/basicMLTools/CNN/run_CNN.py
gpu=$1
num=8
r=0.01
n_train=10000
noise=_mel
cnn="--input_shape 20 20 --filter 5,5 2,2 --ch 1 "
for fold in `seq 1 5`
do
input_train=dataset_cv/dataset${noise}_train${fold}.npy
input_train_a=dataset_cv/dataset${noise}_train${fold}_ans.npy
input_test=dataset_cv/dataset${noise}_test${fold}.npy
input_test_a=dataset_cv/dataset${noise}_test${fold}_ans.npy
param=cv/param${noise}_${fold}.dump

THEANO_FLAGS=mode=FAST_RUN,device=gpu${gpu},floatX=float32 python ${binary} ${input_train} -a ${input_train_a} --numpy  --n_class ${num} --ch 1 -T ${n_train} -s ${param} -B 500 -L ${r} ${cnn} > cv/log${noise}_${fold}.out

THEANO_FLAGS=mode=FAST_RUN,device=gpu${gpu},floatX=float32 python ${binary} ${input_test} -c ./cv/comp_a${fold}.npy --numpy --n_class ${num} --ch 1 -T 0 -l ${param} -r ./cv/result${noise}_${fold}.txt -B 1 ${cnn} > cv/eval${noise}_${fold}.out

done

