/// <reference path="common.ts" />


interface JQuery{
    gpFloatY?(): any;
    balloon?(options?: any): any;
    showBalloon?(options?: any): any;
    hideBalloon?(options?: any): any;
}

class AppAnnotation{
    commonInfo: AnnotaionCommon;
    projectName;
    base_path;
    projectID;
    constructor(projectName, base_path, projectID) {
        this.projectName = projectName;
        this.base_path = base_path;
        this.projectID = projectID;
        this.commonInfo = new AnnotaionCommon();
        var labelView=new LabelView(this.commonInfo);
        var audioView=new AudioView(this.commonInfo);
    }
    getRequest() {
        if (location.search.length > 1) {
            var get = new Object();
            var ret = location.search.substr(1).split('&');
            for (var i = 0; i < ret.length; i++) {
                var r = ret[i].split('=');
                get[r[0]] = r[1];
            }
            return get;
        } else {
            return false;
        }
    }

    zoomIn() {
        var SCALE_WIDTH = 50;
        var canvas = <HTMLCanvasElement>document.getElementById("waveDisplayL");
        this.commonInfo.CANVAS_WIDTH = canvas.width * 1.5;
        this.setCanvasSize(this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT, SCALE_WIDTH);
        this.commonInfo.labelView.normalizeLinePositionW(1.5);
        this.commonInfo.labelView.updateLabelCanvas();
        this.drawSpectrogram();
        //this.commonInfo.audioView.startLoadBinary();
        //this.thumbnailLoad();
    }
    zoomOut() {
        var SCALE_WIDTH = 50;
        var canvas = <HTMLCanvasElement>document.getElementById("waveDisplayL");
        this.commonInfo.CANVAS_WIDTH = canvas.width * 2 / 3;
        this.setCanvasSize(this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT, SCALE_WIDTH);

        this.commonInfo.labelView.normalizeLinePositionW(2 / 3);
        this.commonInfo.labelView.updateLabelCanvas();
        this.drawSpectrogram();
        //this.commonInfo.audioView.startLoadBinary();
        //thumbnailLoad();
    }

    setCanvasSize(w, h, sw) {
        var canvas = <HTMLCanvasElement>document.getElementById("waveDisplay");
        canvas.width = w;
        canvas.height = h;
        canvas = <HTMLCanvasElement>document.getElementById("waveDisplay2");
        canvas.width = w;
        canvas.height = h;
        canvas = <HTMLCanvasElement>document.getElementById("waveDisplayL");
        canvas.width = w;
        canvas.height = h;
        canvas = <HTMLCanvasElement>document.getElementById("waveDisplayL2");
        canvas.width = w;
        canvas.height = h;
        //
        $('#viewLabel').width = w;
        $('#viewLabel').height = h;
        $('#viewport').width = w;
        $('#viewport').height = h;
        $('#viewUpper').css("width", w + sw);
        $('#viewUpper').css("height", h);
        $('#viewLower').css("width", w + sw);
        $('#viewLower').css("height", h);
        $('#contents').css("width", w + sw);
    }

    loadLabelConfig(callback) {
        if (this.projectID != null) {
            // here is for rails
            $.get("/projects/" + this.projectID + "/list/labels", (data)=> {
                if (data.length == 0) {
                    //no labels
                    var url = "/projects/" + this.projectID + "/edit_labels"
                    location.href = url;
                    return;
                }
                for (var i = 0; i < data.length; i++) {
                    var label_name = data[i]["name"]
                    var input_tag = '<input type="radio" name="label_selector_buttons" value="' + i + '" onChange="selectLabel(' + i + ');"';
                    if (i == 0) {
                        input_tag += " checked"
                    }
                    input_tag += '>' + i + ": " + label_name + this.writeMark(i) + '</input>';
                    $("#label_selector").append(input_tag);
                    callback();
                }
            });
        } else {
            for (var i = 0; i < 4; i++) {
                var input_tag = '<input type="radio" name="label_selector_buttons" value="' + i + '" onChange="selectLabel(' + i + ');"';
                if (i == 0) {
                    input_tag += " checked"
                }
                input_tag += '>' + i + this.writeMark(i) + '</input>';
                $("#label_selector").append(input_tag);
            }
            callback();
        }
    }
    drawSpectrogram() {
        var canvas_wav = <HTMLCanvasElement>document.getElementById("waveDisplay");
        if (!canvas_wav || !canvas_wav.getContext) { return false; }
        var ctx = canvas_wav.getContext('2d');
        var img = new Image();
        img.src = this.base_path + this.projectName + "/specgram.png";
        img.onload = ()=>{
            var h_space = 40
            ctx.drawImage(img, 0, h_space, this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT - h_space);
        }
    }
    // Loadingイメージ表示関数
    dispLoading(msg) {
        // 画面表示メッセージ
        var dispMsg = "";
        // 引数が空の場合は画像のみ
        if (msg != "") {
            dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
        }
        // ローディング画像が表示されていない場合のみ表示
        var el:any=$("#loading");
        if (el.size() == 0) {
            $("body").append("<div id='loading'>" + dispMsg + "</div>");
        }
    }
 
