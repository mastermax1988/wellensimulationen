var lambda, T;
var waveEmitter = [];
function waveTroughInit()
{
	waveEmitter = [];
	waveEmitter.push({x: map.width / 3, y: map.height / 2});
	waveEmitter.push({x: 2 * map.width / 3, y: map.height / 2});
	lambda = 120,
	T = 3;
	console.log("init");
	var mainSvg = d3.select("#mainSvg");
	if(mainSvg.attr("data") != "clear")
		clearSvg();
	fillCircles();
	mainSvg.attr("data", "wavetrough");
}
var res = 10;
function fillCircles()
{
	var mainSvg = d3.select("#mainSvg");
	var data = [];
	for(var x = 0; x < map.width / res - 1; x++)
		for(var y = 0; y < map.height / res - 1; y++)
			data.push({id : "svgRect_" + x + "_" + y, x : x * res, y : y * res});
	mainSvg.selectAll("rect").data(data).enter().append("rect").attr("height", res).attr("width", res).attr("x", function(d) {
		return d.x;
	}).attr("y", function(d) {
		return d.y;
	}).attr("id", function(d) {
		return d.id;
	});

	//mainSvg.append("rect").attr("height",40).attr("width",40).attr("x",x*40).attr("y",y*40).attr("id","svgCircle");

}
function getWaveColor(x, y, t)
{
	var a = 0;
	for(var i = 0; i < waveEmitter.length; i++)
		a += Math.sin(2 * Math.PI * (t / T - (Math.sqrt(Math.pow(x - waveEmitter[i].x, 2) + Math.pow(y -  waveEmitter[i].y, 2))) / lambda));
	a /= waveEmitter.length;
	a /= 2;
	a += 0.5;
	a *= 255;
	a = Math.round(a);
	var s = "rgb(" + a + "," + a + "," + a + ")";
	return s;
}
function drawWaveTrough()
{
	if(d3.select("#mainSvg").attr("data") != "wavetrough")
		waveTroughInit();
	var t = time;
	d3.selectAll("rect").attr("fill", function (d) {
		return getWaveColor(d.x, d.y, t);
	});
}

function waveTroughTimer()
{
  time = new Date().getTime()/1000-time_start; 
  drawWaveTrough();
  if(requiredSimulation=="wavet_svg")
    requestAnimFrame(waveTroughTimer);
  else
    clearSvg();
}
