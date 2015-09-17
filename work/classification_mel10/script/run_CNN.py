import cPickle
import gzip
import os
import sys
import time

import numpy

import theano
import theano.tensor as T
from theano.tensor.signal import downsample
from theano.tensor.nnet import conv

from logistic_sgd import LogisticRegression, load_data
from mlp import HiddenLayer
from convolutional_mlp import LeNetConvPoolLayer
import argparse
import array
import csv

usage="Usage: < input (.csv/.np/.dat) >  <output (.csv/.np/.dat)> < hidden layer (comma sep) > <begin_vec_col> [args]"
parser = argparse.ArgumentParser(
		description=__doc__,
		fromfile_prefix_chars='@'
		)
parser.add_argument('input_file',
		metavar='INPUT_FILE',
		type=str,
		help='input file name (x)')
## structure and parameters of CNN
parser.add_argument(
	"--ch",
	type=int,
	dest="channel",
	help="input channel",
	default=1)
parser.add_argument(
	"--n_class",
	dest="n_class",
	type=int,
	default=2,
	help="# of output classes (log-layer)")
parser.add_argument(
	"-r",
	"--result",
	dest="result_filename",
	default=None,
	help="output result")
parser.add_argument(
	"-T",
	"--train",
	dest="train",
	type=int,
	default=1,
	help="# of training epochs")
parser.add_argument(
	"-B",
	"--batch",
	dest="batch",
	type=int,
	default=1,
	help="batch size")
parser.add_argument(
	"-c",
	"--comp",
	dest="compressed_file",
	default=None,
	help="compressed output file name")
parser.add_argument(
	"--mlp_layer",
	dest="mlp_layer",
	type=int,
	nargs="+",
	default=[500],
	help="number of MLP layers")
parser.add_argument(
	"--pool",
	dest="pool",
	type=str,
	nargs="+",
	default=["2,2","2,2"],
	help="array of pooling sizes (convolution layer parameters)")
parser.add_argument(
	"--filter",
	dest="filter",
	type=str,
	nargs="+",
	default=["5,5","5,5"],
	help="array of filter sizes (convolution layer parameters)")
parser.add_argument(
	"--n_kernel",
	dest="n_kernel",
	type=int,
	nargs="+",
	default=[20,50],
	help="array of filter sizes (convolution layer parameters)")
parser.add_argument(
	"--input_shape",
	dest="input_shape",
	type=int,
	nargs="+",
	default=[28,28],
	help="input size (convolution layer parameters)")

parser.add_argument(
	"--validation_freq",
	dest="validation_freq",
	type=int,
	default=1000,
	help="validation frequency to indicate # of iteration")

parser.add_argument(
	"--input2",
	dest="input2",
	type=str,
	default=None,
	help="second input")
parser.add_argument(
	"--mlp_layer2",
	dest="mlp_layer2",
	type=int,
	nargs="+",
	default=[500],
	help="number of MLP layers")





## file format
parser.add_argument(
	"-l",
	"--load",
	dest="param_file",
	help="load parameters file (.dump)")
parser.add_argument(
	"--numpy",
	action="store_true",
	dest="numpy",
	help="use numpy file format as input/output/answer-set",
	default=False)
parser.add_argument(
	"-D",
	"--dat",
	dest="dat_col",
	default="",
	help="use dat(binary) file format with indicated columns as input")
parser.add_argument(
	"-a",
	"--ans",
	dest="ans_filename",
	help="answer-set file (and enable fine-tuning)",)
parser.add_argument(
	"-A",
	"--ans_col",
	dest="ans_col",
	type=int,
	nargs="+",
	default=None,
	help="answer collumn id (csv) (and enable fine-tuning)")
parser.add_argument(
	"-s",
	"--save",
	dest="save_param_filename",
	default=None,
	help="filename to save parameters")
parser.add_argument(
	"-i",
	"--ignore",
	dest="ignore_col",
	type=int,
	default=0,
	help="")
## parse
args = parser.parse_args()

