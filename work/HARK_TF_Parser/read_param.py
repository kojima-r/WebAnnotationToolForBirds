import sys
import zipfile
from xml.etree import ElementTree as et

MIC_FILE="transferFunction/microphones.xml"
def read_hark_tf_param(tf_filename):
	positions=[]
	# main
	with zipfile.ZipFile(tf_filename, 'r') as zf:
		tree=et.fromstring(zf.open(MIC_FILE).read())
		for el in tree.findall(".//positions"):
			# format check
			if el.get("coordinate")!="cartesian":
				print("WARN: unsupported coordinate:",el.get("coordinate"), file=sys.stderr)
			# read positions of microphones
			for el in el.findall(".//position"):
				x=el.get("x")
				y=el.get("y")
				z=el.get("z")
				pos_id=el.get("id")
				pos= (int(pos_id),float(x),float(y),float(z))
				positions.append(pos)
	return positions

if __name__ == '__main__':
	# argv check
	if len(sys.argv)<2:
		print("Usage: read_param.py <in: tf.zip(HARK2 transfer function file)>", file=sys.stderr)
		quit()
	tf_filename=sys.argv[1]
	print(read_hark_tf_param(tf_filename))

