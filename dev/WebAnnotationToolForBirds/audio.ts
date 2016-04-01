/// <reference path="util.ts" />


class AudioView {
    commonInfo: AnnotaionCommon;
    constructor(common: AnnotaionCommon) {
        common.audioView = this;
        this.commonInfo = common;
    }

    binaryIndex: number = 0;
    
    //wav
    //riff, wave, fmt, channels, 
    sample:number;
    channels: number;

    waveData;
    waveBuffer;
    //context = new webkitAudioContext();
    //context = window.AudioContext || window.webkitAudioContext,
    context: AudioContext = new AudioContext();
    
    callbackAudioInfoLoaded = null;
    infoTagID = "infoArea";


    prev_y;
    prev_x;


    setInfoTagID(id_name) {
        this.infoTagID = id_name;
    }

    audioInitialize(filename, callbackFunc) {
        if (filename) {
            this.loadServer(filename, callbackFunc);
        }
        var fileSelect = <HTMLInputElement> document.getElementById("fileSelect");
    
        fileSelect.addEventListener("change",  ()=> {
            this.loadFile(fileSelect.files);
        }, false);

        document.documentElement.addEventListener('dragover',  (event) => {
            event.preventDefault();
        }, false);
        document.documentElement.addEventListener('drop', (event) => {
            event.preventDefault();
            this.loadFile(event.dataTransfer.files);
        }, false);
        /// [call] label.js
        this.commonInfo.labelView.preloadLabelCanvas();

    };
    //サーバからロード（サーバ）
    loadServer(path, callbackFunc) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", path, true);
        oReq.responseType = "arraybuffer";
        console.log("[request]", path);
        oReq.onload = (oEvent) => {
            console.log("[loaded]", path);
            this.waveBuffer = oReq.response; // Note: not oReq.responseText
            if (this.waveBuffer) {
                var sdata = new Uint8Array(this.waveBuffer);
                try {
                    var sdata = new Uint8Array(this.waveBuffer); //ArrayBufferToString(data);
                } catch (e) {
                    alert(e);
                }
                this.checkHeader(sdata);
                //波形描画
                //startLoadBinary(sdata);
                ///
                this.initBar();
                ///
                this.decodeSound(this.waveBuffer);
                //playSound(waveBuffer);

            }
        };
        oReq.send(null);
        var infoReq = new XMLHttpRequest();
        var reg = /(.*)(?:\.([^.]+$))/;
        var info_path = path.match(reg)[1] + ".json"
        console.log("[request]", info_path);
        infoReq.open("GET", info_path, true);
        infoReq.responseType = "text";
        infoReq.onload = (oEvent) => {
            var obj = JSON.parse(infoReq.responseText);
            if (!obj) {
                alert('Error');
                return;
            }
            console.log("[loaded]", info_path, obj);
            this.commonInfo.sampleRate = obj["sampleRate"]
            this.commonInfo.wavDuration = obj["duration"]
            if (this.callbackAudioInfoLoaded != null) {
                this.callbackAudioInfoLoaded();
                this.callbackAudioInfoLoaded = null;
            }
        };
        infoReq.send(null);
    }
    //ファイルオブジェクトからロード（ローカル）
    loadFile(files) {
        var file = files[0];
        var info = document.getElementById(this.infoTagID);
        //ファイル名，タイプ，サイズはブラウザから受け取れる
        info.appendChild(document.createTextNode("File: " + file.name));
        info.appendChild(document.createElement("br"));
        info.appendChild(document.createTextNode("Type: " + file.type));
        info.appendChild(document.createElement("br"));
        info.appendChild(document.createTextNode("Size: " + file.size + " bytes"));
        info.appendChild(document.createElement("br"));
        this.commonInfo.baseFilename = Util.basename(file.name).replace(/\..+?$/, "");
        if (Util.getExtention(file.name) == "csv") {
            //[call] label.js
            this.commonInfo.labelView.loadLabelData(file);
            return;
        }
        var canvas = <HTMLCanvasElement> document.getElementById("waveDisplay");
        var ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT);
        
        //読み込み
        var reader = new FileReader();
        reader.onload = ()=> {
            try {
                var data = reader.result;
                this.waveBuffer = data;
                var sdata = new Uint8Array(data);//ArrayBufferToString(data);
            } catch (e) {
                alert(e);
            }
            this.checkHeader(sdata);
            this.startLoadBinary(sdata);
            ///
            this.initBar();
            ///
            this.decodeSound(this.waveBuffer);
            //playSound(waveBuffer);

        };

        reader.readAsArrayBuffer(file);
    }

    checkHeader(data) {
        var info;

        info = document.getElementById(this.infoTagID);

        var riff = Util.ArrayBufferToString(data.subarray(0, 4));
        var wave = Util.ArrayBufferToString(data.subarray(8, 12));
        var fmt = Util.ArrayBufferToString(data.subarray(12, 16));
        this.channels = Util.ArrayBufferToString(data.subarray(22, 24)).charCodeAt(0);
        this.sample = Util.ArrayBufferToString(data.subarray(34, 35)).charCodeAt(0);

        info.appendChild(document.createTextNode("RIFF header: " + riff));
        info.appendChild(document.createElement("br"));
        info.appendChild(document.createTextNode("WAVE header: " + wave));
        info.appendChild(document.createElement("br"));
        info.appendChild(document.createTextNode("fmt chunk: " + fmt));
        info.appendChild(document.createElement("br"));
        info.appendChild(document.createTextNode("Channels : " + this.channels));
        info.appendChild(document.createElement("br"));
        info.appendChild(document.createTextNode("sample : " + this.sample));
        info.appendChild(document.createElement("br"));
        console.log("[RIFF]",riff);
        console.log("[header]",wave);
        console.log("[fmt chunk]",fmt);
        console.log("[#channels]",this.channels);
        console.log("[#samples]",this.sample);
        // 型があいまいなので==を使って処理系に変換していただいている。
        //if (riff === "RIFF" && wave === "WAVE" && fmt == "fmt " &&channels == 2 && sample == 16) {
        info.appendChild(document.createTextNode("format ok"));
        info.appendChild(document.createElement("br"));


    }
    
    startLoadBinary(binaryData) {
        var length = binaryData.length;
        this.binaryIndex = 44;

        this.waveData = new Array(this.channels);
        this.prev_y = new Array(this.channels);
        this.prev_x = new Array(this.channels);
        for (var i = 0; i < this.channels; i++) {
            this.waveData[i] = new Array((length - 44) / this.channels);
            this.prev_y[i] = this.commonInfo.CANVAS_HEIGHT / 2;
            this.prev_x[i] = 1;
        }

        while (this.loadBinary(binaryData)) {
        }

    }

    loadBinary(data) {
        var length = data.length;
        var spp = this.commonInfo.CANVAS_WIDTH / length;
        var canvr = <HTMLCanvasElement> document.getElementById("waveDisplay");
        var ctxr = canvr.getContext("2d");
        var canvl = <HTMLCanvasElement> document.getElementById("waveDisplayL");
        var ctxl = canvl.getContext("2d");
        var i, s, j, x, yr, yl, en;
        en = this.binaryIndex + 10;
        var step = this.channels * this.sample / 8;
        for (i = this.binaryIndex; i < en && i < length; i += step) {
            s = 0;
            for (var shift = 0; shift < (this.sample / 8); shift++) {
                s += data[i + shift] << (8 * shift);
            }
            if (this.sample == 16) {
                this.waveData[0][i / step] = s > 32768 ? - (s - 65536) : -s;
            }

        }

        x = this.binaryIndex / length * this.commonInfo.CANVAS_WIDTH;
        yr = this.waveData[0][this.binaryIndex / step] / 32768.0 * (this.commonInfo.CANVAS_HEIGHT / 2) + this.commonInfo.CANVAS_HEIGHT / 2;

        this.binaryIndex = i;

        ctxr.beginPath();
        ctxr.moveTo(this.prev_x[0], this.prev_y[0]);
        ctxr.lineTo(x, yr);
        ctxr.stroke();

        this.prev_y[0] = yr;
        this.prev_x[0] = x;
        if (i >= length) {
            return 0;
        } else {
            return 1;
        }
    }

    playSource;
    playStartTime;
    percentage = 0;
    startPercentage = 0;
    isPlaying = false;
    decodeSound(data) {
        var onError: DecodeErrorCallback = () => {//e: DOMException
        };
        this.context.decodeAudioData(data, function (buffer) {
            this.sampleRate = buffer.sampleRate;
            this.wavDuration = buffer.duration;
            console.log("[sampling rate]",this.sampleRate);
            console.log("[duration]",this.wavDuration);
            if (this.callbackAudioInfoLoaded != null) {
                this.callbackAudioInfoLoaded();
                this.callbackAudioInfoLoaded = null;
            }
        }, onError);
    }
    playSoundBuffer(buffer: AudioBuffer): AudioBufferSourceNode {
        var source = this.context.createBufferSource(); // creates a sound source
        source.buffer = buffer;                    // tell the source which sound to play
        source.connect(this.context.destination);       // connect the source to the context's destination (the speakers)
        return source;
    }
    playSound(data, updateInfo, stPercentage) {
        this.startPercentage = stPercentage;
        this.context.decodeAudioData(data, (buffer: AudioBuffer)=>{
            this.commonInfo.sampleRate = buffer.sampleRate;
            this.commonInfo.wavDuration = buffer.duration;
            this.playSource = this.playSoundBuffer(buffer);
            this.playStartTime = this.context.currentTime;
            this.playSource.start(0, this.commonInfo.wavDuration * stPercentage);
            setTimeout( ()=>{ updateInfo(); }, 1);
        },()=>{
        });
    }

    drawLabelBar(xbar) {
        var canvl = <HTMLCanvasElement>document.getElementById("waveDisplayL");
        var ctxl = canvl.getContext("2d");
        this.commonInfo.labelView.updateLabelCanvas();
        ctxl.strokeStyle = '#999';
        ctxl.lineWidth = 1;
        ctxl.beginPath();
        ctxl.moveTo(xbar, 0);
        ctxl.lineTo(xbar, this.commonInfo.CANVAS_HEIGHT);
        ctxl.stroke();
    }

    drawSeekBar(xbar) {
        if (xbar == undefined) {
            xbar = this.percentage * this.commonInfo.CANVAS_WIDTH;
        }
        var x = 0, y = 10, height = 30;
        var canvr2 = <HTMLCanvasElement>document.getElementById("waveDisplay2");
        var ctxr2 = canvr2.getContext("2d");
        ctxr2.clearRect(0, 0, this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT);
        ctxr2.fillStyle = "rgb(220, 220, 220)";
        ctxr2.fillRect(x, y, this.commonInfo.CANVAS_WIDTH, height);
        ctxr2.fillStyle = "rgb(200, 200, 255)";
        ctxr2.fillRect(x, y, xbar, height);
        ctxr2.strokeStyle = '#999';
        ctxr2.lineWidth = 1;
        ctxr2.beginPath();
        ctxr2.moveTo(xbar, 0);
        ctxr2.lineTo(xbar, this.commonInfo.CANVAS_HEIGHT);
        ctxr2.stroke()
        //
        ctxr2.fillStyle = "rgb(0,0,0)";
        var step = 10
        for (var i = 0; i < this.commonInfo.wavDuration; i += step) {
            ctxr2.fillText(i.toString(), this.commonInfo.CANVAS_WIDTH * (i / this.commonInfo.wavDuration), 10);
        }
        ctxr2.fillText(Math.floor(this.commonInfo.wavDuration).toString(), this.commonInfo.CANVAS_WIDTH - 15, 10);
        //wavDuration
    }

    initBar() {
        var canvr  = <HTMLCanvasElement>document.getElementById("waveDisplay");
        var canvr2 = <HTMLCanvasElement>document.getElementById("waveDisplay2");
        var ctxr2 = canvr2.getContext("2d");
        var x = 0, y = 10, height = 50;
        var drawBar=(xbar)=>{
            this.percentage = xbar / this.commonInfo.CANVAS_WIDTH;
            this.drawSeekBar(xbar);
            this.drawLabelBar(xbar);
        }
        canvr2.addEventListener('click', (e: MouseEvent) => {
            var el = <Element>e.target;
            var button = el.getBoundingClientRect();
            var mouseX = e.clientX - button.left;
            var mouseY = e.clientY - button.top;
            if (x < mouseX && mouseX < x + this.commonInfo.CANVAS_WIDTH) {
                if (y < mouseY && mouseY < y + height) {
                    drawBar(mouseX - x);
                }
            }
		});
    }

    updateInfo=()=>{
        console.log("**********");
        console.log(this);
        var playPos = this.context.currentTime;
        this.percentage = this.startPercentage + (playPos - this.playStartTime) / this.commonInfo.wavDuration;
        ////
        var canvl = <HTMLCanvasElement>document.getElementById("waveDisplayL");
        var ctxl = canvl.getContext("2d");
        var xbar = this.commonInfo.CANVAS_WIDTH * this.percentage;
        this.drawSeekBar(xbar);
        this.drawLabelBar(xbar);
        ////
        if (this.percentage >= 1.0) {
            this.butttonStop();
        }
        ////
        if (this.isPlaying) {
            setTimeout(() => { this.updateInfo(); }, 1);
        }
    }

    butttonPlayOrResume() {
        if (!this.isPlaying) {
            if (this.playSource != undefined) {
                this.playSource.stop();
            }
            this.isPlaying = true;
            this.playSound(this.waveBuffer, this.updateInfo, this.percentage);
        }
    }

    butttonStop() {
        if (this.playSource != undefined) {
            this.playSource.stop();
        }
        this.isPlaying = false;
        //playSound(waveBuffer);
    }
}


