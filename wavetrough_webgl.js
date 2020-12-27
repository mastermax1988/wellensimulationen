var shaderProgram;
var waveEmitters = [];
var shaderNames = {fs: "", vs: ""};

function initShaders() {
	var fragmentShader = getShader(gl, shaderNames.fs);
	var vertexShader = getShader(gl, shaderNames.vs);
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialize shaders");
	}
	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.theTime = gl.getUniformLocation(shaderProgram, "theTime");
	shaderProgram.theMouse = gl.getUniformLocation(shaderProgram, "mousePos");
	shaderProgram.waveEmitters = gl.getUniformLocation(shaderProgram, "waveEmitter");
  shaderProgram.theD = gl.getUniformLocation(shaderProgram, "theD");
	gl.uniform2fv(shaderProgram.waveEmitters, new Float32Array(waveEmitters));
}

var mainVertexPositionBuffer;
function initBuffers() {
	mainVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mainVertexPositionBuffer);
	vertices = [
							 1.0, 1.0,
							 -1.0, 1.0,
							 1.0, -1.0,
							 -1.0, -1.0
						 ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	mainVertexPositionBuffer.itemSize = 2;
	mainVertexPositionBuffer.numItems = 4;
}
function drawScene() {
	gl.uniform1f(shaderProgram.theTime, parseFloat(time));
	gl.uniform2f(shaderProgram.theMouse, mousePos.x, mousePos.y);
  gl.uniform1f(shaderProgram.theD, wavet_d);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.bindBuffer(gl.ARRAY_BUFFER, mainVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mainVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, mainVertexPositionBuffer.numItems);
}

function webGLStart() {
	var canvas = document.getElementById("webglCanvas");
	initGL(canvas);
	initShaders();
	initBuffers();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	startTickTimer();
}
function drawOverlay()
{
	clearSvg();
	var svg = d3.select("#mainSvg");
	if(shaderNames.fs == "wavet1-fs")
	{
		for(var i = 0; i < waveEmitters.length; i += 2)
		{
			var coord = shader2pixel(waveEmitters[i], waveEmitters[i + 1]);
			svg.append("circle").attr("cx", coord.x).attr("cy", coord.y).attr("r", 3).attr("fill", "red");
		}
	}
	else if(shaderNames.fs == "wavet-plane-gaps-fs")
	{
		if(pre_NrOfWaveEmitters == 1)
		{
			var coord = shader2pixel(-1.6, 0);
			svg.append("line").attr("x1", coord.x).attr("y1", 0).attr("x2", coord.x).attr("y2", map.height / 2 - 5).attr("style", "stroke:rgb(255,0,0);stroke-width:5");
			svg.append("line").attr("x1", coord.x).attr("y1", map.height).attr("x2", coord.x).attr("y2", map.height / 2 + 5).attr("style", "stroke:rgb(255,0,0);stroke-width:5");
		}
		else
		{
			var coord = shader2pixel(waveEmitters[2], waveEmitters[3]);
			var coord2 = shader2pixel(waveEmitters[0], waveEmitters[1]);
			svg.append("line").attr("x1", coord.x).attr("y1", 0).attr("x2", coord.x).attr("y2", coord.y - 5).attr("style", "stroke:rgb(255,0,0);stroke-width:5");
			svg.append("line").attr("x1", coord.x).attr("y1", coord.y+5).attr("x2", coord.x).attr("y2", coord2.y - 5).attr("style", "stroke:rgb(255,0,0);stroke-width:5");
			svg.append("line").attr("x1", coord.x).attr("y1", coord2.y+5).attr("x2", coord.x).attr("y2", map.height).attr("style", "stroke:rgb(255,0,0);stroke-width:5");
		}
	}
  else if(shaderNames.fs=="wavet-plane-diffraction-fs")
  {
      var coord = shader2pixel(-1.6, -wavet_d);
      svg.append("line").attr("x1", coord.x).attr("y1", 0).attr("x2", coord.x).attr("y2", coord.y).attr("style", "stroke:rgb(255,0,0);stroke-width:5");
      coord = shader2pixel(-1.6, wavet_d);
			svg.append("line").attr("x1", coord.x).attr("y1", map.height).attr("x2", coord.x).attr("y2", coord.y).attr("style", "stroke:rgb(255,0,0);stroke-width:5");
  }
}
var bTickTimerRunning=false;
function startTickTimer()
{
  if(bTickTimerRunning)
    return;
  bTickTimerRunning=true;
  tick();
}
function tick()
{
	drawScene();
	time = new Date().getTime() / 1000;
	if (time_start == 0)
		time_start = time;
	time -= time_start;
	if(requiredSimulation == "wavet_webgl")
		requestAnimFrame(tick);
	else
  {
		bTickTimerRunning=false;
    clearWebGL();
  }
}

