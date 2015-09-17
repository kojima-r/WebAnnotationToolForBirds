var binaryIndex = 0;
var riff, wave, fmt, channels, sample;
var waveData;
var waveBuffer;
var context = new webkitAudioContext();
var sampleRate,wavDuration;
var baseFilename="default";
var callbackAudioInfoLoaded=null;
var infoTagID="infoArea";

function ArrayBufferToString(buffer) {
    return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
}
function BinaryToString(binary) {
	var error;
	try {
		return decodeURIComponent(escape(binary));
	} catch (_error) {
		error = _error;
		if (error instanceof URIError) {
			return binary;
		} else {
			throw error;
		}
	}
}
function basename(path) {
	return path.replace(/\\/g,'/').replace( /.*\//, '' );
}
 
function dirname(path) {
	return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
}
function getExtention(fileName) {
	var ret;
	if (!fileName) {
		return ret;
	}
	var fileTypes = fileName.split(".");
	var len = fileTypes.length;
	if (len === 0) {
		return ret;
	}
	ret = fileTypes[len - 1];
	return ret;
}
setInfoTagID = function(id_name){
	infoTagID=id_name;
}
audioInitialize = function(filename,callbackFunc){
	if (filename){
		loadServer(filename,callbackFunc);
	}
	var fileSelect = document.getElementById("fileSelect");
	fileSelect.addEventListener("change", function () {
		loadFile(fileSelect.files);
	}, false);

	document.documentElement.addEventListener('dragover', function (event) {
		event.preventDefault();
	}, false);
	document.documentElement.addEventListener('drop', function (event) {
		event.preventDefault();
		loadFile(event.dataTransfer.files);
	}, false);
	///
	preloadLabelCanvas();

};
//サーバからロード（サーバ）
function loadServer(path,callbackFunc) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", path, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        waveBuffer = oReq.response; // Note: not oReq.responseText
        if (waveBuffer) {
            var sdata = new Uint8Array(waveBuffer);
            console.log("start");
            try {
                var sdata = new Uint8Array(waveBuffer); //ArrayBufferToString(data);
            } catch (e) {
                alert(e);
            }
            checkHeader(sdata);
            //波形描画
            //startLoadBinary(sdata);
            ///
            initBar();
            ///
            decodeSound(waveBuffer);
            //playSound(waveBuffer);
            
        }
    };
    oReq.send(null);
}
//ファイルオブジェクトからロード（ローカル）
function loadFile(files) {
	var file = files[0];
	var ctx;
	var info = document.getElementById(infoTagID);
	//ファイル名，タイプ，サイズはブラウザから受け取れる
	info.appendChild(document.createTextNode("File: " + file.name));
	info.appendChild(document.createElement("br"));
	info.appendChild(document.createTextNode("Type: " + file.type));
	info.appendChild(document.createElement("br"));
	info.appendChild(document.createTextNode("Size: " + file.size + " bytes"));
	info.appendChild(document.createElement("br"));
	baseFilename=basename(file.name).replace(/\..+?$/,"");
	if(getExtention(file.name)=="csv"){
		console.log(file.name);
		loadLabelData(file);
		return;
	}
	ctx = document.getElementById("waveDisplay").getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	console.log(file.name);
	console.log(file.type);
	console.log(file.size);

	//読み込み
	var reader = new FileReader();
	reader.onload = function () {
		console.log("start");
		try {
			var data = reader.result;
			waveBuffer=data;
			var sdata = new Uint8Array(data);//ArrayBufferToString(data);
		} catch (e) {
			alert(e);
		}
		checkHeader(sdata);
		startLoadBinary(sdata);
		///
		initBar();
		///
		decodeSound(waveBuffer);
		//playSound(waveBuffer);
		
	};

	reader.readAsArrayBuffer(file);
}

