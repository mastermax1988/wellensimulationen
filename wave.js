var theBalls;
var connections;
var kindOfWave = "wave1";
function initWave()
{
	clearSvg();
	chain_lastTime = 0;
	chain_elapsed = 0;
	time_superpos_elapsed = 0;
	superpos_running = false;
	initBallData();
	var mainSvg = d3.select("#mainSvg");
	mainSvg.selectAll("#theCircles").remove();
	mainSvg.selectAll("#axis").remove();
	mainSvg.selectAll("#helpline").remove();
	mainSvg.selectAll("#connection").remove();
	mainSvg.selectAll("circle").data(theBalls).enter().append("circle").attr("cx", function(d) {
		return d.x;
	}).attr("cy", function(d) {
		return d.y;
	}).attr("r", function(d) {
		return d.r;
	}).attr("fill", function(d) {
		return d.col;
	}).attr("id", function(d) {
		return d.id;
	}).on("click", function (d) {
		ballClicked(d);
	});
	if(wave_drawhl)
		mainSvg.selectAll("line").data(theBalls).enter().append("line").attr("x1", function(d) {
		return d.x;
	}).attr("x2", function(d) {
		return d.x;
	}).attr("y1", map.height / 2).attr("y2", function(d) {
		return d.y;
	}).attr("style", "stroke:rgb(0,0,0);stroke-width:2").attr("id", "helpline");
	if(wave_connect)
	{
		initConnectionData();
		mainSvg.selectAll("line").data(connections).enter().append("line").attr("x1", function(d) {
			return d.x1;
		}).attr("x2", function(d) {
			return d.x2;
		}).attr("y1", function(d) {
			return d.y1;
		}).attr("y2", function(d) {
			return d.y2;
		}).attr("style", function(d) {
			return ("stroke:" + d.col + ";stroke-width:" + wave_r);
		}).attr("id", "connection");
	}
	mainSvg.append("line").attr("x1", 0).attr("x2", map.width).attr("y1", map.height / 2).attr("y2", map.height / 2).attr("style", "stroke:rgb(0,0,0);stroke-width:2").attr("id", "axis");
	mainSvg.append("line").attr("x1", 2 * wave_r + 1).attr("x2", 2 * wave_r + 1).attr("y1", map.height).attr("y2", 0).attr("style", "stroke:rgb(0,0,0);stroke-width:2").attr("id", "axis");
	for(var i = 0; i < 5; i++)
	{
		mainSvg.append("line").attr("x1", 2 * wave_r - 9).attr("x2", 2 * wave_r + 11).attr("y1", map.height * i / 4).attr("y2", map.height * i / 4).attr("style", "stroke:rgb(0,0,0);stroke-width:2").attr("id", "axis");
		if(2 - i == 0)
			mainSvg.append("text").attr("x", 2 * wave_r + 5).attr("y", map.height / 2 + 25).attr("font-size", "20px").html(2 - i);
		else
			mainSvg.append("text").attr("x", 2 * wave_r + 11).attr("y", map.height * i / 4 + 5).attr("font-size", "20px").html(2 - i);
	}
	for(var i = 0; i < map.width / (map.height / 4); i++)
	{
		mainSvg.append("line").attr("x1", 2 * wave_r + 1 + i * map.height / 4).attr("x2", 2 * wave_r + 1 + i * map.height / 4).attr("y1", map.height / 2 + 10).attr("y2", map.height / 2 - 10).attr("style", "stroke:rgb(0,0,0);stroke-width:2").attr("id", "axis");
		if(i != 0)
			mainSvg.append("text").attr("x", 2 * wave_r + i * map.height / 4 - 5).attr("y", map.height / 2 + 30).attr("font-size", "20px").html(i);
	}

	restartWaveTimer();
}
function initConnectionData()
{
	connections = [];
	var bSuper = kindOfWave == "superpos";
	for(var i = 0; i < theBalls.length - (bSuper ? 3 : 1); i++)
	{
		if(!bSuper)
			connections.push({x1: theBalls[i].x, x2: theBalls[i + 1].x, y1: theBalls[i].y, y2: theBalls[i + 1].y, col: theBalls[i].col, r: wave_r});
		else
		{
			var r = 0;
			if((i % 3 == 0 && w1) || (i % 3 == 1 && w2) || (i % 3 == 2 && w3))
				r = wave_r;
			connections.push({x1: theBalls[i].x, x2: theBalls[i + 3].x, y1: theBalls[i].y, y2: theBalls[i + 3].y, col: theBalls[i].col, r: r});
		}
	}
}
function updateConnectionData()
{
	var bSuper = (kindOfWave == "superpos");
	if(bSuper)
	{
		var r = [w1 ? wave_r : 0, w2 ? wave_r : 0, wave_r];
		for(var i = 0; i < theBalls.length - 3; i++)
		{
			connections[i].y1 = theBalls[i].y;
			connections[i].y2 = theBalls[i + 3].y;
			r[2] = 0;
			if(i % 3 == 2 && w3 && theBalls[i].y != map.height / 2)
			{
				if((w1 && (theBalls[i - 1].y != map.height / 2 || theBalls[i + 2].y != map.height / 2) && w2 && (theBalls[i - 2].y != map.height / 2 || theBalls[i + 1].y != map.height / 2)) || (w1 && (theBalls[i - 1].y != map.height / 2 || theBalls[i + 2].y != map.height / 2) && !w2 ) || (!w1 && w2 && (theBalls[i - 2].y != map.height / 2 || theBalls[i + 1].y != map.height / 2)) || (!w1 && !w2))
				{
					r[2] = wave_r;
					connections[i > 2 ? i - 3 : i].r = wave_r;
				}
			}
			connections[i].r = r[i % 3];
			connections.col = theBalls[i].col;
		}
	}
	else
		for(var i = 0; i < theBalls.length - 1; i++)
		{
			connections[i].y1 = theBalls[i].y;
			connections[i].y2 = theBalls[i + 1].y;
		}
}
function initBallData()
{
	theBalls = [];
	for(var i = 0; i < map.width / (2 * wave_r + 1) - 1; i++)
	{
		theBalls.push({x: (i + 1) * (2 * wave_r + 1), y: map.height / 2, vy: 0, id: "theBalls", col: "red", r: ((kindOfWave != "superpos" || w1) ? wave_r : 0)});
		if(kindOfWave == "superpos")
		{
			theBalls.push({x: (i + 1) * (2 * wave_r + 1), y: map.height / 2, vy: 0, id: "theBalls2", col: "blue", r: (w2 ? wave_r : 0)});
			theBalls.push({x: (i + 1) * (2 * wave_r + 1), y: map.height / 2, vy: 0, id: "theBalls3", col: "green", r: 0});
		}
	}
}
function updateBalls()
{
	var mainSvg = d3.select("#mainSvg");
	for(var i = 0; i < theBalls.length; i++)
	{
		theBalls[i].y = wave_A * (-map.height / 4 + map.height / 2) * Math.sin(2 * Math.PI * (time / wave_T -  (theBalls[i].x - theBalls[0].x) / map.height * 4 / wave_lambda)) + map.height / 2;
	}
	mainSvg.selectAll("circle").data(theBalls).attr("cy", function(d) {
		return d.y;
	});
	mainSvg.selectAll("#helpline").data(theBalls).attr("y2", function(d) {
		return d.y;
	});
	if(wave_connect)
	{
		updateConnectionData();
		mainSvg.selectAll("#connection").data(connections).attr("y1", function(d) {
			return d.y1;
		}).attr("y2", function(d) {
			return d.y2;
		})
	}
}
function startChain()
{
	initWave();

}
var chain_lastTime, chain_elapsed;
function updateChain()
{
	var mainSvg = d3.select("#mainSvg");
	for(var i = 0; i < theBalls.length; i++)
	{
		if(theBalls[i].vy != 0)
		{
			theBalls[i].y = theBalls[i].vy * chain_elapsed + map.height / 2;
			theBalls[i].vy = ((theBalls[i].y - map.height / 2) * 100 * chain_elapsed) / 1;
		}
	}
	mainSvg.selectAll("circle").data(theBalls).attr("cy", function(d) {
		return d.y;
	});
}
function ballClicked(d)
{
	if(kindOfWave != "wave_chain")
		return;
	for(var i = 0; i < theBalls.length; i++)
		if(theBalls[i].x == d.x)
			theBalls[i].vy = 100;
}
var time_superpos_elapsed, time_superpos_start;
var superpos_running = false;
function startSuperpos()
{
	time_superpos_start = new Date().getTime() / 1000 - time_start;
	superpos_running = true;
	restartWaveTimer();
}

