import sys
import zipfile
from xml.etree import ElementTree as et

SOURCE_FILE="transferFunction/source.xml"
# main
def read_hark_tf_source(filename):
	config={}
	config["positions"]=[]
	with zipfile.ZipFile(filename, 'r') as zf:
		tree=et.fromstring(zf.open(SOURCE_FILE).read())
		for el in tree.findall(".//config"):
			for e in el:
				config[e.tag]=e.text
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
				pos=(int(pos_id),float(x),float(y),float(z))
				config["positions"].append(pos)
	return config

if __name__ == '__main__':
	# argv check
	if len(sys.argv)<2:
		print("Usage: read_source.py <in: tf.zip(HARK2 transfer function file)>", file=sys.stderr)
		quit()
	# 
	tf_filename=sys.argv[1]
	config=read_hark_tf_source(tf_filename)
	print("# config:",config)

