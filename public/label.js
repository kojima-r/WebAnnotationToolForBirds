var CANVAS_WIDTH = 1000;		
var CANVAS_HEIGHT = 250;


var S_POINT=1,NO_POINT=0;

var canvas;			// canvas要素(HTMLCanvasElement)
var ctx;			// 2Dコンテキスト(CanvasRenderingContext2D)
var oX;				// 中心Ｏのx座標（スクリーン座標）
var oY;				// 中心Ｏのy座標（スクリーン座標）
var sX = null;		// 始点Ｓのx座標（スクリーン座標）
var sY = null;		// 始点Ｓのy座標（スクリーン座標）
var eX = null;		// 終点Ｅのx座標（スクリーン座標）
var eY = null;		// 終点Ｅのy座標（スクリーン座標）
var mouseX;			// ドラッグされている位置のx座標
var mouseY;			// ドラッグされている位置のy座標
var lines=[];
var defaultLabel=0;
var lineTypeCol=['#0f0','#f00','#00f'];
var lineTypeCol2=['#0f0','#f00','#00f'];
var lineTypeNum=3;
var editMode=false;
var idCount=0;
var labelSelectedCallback=null
var rectSelect=false;

UNANNOTATED_SEG=0
ANNOTATED_SEG=1

function normalizeLinePositionW(w){
	for(var i=0;i<lines.length;i++){
		lines[i][0]*=w;
		lines[i][2]*=w;
	}
}

function loadLabelDataServer(path){
	var oReq = new XMLHttpRequest();
	oReq.open("GET", path, true);
	oReq.responseType = "text";
	oReq.onload = function (oEvent) {
		list = oReq.responseText;
		parseCSVLines(list);
	};
	oReq.send(null);
}
function parseCSVLines(text){
	arr=text.split("\n");
	prevID=null
	maxID=0;
	for(var i=0;i<arr.length;i++){
		v=arr[i].split(",");
		if(v.length==2){//行：X,Y
			var x=parseFloat(v[0])/wavDuration*CANVAS_WIDTH;
			var y=parseFloat(v[1])*CANVAS_HEIGHT;
			lines.push([idCount,defaultLabel,x,y])
		}else if(v.length==3){//行：ID,X,Y
			var x=parseFloat(v[1])/wavDuration*CANVAS_WIDTH;
			var y=parseFloat(v[2])*CANVAS_HEIGHT;
			var nowID=parseInt(v[0]);
			if(prevID!=nowID){
				count=0;
			}
			//if(count%5==0){
			lines.push([nowID+idCount,x,y,nowID,UNANNOTATED_SEG])
			//}
			count+=1;
			if(maxID<nowID){
				maxID=nowID
			}
			prevID=nowID;
		}else if(v.length==4){//行：ID,ラベル,X,Y
			var x=parseFloat(v[2])/wavDuration*CANVAS_WIDTH;
			var y=parseFloat(v[3])*CANVAS_HEIGHT;
			var nowID=parseInt(v[0]);
			if(prevID!=nowID){
				count=0;
			}
			//if(count%5==0){
			lines.push([nowID+idCount,parseInt(v[1]),x,y,nowID,UNANNOTATED_SEG])
			//}
			if(maxID<nowID){
				maxID=nowID
			}
			count+=1;
			prevID=nowID;
		}else if(v.length==6){//行：ID,ラベル,X,Y,ID,ANNOTATED_FLAG
			var x=parseFloat(v[2])/wavDuration*CANVAS_WIDTH;
			var y=parseFloat(v[3])*CANVAS_HEIGHT;
			var nowID=parseInt(v[4]);
			if(prevID!=nowID){
				count=0;
			}
			//if(count%5==0){
			lines.push([nowID+idCount,parseInt(v[1]),x,y,nowID,parseInt(v[5])])
			//}
			if(maxID<nowID){
				maxID=nowID
			}
			count+=1;
			prevID=nowID;
		}
	}
	idCount+=maxID+1
	console.log(lines);
	console.log(wavDuration);
	console.log(CANVAS_WIDTH);
	drawAllLines();
	
}
function loadLabelData(file){
	//ラベルデータ読み込み
	//行：X,Y
	//行：ID,X,Y
	//行：ID,Label,X,Y
	var reader = new FileReader();
	reader.onload=function(){
		try {
			var data = reader.result;
			parseCSVLines(data);
		} catch (e) {
			alert(e);
		}
	}
	reader.readAsText(file);
	
}

