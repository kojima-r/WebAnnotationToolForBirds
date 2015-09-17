# We'll need the os module for file path manipulation
import os
import sys

# And numpy for some mathematical operations
import numpy as np

# Librosa for audio
import librosa

# matplotlib for displaying the output
import matplotlib.pyplot as plt
#%matplotlib inline

audio_path = sys.argv[1]
output_path = sys.argv[2]
y, sr = librosa.load(audio_path,sr=16000)

plot_enable=False
output_path2 = output_path
if(len(sys.argv)>3 and sys.argv[3]=="plot"):
	output_path2 = sys.argv[4]
	plot_enable=True

# Let's make and display a mel-scaled power (energy-squared) spectrogram
# We use a small hop length of 64 here so that the frames line up with the beat tracker example below.
print sr
S = librosa.feature.melspectrogram(y, sr=sr, n_fft=256, hop_length=160, n_mels=161)
# Convert to log scale (dB). We'll use the peak power as reference.
log_S = librosa.logamplitude(S, ref_power=np.max)
# Display the spectrogram on a mel scale
# sample rate and hop length parameters are used to render the time axis
name, ext = os.path.splitext(os.path.basename(audio_path))
if plot_enable:
	# Make a new figure
	plt.figure(figsize=(12,4))
	librosa.display.specshow(log_S, sr=sr, hop_length=160, x_axis='time', y_axis='mel')
	plt.title('mel power spectrogram')
	#plt.colorbar(format='%+02.0f dB')
	plt.colorbar()
	plt.tight_layout()
	plt.savefig(output_path2+name+'.png', dpi=72)

log_St=np.transpose(log_S)
#np.save(output_path+name,log_St)
out = open(output_path+name+".mel","w")
for x in log_St:
	print >>out, ",".join(map(str,x))
#
