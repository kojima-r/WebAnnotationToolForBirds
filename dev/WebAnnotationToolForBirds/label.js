/// <reference path="common.ts" />
var LabelPoint = (function () {
    function LabelPoint() {
    }
    return LabelPoint;
})();
var NearestPointPair = (function () {
    function NearestPointPair() {
    }
    return NearestPointPair;
})();
var LabelView = (function () {
    function LabelView(common) {
        this.S_POINT = 1;
        this.NO_POINT = 0;
        this.sX = null; // 始点Ｓのx座標（スクリーン座標）
        this.sY = null; // 始点Ｓのy座標（スクリーン座標）
        this.eX = null; // 終点Ｅのx座標（スクリーン座標）
        this.eY = null; // 終点Ｅのy座標（スクリーン座標）
        this.lines = [];
        this.defaultLabel = 0;
        this.lineTypeCol = ['#0f0', '#f00', '#00f'];
        this.lineTypeCol2 = ['#0f0', '#f00', '#00f'];
        this.lineTypeNum = 3;
        this.editMode = false;
        this.idCount = 0;
        this.labelSelectedCallback = null;
        this.labelModifiededCallback = null;
        this.rectSelect = false;
        this.UNANNOTATED_SEG = 0;
        this.ANNOTATED_SEG = 1;
        common.labelView = this;
        this.commonInfo = common;
    }
    LabelView.prototype.normalizeLinePositionW = function (w) {
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].x *= w;
        }
    };
    LabelView.prototype.loadLabelDataServer = function (path) {
        var _this = this;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", path, true);
        oReq.responseType = "text";
        oReq.onload = function (oEvent) {
            var list = oReq.responseText;
            _this.parseCSVLines(list);
            console.log("[loaded]", path, _this.lines);
        };
        oReq.send(null);
    };
    LabelView.prototype.pixel2time = function (pt) {
        return pt * this.commonInfo.wavDuration / this.commonInfo.CANVAS_WIDTH;
    };
    LabelView.prototype.pixel2deg = function (pt) {
        return 180 - pt / this.commonInfo.CANVAS_HEIGHT * 360.0;
    };
    LabelView.prototype.parseCSVLines = function (text) {
        var arr = text.split("\n");
        var prevID = null;
        var nowID = 0;
        var defaultSepID = 0;
        for (var i = 0; i < arr.length; i++) {
            var v = arr[i].split(",");
            if (v.length == 2) {
                var x = parseFloat(v[0]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                var y = parseFloat(v[1]) * this.commonInfo.CANVAS_HEIGHT;
                this.lines.push({ "id": this.idCount, "label": this.defaultLabel, "x": x, "y": y, "sep_id": defaultSepID, "annotationFlag": this.UNANNOTATED_SEG });
            }
            else if (v.length > 2) {
                nowID = parseInt(v[0]);
                if (prevID != nowID) {
                    prevID = nowID;
                    this.idCount += 1;
                }
                if (v.length == 3) {
                    var x = parseFloat(v[1]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[2]) * this.commonInfo.CANVAS_HEIGHT;
                    this.lines.push({ "id": this.idCount, "label": this.defaultLabel, "x": x, "y": y, "sep_id": defaultSepID, "annotationFlag": this.UNANNOTATED_SEG });
                }
                else if (v.length == 4) {
                    var x = parseFloat(v[2]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[3]) * this.commonInfo.CANVAS_HEIGHT;
                    var l = parseInt(v[1]);
                    //this.lines.push([nowID + this.idCount, parseInt(v[1]), x, y, nowID, this.UNANNOTATED_SEG])
                    this.lines.push({ "id": this.idCount, "label": l, "x": x, "y": y, "sep_id": defaultSepID, "annotationFlag": this.UNANNOTATED_SEG });
                }
                else if (v.length == 5) {
                    var x = parseFloat(v[2]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[3]) * this.commonInfo.CANVAS_HEIGHT;
                    var l = parseInt(v[1]);
                    var sepID = parseInt(v[4]);
                    //his.lines.push([nowID + this.idCount,parseInt(v[1]),x,y,nowID,aflag])
                    this.lines.push({ "id": this.idCount, "label": l, "x": x, "y": y, "sep_id": sepID, "annotationFlag": this.UNANNOTATED_SEG });
                }
                else if (v.length == 6) {
                    var x = parseFloat(v[2]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[3]) * this.commonInfo.CANVAS_HEIGHT;
                    var sepID = parseInt(v[4]);
                    var aflag = parseInt(v[5]);
                    var l = parseInt(v[1]);
                    this.lines.push({ "id": this.idCount, "label": l, "x": x, "y": y, "sep_id": nowID, "annotationFlag": aflag });
                }
            }
        }
        this.idCount += 1;
        this.drawAllLines();
    };
    LabelView.prototype.loadLabelData = function (file) {
        var _this = this;
        //ラベルデータ読み込み
        //行：X,Y
        //行：ID,X,Y
        //行：ID,Label,X,Y
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = reader.result;
                _this.parseCSVLines(data);
            }
            catch (e) {
                alert(e);
            }
        };
        reader.readAsText(file);
    };
    LabelView.prototype.deleteLine = function (index) {
        this.lines.splice(index, 1);
    };
    LabelView.prototype.deleteLineID = function (id) {
        var len = this.lines.length - 1;
        for (var i = len; i >= 0; i--) {
            if (this.lines[i].id == id) {
                this.lines.splice(i, 1);
            }
        }
    };
    LabelView.prototype.modifyLabel = function (id, l) {
        var len = this.lines.length - 1;
        var old = null;
        var changed = false;
        for (var i = len; i >= 0; i--) {
            if (this.lines[i].id == id) {
                old = this.lines[i].label;
                this.lines[i].label = l;
                this.lines[i].annotationFlag = this.ANNOTATED_SEG;
                changed = true;
            }
        }
        if (changed && this.labelModifiededCallback != null) {
            this.labelModifiededCallback(id, old, l);
        }
    };
    LabelView.prototype.toggleAnnotationFlag = function (id) {
        var len = this.lines.length - 1;
        for (var i = len; i >= 0; i--) {
            if (this.lines[i].id == id) {
                if (this.lines[i].annotationFlag == this.ANNOTATED_SEG) {
                    this.lines[i].annotationFlag = this.UNANNOTATED_SEG;
                }
                else {
                    this.lines[i].annotationFlag = this.ANNOTATED_SEG;
                }
            }
        }
    };
    LabelView.prototype.setAllAnnotationFlag = function (flag) {
        var len = this.lines.length - 1;
        for (var i = len; i >= 0; i--) {
            this.lines[i].annotationFlag = flag;
        }
    };
    LabelView.prototype.modifyLabelSucc = function (id) {
        var len = this.lines.length - 1;
        for (var i = len; i >= 0; i--) {
            if (this.lines[i].id == id) {
                this.lines[i].label += 1;
                this.lines[i].label = this.lines[i].label % this.lineTypeNum;
                this.lines[i].annotationFlag = this.ANNOTATED_SEG;
            }
        }
    };
    LabelView.prototype.nearestLine = function (x, y) {
        var p = this.nearestPoint(x, y);
        return p.event_id;
    };
    LabelView.prototype.nearestPoint = function (x, y) {
        var ni = -1;
        var nd = this.commonInfo.CANVAS_WIDTH * this.commonInfo.CANVAS_WIDTH + this.commonInfo.CANVAS_HEIGHT * this.commonInfo.CANVAS_HEIGHT;
        for (var i = 0; i < this.lines.length; i++) {
            var dx = (x - this.lines[i].x);
            var dy = (y - this.lines[i].y);
            var dd = dx * dx + dy * dy;
            if (dd < nd) {
                ni = this.lines[i].id;
                nd = dd;
            }
        }
        return { event_id: ni, distance: nd };
    };
    LabelView.prototype.getFirstPoint = function (seg_id) {
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].id == seg_id) {
                return this.lines[i];
            }
        }
        return null;
    };
    LabelView.prototype.findPoint = function (seg_id) {
        var points = [];
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].id == seg_id) {
                points.push(this.lines[i]);
            }
        }
        return points;
    };
    LabelView.prototype.findRectPoint = function (sx, sy, ex, ey) {
        var points = [];
        for (var i = 0; i < this.lines.length; i++) {
            if (sx <= this.lines[i].x && this.lines[i].x <= ex || ex <= this.lines[i].x && this.lines[i].x <= sx) {
                if (sy <= this.lines[i].y && this.lines[i].y <= ey || ey <= this.lines[i].y && this.lines[i].y <= sy) {
                    points.push(this.lines[i].id);
                }
            }
        }
        //unique
        var unique_points = points.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        return unique_points;
    };
    LabelView.prototype.modifyLabelRectPoint = function (sx, sy, ex, ey, l) {
        var list = this.findRectPoint(sx, sy, ex, ey);
        console.log(list);
        for (var j = 0; j < list.length; j++) {
            this.modifyLabel(list[j], l);
        }
    };
    LabelView.prototype.addLine = function (sx, sy, ex, ey, l) {
        var vx = ex - sx;
        var vy = ey - sy;
        var d = Math.sqrt(vx * vx + vy * vy);
        var dvx = vx / d;
        var dvy = vy / d;
        var rx = 0;
        var ry = 0;
        while (Math.abs(rx) < Math.abs(vx)) {
            this.lines.push({ "id": this.idCount, "label": this.defaultLabel, "x": sx + rx, "y": sy + ry, "sep_id": this.idCount, "annotationFlag": this.ANNOTATED_SEG });
            //this.lines.push([this.idCount, this.defaultLabel, sx + rx, sy + ry, this.idCount, this.ANNOTATED_SEG]);
            rx += dvx;
            ry += dvy;
        }
        this.idCount += 1;
    };
    LabelView.prototype.buttonLabelOut = function () {
        var name = this.commonInfo.baseFilename + ".csv";
        var res = this.getLabelCSV(this.commonInfo.wavDuration);
        this.textSave(name, res);
    };
    LabelView.prototype.textSave = function (name, text) {
        var blob = new Blob([text], { type: 'text/plain' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link); // for Firefox
        link.click();
        document.body.removeChild(link); // for Firefox
    };
    LabelView.prototype.getLabelCSV = function (scale) {
        var out = "";
        for (var i = 0; i < this.lines.length; i++) {
            var oline = new Array(6);
            oline[0] = this.lines[i].id;
            oline[1] = this.lines[i].label;
            oline[2] = this.lines[i].x / this.commonInfo.CANVAS_WIDTH * scale;
            oline[3] = this.lines[i].y / this.commonInfo.CANVAS_HEIGHT;
            oline[4] = this.lines[i].sep_id;
            oline[5] = this.lines[i].annotationFlag;
            out += oline.join(",") + "\n";
        }
        return out;
    };
    LabelView.prototype.outLabelHTML = function (scale) {
        var out = "";
        for (var i = 0; i < this.lines.length; i++) {
            var oline = new Array(6);
            oline[0] = this.lines[i].id;
            oline[1] = this.lines[i].label;
            oline[2] = this.lines[i].x / this.commonInfo.CANVAS_WIDTH * scale;
            oline[3] = this.lines[i].y / this.commonInfo.CANVAS_HEIGHT;
            oline[4] = this.lines[i].sep_id;
            oline[5] = this.lines[i].annotationFlag;
            out += oline.join(",") + "<br>";
        }
        var info = document.getElementById('outLabel');
        info.innerHTML = out;
    };
    LabelView.prototype.butttonLabelClear = function () {
        this.lines = [];
        this.idCount = 0;
        this.sX = null;
        this.sY = null;
        this.eX = null;
        this.eY = null;
        // 座標軸の初期化
        this.drawInit();
    };
    LabelView.prototype.updateLabelCanvas = function () {
        this.drawInit();
        this.drawTempPoint();
        this.drawAllLines();
    };
    LabelView.prototype.preloadLabelCanvas = function () {
        var _this = this;
        // canvas要素を取得し、サイズ設定
        this.canvas = document.getElementById('waveDisplayL');
        this.commonInfo.CANVAS_WIDTH = this.canvas.width;
        this.commonInfo.CANVAS_HEIGHT = this.canvas.height;
        this.oX = Math.ceil(this.commonInfo.CANVAS_WIDTH / 2);
        this.oY = Math.ceil(this.commonInfo.CANVAS_HEIGHT / 2);
        // 描画のために2Dコンテキスト取得
        this.ctx = this.canvas.getContext('2d');
        // 座標軸の初期化
        this.drawInit();
        // mousedownイベントの登録（始点の確定）
        var dragFlag = false;
        var catchedLineIndex = 0;
        var catchedPoint = this.NO_POINT; //0:none 1:start -1 end
        this.canvas.onmousedown = function (e) {
            switch (e.button) {
                case 0:
                    if (!_this.editMode) {
                        if (_this.labelSelectedCallback != null) {
                            var i = _this.nearestLine(_this.mouseX, _this.mouseY);
                            _this.labelSelectedCallback(i);
                        }
                    }
                    else {
                        // 座標軸の初期化
                        _this.drawInit();
                        // クリック位置のスクリーン座標（mouseX, mouseY）を取得
                        _this.calcMouseCoordinate(e);
                        // 始点、終点のスクリーン座標を設定（終点はクリア）
                        _this.sX = _this.mouseX;
                        _this.sY = _this.mouseY;
                        _this.eX = null;
                        _this.eY = null;
                        // 始点の描画
                        _this.drawStartPoint();
                        _this.drawAllLines();
                        dragFlag = true;
                        _this.rectSelect = false;
                    }
                    break;
                case 1:
                    if (!_this.editMode) {
                        _this.calcMouseCoordinate(e);
                        var i = _this.nearestLine(_this.mouseX, _this.mouseY);
                        //modifyLabelSucc(i);
                        _this.toggleAnnotationFlag(i);
                        _this.drawInit();
                        _this.drawAllLines();
                        e.preventDefault();
                    }
                    else {
                        // 座標軸の初期化
                        _this.drawInit();
                        _this.calcMouseCoordinate(e);
                        _this.sX = _this.mouseX;
                        _this.sY = _this.mouseY;
                        _this.eX = null;
                        _this.eY = null;
                        _this.drawStartPoint();
                        _this.drawAllLines();
                        dragFlag = true;
                        _this.rectSelect = true;
                        e.preventDefault();
                        return 0;
                    }
                    break;
                case 2:
                    if (!_this.editMode) {
                        _this.calcMouseCoordinate(e);
                        var i = _this.nearestLine(_this.mouseX, _this.mouseY);
                        //modifyLabelSucc(i);
                        _this.modifyLabel(i, _this.defaultLabel);
                        _this.drawInit();
                        _this.drawAllLines();
                    }
                    else {
                        _this.calcMouseCoordinate(e);
                        var i = _this.nearestLine(_this.mouseX, _this.mouseY);
                        _this.deleteLineID(i);
                    }
                    break;
            }
        };
        // mousemoveイベントの登録
        this.canvas.onmousemove = function (e) {
            if (dragFlag) {
                if (_this.rectSelect) {
                    // 座標軸の初期化
                    _this.drawInit();
                    // 始点の描画
                    _this.drawStartPoint();
                    // 終点の描画
                    _this.drawEndPoint();
                    // マウス位置のスクリーン座標（mouseX, mouseY）を取得
                    _this.calcMouseCoordinate(e);
                    // マウス位置の点の描画
                    _this.drawTempPoint();
                    _this.drawAllLines();
                    _this.updateLabelCanvas();
                    // draw region 
                    var col = _this.lineTypeCol[_this.defaultLabel % _this.lineTypeCol.length];
                    _this.drawRect(_this.mouseX - 1, _this.mouseY - 1, _this.sX + 1, _this.sY + 1, "#000", 1);
                    _this.drawRect(_this.mouseX + 1, _this.mouseY + 1, _this.sX - 1, _this.sY - 1, "#000", 1);
                    _this.drawRect(_this.mouseX, _this.mouseY, _this.sX, _this.sY, col, 1);
                }
                else if (catchedPoint == _this.NO_POINT) {
                    // 座標軸の初期化
                    _this.drawInit();
                    // 始点の描画
                    _this.drawStartPoint();
                    // 終点の描画
                    _this.drawEndPoint();
                    // マウス位置のスクリーン座標（mouseX, mouseY）を取得
                    _this.calcMouseCoordinate(e);
                    // マウス位置の点の描画
                    _this.drawTempPoint();
                    _this.drawAllLines();
                    _this.updateLabelCanvas();
                }
                else {
                    // マウス位置のスクリーン座標（mouseX, mouseY）を取得
                    _this.calcMouseCoordinate(e);
                    if (catchedPoint == _this.S_POINT) {
                        _this.lines[catchedLineIndex].x = _this.mouseX;
                        _this.lines[catchedLineIndex].y = _this.mouseY;
                    }
                    // マウス位置の点の描画
                    _this.drawInit();
                    _this.drawTempPoint();
                    _this.drawAllLines();
                    _this.updateLabelCanvas();
                }
            }
            else {
                _this.drawInit();
                _this.calcMouseCoordinate(e);
                _this.drawTempPoint();
                _this.drawAllLines();
            }
        };
        this.canvas.addEventListener("contextmenu", function (e) {
            // デフォルトイベントをキャンセル
            // これを書くことでコンテキストメニューが表示されなくなります
            e.preventDefault();
        }, false);
        // mouseupイベントの登録（終点、線分を確定）
        this.canvas.onmouseup = function (e) {
            switch (e.button) {
                case 0:
                    if (dragFlag) {
                        dragFlag = false;
                        if (catchedPoint != _this.NO_POINT) {
                            catchedLineIndex = 0;
                            catchedPoint = _this.NO_POINT;
                            _this.updateLabelCanvas();
                        }
                        else {
                            // クリック位置のスクリーン座標（mouseX, mouseY）を取得
                            _this.calcMouseCoordinate(e);
                            // 終点のスクリーン座標を設定
                            _this.eX = _this.mouseX;
                            _this.eY = _this.mouseY;
                            // 終点の描画
                            _this.addLine(_this.sX, _this.sY, _this.eX, _this.eY, _this.defaultLabel);
                            _this.idCount += 1;
                            _this.updateLabelCanvas();
                        }
                    }
                    break;
                case 1:
                    if (dragFlag) {
                        dragFlag = false;
                        _this.rectSelect = false;
                        // クリック位置のスクリーン座標（mouseX, mouseY）を取得
                        _this.calcMouseCoordinate(e);
                        // 終点のスクリーン座標を設定
                        _this.eX = _this.mouseX;
                        _this.eY = _this.mouseY;
                        _this.modifyLabelRectPoint(_this.sX, _this.sY, _this.eX, _this.eY, _this.defaultLabel);
                        // 終点の描画
                        //lines.push([idCount,defaultLabel,eX,eY]);
                        //lines.push([idCount,defaultLabel,sX,sY]);
                        _this.updateLabelCanvas();
                        //
                        e.preventDefault();
                        return 0;
                    }
                    break;
                case 2:
                    break;
            }
        };
        // mouseoutイベントの登録
        this.canvas.onmouseout = function (e) {
            // 座標軸の初期化
            _this.drawInit();
            dragFlag = false;
            // 始点・終点が共に確定していなければ、一旦クリア
            if (_this.sX == null || _this.sY == null || _this.eX == null || _this.eY == null) {
                _this.sX = null;
                _this.sY = null;
                _this.eX = null;
                _this.eY = null;
            }
            // 始点・終点・線分の描画（始点、終点が確定している時のみ）
            //drawStartPoint();
            //drawEndPoint();
            _this.drawAllLines();
        };
    };
    ;
    LabelView.prototype.calcMouseCoordinate = function (e) {
        // クリック位置の座標計算（canvasの左上を基準。-2ずつしているのはborderの分）
        var rect = e.target.getBoundingClientRect();
        this.mouseX = e.clientX - Math.floor(rect.left) - 2;
        this.mouseY = e.clientY - Math.floor(rect.top) - 2;
    };
    // 一度canvasをクリアして座標軸を再描画する
    LabelView.prototype.drawInit = function () {
        // 一度描画をクリア
        this.ctx.clearRect(0, 0, this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT);
    };
    // 指定位置に点と座標表示を描画する
    LabelView.prototype.drawPoint = function (screenX, screenY, color, pointText) {
        if (pointText === undefined) {
            pointText = '';
        }
        this.ctx.fillStyle = color;
        // 指定位置を中心に円を描画
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 3, 0, Math.PI * 2, false);
        this.ctx.fill();
    };
    // 指定された2つの点から矩形を描画する
    LabelView.prototype.drawRect = function (firstX, firstY, secondX, secondY, color, width) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        // 線分を描画
        this.ctx.strokeRect(firstX, firstY, secondX - firstX, secondY - firstY);
    };
    // 指定された2つの点を結ぶ線分を描画する
    LabelView.prototype.drawLine = function (firstX, firstY, secondX, secondY, color, width, alpha) {
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        // 線分を描画
        this.ctx.beginPath();
        this.ctx.moveTo(firstX, firstY);
        this.ctx.lineTo(secondX, secondY);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    };
    // マウス位置に点を描画する
    LabelView.prototype.drawTempPoint = function () {
        this.drawPoint(this.mouseX, this.mouseY, '#999', "");
        if (this.sX != null && this.sY != null && this.eX == null && this.eY == null) {
            // 始点が確定していて、終点が確定していない場合に線分を描画
            this.drawLine(this.sX, this.sY, this.mouseX, this.mouseY, '#999', 1, 1.0);
        }
        //縦線
        this.drawLine(this.mouseX, 0, this.mouseX, this.commonInfo.CANVAS_HEIGHT, '#999', 1, 1.0);
        this.drawLine(0, this.mouseY, this.commonInfo.CANVAS_WIDTH, this.mouseY, '#999', 1, 1.0);
        var cnvsr2 = document.getElementById("waveDisplay2");
        var ctxr2 = cnvsr2.getContext("2d");
        this.commonInfo.audioView.drawSeekBar(undefined);
        ctxr2.strokeStyle = '#999';
        ctxr2.lineWidth = 1;
        ctxr2.beginPath();
        ctxr2.moveTo(this.mouseX, 0);
        ctxr2.lineTo(this.mouseX, this.commonInfo.CANVAS_HEIGHT);
        ctxr2.stroke();
        if (this.sX != null && this.sY != null && this.eX == null && this.eY == null) {
            // 始点が確定していて、終点が確定していない場合に線分を描画
            this.drawLine(this.sX, 0, this.sX, this.commonInfo.CANVAS_HEIGHT, '#999', 1, 1.0);
            ctxr2.beginPath();
            ctxr2.moveTo(this.sX, 0);
            ctxr2.lineTo(this.sX, this.commonInfo.CANVAS_HEIGHT);
            ctxr2.stroke();
        }
    };
    // 始点を描画する
    LabelView.prototype.drawStartPoint = function () {
        if (this.sX != null && this.sY != null) {
            this.drawPoint(this.sX, this.sY, '#000', 'Ｓ');
        }
    };
    // 終点を描画する
    LabelView.prototype.drawEndPoint = function () {
        if (this.sX != null && this.sY != null && this.eX != null && this.eY != null) {
            this.drawPoint(this.eX, this.eY, '#000', 'Ｅ');
            this.drawLine(this.sX, this.sY, this.eX, this.eY, '#000', 1, 1.0);
        }
    };
    LabelView.prototype.drawAllLines = function () {
        var prevId = null;
        for (var i = 0; i < this.lines.length; i++) {
            var col;
            if (this.lines[i].label >= 0) {
                if (this.lines[i].annotationFlag == this.ANNOTATED_SEG) {
                    col = this.lineTypeCol[this.lines[i].label % this.lineTypeCol.length];
                }
                else {
                    col = this.lineTypeCol2[this.lines[i].label % this.lineTypeCol2.length];
                }
            }
            else {
                col = '#000';
            }
            this.drawPoint(this.lines[i].x, this.lines[i].y, col, 'Ｅ');
            if (prevId == this.lines[i].id) {
                this.drawLine(this.lines[i - 1].x, this.lines[i - 1].y, this.lines[i].x, this.lines[i].y, col, 1, 1.0);
            }
            prevId = this.lines[i].id;
        }
    };
    return LabelView;
})();
//# sourceMappingURL=label.js.map