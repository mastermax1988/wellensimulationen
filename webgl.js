var gl;
var pre_NrOfWaveEmitters = 2;
var pre_lambda = 0.1;
var pre_T = 2.0;
var pre_bShowIntensity=false;
function initGL(canvas) {
	try
	{
		gl = WebGLUtils.setupWebGL(canvas);
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e)
	{
		alert(e);
	}
	if (!gl)
		alert("Could not initialise WebGL, sorry :-(");
}
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}
	var str = "#define NR_OF_WAVEEMITTERS " + pre_NrOfWaveEmitters + "\r\n";
	str += "#define LAMBDA " + pre_lambda + "\r\n";
	str += "#define PERIODIC_TIME " + pre_T + "\r\n";
	if(pre_bShowIntensity)
    str += "#define SHOW_INTENSITY 1\r\n";
	str +=  "#define M_PI 3.1415926535897932384626433832795";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

function clearWebGL()
{
	var canvas = document.getElementById("webglCanvas");
	initGL(canvas);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function shader2pixel(x, y)
{
	return {x: map.width / 4 * x + map.width / 2, y: map.height / 2 * y + map.height / 2}
}