    // Loadingイメージ削除関数
    removeLoading() {
        $("#loading").remove();
    }
    selectLabel(x) {
        if (x == null) {
            var obj = <HTMLSelectElement> document.getElementById("other");
            var index = obj.selectedIndex;
            x = obj.options[index].value;
        }
        this.commonInfo.labelView.defaultLabel = x;
    }
    setEditMode(editMode) {
        this.commonInfo.labelView.editMode = editMode;
    }
    lineTypeCol = ['#0f0', '#f00', '#00f', '#0ff', '#ff0', '#f0f', '#080', '#800', '#008', '#f80', '#80f', '#0f8'];
    lineTypeCol2 = ['#8f8', '#f88', '#88f', '#8ff', '#ff8', '#f8f', '#484', '#844', '#448', '#f84', '#84f', '#4f8'];
    lineTypeNum = 7;
    initLabelSelector() {

    }
    writeMark(n) {
        //document.write("<span style='color:"+lineTypeCol[n]+";'>*</span>")
        return "<span style='color:" + this.lineTypeCol[n] + ";'>*</span>"
    }
    postLabelOut() {
        this.dispLoading("Operations Are In Progress ...");
        var res = this.commonInfo.labelView.getLabelCSV(this.commonInfo.wavDuration);
        $.post('/upload_txt',
            { 'label': res },
            (data)=> {//成功時のコールバック
                console.log("[updated]")
                //$('#output').html(data);
                this.commonInfo.labelView.butttonLabelClear();
                this.commonInfo.labelView.loadLabelDataServer(this.base_path + this.projectName + "/label.csv?");
                this.removeLoading();
            });
    }

