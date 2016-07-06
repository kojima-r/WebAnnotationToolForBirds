/// <reference path="common.ts" />
class LabelPoint{
    id: number;
    label: number;
    x: number;
    y: number;
    sep_id: number;
    annotationFlag: number;
}
class NearestPointPair{
    event_id: number;
    distance: number;
}


class LabelView{

    commonInfo: AnnotaionCommon;
    constructor(common: AnnotaionCommon) {
        common.labelView = this;
        this.commonInfo = common;
    }

    S_POINT = 1;
    NO_POINT = 0;

    canvas;			// canvas要素(HTMLCanvasElement)
    ctx;			// 2Dコンテキスト(CanvasRenderingContext2D)
    oX;				// 中心Ｏのx座標（スクリーン座標）
    oY;				// 中心Ｏのy座標（スクリーン座標）
    sX = null;		// 始点Ｓのx座標（スクリーン座標）
    sY = null;		// 始点Ｓのy座標（スクリーン座標）
    eX = null;		// 終点Ｅのx座標（スクリーン座標）
    eY = null;		// 終点Ｅのy座標（スクリーン座標）
    mouseX;			// ドラッグされている位置のx座標
    mouseY;			// ドラッグされている位置のy座標
    lines: Array<LabelPoint> = [];
    defaultLabel=0;
    lineTypeCol=['#0f0','#f00','#00f'];
    lineTypeCol2=['#0f0','#f00','#00f'];
    lineTypeNum=3;
    editMode=false;
    idCount=0;
    labelSelectedCallback = null;
    labelModifiededCallback = null;
    rectSelect=false;

    UNANNOTATED_SEG=0
    ANNOTATED_SEG=1

    normalizeLinePositionW(w){
	    for(var i=0;i<this.lines.length;i++){
            this.lines[i].x*=w;
	    }
    }

    loadLabelDataServer(path){
	    var oReq = new XMLHttpRequest();
	    oReq.open("GET", path, true);
	    oReq.responseType = "text";
	    oReq.onload =  (oEvent)=>{
		    var list = oReq.responseText;
		    this.parseCSVLines(list);
            console.log("[loaded]", path, this.lines);
        };
	    oReq.send(null);
    }

