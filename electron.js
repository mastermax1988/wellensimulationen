var e_lambda = 350E-9,
		e_k = 2 * Math.PI / e_lambda,
		e_b = 0.1E-3,
		e_a = 0.7E-3,
    e_dist=10;
    e_maxangle=Math.atan(0.2/2/e_dist);
		//e_maxangle = 0.002 * Math.PI;
var theDots, allDots;
function initEl()
{
	theDots = [];
}
//console.log(getIntensity(0.01));
function generateDot()
{
	var mainSvg = d3.select("#mainSvg");
	while(true)
	{
		var _x = Math.random();
		var _y = 0.05 * Math.random() + 0.9;
		if(Math.pow(getIntensity(_x * e_maxangle * 2 - e_maxangle), 2) < Math.random()) continue;
		theDots.push({x: _x, y: _y});
		try {
			mainSvg.selectAll("circle").data(theDots).enter().append("circle").attr("cy", _y * map.height).attr("cx", _x * map.width).attr("r", 2).attr("fill", "red").attr('id', 'dot');
		}
		catch(e) {
			console.log(e);
		};
		break;
	}
}
function delDots()
{
	var mainSvg = d3.select("#mainSvg");
	console.log("del");
	mainSvg.selectAll("circle").remove();
	updateIntensity2();
}
function getIntensity(alpha) {
	var kx = e_k * Math.sin(alpha),
			gamma = kx / 2.*e_b,
			delta = kx / 2.*e_a;
  var val=Math.pow((Math.sin(gamma) / gamma), 2) * Math.pow(Math.cos(delta), 2);
  if(isNaN(val))
    return 1;
	return val;
}
function plotIntensity()
{
	var mainSvg = d3.select("#mainSvg");
	var theIntensity = [];
	for(var i = 0; i < map.width; i++)
		theIntensity.push({"x": i, "y": map.height - getIntensity(i / map.width*e_maxangle * 2 - e_maxangle)*map.height});
  var lineData=[];
for(var i=0;i<map.width;i++)
    lineData.push({"x":i, "y":2000*Math.random()});

	var interpolateFunction = d3.svg.line()
    .x(function(d) {
		return d.x;
	}).y(function(d) {
		return d.y;
	}).interpolate("linear");
	mainSvg.append("path").attr("d", interpolateFunction(theIntensity)).attr("stroke", "blue").attr("stroke-width", 2).attr("fill", "none").attr("id", "intensity");


}
function elTimer()
{
  if(requiredSimulation=="el")  
	  generateDot();
	if(!bStopElTimer && requiredSimulation=="el")
  {
		requestAnimationFrame(elTimer);
    return;
  }
  
	bElTimerRunning = false;
}
var bElTimerRunning = false;
function startElTimer()
{
	delDots();
	if(bElTimerRunning)
		return;
  bElTimerRunning=true;
	bStopElTimer = false;
	elTimer();
}
var bStopElTimer = false;
function stopElTimer()
{
	bStopElTimer = true;
}

var bPlotIntensity = false;
function updateIntensity(showIt)
{
	bPlotIntensity = showIt;
  if(bPlotIntensity)
  {
    d3.selectAll("#intensity").remove();
    plotIntensity();
  }
	d3.selectAll("#intensity").attr("stroke-width", bPlotIntensity ? 2 : 0);
}
function updateIntensity2()
{
	updateIntensity(bPlotIntensity);
}


