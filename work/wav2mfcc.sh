name=sound.scp
echo -n "" > ${name}
for f in `ls sep_files/*.wav`
do
	echo -n $f >>${name}
	echo -n " " >>${name}
	echo "sep_files/"`basename $f .wav`".mfcc.htk" >>${name}
done

HCopy -T 1 -C ./config.hcopy -S ./${name}