    parseCSVLines(text) {
	    var arr=text.split("\n");
	    var prevID=null
        var nowID = 0;
        var defaultSepID=0;
	    for(var i=0;i<arr.length;i++){
            var v = arr[i].split(",");
            
            if (v.length == 2) {//行：X,Y
                var x = parseFloat(v[0]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                var y = parseFloat(v[1]) * this.commonInfo.CANVAS_HEIGHT;
                this.lines.push({ "id": this.idCount, "label": this.defaultLabel, "x": x, "y": y, "sep_id": defaultSepID, "annotationFlag": this.UNANNOTATED_SEG })
            } else if(v.length > 2){
                nowID = parseInt(v[0]);
                if (prevID != nowID) {
                    prevID = nowID;
                    this.idCount += 1;
                }
                if (v.length == 3) {//行：ID,X,Y
                    var x = parseFloat(v[1]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[2]) * this.commonInfo.CANVAS_HEIGHT;
                    this.lines.push({ "id": this.idCount, "label": this.defaultLabel, "x": x, "y": y, "sep_id": defaultSepID, "annotationFlag": this.UNANNOTATED_SEG });
                } else if (v.length == 4) {//行：ID,ラベル,X,Y
                    var x = parseFloat(v[2]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[3]) * this.commonInfo.CANVAS_HEIGHT;
                    var l = parseInt(v[1]);
                    //this.lines.push([nowID + this.idCount, parseInt(v[1]), x, y, nowID, this.UNANNOTATED_SEG])
                    this.lines.push({ "id": this.idCount, "label": l, "x": x, "y": y, "sep_id": defaultSepID, "annotationFlag": this.UNANNOTATED_SEG });

                } else if (v.length == 5) {//行：ID,ラベル,X,Y,ID(ANNOTATED_FLAG=0)
                    var x = parseFloat(v[2]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[3]) * this.commonInfo.CANVAS_HEIGHT;
                    var l = parseInt(v[1]);
                    var sepID = parseInt(v[4]);
                    //his.lines.push([nowID + this.idCount,parseInt(v[1]),x,y,nowID,aflag])
                    this.lines.push({ "id": this.idCount, "label": l, "x": x, "y": y, "sep_id": sepID, "annotationFlag": this.UNANNOTATED_SEG });

                } else if (v.length == 6) {//行：ID,ラベル,X,Y,ID,ANNOTATED_FLAG
                    var x = parseFloat(v[2]) / this.commonInfo.wavDuration * this.commonInfo.CANVAS_WIDTH;
                    var y = parseFloat(v[3]) * this.commonInfo.CANVAS_HEIGHT;
                    var sepID = parseInt(v[4]);
                    var aflag = parseInt(v[5]);
                    var l = parseInt(v[1]);
                    this.lines.push({ "id": this.idCount, "label": l, "x": x, "y": y, "sep_id": nowID, "annotationFlag": aflag });
                    //this.lines.push([nowID + this.idCount, parseInt(v[1]), x, y, nowID, aflag]);
                }
            }
        }
        this.idCount += 1;
	    this.drawAllLines();
    }

    loadLabelData(file){
	    //ラベルデータ読み込み
	    //行：X,Y
	    //行：ID,X,Y
	    //行：ID,Label,X,Y
	    var reader = new FileReader();
	    reader.onload=()=>{
		    try {
			    var data = reader.result;
			    this.parseCSVLines(data);
		    } catch (e) {
			    alert(e);
		    }
	    }
	    reader.readAsText(file);
	
    }

    deleteLine(index){
        this.lines.splice(index,1);
    }
    deleteLineID(id){
        var len = this.lines.length - 1;
        for (var i = len; i >= 0; i--){
            if (this.lines[i].id == id) {
                this.lines.splice(i,1);
		    }
	    }
    }
    modifyLabel(id,l){
        var len = this.lines.length - 1;
        var old: number = null;
        var changed = false;
	    for(var i = len; i >= 0; i--){
            if (this.lines[i].id == id) {
                old=this.lines[i].label;
                this.lines[i].label = l;
                this.lines[i].annotationFlag = this.ANNOTATED_SEG;
                changed = true;
            }
        }
        if (changed && this.labelModifiededCallback != null) {
            this.labelModifiededCallback(id, old, l);
        }

    }
    toggleAnnotationFlag(id){
        var len = this.lines.length - 1;
	    for(var i = len; i >= 0; i--){
            if (this.lines[i].id == id) {
                if (this.lines[i].annotationFlag == this.ANNOTATED_SEG) {
                    this.lines[i].annotationFlag = this.UNANNOTATED_SEG
			    }else{
                    this.lines[i].annotationFlag = this.ANNOTATED_SEG
			    }
		    }
	    }
    }
    modifyLabelSucc(id){
        var len = this.lines.length - 1;
        for (var i = len; i >= 0; i--){
            if (this.lines[i].id == id) {
                this.lines[i].label += 1;
                this.lines[i].label = this.lines[i].label % this.lineTypeNum;
                this.lines[i].annotationFlag = this.ANNOTATED_SEG;
		    }
	    }
    }

    nearestLine(x,y){
        var p = this.nearestPoint(x, y);
        return p.event_id;
    }

    nearestPoint(x, y): NearestPointPair{
	    var ni=-1;
	    var nd=this.commonInfo.CANVAS_WIDTH*this.commonInfo.CANVAS_WIDTH+this.commonInfo.CANVAS_HEIGHT*this.commonInfo.CANVAS_HEIGHT;
        for (var i = 0; i < this.lines.length;i++){
            var dx = (x - this.lines[i].x);
            var dy = (y - this.lines[i].y);
		    var dd=dx*dx+dy*dy;
            if (dd < nd) {
                ni = this.lines[i].id;
			    nd=dd;
		    }
	    }
        return { event_id: ni, distance: nd };
    }
    getFirstPoint(seg_id): LabelPoint {
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].id == seg_id) {
                return this.lines[i]
            }
        }
        return null;
    }
    findPoint(seg_id): Array<LabelPoint> {
        var points: Array<LabelPoint> = [];
        for (var i = 0; i < this.lines.length; i++){
            if (this.lines[i].id == seg_id) {
                points.push(this.lines[i]);
		    }
	    }
	    return points;
    }

    findRectPoint(sx, sy, ex, ey) {
	    var points=[];
        for (var i = 0; i < this.lines.length;i++){
            if (sx <= this.lines[i].x && this.lines[i].x <= ex || ex <= this.lines[i].x && this.lines[i].x <= sx ){
                if (sy <= this.lines[i].y && this.lines[i].y <= ey || ey <= this.lines[i].y && this.lines[i].y <= sy) {
                    points.push(this.lines[i].id);
			    }
		    }
        }
        //unique
	    var unique_points=points.filter(function (x, i, self) {
		    return self.indexOf(x) === i;
	    });
        return unique_points;
    }

    modifyLabelRectPoint(sx, sy, ex, ey, l) {
        var list = this.findRectPoint(sx, sy, ex, ey)
        console.log(list)
        for (var j = 0; j < list.length; j++){
            this.modifyLabel(list[j], l);
	    }
    }

    addLine(sx, sy, ex, ey, l) {
	    var vx=ex-sx;
	    var vy=ey-sy;
	    var d=Math.sqrt(vx*vx+vy*vy);
	    var dvx=vx/d;
	    var dvy=vy/d;
	    var rx=0;
	    var ry=0;
	    while(Math.abs(rx)<Math.abs(vx)){
            this.lines.push({ "id": this.idCount, "label": this.defaultLabel, "x": sx + rx, "y": sy + ry, "sep_id": this.idCount, "annotationFlag": this.ANNOTATED_SEG });
            //this.lines.push([this.idCount, this.defaultLabel, sx + rx, sy + ry, this.idCount, this.ANNOTATED_SEG]);
		    rx+=dvx;
		    ry+=dvy;
	    }
        this.idCount+=1;
    }

    buttonLabelOut(){
        var name = this.commonInfo.baseFilename+".csv";
        var res = this.getLabelCSV(this.commonInfo.wavDuration);
	    this.textSave(name, res);
    }

    textSave(name, text) {
	    var blob = new Blob( [text], {type: 'text/plain'} )
	    var link:any = document.createElement('a')
	    link.href = URL.createObjectURL(blob)
	    link.download = name
	    document.body.appendChild(link) // for Firefox
	    link.click()
	    document.body.removeChild(link) // for Firefox
    }
    getLabelCSV(scale) {
	    var out="";
	    for(var i=0;i<this.lines.length;i++){
            var oline = new Array(6);
            oline[0] = this.lines[i].id;
            oline[1] = this.lines[i].label;
            oline[2] = this.lines[i].x / this.commonInfo.CANVAS_WIDTH * scale;
            oline[3] = this.lines[i].y / this.commonInfo.CANVAS_HEIGHT;
            oline[4] = this.lines[i].sep_id;
            oline[5] = this.lines[i].annotationFlag;
            out += oline.join(",") +"\n";
	    }
	    return out;
    }
    outLabelHTML(scale) {
	    var out="";
        for (var i = 0; i < this.lines.length;i++){
            var oline = new Array(6);
            oline[0] = this.lines[i].id;
            oline[1] = this.lines[i].label;
            oline[2] = this.lines[i].x / this.commonInfo.CANVAS_WIDTH * scale;
            oline[3] = this.lines[i].y / this.commonInfo.CANVAS_HEIGHT;
            oline[4] = this.lines[i].sep_id;
            oline[5] = this.lines[i].annotationFlag;
		    out+=oline.join(",")+"<br>";
	    }
	    var info = document.getElementById('outLabel');
	    info.innerHTML=out;
    }

    butttonLabelClear() {
        this.lines=[];
        this.idCount=0;
        this.sX = null;
        this.sY = null;
        this.eX = null;
        this.eY = null;
	    // 座標軸の初期化
	    this.drawInit();
    }
    updateLabelCanvas() {
        this.drawInit();
        this.drawTempPoint();
        this.drawAllLines();
    }
    preloadLabelCanvas() {
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
	    var dragFlag=false;
	    var catchedLineIndex=0;
        var catchedPoint = this.NO_POINT;//0:none 1:start -1 end
        this.canvas.onmousedown = (e: MouseEvent) => {
		    switch(e.button){
		    case 0: //左クリック
                if (!this.editMode){
                    if (this.labelSelectedCallback!=null){
                        var i = this.nearestLine(this.mouseX, this.mouseY);
                        this.labelSelectedCallback(i);
				    }
			    }else{
				    // 座標軸の初期化
                    this.drawInit();
				    // クリック位置のスクリーン座標（mouseX, mouseY）を取得
                    this.calcMouseCoordinate(e);
				    // 始点、終点のスクリーン座標を設定（終点はクリア）
                    this.sX = this.mouseX;
                    this.sY = this.mouseY;
                    this.eX = null;
                    this.eY = null;
				    // 始点の描画
                    this.drawStartPoint();
                    this.drawAllLines();
                    dragFlag = true;
                    this.rectSelect = false;

			    }
			    break;
		    case 1://中クリック
                    if (!this.editMode){
                        this.calcMouseCoordinate(e);
                    var i = this.nearestLine(this.mouseX, this.mouseY);
				    //modifyLabelSucc(i);
                    this.toggleAnnotationFlag(i);
                    this.drawInit();
                    this.drawAllLines();
				    e.preventDefault();
			    }else{
				    // 座標軸の初期化
                    this.drawInit();
                    this.calcMouseCoordinate(e);
                    this.sX = this.mouseX;
                    this.sY = this.mouseY;
                    this.eX = null;
                    this.eY = null;
                    this.drawStartPoint();
                    this.drawAllLines();
				    dragFlag=true;
                    this.rectSelect=true;
				    e.preventDefault();
				    return 0;
			    }
			    break;
		    case 2://右クリック
                if (!this.editMode){
                    this.calcMouseCoordinate(e);
                    var i = this.nearestLine(this.mouseX, this.mouseY);
				    //modifyLabelSucc(i);
                    this.modifyLabel(i, this.defaultLabel);
                    this.drawInit();
                    this.drawAllLines();
			    }else{
                    this.calcMouseCoordinate(e);
                    var i = this.nearestLine(this.mouseX, this.mouseY);
                    this.deleteLineID(i);
			    }
			    break;
			
		    }
	    }

	    // mousemoveイベントの登録
        this.canvas.onmousemove = (e)=> {
		    if(dragFlag){
                if (this.rectSelect){
				    // 座標軸の初期化
                    this.drawInit();
				    // 始点の描画
                    this.drawStartPoint();
				    // 終点の描画
                    this.drawEndPoint();
				    // マウス位置のスクリーン座標（mouseX, mouseY）を取得
                    this.calcMouseCoordinate(e);
				    // マウス位置の点の描画
                    this.drawTempPoint();
                    this.drawAllLines();
                    this.updateLabelCanvas();
				    // draw region 
                    var col = this.lineTypeCol[this.defaultLabel % this.lineTypeCol.length];
                    this.drawRect(this.mouseX - 1, this.mouseY - 1, this.sX + 1, this.sY+1,"#000",1);
                    this.drawRect(this.mouseX + 1, this.mouseY + 1, this.sX - 1, this.sY-1,"#000",1);
                    this.drawRect(this.mouseX, this.mouseY, this.sX, this.sY,col,1);
                } else if (catchedPoint == this.NO_POINT){
				    // 座標軸の初期化
                    this.drawInit();
				    // 始点の描画
                    this.drawStartPoint();
				    // 終点の描画
                    this.drawEndPoint();
				    // マウス位置のスクリーン座標（mouseX, mouseY）を取得
                    this.calcMouseCoordinate(e);
				    // マウス位置の点の描画
                    this.drawTempPoint();
                    this.drawAllLines();
                    this.updateLabelCanvas();
			    }else{
				    // マウス位置のスクリーン座標（mouseX, mouseY）を取得
                    this.calcMouseCoordinate(e);
                    if (catchedPoint == this.S_POINT) {
                        this.lines[catchedLineIndex].x = this.mouseX;
                        this.lines[catchedLineIndex].y = this.mouseY;
				    }
				    // マウス位置の点の描画
                    this.drawInit();
                    this.drawTempPoint();
                    this.drawAllLines();
                    this.updateLabelCanvas();
			    }
		    }else{
                this.drawInit();
                this.calcMouseCoordinate(e);
                this.drawTempPoint();
                this.drawAllLines();
		    }
	    }
        this.canvas.addEventListener("contextmenu", function(e){
		    // デフォルトイベントをキャンセル
		    // これを書くことでコンテキストメニューが表示されなくなります
		    e.preventDefault();
	    }, false);
	    // mouseupイベントの登録（終点、線分を確定）
        this.canvas.onmouseup = (e)=> {
		    switch(e.button){
		    case 0:
			    if(dragFlag){
				    dragFlag=false;
                    if (catchedPoint != this.NO_POINT){
					    catchedLineIndex=0;
                        catchedPoint = this.NO_POINT;
                        this.updateLabelCanvas();
				    }else{
					    // クリック位置のスクリーン座標（mouseX, mouseY）を取得
                        this.calcMouseCoordinate(e);
					    // 終点のスクリーン座標を設定
                        this.eX = this.mouseX;
                        this.eY = this.mouseY;
					    // 終点の描画
                        this.addLine(this.sX, this.sY, this.eX, this.eY, this.defaultLabel);
                        this.idCount+=1;
                        this.updateLabelCanvas();
					    //
				    }
			    }
			    break;
		    case 1:
			    if(dragFlag){
				    dragFlag=false;
                    this.rectSelect=false;
				    // クリック位置のスクリーン座標（mouseX, mouseY）を取得
                    this.calcMouseCoordinate(e);
				    // 終点のスクリーン座標を設定
                    this.eX = this.mouseX;
                    this.eY = this.mouseY;
                    this.modifyLabelRectPoint(this.sX, this.sY, this.eX, this.eY, this.defaultLabel);
				    // 終点の描画
				    //lines.push([idCount,defaultLabel,eX,eY]);
				    //lines.push([idCount,defaultLabel,sX,sY]);
                    this.updateLabelCanvas();
				    //
				    e.preventDefault();
				    return 0;
			    }
			    break;
		    case 2:
			    break;
		    }
	    }

        // mouseoutイベントの登録
        this.canvas.onmouseout = (e: MouseEvent) => {
		    // 座標軸の初期化
            this.drawInit();
		    dragFlag=false;
		    // 始点・終点が共に確定していなければ、一旦クリア
            if (this.sX == null || this.sY == null || this.eX == null || this.eY == null) {
			    this.sX = null;
			    this.sY = null;
			    this.eX = null;
                this.eY = null;
		    }

		    // 始点・終点・線分の描画（始点、終点が確定している時のみ）
		    //drawStartPoint();
		    //drawEndPoint();
            this.drawAllLines();
	    }
    };

    calcMouseCoordinate(e) {
	    // クリック位置の座標計算（canvasの左上を基準。-2ずつしているのはborderの分）
	    var rect = e.target.getBoundingClientRect();
        this.mouseX = e.clientX - Math.floor(rect.left) - 2;
        this.mouseY = e.clientY - Math.floor(rect.top) - 2;
    }

    // 一度canvasをクリアして座標軸を再描画する
    drawInit() {
	    // 一度描画をクリア
        this.ctx.clearRect(0, 0, this.commonInfo.CANVAS_WIDTH, this.commonInfo.CANVAS_HEIGHT);
    }

    // 指定位置に点と座標表示を描画する
    drawPoint(screenX, screenY, color, pointText) {
	    if (pointText === undefined) {
		    pointText = '';
	    }
        this.ctx.fillStyle = color;
	    // 指定位置を中心に円を描画
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 3, 0, Math.PI * 2, false);
        this.ctx.fill();
    }

    // 指定された2つの点から矩形を描画する
    drawRect(firstX, firstY, secondX, secondY, color, width) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
	    // 線分を描画
        this.ctx.strokeRect(firstX, firstY, secondX-firstX,secondY-firstY)
    }


    // 指定された2つの点を結ぶ線分を描画する
    drawLine(firstX, firstY, secondX, secondY, color, width,alpha) {
	    this.ctx.globalAlpha = alpha;
	    this.ctx.strokeStyle = color;
	    this.ctx.lineWidth = width;
	    // 線分を描画
	    this.ctx.beginPath();
	    this.ctx.moveTo(firstX, firstY);
	    this.ctx.lineTo(secondX, secondY);
	    this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    // マウス位置に点を描画する
    drawTempPoint() {
        this.drawPoint(this.mouseX, this.mouseY, '#999',"");

        if (this.sX != null && this.sY != null && this.eX == null && this.eY == null) {
		    // 始点が確定していて、終点が確定していない場合に線分を描画
            this.drawLine(this.sX, this.sY, this.mouseX, this.mouseY, '#999', 1,1.0);
	    }
	    //縦線
        this.drawLine(this.mouseX, 0, this.mouseX,this.commonInfo.CANVAS_HEIGHT , '#999', 1,1.0);
        this.drawLine(0, this.mouseY, this.commonInfo.CANVAS_WIDTH, this.mouseY, '#999', 1, 1.0);
        var cnvsr2 = <HTMLCanvasElement>document.getElementById("waveDisplay2");
        var ctxr2 = cnvsr2.getContext("2d");
        this.commonInfo.audioView.drawSeekBar(undefined);
	    ctxr2.strokeStyle = '#999';
	    ctxr2.lineWidth = 1;
	    ctxr2.beginPath();
        ctxr2.moveTo(this.mouseX, 0);
        ctxr2.lineTo(this.mouseX, this.commonInfo.CANVAS_HEIGHT);
	    ctxr2.stroke()
        if (this.sX != null && this.sY != null && this.eX == null && this.eY == null) {
		    // 始点が確定していて、終点が確定していない場合に線分を描画
            this.drawLine(this.sX, 0, this.sX,this.commonInfo.CANVAS_HEIGHT , '#999', 1,1.0);
		    ctxr2.beginPath();
            ctxr2.moveTo(this.sX, 0);
            ctxr2.lineTo(this.sX, this.commonInfo.CANVAS_HEIGHT);
		    ctxr2.stroke()
	    }
    }

    // 始点を描画する
    drawStartPoint() {
        if (this.sX != null && this.sY != null) {
            this.drawPoint(this.sX, this.sY, '#000', 'Ｓ');
	    }
    }

    // 終点を描画する
    drawEndPoint() {
        if (this.sX != null && this.sY != null && this.eX != null && this.eY != null) {
            this.drawPoint(this.eX, this.eY, '#000', 'Ｅ');
            this.drawLine(this.sX, this.sY, this.eX, this.eY, '#000', 1,1.0);
	    }	
    }
    drawAllLines() {
	    var prevId=null;
        for (var i = 0; i < this.lines.length;i++){
            var col;
            if (this.lines[i].label >= 0) {
                if (this.lines[i].annotationFlag == this.ANNOTATED_SEG) {
                    col = this.lineTypeCol[this.lines[i].label % this.lineTypeCol.length];
			    }else{
                    col = this.lineTypeCol2[this.lines[i].label % this.lineTypeCol2.length];
			    }
		    }else{
			    col='#000'
		    }
            this.drawPoint(this.lines[i].x, this.lines[i].y, col, 'Ｅ');
            if (prevId == this.lines[i].id) {
                this.drawLine(this.lines[i - 1].x, this.lines[i - 1].y, this.lines[i].x, this.lines[i].y,col, 1,1.0);
            }
            prevId = this.lines[i].id;
	    }
    }

}
