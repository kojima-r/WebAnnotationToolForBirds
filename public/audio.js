/// <reference path="util.ts" />
var AudioView = (function () {
    function AudioView(common) {
        var _this = this;
        this.binaryIndex = 0;
        //context = new webkitAudioContext();
        //context = window.AudioContext || window.webkitAudioContext,
        this.context = new AudioContext();
        this.callbackAudioInfoLoaded = null;
        this.infoTagID = "infoArea";
        this.percentage = 0;
        this.startPercentage = 0;
        this.isPlaying = false;
        this.updateInfo = function () {
            console.log("**********");
            console.log(_this);
            var playPos = _this.context.currentTime;
            _this.percentage = _this.startPercentage + (playPos - _this.playStartTime) / _this.commonInfo.wavDuration;
            ////
            var canvl = document.getElementById("waveDisplayL");
            var ctxl = canvl.getContext("2d");
            var xbar = _this.commonInfo.CANVAS_WIDTH * _this.percentage;
            _this.drawSeekBar(xbar);
            _this.drawLabelBar(xbar);
            ////
            if (_this.percentage >= 1.0) {
                _this.butttonStop();
            }
            ////
            if (_this.isPlaying) {
                setTimeout(function () { _this.updateInfo(); }, 1);
            }
        };
        common.audioView = this;
        this.commonInfo = common;
    }
    AudioView.prototype.setInfoTagID = function (id_name) {
        this.infoTagID = id_name;
    };
    AudioView.prototype.audioInitialize = function (filename, callbackFunc) {
        var _this = this;
        if (filename) {
            this.loadServer(filename, callbackFunc);
        }
        var fileSelect = document.getElementById("fileSelect");
        fileSelect.addEventListener("change", function () {
            _this.loadFile(fileSelect.files);
        }, false);
        document.documentElement.addEventListener('dragover', function (event) {
            event.preventDefault();
        }, false);
        document.documentElement.addEventListener('drop', function (event) {
            event.preventDefault();
            _this.loadFile(event.dataTransfer.files);
        }, false);
        /// [call] label.js
        this.commonInfo.labelView.preloadLabelCanvas();
    };
    ;
    //サーバからロード（サーバ）
    AudioView.prototype.loadServer = function (path, callbackFunc) {
        var _this = this;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", path, true);
        oReq.responseType = "arraybuffer";
        console.log("[request]", path);
        oReq.onload = function (oEvent) {
            console.log("[loaded]", path);
            _this.waveBuffer = oReq.response; // Note: not oReq.responseText
            if (_this.waveBuffer) {
                var sdata = new Uint8Array(_this.waveBuffer);
                try {
                    var sdata = new Uint8Array(_this.waveBuffer); //ArrayBufferToString(data);
                }
                catch (e) {
                    alert(e);
                }
                _this.checkHeader(sdata);
                //波形描画
                //startLoadBinary(sdata);
                ///
                _this.initBar();
                ///
                _this.decodeSound(_this.waveBuffer);
            }
        };
        oReq.send(null);
        var infoReq = new XMLHttpRequest();
        var reg = /(.*)(?:\.([^.]+$))/;
        var info_path = path.match(reg)[1] + ".json";
        console.log("[request]", info_path);
        infoReq.open("GET", info_path, true);
        infoReq.responseType = "text";
        infoReq.onload = function (oEvent) {
            var obj = JSON.parse(infoReq.responseText);
            if (!obj) {
                alert('Error');
                return;
            }
            console.log("[loaded]", info_path, obj);
            _this.commonInfo.sampleRate = obj["sampleRate"];
            _this.commonInfo.wavDuration = obj["duration"];
            if (_this.callbackAudioInfoLoaded != null) {
                _this.callbackAudioInfoLoaded();
                _this.callbackAudioInfoLoaded = null;
            }
        };
        infoReq.send(null);
    };
    //ファイルオブジェクトからロード（ローカル）
    AudioView.prototype.loadFile = function (files) {
        var _this = this;
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
        var canvas = document.getElementById("waveDisplay");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT);
        //読み込み
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = reader.result;
                _this.waveBuffer = data;
                var sdata = new Uint8Array(data); //ArrayBufferToString(data);
            }
            catch (e) {
                alert(e);
            }
            _this.checkHeader(sdata);
            _this.startLoadBinary(sdata);
            ///
            _this.initBar();
            ///
            _this.decodeSound(_this.waveBuffer);
            //playSound(waveBuffer);
        };
        reader.readAsArrayBuffer(file);
    };
    AudioView.prototype.checkHeader = function (data) {
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
        console.log("[RIFF]", riff);
        console.log("[header]", wave);
        console.log("[fmt chunk]", fmt);
        console.log("[#channels]", this.channels);
        console.log("[#samples]", this.sample);
        // 型があいまいなので==を使って処理系に変換していただいている。
        //if (riff === "RIFF" && wave === "WAVE" && fmt == "fmt " &&channels == 2 && sample == 16) {
        info.appendChild(document.createTextNode("format ok"));
        info.appendChild(document.createElement("br"));
    };
    AudioView.prototype.startLoadBinary = function (binaryData) {
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
    };
    AudioView.prototype.loadBinary = function (data) {
        var length = data.length;
        var spp = this.commonInfo.CANVAS_WIDTH / length;
        var canvr = document.getElementById("waveDisplay");
        var ctxr = canvr.getContext("2d");
        var canvl = document.getElementById("waveDisplayL");
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
                this.waveData[0][i / step] = s > 32768 ? -(s - 65536) : -s;
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
        }
        else {
            return 1;
        }
    };
    AudioView.prototype.decodeSound = function (data) {
        var onError = function () {
        };
        this.context.decodeAudioData(data, function (buffer) {
            this.sampleRate = buffer.sampleRate;
            this.wavDuration = buffer.duration;
            console.log("[sampling rate]", this.sampleRate);
            console.log("[duration]", this.wavDuration);
            if (this.callbackAudioInfoLoaded != null) {
                this.callbackAudioInfoLoaded();
                this.callbackAudioInfoLoaded = null;
            }
        }, onError);
    };
    AudioView.prototype.playSoundBuffer = function (buffer) {
        var source = this.context.createBufferSource(); // creates a sound source
        source.buffer = buffer; // tell the source which sound to play
        source.connect(this.context.destination); // connect the source to the context's destination (the speakers)
        return source;
    };
    AudioView.prototype.playSound = function (data, updateInfo, stPercentage) {
        var _this = this;
        this.startPercentage = stPercentage;
        this.context.decodeAudioData(data, function (buffer) {
            _this.commonInfo.sampleRate = buffer.sampleRate;
            _this.commonInfo.wavDuration = buffer.duration;
            _this.playSource = _this.playSoundBuffer(buffer);
            _this.playStartTime = _this.context.currentTime;
            _this.playSource.start(0, _this.commonInfo.wavDuration * stPercentage);
            setTimeout(function () { updateInfo(); }, 1);
        }, function () {
        });
    };
    AudioView.prototype.drawLabelBar = function (xbar) {
        var canvl = document.getElementById("waveDisplayL");
        var ctxl = canvl.getContext("2d");
        this.commonInfo.labelView.updateLabelCanvas();
        ctxl.strokeStyle = '#999';
        ctxl.lineWidth = 1;
        ctxl.beginPath();
        ctxl.moveTo(xbar, 0);
        ctxl.lineTo(xbar, this.commonInfo.CANVAS_HEIGHT);
        ctxl.stroke();
    };
    AudioView.prototype.drawSeekBar = function (xbar) {
        if (xbar == undefined) {
            xbar = this.percentage * this.commonInfo.CANVAS_WIDTH;
        }
        var x = 0, y = 10, height = 30;
        var canvr2 = document.getElementById("waveDisplay2");
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
        ctxr2.stroke();
        //
        ctxr2.fillStyle = "rgb(0,0,0)";
        var step = 10;
        for (var i = 0; i < this.commonInfo.wavDuration; i += step) {
            ctxr2.fillText(i.toString(), this.commonInfo.CANVAS_WIDTH * (i / this.commonInfo.wavDuration), 10);
        }
        ctxr2.fillText(Math.floor(this.commonInfo.wavDuration).toString(), this.commonInfo.CANVAS_WIDTH - 15, 10);
        //wavDuration
    };
    AudioView.prototype.initBar = function () {
        var _this = this;
        var canvr = document.getElementById("waveDisplay");
        var canvr2 = document.getElementById("waveDisplay2");
        var ctxr2 = canvr2.getContext("2d");
        var x = 0, y = 10, height = 50;
        var drawBar = function (xbar) {
            _this.percentage = xbar / _this.commonInfo.CANVAS_WIDTH;
            _this.drawSeekBar(xbar);
            _this.drawLabelBar(xbar);
        };
        canvr2.addEventListener('click', function (e) {
            var el = e.target;
            var button = el.getBoundingClientRect();
            var mouseX = e.clientX - button.left;
            var mouseY = e.clientY - button.top;
            if (x < mouseX && mouseX < x + _this.commonInfo.CANVAS_WIDTH) {
                if (y < mouseY && mouseY < y + height) {
                    drawBar(mouseX - x);
                }
            }
        });
    };
    AudioView.prototype.butttonPlayOrResume = function () {
        if (!this.isPlaying) {
            if (this.playSource != undefined) {
                this.playSource.stop();
            }
            this.isPlaying = true;
            this.playSound(this.waveBuffer, this.updateInfo, this.percentage);
        }
    };
    AudioView.prototype.butttonStop = function () {
        if (this.playSource != undefined) {
            this.playSource.stop();
        }
        this.isPlaying = false;
        //playSound(waveBuffer);
    };
    return AudioView;
})();
//# sourceMappingURL=audio.js.map