function deleteLine(index){
	lines.splice(index,1);
}
function deleteLineID(id){
	var len = lines.length - 1;
	for(var i = len; i >= 0; i--){
		if(lines[i][0] == id){
			lines.splice(i,1);
		}
	}
}
function modifyLabel(id,l){
	var len = lines.length - 1;
	for(var i = len; i >= 0; i--){
		if(lines[i][0] == id){
			lines[i][1]=l;
			lines[i][5]=ANNOTATED_SEG;
		}
	}
}
function toggleAnnotationFlag(id){
	var len = lines.length - 1;
	for(var i = len; i >= 0; i--){
		if(lines[i][0] == id){
			if(lines[i][5]==ANNOTATED_SEG){
				lines[i][5]=UNANNOTATED_SEG
			}else{
				lines[i][5]=ANNOTATED_SEG
			}
		}
	}
}
function modifyLabelSucc(id){
	var len = lines.length - 1;
	for(var i = len; i >= 0; i--){
		if(lines[i][0] == id){
			lines[i][1]+=1;
			lines[i][1]=lines[i][1]%lineTypeNum;
			lines[i][5]=ANNOTATED_SEG;
		}
	}
}

function nearestLine(x,y){
	p=nearestPoint(x,y);
	return p[0];
}


function nearestPoint(x,y){
	var ni=-1;
	var nd=CANVAS_WIDTH*CANVAS_WIDTH+CANVAS_HEIGHT*CANVAS_HEIGHT;
	for(var i=0;i<lines.length;i++){
		var dx=(x-lines[i][2]);
		var dy=(y-lines[i][3]);
		var dd=dx*dx+dy*dy;
		if(dd<nd){
			ni=lines[i][0];
			nd=dd;
		}
	}
	return [ni,nd];
}
function findPoint(seg_id){
	var points=[];
	for(var i=0;i<lines.length;i++){
		if(lines[i][0]==seg_id){
			points.push(lines[i]);
		}
	}
	return points;
}
function findRectPoint(sx,sy,ex,ey){
	var points=[];
	for(var i=0;i<lines.length;i++){
		if(sx<=lines[i][2]&&lines[i][2]<=ex || ex<=lines[i][2]&&lines[i][2]<=sx ){
			if(sy<=lines[i][3]&&lines[i][3]<=ey || ey<=lines[i][3]&&lines[i][3]<=sy ){
				points.push(lines[i][0]);
			}
		}
	}
	points.filter(function (x, i, self) {
		return self.indexOf(x) === i;
	});
	return points;
}
function modifyLabelRectPoint(sx,sy,ex,ey,l){
	list=findRectPoint(sx,sy,ex,ey)
	var len = lines.length - 1;
	for(var i = len; i >= 0; i--){
		for(var j=0;j<list.length;j++){
			if(lines[i][0] == list[j]){
				lines[i][1]=l;
				lines[i][5]=ANNOTATED_SEG;
			}
		}
	}
}
function addLine(sx,sy,ex,ey,l){
	var vx=ex-sx;
	var vy=ey-sy;
	var d=Math.sqrt(vx*vx+vy*vy);
	var dvx=vx/d;
	var dvy=vy/d;
	console.log(dvx)
	console.log(dvy)
	var rx=0;
	var ry=0;
	while(Math.abs(rx)<Math.abs(vx)){
		lines.push([idCount,defaultLabel,sx+rx,sy+ry,idCount,ANNOTATED_SEG]);
		rx+=dvx;
		ry+=dvy;
	}
	idCount+=1;
}

