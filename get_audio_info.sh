dur=`soxi -D $1`
echo "{"
echo '	"sampleRate":16000,'
echo -n '	"duration":'
echo ${dur}
echo "}"

