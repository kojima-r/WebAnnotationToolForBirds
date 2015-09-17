rm mel_img/*
echo -n "" > commands_mel.sh
for f in `ls ./sep_files/*.wav`
do
echo "python mel.py $f ./sep_files/ plot ./mel_img/" >> commands_mel.sh
done

cat commands_mel.sh | xargs -P16 -I{} -t bash -c '{}'