    outLabelImage() {
        var cvs = <HTMLCanvasElement>document.getElementById("waveDisplayL");
        var dataUrl = cvs.toDataURL();
        var imgEl = <HTMLImageElement>document.getElementById("outImg");
        imgEl.src = dataUrl;
    }
    callbackLoadingLabel=()=> {
        console.log("[called] callbackLoadingLabel");
        this.commonInfo.audioView.setInfoTagID("wavInfoArea");
        var SCALE_WIDTH = 50
        var canvas = <HTMLCanvasElement>document.getElementById("scale1");
        canvas.width = SCALE_WIDTH;
        canvas.height = this.commonInfo.CANVAS_HEIGHT;
        canvas = <HTMLCanvasElement>document.getElementById("scale2");
        canvas.width = SCALE_WIDTH;
        canvas.height = this.commonInfo.CANVAS_HEIGHT;

        this.setCanvasSize(this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT, SCALE_WIDTH);
        $('#contents').css("width", this.commonInfo.CANVAS_WIDTH);
        $('#contents').css("padding-top", 30);
        //
        $("#scale1").gpFloatY();
        $("#scale1").css('z-index', 1);
        $("#scale2").gpFloatY();
        $("#scale2").css('z-index', 1);
        $("#viewScale1").width(SCALE_WIDTH);
        $("#viewScale1").height(this.commonInfo.CANVAS_HEIGHT);
        $("#viewScale2").width(SCALE_WIDTH);
        $("#viewScale2").height(this.commonInfo.CANVAS_HEIGHT);
        //
        $("#infoArea").gpFloatY();
        $("#infoAreaDummy").height($("#infoArea").height() + 1000)
        //
        var get = this.getRequest();
        this.projectName = get['project'];
        if (!this.projectName) {
            this.projectName = "sample"
        }
        var labelName = get['label'];
        if (!labelName) {
            labelName = "label"
        }
        //スペクトログラム表示
        this.drawSpectrogram();
        //スペクトログラム縦軸表示
        var h_space = 40
        var freq = [], max = 9;
        for (var i = 1; freq.push((max - i++) * 1000) < max;);

        var canvas2 = <HTMLCanvasElement>document.getElementById("scale2");
        var ctx_scale2 = canvas2.getContext('2d');
        var hstep = (this.commonInfo.CANVAS_HEIGHT - h_space) / (freq.length - 1)
        //塗りつぶし
        var old_fs = ctx_scale2.fillStyle
        ctx_scale2.fillStyle = '#fff'
        ctx_scale2.fillRect(0, 0, SCALE_WIDTH, this.commonInfo.CANVAS_HEIGHT);
        ctx_scale2.fillStyle = old_fs
        //
        for (var i = 0; i < freq.length; i++) {
            ctx_scale2.fillText(freq[i], 10, h_space + hstep * i);
            ctx_scale2.strokeStyle = '#000';
            ctx_scale2.lineWidth = 1;
            ctx_scale2.beginPath();
            ctx_scale2.moveTo(SCALE_WIDTH - 10, h_space + hstep * i);
            ctx_scale2.lineTo(SCALE_WIDTH, h_space + hstep * i);
            ctx_scale2.stroke()
        }
        //方向縦軸表示
        h_space = 40
        var dirs = [-180, -135, -90, -45, 0, 45, 90, 135, 180]
        var canvas1 = <HTMLCanvasElement>document.getElementById("scale1");
        var ctx_scale1 = canvas1.getContext('2d');
        //塗りつぶし
        old_fs = ctx_scale1.fillStyle;
        ctx_scale1.fillStyle = '#fff';
        ctx_scale1.fillRect(0, 0, SCALE_WIDTH, this.commonInfo.CANVAS_HEIGHT);
        ctx_scale1.fillStyle = old_fs;
        //
        hstep = (this.commonInfo.CANVAS_HEIGHT) / (dirs.length - 1)
        var hstep_text = (this.commonInfo.CANVAS_HEIGHT - 10) / (dirs.length - 1)
        ctx_scale1.strokeStyle = '#000';
        ctx_scale1.lineWidth = 1;
        for (var i = 0; i < dirs.length; i++) {
            ctx_scale1.fillText(dirs[i].toString(), 15, this.commonInfo.CANVAS_HEIGHT - hstep_text * i);
            ctx_scale1.beginPath();
            ctx_scale1.moveTo(SCALE_WIDTH - 10, hstep * i);
            ctx_scale1.lineTo(SCALE_WIDTH, hstep * i);
            ctx_scale1.stroke()
        }
        ctx_scale1.beginPath();
        ctx_scale1.moveTo(SCALE_WIDTH, 0);
        ctx_scale1.lineTo(SCALE_WIDTH, this.commonInfo.CANVAS_HEIGHT);
        ctx_scale1.stroke()
        //
        this.commonInfo.audioView.callbackAudioInfoLoaded = () => {
            console.log("[called] AudioInfoLoaded")
            this.commonInfo.labelView.loadLabelDataServer(this.base_path + this.projectName + "/" + labelName + ".csv?")
            $("#waveDisplayL").css('background-image', 'url("' + this.base_path + this.projectName + '/music.png")');
        }
        this.commonInfo.labelView.labelSelectedCallback = (i: number) => {
            console.log("[called] labelSelectedCallback")
            var arr = this.commonInfo.labelView.findPoint(i);
            if (arr.length > 0) {
                var sep = arr[0].sep_id;
                var basefilename = "sep_" + sep + ".wav"
                var filename = this.base_path + this.projectName + "/sep_files/sep_" + sep + ".wav";
                var spec_filename = this.base_path + this.projectName + "/sep_files/sep_" + sep + ".png";
                console.log("[request]",filename);
                //playSoundFile(filename);
			
                $("#evt_file").html(
                    'file : <a href="' + filename + '">' + basefilename + "</a><br>"
                    + '<audio src="' + filename + '" controls/>'
                );
                $("#evt_spec").attr("src", spec_filename);

                //balloon
                var c = $("#waveDisplayL");
                var pos = $("#waveDisplayL").offset();
                console.log("[pos]", arr);
                pos.left += arr[0].x;
                pos.top += arr[0].y;
                $('#selected_label').offset(pos);
                arr[0].label
                $('#selected_label').showBalloon({ contents: "testtest" });

                //$('#selected_label').hideBalloon({ hideComplete: function () { $('#selected_label').showBalloon({ contents: "testtest" }); } });
                
            }

        }
        this.commonInfo.audioView.audioInitialize(this.base_path + this.projectName + "/original.wav",null);
    }
    onload() {
        $("#button_stop").click(() => {
            console.log("stop");
            this.commonInfo.audioView.butttonStop();
        });
        $("#button_play").click(() => {
            console.log("button_play");
            this.commonInfo.audioView.butttonPlayOrResume();
        });
        $("#button_clear_label").click(() => {
            console.log("button_clear_label");
            this.commonInfo.labelView.butttonLabelClear();
        });
        $("#button_out_label").click(() => {
            this.commonInfo.labelView.buttonLabelOut();
        });
        $("#button_out_label_html").click(() => {
            this.commonInfo.labelView.outLabelHTML(this.commonInfo.wavDuration);
        });
        $("#button_save_img").click(() => {
            this.outLabelImage();
        });
        
        //
        $('#buttonWavInfoArea').click(function () {
            $('#wavInfoArea').slideToggle('fast');
        });
        $('#buttonSubFunction').click(function () {
            $('#subFunction').slideToggle('fast');
        });
    }
}