class CNN(object):
	def __init__(self, rng,
			x2_size=0,
			input_shape=(28,28),
			pool_size=[(2,2),(2,2)],
			filter_size=[(5,5),(5,5)],
			input_tensor=2,
			input_channel=1,
			nkerns=[20, 50],
			n_class=10,
			mlp_layer=[500],
			mlp_layer2=[500]):
		self.rng=rng
		self.input_tensor=input_tensor
		self.input_channel=input_channel
		self.nkerns=nkerns
		self.n_class=n_class
		self.mlp_layer=mlp_layer
		self.mlp_layer2=mlp_layer2
		self.var_index = T.lscalar()
		self.var_y = T.ivector('y')
		self.var_x = self.get_x_var()
		self.x2_size = x2_size
		print "------------------"
		print x2_size
		if self.x2_size>0:
			self.var_x2 = T.matrix('x2')
		else:
			self.var_x2 = None
		self.input_shape=input_shape
		self.pool_size=pool_size
		self.filter_size=filter_size
	def get_image_shapes(self):
		ret=[]
		ishape=self.input_shape
		ret.append(ishape)
		for i in xrange(len(self.filter_size)):
			next_ishape0=(ishape[0]-self.filter_size[i][0]+1)/self.pool_size[i][0]
			next_ishape1=(ishape[1]-self.filter_size[i][1]+1)/self.pool_size[i][1]
			ret.append((next_ishape0,next_ishape1))
			ishape=(next_ishape0,next_ishape1)
		return ret
	def get_vars(self):
		return(self.var_index,self.var_x,self.var_y)
	def get_x_var(self):
		if self.input_tensor==2:
			x = T.matrix('x')
		elif self.input_tensor==3:
			x = T.tensor3('x')
		return x

	def load(self,params,batch_size):
		index,x,y=self.get_vars()
		ishape = self.input_shape
		ishapes=self.get_image_shapes()
		ch=self.input_channel
		mlp_layer=self.mlp_layer
		######################
		# BUILD ACTUAL MODEL #
		######################
		print '... building the model'

		# Reshape matrix of rasterized images of shape (batch_size,28*28)
		# to a 4D tensor, compatible with our LeNetConvPoolLayer
		cnn_layers=[]
		cnn_layer_input = x.reshape((batch_size,self.input_channel, ishapes[0][0], ishapes[0][1]))
		for i in xrange(len(self.filter_size)):
			filter0=self.filter_size[i]
			if i ==0:
				ch=self.input_channel
			else:
				ch=self.nkerns[i-1]
			cnn_layer = LeNetConvPoolLayer(self.rng, input=cnn_layer_input,
					image_shape=(batch_size, ch, ishapes[i][0], ishapes[i][1]),
					W=params['cnn1'][i],
					b=params['cnn2'][i],
					filter_shape=(self.nkerns[i], ch, filter0[0], filter0[1]),
					poolsize=self.pool_size[i])
			cnn_layer_input=cnn_layer.output
	
		last_index=len(self.filter_size)
		layer_input = cnn_layer_input.flatten(2)
		n_layer_input=self.nkerns[last_index-1] * ishapes[last_index][0] * ishapes[last_index][1]
		for layer_index in xrange(len(mlp_layer)):
			n_out=mlp_layer[layer_index]
			lW = theano.shared(params['ws'][layer_index],borrow=True)
			lb = theano.shared(params['bs'][layer_index],borrow=True)
			layer = HiddenLayer(self.rng, input=layer_input, n_in=n_layer_input,
				W=lW,
				b=lb,
				n_out=n_out, activation=T.tanh)
			layer_input=layer.output
			n_layer_input=n_out
		
		mlp_output=layer_input

		lr_index=len(mlp_layer)
		lW = theano.shared(params['ws'][lr_index],borrow=True)
		lb = theano.shared(params['bs'][lr_index],borrow=True)
		if self.x2_size>0:
			layer_input=theano.tensor.concatenate([mlp_output,self.var_x2],axis=1)
			lr_layer = LogisticRegression(input=layer_input,
					W=lW,
					b=lb,
					n_in=n_layer_input+self.x2_size,
					n_out=self.n_class)
			cost = lr_layer.negative_log_likelihood(y)
			return(lr_layer.errors, mlp_output,lr_layer.get_y_pred())
		else:
			lr_layer = LogisticRegression(input=layer_input,
					W=lW,
					b=lb,
					n_in=n_layer_input, n_out=self.n_class)
			cost = lr_layer.negative_log_likelihood(y)
			return(lr_layer.errors, mlp_output,lr_layer.get_y_pred())
	def build(self,batch_size):
		# allocate symbolic variables for the data
		index,x,y=self.get_vars()
		ishape = self.input_shape
		ishapes=self.get_image_shapes()
		ch=self.input_channel
		mlp_layer=self.mlp_layer
		mlp_layer2=self.mlp_layer2
		######################
		# BUILD ACTUAL MODEL #
		######################
		print '... building the model'

		# Reshape matrix of rasterized images of shape (batch_size,28*28)
		# to a 4D tensor, compatible with our LeNetConvPoolLayer
		cnn_layer_input = x.reshape((batch_size,self.input_channel, ishapes[0][0], ishapes[0][1]))
		cnn_params=[]
		for i in xrange(len(self.filter_size)):
			filter0=self.filter_size[i]
			if i ==0:
				ch=self.input_channel
			else:
				ch=self.nkerns[i-1]
			cnn_layer = LeNetConvPoolLayer(self.rng, input=cnn_layer_input,
					image_shape=(batch_size, ch, ishapes[i][0], ishapes[i][1]),
					W=None,
					b=None,
					filter_shape=(self.nkerns[i], ch, filter0[0], filter0[1]),
					poolsize=self.pool_size[i])
			cnn_params+=cnn_layer.params
			cnn_layer_input=cnn_layer.output
	
		last_index=len(self.filter_size)
		layer_input = cnn_layer_input.flatten(2)
		n_layer_input=self.nkerns[last_index-1] * ishapes[last_index][0] * ishapes[last_index][1]

		mlp_params=[]
		for layer_index in xrange(len(mlp_layer)):
			n_out=mlp_layer[layer_index]
			layer = HiddenLayer(self.rng, input=layer_input, n_in=n_layer_input,
				W=None,b=None,
				n_out=n_out, activation=T.tanh)
			mlp_params+=layer.params
			layer_input=layer.output
			n_layer_input=n_out
		
		mlp_output=layer_input

		if self.x2_size>0:
			print self.x2_size
			print n_layer_input+self.x2_size,
			lr_index=len(mlp_layer)
			layer_input=theano.tensor.concatenate([mlp_output,self.var_x2],axis=1)
			lr_layer = LogisticRegression(input=layer_input,
					W=None,
					b=None,
					n_in=n_layer_input+self.x2_size,
					n_out=self.n_class)
			cost = lr_layer.negative_log_likelihood(y)
			return(lr_layer.errors, mlp_output, lr_layer.get_y_pred(),cost,cnn_params,mlp_params,lr_layer.params)
		else:
			lr_index=len(mlp_layer)
			lr_layer = LogisticRegression(input=layer_input,
					W=None,b=None,
					n_in=n_layer_input, n_out=self.n_class)
			cost = lr_layer.negative_log_likelihood(y)
			return(lr_layer.errors, mlp_output, lr_layer.get_y_pred(),cost,cnn_params,mlp_params,lr_layer.params)

