var AUDIO_LIST = {};
function playSoundFile(filename){
	// サウンド再生
	if(filename in AUDIO_LIST){
		AUDIO_LIST[filename].play();
		// 次呼ばれた時用に新たに生成
		AUDIO_LIST[filename] = new Audio( AUDIO_LIST[filename].src );
	}else{
		AUDIO_LIST[filename] = new Audio(filename);
		AUDIO_LIST[filename].play();
		AUDIO_LIST[filename] = new Audio( AUDIO_LIST[filename].src );
	}
	
}