function checkHeader(data) {
	var info;

	info = document.getElementById(infoTagID);

	riff = ArrayBufferToString(data.subarray(0, 4));
	wave = ArrayBufferToString(data.subarray(8, 12));
	fmt = ArrayBufferToString(data.subarray(12, 16));
	channels = ArrayBufferToString(data.subarray(22, 24)).charCodeAt(0);
	sample=ArrayBufferToString(data.subarray(34, 35)).charCodeAt(0);

	info.appendChild(document.createTextNode("RIFF header: " + riff));
	info.appendChild(document.createElement("br"));
	info.appendChild(document.createTextNode("WAVE header: " + wave));
	info.appendChild(document.createElement("br"));
	info.appendChild(document.createTextNode("fmt chunk: " + fmt));
	info.appendChild(document.createElement("br"));
	info.appendChild(document.createTextNode("Channels : " + channels));
	info.appendChild(document.createElement("br"));
	info.appendChild(document.createTextNode("sample : " + sample));
	info.appendChild(document.createElement("br"));
	console.log(riff);
	console.log(wave);
	console.log(fmt);
	console.log(channels);
	console.log(sample);
	// 型があいまいなので==を使って処理系に変換していただいている。
	//if (riff === "RIFF" && wave === "WAVE" && fmt == "fmt " &&channels == 2 && sample == 16) {
	info.appendChild(document.createTextNode("format ok"));
	info.appendChild(document.createElement("br"));
	

}
var prev_y;
var prev_x;
function startLoadBinary(binaryData) {
	var length = binaryData.length;
	binaryIndex = 44;
	drawPixels = 0;

	waveData = new Array(channels);
	prev_y = new Array(channels);
	prev_x = new Array(channels);
	for (var i = 0; i < channels; i++) {
		waveData[i] = new Array((length - 44) / channels);
		prev_y[i] = CANVAS_HEIGHT / 2;
		prev_x[i] = 1;
	}
	
	while(loadBinary(binaryData)){
	}
	
}

function loadBinary(data) {
	var length = data.length;
	var spp = CANVAS_WIDTH / length;
	var canvr=document.getElementById("waveDisplay");
	var ctxr = canvr.getContext("2d");
	var ctxl = document.getElementById("waveDisplayL").getContext("2d");
	var i, s, j, x, yr, yl, en;
	en = binaryIndex + 10;
	var step = channels * sample / 8;
	for (i = binaryIndex; i < en && i < length; i += step) {
		s = 0;
		for (var shift = 0; shift < (sample / 8); shift++) {
			s += data[i + shift] << (8 * shift);
		}
		if (sample == 16) {
			waveData[0][i / step] = s > 32768 ? -(s - 65536) : -s;
		}
		
	}

	x = binaryIndex / length * CANVAS_WIDTH;
	yr = waveData[0][binaryIndex / step] / 32768.0 * (CANVAS_HEIGHT / 2) + CANVAS_HEIGHT / 2;
	
	binaryIndex = i;
	
	ctxr.beginPath();
	ctxr.moveTo(prev_x[0], prev_y[0]);
	ctxr.lineTo(x, yr);
	ctxr.stroke();

	prev_y[0] = yr;
	prev_x[0] = x;
	if (i >= length) {
		return 0;
	} else {
		return 1;
	}
}

