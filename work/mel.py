#coding:utf-8
import sys,os
import wave
import matplotlib
matplotlib.use('Agg')
from pylab import *
from optparse import OptionParser

def my_specgram(x, NFFT=256, Fs=2, Fc=0, detrend=mlab.detrend_none,
			 window=mlab.window_hanning, noverlap=128,
			 cmap=None, xextent=None, pad_to=None, sides='default',
			 p_range_max=None,p_range_min=None,normalize_enabled=False,
			 scale_by_freq=None, minfreq = None, maxfreq = None, **kwargs):
	"""
	call signature::

	  specgram(x, NFFT=256, Fs=2, Fc=0, detrend=mlab.detrend_none,
			   window=mlab.window_hanning, noverlap=128,
			   cmap=None, xextent=None, pad_to=None, sides='default',
			   scale_by_freq=None, minfreq = None, maxfreq = None, **kwargs)

	Compute a spectrogram of data in *x*.  Data are split into
	*NFFT* length segments and the PSD of each section is
	computed.  The windowing function *window* is applied to each
	segment, and the amount of overlap of each segment is
	specified with *noverlap*.

	%(PSD)s

	  *Fc*: integer
		The center frequency of *x* (defaults to 0), which offsets
		the y extents of the plot to reflect the frequency range used
		when a signal is acquired and then filtered and downsampled to
		baseband.

	  *cmap*:
		A :class:`matplotlib.cm.Colormap` instance; if *None* use
		default determined by rc

	  *xextent*:
		The image extent along the x-axis. xextent = (xmin,xmax)
		The default is (0,max(bins)), where bins is the return
		value from :func:`mlab.specgram`

	  *minfreq, maxfreq*
		Limits y-axis. Both required

	  *kwargs*:

		Additional kwargs are passed on to imshow which makes the
		specgram image

	  Return value is (*Pxx*, *freqs*, *bins*, *im*):

	  - *bins* are the time points the spectrogram is calculated over
	  - *freqs* is an array of frequencies
	  - *Pxx* is a len(times) x len(freqs) array of power
	  - *im* is a :class:`matplotlib.image.AxesImage` instance

	Note: If *x* is real (i.e. non-complex), only the positive
	spectrum is shown.  If *x* is complex, both positive and
	negative parts of the spectrum are shown.  This can be
	overridden using the *sides* keyword argument.

	**Example:**

	.. plot:: mpl_examples/pylab_examples/specgram_demo.py

	"""

	#####################################
	# modified  axes.specgram() to limit
	# the frequencies plotted
	#####################################

	# this will fail if there isn't a current axis in the global scope
	ax = gca()
	Pxx, freqs, bins = mlab.specgram(x, NFFT, Fs, detrend,
		 window, noverlap, pad_to, sides, scale_by_freq)

	# modified here
	#####################################
	if minfreq is not None and maxfreq is not None:
		Pxx = Pxx[(freqs >= minfreq) & (freqs <= maxfreq)]
		freqs = freqs[(freqs >= minfreq) & (freqs <= maxfreq)]
	#####################################

	Z = 10. * np.log10(Pxx)
	Z = np.flipud(Z)
###
#dynamic range
	if p_range_max!=None:
		print("[range]",np.max(Z),"->",p_range_max)
		Z[Z>p_range_max]=p_range_max
	if p_range_min!=None:
		print("[range]",np.min(Z),"->",p_range_min)
		Z[Z<p_range_min]=p_range_min
	if normalize_enabled:
		if p_range_min!=None and p_range_max!=None:
			Z=(Z-p_range_min)/(p_range_max-p_range_min)+p_range_min

###
	if xextent is None: xextent = 0, np.amax(bins)
	xmin, xmax = xextent
	freqs += Fc
	extent = xmin, xmax, freqs[0], freqs[-1]
	im = ax.imshow(Z, cmap, extent=extent, **kwargs)
	ax.axis('auto')

	return Pxx, freqs, bins, im, Z

def cut_off(Zt,thresh,length):
	num=Zt.shape[0]
	start_index=None
	end_index=None
	for i in range(num):
		if np.max(Zt[i])>thresh:
			start_index=i
			break
	if(start_index!=None and start_index<num):
		for i in range(num):
			if np.max(Zt[num-i-1])>thresh:
				end_index=num-i-1
				break
		Zc=Zt[start_index:end_index+1]
		if(Zc.shape[0]>=length):
			return True,Zc
		else:
			return False,None
	return False,None

if __name__ == "__main__":
	parser = OptionParser()
	parser.add_option(
		"-c", "--cutoff", dest="cutoff_thresh",
		help="cut off threshold (samples)",
		default=None,
		type=int,
		metavar="THRESH")
	(options, args) = parser.parse_args()
	audio_path=args[0]
	output_path=args[1]
	
	name, ext = os.path.splitext(os.path.basename(audio_path))

	# WAVEファイルから波形データを取得
	wf = wave.open(audio_path, "rb")
	data = wf.readframes(wf.getnframes())
	data = frombuffer(data, dtype="int16")
	length = float(wf.getnframes()) / wf.getframerate()  # 波形長さ（秒）
	
	# FFTのサンプル数oFs = 16000.
	Fs=wf.getframerate()
	N = int(Fs*0.005)  # 5ms window
	noverlap = int(Fs*0.0025)
	#N = 128
	#noverlap=N*3/4
	# FFTで用いるハミング窓
	hammingWindow = np.hamming(N)

	# スペクトログラムを描画
	view_x_start=0
	view_x_end=length
	view_freq_start=0
	view_freq_end=wf.getframerate() / 2
	view_length=view_x_end-view_x_start
	output_freq_start=0
	output_freq_end=8000

	x=(12*(view_length/10))
	if(x> 32768/73.0):#plot maximum size is 32768
		print("[WARN] plot maximum size")
		x=32768/73.0#+6 actually safe
	figure(figsize=(x,4))
	pxx, freqs, bins, im,Z = my_specgram(data,
			NFFT=N, Fs=Fs, noverlap=noverlap,
			p_range_max=50,p_range_min=0,normalize_enabled=True,
			window=hammingWindow,cmap=cm.gray_r)
	axis([view_x_start,view_x_end, view_freq_start,view_freq_end])#
	disable_xy_label=False
	if disable_xy_label:
		tick_params(labelbottom='off')
		tick_params(labelleft='off')

	#colorbar(format='%+02.0f dB')
	try:
		tight_layout()
	except:
		print("[WARN] tight_layout doesn't work, and skip")

	#xlabel("time [second]"):
	#ylabel("frequency [Hz]")
	#savefig('test.png', dpi=72)
	try:
		savefig(output_path+name+'.png', dpi=72)
	except:
		print("[WARN] too short (plot fail)")
	
	nbin=Z.shape[0]
	i1=int(math.floor(nbin*output_freq_start/(Fs/2)))
	i2=int(math.ceil(nbin*output_freq_end/(Fs/2))+1)
	Z=Z[i1:i2]
	print(Z.shape)

	save_data=np.transpose(Z)
	res=True
	if options.cutoff_thresh!=None:
		res,save_data=cut_off(save_data,0.1,200)
	if res:
		np.save(output_path+name,save_data)
		print("[save]:"+output_path+name+".npy")
		out = open(output_path+name+".mel","w")
		for x in save_data:
			print(",".join(map(str,x)), file=out)
		print("[save]:"+output_path+name+".mel")
#
