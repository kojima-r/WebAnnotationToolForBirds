import os
import sys
import time

import cPickle
import gzip
import numpy
import theano
import theano.tensor as T
from theano.tensor.shared_randomstreams import RandomStreams
import scipy.io
import csv
import SdA
from optparse import OptionParser
import array

usage="Usage: < input (.csv/.np/.dat) >  <output (.csv/.np/.dat)> < hidden layer (comma sep) > <begin_vec_col> [OPTIONS]"
parser = OptionParser(usage=usage)
## structure and parameter of SdA
parser.add_option(
	"--log", action="store_true", dest="log_layer_flag",
	help="enable log layer",
	default=False)
parser.add_option(
	"-n", "--n_out", dest="n_out",
	default="0",
	help="# of output classes (log-layer)")
parser.add_option(
	"-p", "--pretrain", dest="pretrain",
	default="1",
	help="# of pretraining epochs")
parser.add_option(
	"-t", "--train", dest="train",
	default="1",
	help="# of training epochs")
parser.add_option(
	"-b", "--batch", dest="batch",
	default="1",
	help="batch size")

## file format
parser.add_option(
	"-l", "--load", dest="param_file",
	help="load parameters file (.dump)")
parser.add_option(
	"--numpy",action="store_true", dest="numpy",
	help="use numpy file format as input/output/answer-set",
	default=False)
parser.add_option(
	"-d", "--dat", dest="dat_col",
	default="",
	help="use dat(binary) file format with indicated columns as input")
parser.add_option(
	"-f", "--fine", dest="ans_filename",
	help="answer-set file (and enable fine-tuning)",)
parser.add_option(
	"-F", "--fine_col", dest="fine_col",
	default=None,
	help="answer collumn id (csv) (and enable fine-tuning)")
parser.add_option(
	"-s", "--save", dest="save_filename",
	default=None,
	help="filename to save parameters")

## parse
(options, args) = parser.parse_args()

def load_dat(filename,ncols):
	f = open(filename, "rb")
	a = array.array('f')
	line_cnt=0
	try:
		while(1):
			a.fromfile(f, ncols)
			line_cnt+=1
	except EOFError:
		f.close()
	na=numpy.asarray(a,dtype=theano.config.floatX)
	na.shape=(line_cnt,ncols)
	return na


def save_SdA(filename,sda):
	########################
	# SAVE THE MODEL 
	########################
	ws=[]
	bs=[]
	for i in range(len(sda.params)/2):
		ws.append(sda.params[i*2].get_value(borrow=True))
		bs.append(sda.params[i*2+1].get_value(borrow=True))
	params={'ws':ws,'bs':bs}
	fd=open(filename,'w')
	cPickle.dump(params,fd)
	print "# param_num : ",len(sda.params)

def learn_SdA(finetune_lr=0.1, pretraining_epochs=15,
		pretrain_lr=0.001, training_epochs=1000,
		corruption_levels = [.1, .2, .3],
		hidden_layers_sizes=[2],
		n_out=10,
		log_layer_flag=False,
		train_set_x=[],train_set_y=None,in_dim=10, batch_size=1,sda=None,):
	borrow=False
	n_train_batches = train_set_x.get_value(borrow=True).shape[0]
	n_train_batches /= batch_size
	numpy_rng = numpy.random.RandomState(89677)
	# construct the stacked denoising autoencoder class
	if sda==None:
		sda = SdA.SdA(numpy_rng=numpy_rng, n_ins=in_dim,
			  hidden_layers_sizes=hidden_layers_sizes,
			  n_outs=n_out,log_layer_flag=log_layer_flag)
	#########################
	# PRETRAINING THE MODEL #
	#########################
	if pretraining_epochs>0:
		print '... getting the pretraining functions'
		pretraining_fns = sda.pretraining_functions(train_set_x=train_set_x,
												batch_size=batch_size)
		print '... pre-training the model'
		start_time = time.clock()
		for i in xrange(sda.n_layers):
			for epoch in xrange(pretraining_epochs):
				c = []
				for batch_index in xrange(n_train_batches):
					c.append(pretraining_fns[i](index=batch_index,
							 corruption=corruption_levels[i],
							 lr=pretrain_lr))
				print '* Pre-training layer %i, epoch %d, cost ' % (i, epoch),
				print numpy.mean(c)
		end_time = time.clock()
		print >> sys.stderr, ('... The pretraining code for file ' +
						  os.path.split(__file__)[1] +
						  ' ran for %.2fm' % ((end_time - start_time) / 60.))

	########################
	# FINETUNING THE MODEL #
	########################
	if(train_set_y!=None and training_epochs>0):
		#(sda,train_set_x,train_set_y,)
		print '... getting the finetuning functions'
		train_fn = sda.build_finetune_functions2(
				dataset_x=train_set_x,dataset_y=train_set_y, batch_size=batch_size,
				learning_rate=finetune_lr)
		print '... finetuning the model'
		patience = 10 * n_train_batches  # look as this many examples regardless
		patience_increase = 2.  # wait this much longer when a new best is
								# found
		improvement_threshold = 0.995  # a relative improvement of this much is
									   # considered significant
		validation_frequency = min(n_train_batches, patience / 2)
									  # go through this many
									  # minibatche before checking the network
									  # on the validation set; in this case we
									  # check every epoch
	
		best_params = None
		best_validation_loss = numpy.inf
		test_score = 0.
		start_time = time.clock()
	
		done_looping = False
		epoch = 0
	
		while ((epoch < training_epochs) and not done_looping):
			print '* Finetuning : %d/%d' % (epoch,training_epochs)
			epoch = epoch + 1
			for minibatch_index in xrange(n_train_batches):
				minibatch_avg_cost = train_fn(minibatch_index)
				iter = (epoch - 1) * n_train_batches + minibatch_index
				#if patience <= iter:
				#	done_looping = True
				#	break
		end_time = time.clock()
	
	print >> sys.stderr, ('... The training code for file ' +
						  os.path.split(__file__)[1] +
						  ' ran for %.2fm' % ((end_time - start_time) / 60.))
	return sda