def test_CNN(train_set_x=None,train_set_y=None,
					train_set_x2=None,
					batch_size=500,param=None,
					compress_out=None,
					result_filename=None,
					cnn=None):
	# compute number of minibatches for training, validation and testing
	n_train_batches = train_set_x.get_value(borrow=True).shape[0]
	n_train_batches /= batch_size
	# allocate symbolic variables for the data
	# error function
	errors,compress,pred = cnn.load(param,batch_size=batch_size)
	index,x,y=cnn.get_vars()
	x2=cnn.var_x2
	if train_set_y!=None:
		if train_set_x2==None:
			test_model = theano.function([index], errors(y),
				 givens={
					x: train_set_x[index * batch_size: (index + 1) * batch_size],
					y: train_set_y[index * batch_size: (index + 1) * batch_size]})
		else:
			test_model = theano.function([index], errors(y),
				 givens={
					x: train_set_x[index * batch_size: (index + 1) * batch_size],
					x2: train_set_x2[index * batch_size: (index + 1) * batch_size],
					y: train_set_y[index * batch_size: (index + 1) * batch_size]})
	
		test_losses = [test_model(i) for i in xrange(n_train_batches)]
		test_score = numpy.mean(test_losses)
		print (('... model %f %%') % (test_score * 100.))
	
	if compress_out!=None:
		compress_model = theano.function([index],compress,
			 givens={
				x: train_set_x[index * batch_size: (index + 1) * batch_size]})
	
		compressed_data = [compress_model(i).ravel() for i in xrange(n_train_batches)]
		numpy.save(compress_out,compressed_data)
		print '... saved '+compress_out
	
	# recons
	#for da in reversed(sda.dA_layers):
	#	temp=da.get_reconstructed_input(temp)
	
	if result_filename!=None:
		path, ext = os.path.splitext( os.path.basename(result_filename))
		if train_set_x2==None:
			f=theano.function([index],pred,givens={
				x:train_set_x[index*batch_size:(index+1)*batch_size]
				})
		else:
			f=theano.function([index],pred,givens={
				x:train_set_x[index*batch_size:(index+1)*batch_size],
				x2:train_set_x2[index*batch_size:(index+1)*batch_size]
				})
		
		if(ext==".csv" or ext==".txt"):
			fp = open(result_filename, 'w') 
			output = [f(i) for i in xrange(n_train_batches)]
			for x in output:
				fp.writelines(str(x[0])+"\n")
		else:
			output = [f(i) for i in xrange(n_train_batches)]
			numpy.save(output,result_filename)

	return


