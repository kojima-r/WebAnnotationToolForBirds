

binary=~/programs/BMLTool/BasicMLTools-CNN/src/basicMLTools/CNN/run_CNN.py
gpu=$1
num_class=10
noise=10
n_train=1000
cnn="--input_shape 27 100 --filter 4,11 5,10 --ch 1 "
THEANO_FLAGS=mode=FAST_RUN,device=gpu${gpu},floatX=float32 python ${binary} ./dataset/dataset_x${noise}_n.npy -c ./closed/dataset_x${noise}_n_c.npy --numpy -a ./dataset/dataset_y${noise}.npy --n_class ${num_class} -T ${n_train} -L 0.01 -s ./closed/param${noise}.dump -r ./closed/result${noise}.txt -B 500 ${cnn} > closed/log${noise}.out 