function buttonLabelOut(){
	var name=baseFilename+".csv";
	res=getLabelCSV(wavDuration);
	textSave(name, res);
}

function textSave(name, text) {
	var blob = new Blob( [text], {type: 'text/plain'} )
	var link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = name
	document.body.appendChild(link) // for Firefox
	link.click()
	document.body.removeChild(link) // for Firefox
}
getLabelCSV = function(scale) {
	out="";
	for(var i=0;i<lines.length;i++){
		oline=new Array(lines[i].length);
		oline[0]=lines[i][0];
		oline[1]=lines[i][1];
		oline[2]=lines[i][2]/CANVAS_WIDTH*scale;
		oline[3]=lines[i][3]/CANVAS_HEIGHT;
		oline[4]=lines[i][4];
		oline[5]=lines[i][5];
		out+=oline.join(",")+"\n";
	}
	return out;
}
outLabelHTML = function(scale) {
	out="";
	for(var i=0;i<lines.length;i++){
		oline=new Array(lines[i].length);
		oline[0]=lines[i][0];
		oline[1]=lines[i][1];
		oline[2]=lines[i][2]/CANVAS_WIDTH*scale;
		oline[3]=lines[i][3]/CANVAS_HEIGHT;
		oline[4]=lines[i][4];
		oline[5]=lines[i][5];
		out+=oline.join(",")+"<br>";
	}
	var info = document.getElementById('outLabel');
	info.innerHTML=out;
}