var playSource;
var playStartTime;
var percentage=0;
var startPercentage=0;
var isPlaying=false;
function decodeSound(data) {
	onError=function(e){
		
	}
	context.decodeAudioData(data, function(buffer) {
		sampleRate=buffer.sampleRate;
		wavDuration=buffer.duration;
		console.log(sampleRate);
		console.log(wavDuration);
		if(callbackAudioInfoLoaded!=null){
			callbackAudioInfoLoaded();
		}
	}, onError);
}
function playSound(data,updateInfo,stPercentage) {
	startPercentage=stPercentage;
	function playSoundBuffer(buffer) {
		var source = context.createBufferSource(); // creates a sound source
		source.buffer = buffer;                    // tell the source which sound to play
		source.connect(context.destination);       // connect the source to the context's destination (the speakers)
		return source;
	}
	onError=function(e){
		
	}
	context.decodeAudioData(data, function(buffer) {
		sampleRate=buffer.sampleRate;
		wavDuration=buffer.duration;
		playSource=playSoundBuffer(buffer);
		playStartTime=context.currentTime;
		console.log(stPercentage);
		playSource.start(0,wavDuration*stPercentage);
		setTimeout(updateInfo, 1);
	}, onError);
}
function drawLabelBar(xbar){
	var ctxl = document.getElementById("waveDisplayL").getContext("2d");
	updateLabelCanvas();
	ctxl.strokeStyle = '#999';
	ctxl.lineWidth = 1;
	ctxl.beginPath();
	ctxl.moveTo(xbar, 0);
	ctxl.lineTo(xbar, CANVAS_HEIGHT);
	ctxl.stroke()
}
function drawSeekBar(xbar){
	if(xbar==undefined){
		xbar=percentage*CANVAS_WIDTH;
	}
	var x=0,y=10,height=30;
	var canvr2=document.getElementById("waveDisplay2");
	var ctxr2 = canvr2.getContext("2d");
	ctxr2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	ctxr2.fillStyle = "rgb(220, 220, 220)";
	ctxr2.fillRect(x, y, CANVAS_WIDTH, height);
	ctxr2.fillStyle = "rgb(200, 200, 255)";
	ctxr2.fillRect(x, y, xbar, height);
	ctxr2.strokeStyle = '#999';
	ctxr2.lineWidth = 1;
	ctxr2.beginPath();
	ctxr2.moveTo(xbar, 0);
	ctxr2.lineTo(xbar, CANVAS_HEIGHT);
	ctxr2.stroke()
	//
	ctxr2.fillStyle = "rgb(0,0,0)";
	step=10
	for(var i=0;i<wavDuration;i+=step){
		ctxr2.fillText(i,CANVAS_WIDTH*(i/wavDuration),10);
	}
	ctxr2.fillText(Math.floor(wavDuration),CANVAS_WIDTH-15,10);
	//wavDuration
}
function initBar(){
	var canvr=document.getElementById("waveDisplay");
	var canvr2=document.getElementById("waveDisplay2");
	var ctxr2 = canvr2.getContext("2d");
	var x=0,y=10,height=50;
	function drawBar(xbar){
		percentage=xbar/CANVAS_WIDTH;
		drawSeekBar(xbar);
		drawLabelBar(xbar);
	}
	canvr2.addEventListener('click', function(e){
		var button = e.target.getBoundingClientRect();
		mouseX = e.clientX - button.left;
		mouseY = e.clientY - button.top;
		if(x < mouseX && mouseX < x + CANVAS_WIDTH){
			if(y < mouseY && mouseY < y + height){
				drawBar(mouseX-x);
			}
		}
	});
}
function updateInfo(){
	var playPos=context.currentTime;
	percentage=startPercentage+(playPos-playStartTime)/wavDuration;
	////
	var ctxl = document.getElementById("waveDisplayL").getContext("2d");
	xbar=CANVAS_WIDTH*percentage;
	drawSeekBar(xbar);
	drawLabelBar(xbar);
	////
	if(isPlaying){
		setTimeout(updateInfo, 1);
	}
}
////////
///////
function butttonPlay(){
	console.log("play:"+waveBuffer)
	
	if(playSource!=undefined){
		playSource.stop();
	}
	isPlaying=true;
	playSound(waveBuffer,updateInfo,0);
}
function butttonResume(){
	if(playSource!=undefined){
		playSource.stop();
	}
	isPlaying=true;
	playSound(waveBuffer,updateInfo,percentage);
	
}

function butttonStop(){
	if(playSource!=undefined){
		playSource.stop();
	}
	isPlaying=false;
	//playSound(waveBuffer);
}