#########################
### main program ########
#########################
if __name__ == '__main__':
	argvs = args
	argc=len(args)
	if argc<4:
		parser.print_help() 
		quit()
	outfile=argvs[1]
	#read data from vec_col to the end of cols
	vec_col=int(argvs[3])
	log_layer_flag=options.log_layer_flag
	batch_size=int(options.batch)
	train_set_x=None
	train_set_y=None
	if options.fine_col!=None:
		fine_col=map(int,options.fine_col.split(","))
	else:
		fine_col=None
	if options.dat_col!="":
		print "... reading input data (x) from : "+argvs[0]+"(dat)..."
		ncols=int(options.dat_col)
		train_set_x=load_dat(argvs[0],ncols)
	elif options.numpy:
		print "... reading input data (x) from : "+argvs[0]+"(numpy)..."
		temp=numpy.load(argvs[0])
		train_set_x=numpy.asarray(temp,dtype=theano.config.floatX)
		#print train_set_x
	else:
		print "... reading input data (x) from : "+argvs[0]+"(csv)..."
		data=[]
		ignore=[]
		ans_data=[]
		spamReader = csv.reader(open(argvs[0], 'r'), delimiter=',')
		for row in spamReader:
			r=map(float,row[vec_col:])
			if vec_col>0: ignore.append(row[:vec_col])
			if fine_col!=None:
				if log_layer_flag:
					ans_data.append(int(row[fine_col[0]]))
				else:
					ans_data.append([int(row[i]) for i in fine_col])
			data.append(r)
		train_set_x=data
		if fine_col!=None: train_set_y=ans_data
	
	num_visible=len(train_set_x[0])
	num_data=len(train_set_x)
	learning_rate=0.1
	borrow=False
	num_hidden=map(int,argvs[2].split(','))
	n_out=int(options.n_out)
	n_pretrain=int(options.pretrain)
	n_train=int(options.train)
	print "# options : "+str(options)
	print "# num_data : "+str(num_data)
	print "# num_hidden : "+str(num_hidden)
	print "# num_visible : "+str(num_visible)
	print "# num_out : "+str(n_out)
	if options.ans_filename!=None:
		print "... loading training data (y) from :" + options.ans_filename + "..."
		if options.numpy:
			train_set_y=numpy.asarray(numpy.load(options.ans_filename),dtype=numpy.int32)
		else:
			data=[]
			spamReader = csv.reader(open(options.ans_filename, 'r'), delimiter=',')
			for row in spamReader:
				r=map(float,row)
				data.append(r)
			train_set_y=data
		
		#train_set_y=numpy.asarray(temp,dtype=theano.config.floatX)
		train_set_x=train_set_x[:len(train_set_y)]
		print "# train set y : ",len(train_set_y)
		print "# train set x : ",len(train_set_x)
		num_data=len(train_set_y)

	shared_x = theano.shared(numpy.asarray(train_set_x,dtype=theano.config.floatX),borrow=borrow)
	sda=None
	if options.param_file==None:
		print "... building SdA with pre-training ..."
		cl=[0.1]*len(num_hidden)
		sda=learn_SdA(finetune_lr=0.1, pretraining_epochs=n_pretrain,
				 pretrain_lr=0.1, training_epochs=0,
				 hidden_layers_sizes=num_hidden,
				 in_dim=len(train_set_x[0]),
				 corruption_levels = cl,
				 log_layer_flag=log_layer_flag,
				 n_out=n_out,
				 train_set_x=shared_x,train_set_y=None, batch_size=batch_size)
		print "... ended SdA with pre-training"
	else:
		print "... loading parameter from :"+options.param_file+"..."
		param_file=options.param_file
		numpy_rng = numpy.random.RandomState(89677)
		fd=open(param_file, 'r')
		param=cPickle.param_file(fd)
		
		ws=[]
		bs=[]
		for i in range(len(param['ws'])):
			ws.append(theano.shared(value=param['ws'][i],borrow=True))
			bs.append(theano.shared(value=param['bs'][i],borrow=True))
		
		sda =SdA.SdA(numpy_rng=numpy_rng, n_ins=num_visible,
			hidden_layers_sizes=num_hidden,
			log_layer_flag=log_layer_flag,
			ws=ws,bs=bs,
			n_outs=n_out)
		
		print "... loaded SdA"
	
	if log_layer_flag:
		shared_y = theano.shared(numpy.asarray(train_set_y,dtype=numpy.int32),borrow=borrow)
	else:
		shared_y = theano.shared(numpy.asarray(train_set_y,dtype=theano.config.floatX),borrow=borrow)

	if (options.ans_filename!=None or fine_col!=None) and n_train>0:
		print "... started fine-tuning"
		cl=[0.0]*len(num_hidden)
		sda=learn_SdA(finetune_lr=0.1, pretraining_epochs=0,
				pretrain_lr=0.1, training_epochs=n_train,
				hidden_layers_sizes=num_hidden,
				in_dim=len(train_set_x[0]),
				corruption_levels = cl,
				n_out=n_out,
				log_layer_flag=log_layer_flag,
				train_set_x=shared_x,train_set_y=shared_y, batch_size=batch_size,sda=sda)
		print "... ended fine-tuning"
	
	#####
	save_filename = options.save_filename
	if save_filename == None:
		save_filename='save_'+"_".join(map(str,num_hidden))+'_p'+str(n_pretrain)+'_t'+str(n_train)+'.dump'
	print "... saving parameters as : "+save_filename
	save_SdA(save_filename,sda)
	#####
	print "... re-build trained SdA"
	# convert with trained SdA
	i = T.vector('i',dtype=theano.config.floatX)
	index = T.lscalar()
	temp=i

	# compute hidden layer
	for da in sda.dA_layers:
		temp=da.get_hidden_values(temp)
	
	# classify
	if log_layer_flag:
		temp=sda.logLayer.get_pred(temp)
	
	# recons
	#for da in reversed(sda.dA_layers):
	#	temp=da.get_reconstructed_input(temp)
	
	f=theano.function([index],temp,givens={i: shared_x[index]})
	output=[]
	for cnt in xrange(num_data):
		output.append(f(cnt))
	
	if options.ans_filename!=None or fine_col!=None:
		print "... computing precision"
		cnt=0
		for y,pred in zip(train_set_y,output):
			if log_layer_flag:
				if y==pred[0] :cnt+=1
			else:
				match_f=True
				for el_y,el_pred in zip(y,pred):
					if el_y==1 and el_pred<=0.5: match_f=False
					if el_y==0 and el_pred>=0.5: match_f=False
				if match_f: cnt+=1
		print "# precision : ",cnt,"/",len(train_set_y)

	if options.numpy:
		print "... saving(numpy) outputs as "+outfile+"..."
		numpy.save(outfile,numpy.array(output))
	else:
		print "... saving(csv) outputs as "+outfile+"..."
		fp=open(outfile, 'w')
		for o,ig in zip(output,ignore):
			head=""
			if vec_col>0: head=",".join(ig)+"," 
			fp.write(head+",".join(map(str,o))+"\n")
		fp.close()
		#scipy.io.savemat(output, {output_var: data}) 