butttonLabelClear= function() {
	lines=[];
	idCount=0;
	sX = null;
	sY = null;
	eX = null;
	eY = null;
	// 座標軸の初期化
	drawInit();
}
updateLabelCanvas = function() {
	drawInit();
	drawTempPoint();
	drawAllLines();
}
preloadLabelCanvas = function() {
	// canvas要素を取得し、サイズ設定
	canvas = document.getElementById('waveDisplayL');
	CANVAS_WIDTH=canvas.width;
	CANVAS_HEIGHT=canvas.height;
	oX = Math.ceil(CANVAS_WIDTH / 2);
	oY = Math.ceil(CANVAS_HEIGHT / 2);

	// 描画のために2Dコンテキスト取得
	ctx = canvas.getContext('2d');

	// 座標軸の初期化
	drawInit();
	
	// mousedownイベントの登録（始点の確定）
	var dragFlag=false;
	var catchedLineIndex=0;
	var catchedPoint=NO_POINT;//0:none 1:start -1 end
	canvas.onmousedown = function(e) {
		switch(e.button){
		case 0: //左クリック
			if(!editMode){
				if(labelSelectedCallback!=null){
					var i=nearestLine(mouseX,mouseY);
					labelSelectedCallback(i);
				}
			}else{
				// 座標軸の初期化
				drawInit();
				// クリック位置のスクリーン座標（mouseX, mouseY）を取得
				calcMouseCoordinate(e);
				// 始点、終点のスクリーン座標を設定（終点はクリア）
				sX = mouseX;
				sY = mouseY;
				eX = null;
				eY = null;
				// 始点の描画
				drawStartPoint();
				drawAllLines();
				dragFlag=true;
			}
			break;
		case 1://中クリック
			if(!editMode){
				calcMouseCoordinate(e);
				var i=nearestLine(mouseX,mouseY);
				//modifyLabelSucc(i);
				toggleAnnotationFlag(i);
				drawInit();
				drawAllLines();
				e.preventDefault();
			}else{
				// 座標軸の初期化
				drawInit();
				calcMouseCoordinate(e);
				sX = mouseX;
				sY = mouseY;
				eX = null;
				eY = null;
				drawStartPoint();
				drawAllLines();
				dragFlag=true;
				rectSelect=true;
				e.preventDefault();
				return 0;
			}
			break;
		case 2://右クリック
			if(!editMode){
				calcMouseCoordinate(e);
				var i=nearestLine(mouseX,mouseY);
				//modifyLabelSucc(i);
				modifyLabel(i,defaultLabel);
				drawInit();
				drawAllLines();
			}else{
				calcMouseCoordinate(e);
				var i=nearestLine(mouseX,mouseY);
				deleteLineID(i);
			}
			break;
			
		}
	}

	// mousemoveイベントの登録
	canvas.onmousemove = function(e) {
		if(dragFlag){
			if(rectSelect){
				// 座標軸の初期化
				drawInit();
				// 始点の描画
				drawStartPoint();
				// 終点の描画
				drawEndPoint();
				// マウス位置のスクリーン座標（mouseX, mouseY）を取得
				calcMouseCoordinate(e);
				// mouseX,sX,
				drawRect(mouseX,mouseY,sX,sY,'#999',1);
				// マウス位置の点の描画
				drawTempPoint();
				drawAllLines();
				updateLabelCanvas();
				return 0;
			}else if(catchedPoint==NO_POINT){
				// 座標軸の初期化
				drawInit();
				// 始点の描画
				drawStartPoint();
				// 終点の描画
				drawEndPoint();
				// マウス位置のスクリーン座標（mouseX, mouseY）を取得
				calcMouseCoordinate(e);
				// マウス位置の点の描画
				drawTempPoint();
				drawAllLines();
				updateLabelCanvas();
			}else{
				// マウス位置のスクリーン座標（mouseX, mouseY）を取得
				calcMouseCoordinate(e);
				if(catchedPoint==S_POINT){
					lines[catchedLineIndex][2]=mouseX;
					lines[catchedLineIndex][3]=mouseY;
				}
				// マウス位置の点の描画
				drawInit();
				drawTempPoint();
				drawAllLines();
				updateLabelCanvas();
			}
		}else{
			drawInit();
			calcMouseCoordinate(e);
			drawTempPoint();
			drawAllLines();
		}
	}
	canvas.addEventListener("contextmenu", function(e){
		// デフォルトイベントをキャンセル
		// これを書くことでコンテキストメニューが表示されなくなります
		e.preventDefault();
	}, false);
	// mouseupイベントの登録（終点、線分を確定）
	canvas.onmouseup = function(e) {
		console.log(e.button)
		switch(e.button){
		case 0:
			if(dragFlag){
				dragFlag=false;
				if(catchedPoint!=NO_POINT){
					catchedLineIndex=0;
					catchedPoint=NO_POINT;
					updateLabelCanvas();
				}else{
					// クリック位置のスクリーン座標（mouseX, mouseY）を取得
					calcMouseCoordinate(e);
					// 終点のスクリーン座標を設定
					eX = mouseX;
					eY = mouseY;
					// 終点の描画
					addLine(sX,sY,eX,eY,defaultLabel)
					idCount+=1;
					console.log(lines);
					updateLabelCanvas();
					//
				}
			}
			break;
		case 1:
			if(dragFlag){
				dragFlag=false;
				rectSelect=false;
				// クリック位置のスクリーン座標（mouseX, mouseY）を取得
				calcMouseCoordinate(e);
				// 終点のスクリーン座標を設定
				eX = mouseX;
				eY = mouseY;
				modifyLabelRectPoint(sX,sY,eX,eY,defaultLabel);
				// 終点の描画
				//lines.push([idCount,defaultLabel,eX,eY]);
				//lines.push([idCount,defaultLabel,sX,sY]);
				updateLabelCanvas();
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
	canvas.onmouseout = function(e) {
		// 座標軸の初期化
		drawInit();
		dragFlag=false;
		// 始点・終点が共に確定していなければ、一旦クリア
		if (sX == null || sY == null || eX == null || eY == null) {
			sX = null;
			sY = null;
			eX = null;
			eY = null;
		}

		// 始点・終点・線分の描画（始点、終点が確定している時のみ）
		//drawStartPoint();
		//drawEndPoint();
		drawAllLines();
	}
};

function calcMouseCoordinate(e) {
	// クリック位置の座標計算（canvasの左上を基準。-2ずつしているのはborderの分）
	var rect = e.target.getBoundingClientRect();
	mouseX = e.clientX - Math.floor(rect.left) - 2;
	mouseY = e.clientY - Math.floor(rect.top) - 2;
}

// 一度canvasをクリアして座標軸を再描画する
function drawInit() {
	// 一度描画をクリア
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// 指定位置に点と座標表示を描画する
function drawPoint(screenX, screenY, color, pointText) {
	if (pointText === undefined) {
		pointText = '';
	}
	ctx.fillStyle = color;
	// 指定位置を中心に円を描画
	ctx.beginPath();
	ctx.arc(screenX, screenY, 3, 0, Math.PI * 2, false);
	ctx.fill();
}

// 指定された2つの点から矩形を描画する
function drawRect(firstX, firstY, secondX, secondY, color, width) {
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	// 線分を描画
	ctx.strokeRect(firstX, firstY, secondX-firstX,secondY-firstY)
}


// 指定された2つの点を結ぶ線分を描画する
function drawLine(firstX, firstY, secondX, secondY, color, width,alpha) {
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	// 線分を描画
	ctx.beginPath();
	ctx.moveTo(firstX, firstY);
	ctx.lineTo(secondX, secondY);
	ctx.stroke();
	ctx.globalAlpha = 1.0;
}

// マウス位置に点を描画する
function drawTempPoint() {
	drawPoint(mouseX, mouseY, '#999');
	if (sX != null && sY != null && eX == null && eY == null) {
		// 始点が確定していて、終点が確定していない場合に線分を描画
		drawLine(sX, sY, mouseX, mouseY, '#999', 1,1.0);
	}
	//縦線
	drawLine(mouseX, 0, mouseX,CANVAS_HEIGHT , '#999', 1,1.0);
	drawLine(0, mouseY, CANVAS_WIDTH,mouseY , '#999', 1,1.0);
	var ctxr2=document.getElementById("waveDisplay2").getContext("2d");
	drawSeekBar();
	ctxr2.strokeStyle = '#999';
	ctxr2.lineWidth = 1;
	ctxr2.beginPath();
	ctxr2.moveTo(mouseX, 0);
	ctxr2.lineTo(mouseX, CANVAS_HEIGHT);
	ctxr2.stroke()
	if (sX != null && sY != null && eX == null && eY == null) {
		// 始点が確定していて、終点が確定していない場合に線分を描画
		drawLine(sX, 0, sX,CANVAS_HEIGHT , '#999', 1,1.0);
		ctxr2.beginPath();
		ctxr2.moveTo(sX, 0);
		ctxr2.lineTo(sX, CANVAS_HEIGHT);
		ctxr2.stroke()
	}
}

// 始点を描画する
function drawStartPoint() {
	if (sX != null && sY != null) {
		drawPoint(sX, sY, '#000', 'Ｓ');
	}
}

// 終点を描画する
function drawEndPoint() {
	if (sX != null && sY != null && eX != null && eY != null) {
		drawPoint(eX, eY, '#000', 'Ｅ');
		drawLine(sX, sY, eX, eY, '#000', 1,1.0);
	}	
}

function drawAllLines() {
	prevId=null;
	for(var i=0;i<lines.length;i++){
		var col;
		if(lines[i][1]>=0){
			if(lines[i][5]==ANNOTATED_SEG){
				col=lineTypeCol[lines[i][1]%lineTypeCol.length];
			}else{
				col=lineTypeCol2[lines[i][1]%lineTypeCol2.length];
			}
		}else{
			col='#000'
		}
		drawPoint(lines[i][2], lines[i][3],col, 'Ｅ');
		if(prevId==lines[i][0]){
			drawLine(lines[i-1][2],lines[i-1][3],lines[i][2],lines[i][3],col, 1,1.0);
		}
		prevId=lines[i][0];
	}
}