def learn(learning_rate=0.1, n_epochs=200,
					train_set_x=None,
					train_set_x2=None,
					train_set_y=None,
					compress_out=None,
					validation_frequency=1000,
					batch_size=500,
					result_filename=None,
					cnn=None):

	# compute number of minibatches for training, validation and testing
	n_train_batches = train_set_x.get_value(borrow=True).shape[0]
	n_train_batches /= batch_size
	errors,compress,pred,cost,cnn_params,mlp_params,lr_params = cnn.build(batch_size=batch_size)
	params=cnn_params+mlp_params+lr_params 
	index,x,y=cnn.get_vars()
	x2=cnn.var_x2
	# error function
	if train_set_x2==None:
		test_model = theano.function([index], errors(y),
				 givens={
					x: train_set_x[index * batch_size: (index + 1) * batch_size],
					y: train_set_y[index * batch_size: (index + 1) * batch_size]})
	else:
		test_model = theano.function([index], errors(y),
				 givens={
					x: train_set_x[index * batch_size: (index + 1) * batch_size],
					x2: train_set_x2[index * batch_size: (index + 1) * batch_size],
					y: train_set_y[index * batch_size: (index + 1) * batch_size]})
		
	grads = T.grad(cost, params)

	# train_model is a function that updates the model parameters by
	# SGD Since this model has many parameters, it would be tedious to
	# manually create an update rule for each model parameter. We thus
	# create the updates list by automatically looping over all
	# (params[i],grads[i]) pairs.
	updates = []
	for param_i, grad_i in zip(params, grads):
		updates.append((param_i, param_i - learning_rate * grad_i))

	if train_set_x2==None:
		train_model = theano.function([index], cost, updates=updates,
			givens={
				x: train_set_x[index * batch_size: (index + 1) * batch_size],
				y: train_set_y[index * batch_size: (index + 1) * batch_size]})
	else:
		train_model = theano.function([index], cost, updates=updates,
			givens={
				x: train_set_x[index * batch_size: (index + 1) * batch_size],
				x2: train_set_x2[index * batch_size: (index + 1) * batch_size],
				y: train_set_y[index * batch_size: (index + 1) * batch_size]})
	###############
	# TRAIN MODEL #
	###############
	print '... training'
	patience = 10000  # look as this many examples regardless
	patience_increase = 2  # wait this much longer when a new best is found
	improvement_threshold = 0.995
	#validation_frequency = min(n_train_batches, patience / 2)

	best_params = None
	best_validation_loss = numpy.inf
	best_iter = 0
	test_score = 0.
	start_time = time.clock()

	epoch = 0
	while(epoch < n_epochs):
		epoch = epoch + 1
		for minibatch_index in xrange(n_train_batches):
			iter = (epoch - 1) * n_train_batches + minibatch_index
			if iter % 100 == 0:
				print '... training @ iter = ', iter
			cost_ij = train_model(minibatch_index)
			if (iter + 1) % validation_frequency == 0:
				test_losses = [test_model(i) for i in xrange(n_train_batches)]
				test_score = numpy.mean(test_losses)
				print (('... epoch %i, minibatch %i/%i, test error of best '
					'model %f %%') % \
					(epoch, minibatch_index + 1, n_train_batches,
					test_score * 100.))


	end_time = time.clock()
	print('Optimization complete.')
	print('Best validation score of %f %% obtained at iteration %i,'\
		  'with test performance %f %%' %
		  (best_validation_loss * 100., best_iter + 1, test_score * 100.))
	print >> sys.stderr, ('The code for file ' +
						  os.path.split(__file__)[1] +
						  ' ran for %.2fm' % ((end_time - start_time) / 60.))
	#
	#
	if compress_out!=None:
		if train_set_x2==None:
			compress_model = theano.function([index], compress,
					givens={x: train_set_x[index * batch_size: (index + 1) * batch_size]})
		else:
			compress_model = theano.function([index], compress,
					givens={
						x: train_set_x[index * batch_size: (index + 1) * batch_size],
					#	x2: train_set_x2[index * batch_size: (index + 1) * batch_size],
						})

		compressed_data = [compress_model(i) for i in xrange(n_train_batches)]
		numpy.save(compress_out,compressed_data)
		print '... saved '+compress_out
	
	
	if result_filename!=None:
		path, ext = os.path.splitext( os.path.basename(result_filename))

		if train_set_x2==None:
			f=theano.function([index],pred,givens={x:train_set_x[index*batch_size:(index+1)*batch_size]})
		else:
			f=theano.function([index],pred,givens={
					x:train_set_x[index*batch_size:(index+1)*batch_size],
					x2:train_set_x2[index*batch_size:(index+1)*batch_size]})

		if(ext==".csv" or ext==".txt"):
			fp = open(result_filename, 'w') 
			output = [f(i) for i in xrange(n_train_batches)]
			for x in output:
				fp.writelines(str(x[0])+"\n")
		else:
			output = [f(i) for i in xrange(n_train_batches)]
			numpy.save(output,result_filename)


	return cnn_params,mlp_params,lr_params 