function updateSuperpos()
{
	var mainSvg = d3.select("#mainSvg");
	superpos_running = false;
	for(var i = 0; i < theBalls.length; i++)
	{
		if(i % 3 != 2)
		{
			var bBall1 = (theBalls[i].id == "theBalls");
			var sinarg = 2 * Math.PI * (time_superpos_elapsed / (bBall1 ? wave_T : wave_T2) -  (theBalls[i].x - theBalls[0].x) / map.height * 4 / (bBall1 ? wave_lambda : wave_lambda2));
			var i2 = ((!wave_opposing || bBall1) ? i : theBalls.length - 1 - i);
			if((wave_init && sinarg < 0) || (wave_impuls ? 1 : 0)*sinarg > Math.PI)
				theBalls[i2].y = map.height / 2;
			else
			{
				theBalls[i2].y = -(bBall1 ? wave_A : wave_A2) * (-map.height / 4 + map.height / 2) * Math.sin(sinarg + (bBall1 ? 0 : wave_phi)) + map.height / 2;
				superpos_running = true;
			}
			theBalls[i2].r = bBall1 ? w1 ? wave_r : 0 : w2 ? wave_r : 0;
		}
	}
	for(var i = 2; i < theBalls.length; i += 3)
	{
		theBalls[i].y = theBalls[i - 1].y + theBalls[i - 2].y - map.height / 2;
		if(!w3 || (w1 && theBalls[i - 1].y == map.height / 2) || (w2 && theBalls[i - 2].y == map.height / 2))
			theBalls[i].r = 0;
		else
			theBalls[i].r = wave_r;
	}

	mainSvg.selectAll("circle").data(theBalls).attr("cy", function(d) {
		return d.y;
	}).attr("r", function(d) {
		return d.r;
	});

	if(wave_connect)
	{
		updateConnectionData();
		mainSvg.selectAll("#connection").data(connections).attr("y1", function(d) {
			return d.y1;
		}).attr("y2", function(d) {
			return d.y2;
		}).attr("style", function (d) {
			return ("stroke:" + d.col + ";stroke-width:" + d.r);
		})
	}
}
var bWaveTimerRunning = false;
function waveTimer()
{
	bWaveTimerRunning = true;
	time = new Date().getTime() / 1000 - time_start;
	if(kindOfWave == "wave_chain")
	{
		if(chain_lastTime == 0)
			chain_elapsed = 0;
		else
			chain_elapsed = time - chain_lastTime;
		chain_lastTime = time;
		updateChain();
	}
	else if(kindOfWave == "wave1")
		updateBalls();
	else if(kindOfWave == "superpos" && superpos_running)
	{
		time_superpos_elapsed = time - time_superpos_start;
		updateSuperpos();
	}
	else if(kindOfWave == "superpos" && !superpos_running)
	{
		bWaveTimerRunning = false;
		return;
	}
	if(requiredSimulation == "wave")
	{
		if(!bStopSuperpos)
			requestAnimFrame(waveTimer);
		else
			bWaveTimerRunning = false;
	}
	else
	{
		clearSvg();
		bWaveTimerRunning = false;
	}
}
function restartWaveTimer()
{
	bStopSuperpos = false;
	if(!bWaveTimerRunning)
		waveTimer();
}
