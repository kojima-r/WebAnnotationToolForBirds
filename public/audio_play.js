var AUDIO_LIST = {};
function playSoundFile(filename){
	// �T�E���h�Đ�
	if(filename in AUDIO_LIST){
		AUDIO_LIST[filename].play();
		// ���Ă΂ꂽ���p�ɐV���ɐ���
		AUDIO_LIST[filename] = new Audio( AUDIO_LIST[filename].src );
	}else{
		AUDIO_LIST[filename] = new Audio(filename);
		AUDIO_LIST[filename].play();
		AUDIO_LIST[filename] = new Audio( AUDIO_LIST[filename].src );
	}
	
}