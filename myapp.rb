require 'sinatra'
require 'haml'
require './wav2png.rb'
require './label2trainset.rb'
# 静的コンテンツ参照のためのパス設定
set :public_dir, File.dirname(__FILE__) + '/public'

fp=nil
fp=open("/tmp/birds_txt","r")
#fp=open("/tmp/birds_pipe","r")

$log_buffer=""
def wait_and_read_file(fp)
	if(fp==nil)
		return "### end"
	end
	s=""
	while true
		begin
		c=f.sysread(1)
		s+=c
		if(c=="\n")
			#print s
			return s
		end
		rescue
			nil
		end
	end
end
def wait_and_read_log(fp)
	if(fp==nil)
		return "pipe error"
	end
	s=""
	while  s==""
		idx=$log_buffer.index("\n")
		if(idx!=nil)
				s=$log_buffer[0..idx]
				$log_buffer=$log_buffer[idx+1..-1]
				break
		end

		ret=IO::select([fp])
		ret[0].each{|rfp|
			$log_buffer += rfp.read
		}
	end
	return s
end

get '/status' do
	#s=wait_and_read_log(fp)
	s=wait_and_read_file(fp)
	p s
	if(s=~/### end/)
		fp.close()
		fp=nil
	end
	s
end

# アップロード
get '/' do
	@projects=Dir.glob("./public/**").select{|e| File.ftype(e)=="directory"}.map{|e| e.gsub("./public/","")}
	p @projects
	erb :index
end
 # アップロード処理
post '/upload_txt' do
	if params.key? "label"
		save_path = "./upload/uploaded_label.csv"
		out_path = "./upload/uploaded_dataset.csv"
 
		File.open(save_path, 'w') do |f|
			f.write params["label"]
			@mes = "アップロード成功"
		end
		label2trainset(save_path,out_path)
		p "sh /export/kojima/WebAnnotationToolForBirds/run_improve_label.sh"
		system("sh /export/kojima/WebAnnotationToolForBirds/run_improve_label.sh")
		#system("echo 'start' > /tmp/birds_pipe")
		#system("sh /home/kojima/Service/WebAnnotationToolForBirds/run_improve_label.sh &")
		p "background process start"
		""
		#"/images/#{params[:file][:filename]}"
		#out.gsub!("./public","")
		#out
	else
		@mes = "アップロード失敗"
		"error"	
	end
	#haml :upload
	#redirect 'images'
end
 
# アップロード処理
post '/upload' do
	p params
	if params[:file]
 
		save_path = "./public/images/#{params[:file][:filename]}"
 
		File.open(save_path, 'wb') do |f|
			p params[:file][:tempfile]
			f.write params[:file][:tempfile].read
			@mes = "アップロード成功"
		end
		out=convert_wav(save_path,800,200)
		#"/images/#{params[:file][:filename]}"
		out.gsub!("./public","")
		out
	else
		@mes = "アップロード失敗"
		"error"	
	end
	#haml :upload
	#redirect 'images'
end
 
# アップロードした画像の表示
get '/images' do
	images_name = Dir.glob("public/images/*")
	@images_path = []
	
	images_name.each do |image|
		@images_path << image.gsub("public/", "./")
	end
	haml :images
end



