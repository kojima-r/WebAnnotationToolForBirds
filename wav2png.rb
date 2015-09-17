require 'wav-file'

def resampling_and_select_channel(wavs,step,ch,n_ch)
  max_sample = 0
  max_wav = 0
  resamples = []
  len=wavs.length/n_ch
  len.times{|i|
    wavs_index=i*n_ch
    wav=wavs[wavs_index]
    sample = wav.abs # 音声信号の強さだけを波形画像に起こすので、絶対値をとります
    if max_sample < sample
      max_sample = sample
      max_wav = wav
    end
    if((i)%step ==0) # 左チャネルだけであれば500要素分ですが、右チャネルを合わせると二倍の閾値になります
        resamples.push(max_wav) # 500ループ中で最も音声信号レベルの強かった値がpushされます
        max_sample = 0
        max_wav = 0
    end
  }
  return resamples
end


def convert_wav(filename,width,height)
  output_base=[File.dirname(filename), File.basename(filename,".wav")].join("/")
  file = File.open(filename)
  format = WavFile::readFormat(file) # フォーマット情報のロード
  dataChunk = WavFile::readDataChunk(file) # wavチャンク情報(実際に音声を発生させるためのデータ)のロード
   
  bit = 's*' if format.bitPerSample == 16 # int16_t
  bit = 'c*' if format.bitPerSample == 8 # signed char
   
  # ↓以降この変数をwavs配列と呼称します。
  wavs = dataChunk.data.unpack(bit) # read binary # Array型で音声データを取り出し。このArrayのlengthはとんでもない数です。
  step=wavs.length/width
  ch=0
  n_ch=format.channel
  rwavs=resampling_and_select_channel(wavs,step,ch,n_ch)
  p format
  p rwavs.length
  
  ####
  ####
  require 'oily_png'
  image = ChunkyPNG::Image.new(width, height, ChunkyPNG::Color::TRANSPARENT) # 幅800、高さ200、背景透過
  color = ChunkyPNG::Color.from_hex("#00ff00") # オシロスコープっぽい緑色の波形にする
  height_one_side = height / 2 # 1チャネルの波形の高さの最大値
  base_y = height / 2 # 左チャネルの波形の基準Y座標。波形画像の上半分を左チャネルとします。
  rwavs.each_with_index{|sample, x|
    # base_y座標に対する相対的なy座標
    relative_y = height_one_side * sample / 32768 
    # base_yからrelative_yに向かって一本線を引きます。
    image.line(x, base_y, x, base_y+relative_y, color)
  }
  image.save output_base+".png" # 波形画像を書き出し
  return output_base+".png"
end

if __FILE__ == $PROGRAM_NAME
  filename=ARGV[0]
  height = 200
  width = 800
  convert_wav(filename,width,height)
end
