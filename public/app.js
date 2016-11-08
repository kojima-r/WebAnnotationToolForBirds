/// <reference path="balloon_manager.ts" />
/// <reference path="common.ts" />
var AppAnnotation = (function () {
    function AppAnnotation(projectName, base_path, projectID) {
        var _this = this;
        this.defaultLabelSelectorNum = 12;
        this.lineTypeCol = ['#0f0', '#f00', '#00f', '#0ff', '#ff0', '#f0f', '#080', '#800', '#008', '#f80', '#80f', '#0f8'];
        this.lineTypeCol2 = ['#8f8', '#f88', '#88f', '#8ff', '#ff8', '#f8f', '#484', '#844', '#448', '#f84', '#84f', '#4f8'];
        this.lineTypeNum = 8;
        this.callbackLoadingLabel = function () {
            console.log("[called] callbackLoadingLabel");
            _this.commonInfo.audioView.setInfoTagID("wavInfoArea");
            var SCALE_WIDTH = 50;
            var canvas = document.getElementById("scale1");
            canvas.width = SCALE_WIDTH;
            canvas.height = _this.commonInfo.CANVAS_HEIGHT;
            canvas = document.getElementById("scale2");
            canvas.width = SCALE_WIDTH;
            canvas.height = _this.commonInfo.CANVAS_HEIGHT;
            _this.setCanvasSize(_this.commonInfo.CANVAS_WIDTH, _this.commonInfo.CANVAS_HEIGHT, SCALE_WIDTH);
            $('#contents').css("width", _this.commonInfo.CANVAS_WIDTH);
            $('#contents').css("padding-top", 30);
            //
            $("#scale1").gpFloatY();
            $("#scale1").css('z-index', 1);
            $("#scale2").gpFloatY();
            $("#scale2").css('z-index', 1);
            $("#viewScale1").width(SCALE_WIDTH);
            $("#viewScale1").height(_this.commonInfo.CANVAS_HEIGHT);
            $("#viewScale2").width(SCALE_WIDTH);
            $("#viewScale2").height(_this.commonInfo.CANVAS_HEIGHT);
            //
            //$("#infoArea").gpFloatY();
            //$("#infoAreaDummy").height($("#infoArea").height() + 1000)
            //
            //スペクトログラム表示
            _this.drawSpectrogram();
            //スペクトログラム縦軸表示
            var h_space = 40;
            var freq = [], max = 9;
            for (var i = 1; freq.push((max - i++) * 1000) < max;)
                ;
            var canvas2 = document.getElementById("scale2");
            var ctx_scale2 = canvas2.getContext('2d');
            var hstep = (_this.commonInfo.CANVAS_HEIGHT - h_space) / (freq.length - 1);
            //塗りつぶし
            var old_fs = ctx_scale2.fillStyle;
            ctx_scale2.fillStyle = '#fff';
            ctx_scale2.fillRect(0, 0, SCALE_WIDTH, _this.commonInfo.CANVAS_HEIGHT);
            ctx_scale2.fillStyle = old_fs;
            //
            for (var i = 0; i < freq.length; i++) {
                ctx_scale2.fillText(freq[i], 10, h_space + hstep * i);
                ctx_scale2.strokeStyle = '#000';
                ctx_scale2.lineWidth = 1;
                ctx_scale2.beginPath();
                ctx_scale2.moveTo(SCALE_WIDTH - 10, h_space + hstep * i);
                ctx_scale2.lineTo(SCALE_WIDTH, h_space + hstep * i);
                ctx_scale2.stroke();
            }
            //方向縦軸表示
            h_space = 40;
            var dirs = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
            var canvas1 = document.getElementById("scale1");
            var ctx_scale1 = canvas1.getContext('2d');
            //塗りつぶし
            old_fs = ctx_scale1.fillStyle;
            ctx_scale1.fillStyle = '#fff';
            ctx_scale1.fillRect(0, 0, SCALE_WIDTH, _this.commonInfo.CANVAS_HEIGHT);
            ctx_scale1.fillStyle = old_fs;
            //
            hstep = (_this.commonInfo.CANVAS_HEIGHT) / (dirs.length - 1);
            var hstep_text = (_this.commonInfo.CANVAS_HEIGHT - 10) / (dirs.length - 1);
            ctx_scale1.strokeStyle = '#000';
            ctx_scale1.lineWidth = 1;
            for (var i = 0; i < dirs.length; i++) {
                ctx_scale1.fillText(dirs[i].toString(), 15, _this.commonInfo.CANVAS_HEIGHT - hstep_text * i);
                ctx_scale1.beginPath();
                ctx_scale1.moveTo(SCALE_WIDTH - 10, hstep * i);
                ctx_scale1.lineTo(SCALE_WIDTH, hstep * i);
                ctx_scale1.stroke();
            }
            ctx_scale1.beginPath();
            ctx_scale1.moveTo(SCALE_WIDTH, 0);
            ctx_scale1.lineTo(SCALE_WIDTH, _this.commonInfo.CANVAS_HEIGHT);
            ctx_scale1.stroke();
            //
            _this.commonInfo.audioView.callbackAudioInfoLoaded = function () {
                console.log("[called] AudioInfoLoaded");
                _this.commonInfo.labelView.loadLabelDataServer(_this.base_path + _this.projectName + "/" + _this.labelName + ".csv?");
                $("#waveDisplayL").css('background-image', 'url("' + _this.base_path + _this.projectName + '/music.png")');
            };
            _this.commonInfo.labelView.labelModifiededCallback = function (i, old, label) {
                console.log("[called] labelModifiededCallback" + i + ":" + old + "->" + label);
                var arr = _this.commonInfo.labelView.findPoint(i);
                _this.balloonManager.deleteBalloon(arr[0].id);
            };
            //イベントが選択された時の詳細表示
            _this.commonInfo.labelView.labelSelectedCallback = function (i) {
                console.log("[called] labelSelectedCallback");
                var arr = _this.commonInfo.labelView.findPoint(i);
                if (arr.length > 0) {
                    var sep = arr[0].sep_id;
                    var label = arr[0].label;
                    var x_min = arr[0].x;
                    var x_max = arr[0].x;
                    var y_min = arr[0].y;
                    var y_max = arr[0].y;
                    for (var i = 0; i < arr.length; i++) {
                        if (x_min > arr[i].x) {
                            x_min = arr[i].x;
                        }
                        if (x_max < arr[i].x) {
                            x_max = arr[i].x;
                        }
                        if (y_min > arr[i].y) {
                            y_min = arr[i].y;
                        }
                        if (y_max < arr[i].y) {
                            y_max = arr[i].y;
                        }
                    }
                    var basefilename = "sep_" + sep + ".wav";
                    var filename = _this.base_path + _this.projectName + "/sep_files/sep_" + sep + ".wav";
                    var spec_filename = _this.base_path + _this.projectName + "/sep_files/sep_" + sep + ".png";
                    console.log("[request]", filename);
                    //playSoundFile(filename);
                    $("#evt_file").html('file : <a href="' + filename + '">' + basefilename + "</a>  "
                        + "label : " + label.toString() + " "
                        + "time (sec)  : " + _this.commonInfo.labelView.pixel2time(x_min).toFixed(3).toString() + "-" + _this.commonInfo.labelView.pixel2time(x_max).toFixed(3).toString() + " "
                        + "angle (deg) : " + _this.commonInfo.labelView.pixel2deg(y_min).toFixed(3).toString() + "-" + _this.commonInfo.labelView.pixel2deg(y_max).toFixed(3).toString() + "<br>"
                        + '<audio src="' + filename + '" controls/>');
                    $("#evt_spec").attr("src", spec_filename);
                    //balloon
                    if (null == _this.balloonManager.addBalloon(arr[0].x, arr[0].y, arr[0].id, arr[0].label)) {
                        _this.balloonManager.deleteBalloon(arr[0].id);
                    }
                }
            };
            _this.commonInfo.audioView.audioInitialize(_this.base_path + _this.projectName + "/original.wav", null);
        };
        var get = this.getRequest();
        if (projectName) {
            this.projectName = projectName;
        }
        else {
            this.projectName = get['project'];
            if (!this.projectName) {
                this.projectName = "sample";
            }
        }
        this.labelName = get['label'];
        if (!this.labelName) {
            this.labelName = "label";
        }
        this.base_path = base_path;
        this.projectID = projectID;
        this.commonInfo = new AnnotaionCommon();
        var labelView = new LabelView(this.commonInfo);
        labelView.lineTypeCol = this.lineTypeCol;
        labelView.lineTypeCol2 = this.lineTypeCol2;
        labelView.lineTypeNum = this.lineTypeNum;
        var audioView = new AudioView(this.commonInfo);
    }
    AppAnnotation.prototype.getRequest = function () {
        if (location.search.length > 1) {
            var get = new Object();
            var ret = location.search.substr(1).split('&');
            for (var i = 0; i < ret.length; i++) {
                var r = ret[i].split('=');
                get[r[0]] = r[1];
            }
            return get;
        }
        else {
            return false;
        }
    };
    AppAnnotation.prototype.zoomIn = function () {
        var SCALE_WIDTH = 50;
        var canvas = document.getElementById("waveDisplayL");
        this.commonInfo.CANVAS_WIDTH = canvas.width * 1.5;
        this.setCanvasSize(this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT, SCALE_WIDTH);
        this.commonInfo.labelView.normalizeLinePositionW(1.5);
        this.commonInfo.labelView.updateLabelCanvas();
        this.drawSpectrogram();
        //this.commonInfo.audioView.startLoadBinary();
        //this.thumbnailLoad();
    };
    AppAnnotation.prototype.zoomOut = function () {
        var SCALE_WIDTH = 50;
        var canvas = document.getElementById("waveDisplayL");
        this.commonInfo.CANVAS_WIDTH = canvas.width * 2 / 3;
        this.setCanvasSize(this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT, SCALE_WIDTH);
        this.commonInfo.labelView.normalizeLinePositionW(2 / 3);
        this.commonInfo.labelView.updateLabelCanvas();
        this.drawSpectrogram();
        //this.commonInfo.audioView.startLoadBinary();
        //thumbnailLoad();
    };
    AppAnnotation.prototype.setCanvasSize = function (w, h, sw) {
        var canvas = document.getElementById("waveDisplay");
        canvas.width = w;
        canvas.height = h;
        canvas = document.getElementById("waveDisplay2");
        canvas.width = w;
        canvas.height = h;
        canvas = document.getElementById("waveDisplayL");
        canvas.width = w;
        canvas.height = h;
        canvas = document.getElementById("waveDisplayL2");
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
    };
    AppAnnotation.prototype.loadLabelConfig = function (callback) {
        var _this = this;
        if (this.projectID != null) {
            // here is for rails
            $.get("/projects/" + this.projectID + "/list/labels", function (data) {
                if (data.length == 0) {
                    //no labels
                    var url = "/projects/" + _this.projectID + "/edit_labels";
                    location.href = url;
                    return;
                }
                for (var i = 0; i < data.length; i++) {
                    var label_name = data[i]["name"];
                    var input_tag = '<input type="radio" name="label_selector_buttons" value="' + i + '" onChange="selectLabel(' + i + ');"';
                    if (i == 0) {
                        input_tag += " checked";
                    }
                    input_tag += '>' + i + ": " + label_name + _this.writeMark(i % _this.defaultLabelSelectorNum) + '</input>';
                    $("#label_selector").append(input_tag);
                    callback();
                }
            });
        }
        else {
            $.get(this.base_path + this.projectName + "/label_mapping.json?", function (data) {
                console.log(data);
                if (data.length == 0) {
                }
                else {
                    $("#label_selector").append("<ul>");
                    for (var i = 0; i < data.length; i++) {
                        var label_name = data[i]["name"];
                        var input_tag = '<li><input type="radio" name="label_selector_buttons" value="' + i + '" onChange="selectLabel(' + i + ');"';
                        if (i == 0) {
                            input_tag += " checked";
                        }
                        input_tag += '>' + _this.writeMark(i % _this.defaultLabelSelectorNum) + label_name + '</input></li>';
                        $("#label_selector").append(input_tag);
                    }
                    $("#label_selector").append("</ul>");
                    callback();
                }
            }).fail(function () {
                //no labels
                $("#label_selector").append("<ul>");
                for (var i = 0; i < _this.defaultLabelSelectorNum; i++) {
                    var input_tag = '<li><input type="radio" name="label_selector_buttons" value="' + i + '" onChange="selectLabel(' + i + ');"';
                    if (i == 0) {
                        input_tag += " checked";
                    }
                    input_tag += '>' + i + _this.writeMark(i) + '</input></li>';
                    $("#label_selector").append(input_tag);
                }
                $("#label_selector").append("</ul>");
                callback();
            });
        }
    };
    AppAnnotation.prototype.drawSpectrogram = function () {
        var _this = this;
        var canvas_wav = document.getElementById("waveDisplay");
        if (!canvas_wav || !canvas_wav.getContext) {
            return false;
        }
        var ctx = canvas_wav.getContext('2d');
        var img = new Image();
        img.src = this.base_path + this.projectName + "/specgram.png";
        img.onload = function () {
            var h_space = 40;
            ctx.drawImage(img, 0, h_space, _this.commonInfo.CANVAS_WIDTH, _this.commonInfo.CANVAS_HEIGHT - h_space);
        };
    };
    // Loadingイメージ表示関数
    AppAnnotation.prototype.dispLoading = function (msg) {
        // 画面表示メッセージ
        var dispMsg = "";
        // 引数が空の場合は画像のみ
        if (msg != "") {
            dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
        }
        // ローディング画像が表示されていない場合のみ表示
        var el = $("#loading");
        if (el.size() == 0) {
            $("body").append("<div id='loading'>" + dispMsg + "</div>");
        }
    };
    // Loadingイメージ削除関数
    AppAnnotation.prototype.removeLoading = function () {
        $("#loading").remove();
    };
    AppAnnotation.prototype.selectLabel = function (x) {
        if (x == null) {
            var obj = document.getElementById("other");
            var index = obj.selectedIndex;
            x = obj.options[index].value;
        }
        this.commonInfo.labelView.defaultLabel = x;
    };
    AppAnnotation.prototype.setEditMode = function (editMode) {
        this.commonInfo.labelView.editMode = editMode;
    };
    AppAnnotation.prototype.initLabelSelector = function () {
    };
    AppAnnotation.prototype.writeMark = function (n) {
        //document.write("<span style='color:"+lineTypeCol[n]+";'>*</span>")
        return "<span style='color:" + this.lineTypeCol[n] + ";'>*</span>";
    };
    AppAnnotation.prototype.postLabelOut = function () {
        var _this = this;
        this.dispLoading("Operations Are In Progress ...");
        var res = this.commonInfo.labelView.getLabelCSV(this.commonInfo.wavDuration);
        $.post('/upload_txt', { 'label': res }, function (data) {
            console.log("[updated]");
            //$('#output').html(data);
            _this.commonInfo.labelView.butttonLabelClear();
            _this.commonInfo.labelView.loadLabelDataServer(_this.base_path + _this.projectName + "/label.csv?");
            _this.removeLoading();
        });
    };
    AppAnnotation.prototype.outLabelImage = function () {
        var cvs = document.getElementById("waveDisplayL");
        var dataUrl = cvs.toDataURL();
        var imgEl = document.getElementById("outImg");
        imgEl.src = dataUrl;
    };
    AppAnnotation.prototype.onload = function () {
        var _this = this;
        $(window).scroll(function () {
            console.log($(window).scrollLeft());
            $("#infoArea").css("margin-left", 10 + $(window).scrollLeft());
        });
        $("#button_stop").click(function () {
            console.log("stop");
            _this.commonInfo.audioView.butttonStop();
        });
        $("#button_play").click(function () {
            console.log("button_play");
            _this.commonInfo.audioView.butttonPlayOrResume();
        });
        $("#button_clear_label").click(function () {
            console.log("button_clear_label");
            _this.commonInfo.labelView.butttonLabelClear();
        });
        $("#button_out_label").click(function () {
            _this.commonInfo.labelView.buttonLabelOut();
        });
        $("#button_out_label_html").click(function () {
            _this.commonInfo.labelView.outLabelHTML(_this.commonInfo.wavDuration);
        });
        $("#button_save_img").click(function () {
            _this.outLabelImage();
        });
        $("#button_annotated_flag").click(function () {
            _this.commonInfo.labelView.setAllAnnotationFlag(_this.commonInfo.labelView.ANNOTATED_SEG);
        });
        $("#button_spec_flag").click(function () {
            $('#viewLower').slideToggle('fast', function () {
                //var y = $("#contents").position().top + $("#contents").height();
                //console.log(y);
                //$("#infoArea").position().top = $("#contents").position().top + $("#contents").height();
                //$("#infoArea").gpFloatY();
            });
        });
        //
        $('#buttonWavInfoArea').click(function () {
            $('#wavInfoArea').slideToggle('fast');
        });
        $('#buttonSubFunction').click(function () {
            $('#subFunction').slideToggle('fast');
        });
        //
        $("#label_selector").draggable();
        $("#label_selector").resizable();
        //
        this.balloonManager = new BaloonManager(this.commonInfo, $('#labels'), 100, $("#waveDisplayL").offset());
        console.log(this.balloonManager);
    };
    return AppAnnotation;
})();
var app;
var shiftDownFlag;
var ctrlDownFlag;
$(document).ready(function () {
    $(window).keydown(function (e) {
        if (e.keyCode == 16) {
            shiftDownFlag = true;
        }
        else if (e.keyCode == 187) {
            if (shiftDownFlag) {
                app.zoomIn();
            }
        }
        else if (e.keyCode == 189) {
            if (shiftDownFlag) {
                app.zoomOut();
            }
        }
        else if (e.keyCode == 17) {
            ctrlDownFlag = true;
            app.setEditMode(true);
        }
    });
    $(window).keyup(function (e) {
        if (e.keyCode == 16) {
            shiftDownFlag = false;
        }
        else if (e.keyCode == 17) {
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
//# sourceMappingURL=app.js.map