def load_CNN(filename):
	fd = open(filename, 'rb')
	param=cPickle.load(fd)
	#print param
	return param


def save_CNN(filename,cnn_params,mlp_params,lr_params):
	cnn1=[]
	cnn2=[]
	for i in range(len(cnn_params)/2):
		cnn1.append(cnn_params[i*2].get_value(borrow=True))
		cnn2.append(cnn_params[i*2+1].get_value(borrow=True))
	ws=[]
	bs=[]
	for i in range(len(mlp_params)/2):
		ws.append(mlp_params[i*2].get_value(borrow=True))
		bs.append(mlp_params[i*2+1].get_value(borrow=True))
	
	ws.append(lr_params[0].get_value(borrow=True))
	bs.append(lr_params[1].get_value(borrow=True))
	
	params={'ws':ws,'bs':bs,'cnn1':cnn1,'cnn2':cnn2}
	fd=open(filename,'wb')
	cPickle.dump(params,fd)


if __name__ == '__main__':
	vec_col=args.ignore_col
	batch_size=args.batch
	train_set_x=None
	train_set_y=None
	shared_y = None
	if args.dat_col!="":
		print "... reading input data (x) from : "+args.input_file+"(dat)..."
		ncols=int(args.dat_col)
		train_set_x=load_dat(args.input_file,ncols)
	elif args.numpy:
		print "... reading input data (x) from : "+args.input_file+"(numpy)..."
		temp=numpy.load(args.input_file)
		train_set_x=numpy.asarray(temp,dtype=theano.config.floatX)
		#print train_set_x
	else:
		print "... reading input data (x) from : "+args.input_file+"(csv)..."
		data=[]
		ignore=[]
		ans_data=[]
		spamReader = csv.reader(open(args.input_file, 'r'), delimiter=',')
		ans_col=args.ans_col
		for row in spamReader:
			r=map(float,row[vec_col:])
			if vec_col>0: ignore.append(row[:vec_col])
			if ans_col!=None:
				if len(ans_col)==1:
					ans_data.append(int(row[ans_col[0]]))
				else:
					ans_data.append([int(row[i]) for i in ans_col])
			data.append(r)
		train_set_x=data
		if ans_col!=None: train_set_y=ans_data
	
	num_data=len(train_set_x)
	learning_rate=0.1
	borrow=False
	n_class=args.n_class
	n_train=args.train
	pool_size=map(lambda s:map(int,s.split(",")),args.pool)
	filter_size=map(lambda s:map(int,s.split(",")),args.filter)
	print "# args : " + str(args)
	print "# num_data : " + str(num_data)
	print "# num_out : " + str(n_class)
	print "# train set x : ", len(train_set_x)
	print "# pool size : ", str(pool_size)
	print "# filter size : ", str(filter_size)
	print "# # of kernels : ", str(args.n_kernel)
	print "# num_hidden : "+str(args.mlp_layer)
	if args.ans_filename!=None:
		print "... loading training data (y) from :" + args.ans_filename + "..."
		if args.numpy:
			train_set_y=numpy.asarray(numpy.load(args.ans_filename),dtype=numpy.int32)
			#train_set_y=numpy.asarray(numpy.load(args.ans_filename),dtype=theano.config.floatX)
		else:
			data=[]
			spamReader = csv.reader(open(args.ans_filename, 'r'), delimiter=',')
			for row in spamReader:
				r=map(float,row)
				data.append(r)
			train_set_y=data
		
		#train_set_y=numpy.asarray(temp,dtype=theano.config.floatX)
		train_set_x=train_set_x[:len(train_set_y)]
		print "# train set y : ",len(train_set_y)
		shared_y = theano.shared(numpy.asarray(train_set_y,dtype=numpy.int32),borrow=borrow)
		num_data=len(train_set_y)

	shared_x = theano.shared(numpy.asarray(train_set_x,dtype=theano.config.floatX),borrow=borrow)
	if args.input2!=None:
		print "... reading input2 data (x) from : "+args.input2+"(numpy)..."
		temp=numpy.load(args.input2)
		train_set_x2=numpy.asarray(temp,dtype=theano.config.floatX)
		shared_x2 = theano.shared(numpy.asarray(train_set_x2,dtype=theano.config.floatX),borrow=borrow)
		
	###
	input_tensor=2
	if args.channel>1:
		input_tensor=3
	###
	rng = numpy.random.RandomState(23455)
	cnn=CNN(
			rng=rng,
			input_shape=args.input_shape,
			input_tensor=input_tensor,
			input_channel=args.channel,
			nkerns=args.n_kernel,
			pool_size=pool_size,
			filter_size=filter_size,
			mlp_layer=args.mlp_layer,
			n_class=args.n_class,
			x2_size=shared_x2.get_value(borrow=True).shape[1],
			mlp_layer2=args.mlp_layer2
			)

	print cnn.get_image_shapes()
	if args.param_file!=None:
		params=load_CNN(args.param_file)
		test_CNN(
				train_set_x=shared_x,train_set_y=shared_y,
				cnn=cnn,
				batch_size=1,
				param=params,
				compress_out=args.compressed_file,
				result_filename=args.result_filename,
				train_set_x2=shared_x2
				)
		quit()

	cnn_params,mlp_params,lr_params=learn(
			learning_rate=learning_rate,
			n_epochs=args.train,
			cnn=cnn,
			validation_frequency=args.validation_freq,
			train_set_x=shared_x,
			train_set_y=shared_y,
			compress_out=args.compressed_file,
			batch_size=batch_size,
			result_filename=args.result_filename,
			train_set_x2=shared_x2
			)
	save_file=args.save_param_filename
	if save_file==None:
		save_file="param_t"+str(n_train)+".dump"
	save_CNN(save_file,cnn_params,mlp_params,lr_params)
	#################
	


