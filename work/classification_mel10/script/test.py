from optparse import OptionParser

parser = OptionParser()

parser.add_option("-f", "--file", dest="filename",help="write report to FILE", metavar="FILE")

parser.add_option("-q", "--quiet",
		                action="store_false", dest="verbose",
						help="be vewwy quiet (I'm hunting wabbits)")

(options, args) = parser.parse_args()
print options
print args
print options.filename
parser.print_help() 
