var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 250;
graphData=[]
function loadGraph(path,callbackFunc) {
	var oReq = new XMLHttpRequest();
	oReq.open("GET", path, true);
	oReq.responseType = "text";
	oReq.onload = function (oEvent) {
		list = oReq.responseText;
		arr=list.split("\n");
		graphData=[]
		for(var i=0;i<arr.length;i++){
			v=arr[i].split(",");
			var vec=[]
			for(var j=0;j<v.length;j++){
				vec.push(parseFloat(v[j]))
			}
			graphData.push(vec);
		}
		callbackFunc(graphData);
	};
	oReq.send(null);
}
function initializeGraph(){
	loadGraph("out.csv"+"?" + new Date().getTime(),function(graphData){
		var intervalMean=0;
		canvas = document.getElementById('waveDisplayL2');
		var ctx=canvas.getContext('2d');
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
		// 指定された2つの点を結ぶ線分を描画する
		function drawLine(firstX, firstY, secondX, secondY, color, width) {
			ctx.strokeStyle = color;
			ctx.lineWidth = width;
			// 線分を描画
			ctx.beginPath();
			ctx.moveTo(firstX, firstY);
			ctx.lineTo(secondX, secondY);
			ctx.stroke();
		}
		//画像の表示間隔計算
		console.log(graphData);
		var step=CANVAS_WIDTH*10.0/(wavDuration*1000.0)
		console.log(step)
		var MinVerticalPos=CANVAS_HEIGHT-10
		var MaxVerticalPos=10
		var Num=4
		var Scale=(MinVerticalPos-MaxVerticalPos)/Num;
		var col=['#0f0','#f00','#00f','#0ff','#ff0','#f0f','#080','#800','#008','#f80','#80f','#0f8'];
		for(var i=0;i<Num;i++){
			var x=0
			for(var j=0;j<graphData.length-1;j++){
				drawLine(x,MinVerticalPos-graphData[j][i]*Scale,x+step,MinVerticalPos-graphData[j+1][i]*Scale,col[i],1);
				x+=step
			}
		}
	});
}



