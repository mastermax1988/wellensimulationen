simFunct = doNothing;
var requiredSimulation = null;
var time = 0;
var time_start = 0;

function doNothing() {}


function clearSvg()
{
	var mainSvg = d3.select("#mainSvg");
	mainSvg.selectAll("*").remove();
	mainSvg.attr("data", "clear");
	console.log("clear");
}