var app: AppAnnotation;

var shiftDownFlag;
var ctrlDownFlag;
$(document).ready(function () {
    $(window).keydown(function (e) {
        if (e.keyCode == 16) {//shift
            shiftDownFlag = true;
        } else if (e.keyCode == 187) {//+
            if (shiftDownFlag) {
                app.zoomIn();
            }
        } else if (e.keyCode == 189) {//-
            if (shiftDownFlag) {
                app.zoomOut();
            }
        } else if (e.keyCode == 17) {//ctrl
            ctrlDownFlag = true;
            app.setEditMode(true);
        }

    });
    $(window).keyup(function (e) {
        if (e.keyCode == 16) {//shift
            shiftDownFlag = false;
        } else if (e.keyCode == 17) {//ctrl
            ctrlDownFlag = false;
            app.setEditMode(false);
        }
    });
    //
    
});

/*
thumbnailCanvasHeight = 150
thumbnailWidth = 100
thumbnailHeight = 100
thumbnailLineWidth = 3
thumbnailStep = 100
thumbnailLineColor = "#f00"
var thumbnailImage;
var thumbnailData;
function thumbnailLoad() {
    var canvas = document.getElementById("thumbnailDisplay");
    var ctx = canvas.getContext('2d');
    loadThumbnailList("thumbnail/log.csv", function (thumbnailData) {
        //画像の表示間隔計算
        var intervalMean = 0;
        for (var i = 1; i < thumbnailData.length; i++) {
            intervalMean += thumbnailData[i][0] - thumbnailData[i - 1][0]
        }
        intervalMean /= (thumbnailData.length - 1)
        thumbnailStep = (intervalMean / 1000.0 / wavDuration) * CANVAS_WIDTH
        //画像ロード
        thumbnailImage = new Array(thumbnailData.length, null)
        for (var i = 0; i < thumbnailData.length; i++) {
            function f(j) {
                var pos_rate = thumbnailData[j][0] / 1000.0 / wavDuration
                var img = new Image();
                img.src = "thumbnail/" + thumbnailData[j][1] + "?" + new Date().getTime();
                img.onload = function () {
                    ctx.drawImage(img, thumbnailStep * j, 0, thumbnailWidth, thumbnailHeight);
                    ctx.strokeStyle = thumbnailLineColor;
                    ctx.lineWidth = thumbnailLineWidth;
                    // 線分を描画
                    ctx.beginPath();
                    ctx.moveTo(thumbnailStep * j, thumbnailHeight);
                    ctx.lineTo(pos_rate * CANVAS_WIDTH, thumbnailCanvasHeight);
                    ctx.stroke();
                }
                thumbnailImage[j] = img
            };
            f(i);
        }
    });
}


//サーバからロード（サーバ）
function loadThumbnailList(path, callbackFunc) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", path, true);
    oReq.responseType = "text";
    oReq.onload = function (oEvent) {
        list = oReq.responseText;
        arr = list.split("\n");
        thumbnailData = []
        for (var i = 0; i < arr.length; i++) {
            v = arr[i].split(",");
            if (v.length >= 3) {
                thumbnailData.push([parseFloat(v[1]), v[2]]);
            }
        }
        console.log(thumbnailData);
        callbackFunc(thumbnailData);
    };
    oReq.send(null);
}
*/

/*
window.onload = () => {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};*/