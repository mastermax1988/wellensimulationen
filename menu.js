var mousePos = {x: 0, y: 0};
var map = {};
var wavet_controlls = [];
var wave_controlls = [];
function drawMainPage()
{
	var d = emptyForm1();
	//var mainSvg = d.append("svg").attr("id", "mainSvg").attr("data", "clear");

	map.width = 900;
	map.height = 450;

	map.canvas =
		d3.select('#form1')
		.append('canvas')
		.attr('width', map.width)
		.attr('height', map.height)
		.attr('id', 'webglCanvas');

	map.svg =
		d3.select('#form1')
		.append('svg')
		.attr("id", "mainSvg")
		.attr('width', map.width)
		.attr('height', map.height)
		.append('g');

	map.svg.append('rect')
	.attr('id', 'theRect')
	.attr('class', 'overlay')
	.attr('width', map.width)
	.attr('height', map.height);
	drawMainMenu();
	var canvas = d3.select("#mainSvg")[0][0];
	canvas.addEventListener('mousemove', function (evt) {
		mousePos = getMousePos(canvas, evt);
	}, false);
	time_start = new Date().getTime() / 1000;
}

function getMousePos(canvas, evt)
{
	var rect = canvas.getBoundingClientRect();
	return {x: 2 * (evt.clientX - rect.left) / map.width - 1, y: -2 * (evt.clientY - rect.top) / map.height + 1};
}
function drawMainMenu()
{
	var m = emptyMenu1();
	var p = m.append("p");
	var selMain = p.append("select").attr("id", "mainSelect").attr("onchange", "mainSelectChanged()");
	var selSub = p.append("select").attr("id", "subSelect").attr("onchange", "subSelectChanged()");
	selMain.append("option").attr("value", "nothing").html("Simulation pausiert");
	selMain.append("option").attr("value", "wave").html("Wellen");
	selMain.append("option").attr("value", "wavetrough").html("Wellenwanne");
	selMain.append("option").attr("value", "electron").html("Elektronen");
	p.append("button").html("Simulationen zurücksetzen").attr("onclick", "window.location.reload(false);");
	var m2 = emptyMenu2();
	m2.append("p").html("placeholder");
	mainSelectChanged();
}

function mainSelectChanged()
{
	var sel = d3.select("#mainSelect")[0][0].value;
	var subSel = d3.select("#subSelect");
	subSel.selectAll("option").remove();
	if(sel == "nothing")
	{
		subSel.append("option").attr("value", "nothing").html("Zuerst links eine Kategorie wählen");
	}
	else if(sel == "wave")
	{
		subSel.append("option").attr("value", "wave1").html("Parameter zur Beschreibung einer Welle");
		//subSel.append("option").attr("value", "wave_chain").html("Perlenkette");
		subSel.append("option").attr("value", "wave_superpos").html("Entstehung und Überlagerung");
	}
	else if(sel == "wavetrough")
	{
		subSel.append("option").attr("value", "wavet_gl").html("Eine oder zwei Quellen");
		subSel.append("option").attr("value", "wavet_gl_plane").html("Ebene Welle");
		subSel.append("option").attr("value", "wavet_gl_ds").html("Einzel- und Doppelspalt");
		subSel.append("option").attr("value", "wavet_gl_df").html("Beugung am Einzelspalt");
		//subSel.append("option").attr("value", "wavet1").html("Wellenwanne SVG (wird nicht weiterentwickelt)");
	}
	else if(sel == "electron")
	{
		subSel.append("option").attr("value", "el_es").html("Einzelspalt");
		subSel.append("option").attr("value", "el_ds").html("Doppelspalt");
	}
	subSelectChanged();
}
function subSelectChanged()
{
	var sel = d3.select("#subSelect")[0][0].value;
	emptyMenu2();
	simFunct = doNothing;
	//d3.select("#form1").attr("style", "display: none");
	//d3.select("#webglCanvas").attr("style", "display: none");
	requiredSimulation = null;
	clearSvg();
	if(sel == "nothing")
		sumFunct = doNothing();
	else if(sel == "wave1")
	{
		requiredSimulation = "wave";
		kindOfWave = "wave1";
		wave_controlls = ["helpline", "r"];
		drawWaveGui();
	}
	else if(sel == "wave_chain_todo")
	{
		requiredSimulation = "wave";
		kindOfWave = "wave_chain";
		wave_controlls = [];
		wave_r = 5;
		wave_drawhl = false;
		initWave();
	}
	else if(sel == "wave_superpos")
	{
		requiredSimulation = "wave";
		kindOfWave = "superpos";
		wave_controlls = ["start", "2ndwave", "r", "impuls", "opposing", "w123", "init"];
		drawWaveGui();
	}
	else if(sel == "wavet_gl")
	{
		requiredSimulation = "wavet_webgl";
		shaderNames.fs = "wavet1-fs";
		shaderNames.vs = "wavet1-vs";
		wavet_controlls = ["nr", "I", "overlay"];
		drawWavetGui();
	}
	else if(sel == "wavet_gl_plane")
	{
		requiredSimulation = "wavet_webgl";
		shaderNames.fs = "wavet-plane-fs";
		shaderNames.vs = "wavet1-vs";
		wavet_controlls = [];
		drawWavetGui();
	}
	else if(sel == "wavet_gl_ds")
	{
		requiredSimulation = "wavet_webgl";
		shaderNames.fs = "wavet-plane-gaps-fs";
		shaderNames.vs = "wavet1-vs";
		wavet_controlls = ["nr", "overlay"];
		drawWavetGui();
	}
	else if(sel == "wavet_gl_df")
	{
		requiredSimulation = "wavet_webgl";
		shaderNames.fs = "wavet-plane-diffraction-fs";
		shaderNames.vs = "wavet1-vs";
		wavet_controlls = ["overlay", "diffraction", "d"];
		//pre_lambda = 0.02;
		//wavet_d=0.2;
		drawWavetGui();
	}
	else if(sel == "wavet1")
	{
		requiredSimulation = "wavet_svg";
		waveTroughTimer();
	}
	else if(sel == "el_es")
	{
		requiredSimulation = "el";
		e_a = 0;
		drawElGui();
	}

	else if(sel == "el_ds")
	{
		requiredSimulation = "el";
		e_a = 0.7E-3;
		drawElGui();
	}
	else if(sel != "nothing")
	{
		var m = emptyMenu2();
		m.append("p").html("noch nicht implementiert");
		clearSvg();
		clearWebGL();
	}
}

var wavet_d = 0.2;
var wavet_selectedIndex = 0;
var wave_T = 5, wave_lambda = 3, wave_A = 0.8, wave_drawhl = false, wave_r = 5, wave_opposing = true, wave_impuls = true, w1 = true, w2 = true, w3 = true, wave_init = true, wave_connect = false;
var wave_T2 = 5, wave_lambda2 = 3, wave_A2 = 0.8, wave_phi = 0;
function drawWaveGui()
{
	var m = emptyMenu2();
	var p = m.append("p");
	p.append("label").html("T= ");
	p.append("input").attr("id", "wave_T").attr("value", wave_T).attr("onchange", "waveChange()").attr("size", 3);
	p.append("label").html(" f=");
	p.append("input").attr("placeholder", "f").attr("value", 1 / wave_T).attr("id", "wave_f").attr("size", 3).attr("onchange", "waveFChange()");
	p.append("label").html(" λ=");
	p.append("input").attr("id", "wave_lambda").attr("value", wave_lambda).attr("onchange", "waveChange()").attr("size", 3);
	p.append("label").html(" A= ");
	p.append("input").attr("id", "wave_A").attr("value", wave_A).attr("onchange", "waveChange()").attr("size", 3);
	if(drawWaveControl("2ndwave"))
	{
		p.append("label").html("  T<sub>2</sub>= ");
		p.append("input").attr("id", "wave_T2").attr("value", wave_T2).attr("onchange", "waveChange()").attr("size", 3);
		p.append("label").html(" f<sub>2</sub>=");
		p.append("input").attr("placeholder", "f<sub>2</sub>").attr("value", 1 / wave_T2).attr("id", "wave_f2").attr("size", 3).attr("onchange", "waveFChange()");
		p.append("label").html(" λ<sub>2</sub>=");
		p.append("input").attr("id", "wave_lambda2").attr("value", wave_lambda2).attr("onchange", "waveChange()").attr("size", 3);
		p.append("label").html(" A<sub>2</sub>= ");
		p.append("input").attr("id", "wave_A2").attr("value", wave_A2).attr("onchange", "waveChange()").attr("size", 3);
		p.append("label").html("∆φ=");
		p.append("input").attr("id", "wave_phi").attr("value", wave_phi).attr("onchange", "waveChange()").attr("size", 5);
	}
	if(drawWaveControl("r"))
	{
		p.append("label").html(" Kugelradius=")
		p.append("input").attr("id", "wave_r").attr("value", wave_r).attr("onchange", "waveChange()").attr("size", 3);
	}
	p.append("label").attr("for", "wave_connect").attr("style", "cursor: pointer").html("<br>Punkte verbinden");
	p.append("input").attr("type", "checkbox").attr("id", "wave_connect").attr("onchange", "waveChange()");
	if(wave_connect)
		d3.select("#wave_connect")[0][0].checked = true;
	if(drawWaveControl("helpline"))
	{
		p.append("label").attr("for", "wave_hl").attr("style", "cursor: pointer").html(" Hilfslinien ");
		p.append("input").attr("type", "checkbox").attr("id", "wave_hl").attr("onchange", "waveChange()");
		if(wave_drawhl)
			d3.select("#wave_hl")[0][0].checked = true;
	}
	if(drawWaveControl("impuls"))
	{
		p.append("label").attr("for", "wave_impuls").attr("style", "cursor: pointer").html(" Impulswelle");
		p.append("input").attr("type", "checkbox").attr("id", "wave_impuls").attr("onchange", "waveChange()");
		if(wave_impuls)
			d3.select("#wave_impuls")[0][0].checked = true;
	}
	if(drawWaveControl("init"))
	{
		p.append("label").attr("for", "wave_init").attr("style", "cursor: pointer").html(" Entstehung");
		p.append("input").attr("type", "checkbox").attr("id", "wave_init").attr("onchange", "waveChange()");
		if(wave_init)
			d3.select("#wave_init")[0][0].checked = true;
	}


	if(drawWaveControl("opposing"))
	{
		p.append("label").attr("for", "wave_opposing").attr("style", "cursor: pointer").html(" Gegenläufig");
		p.append("input").attr("type", "checkbox").attr("id", "wave_opposing").attr("onchange", "waveChange()");
		if(wave_opposing)
			d3.select("#wave_opposing")[0][0].checked = true;
	}
	if(drawWaveControl("w123"))
	{
		p.append("label").attr("for", "w1").attr("style", "cursor: pointer").html(" W<sub>1</sub>");
		p.append("input").attr("type", "checkbox").attr("id", "w1").attr("onchange", "superposWChange()");
		if(w1)
			d3.select("#w1")[0][0].checked = true;
		p.append("label").attr("for", "w2").attr("style", "cursor: pointer").html(" W<sub>2</sub>");
		p.append("input").attr("type", "checkbox").attr("id", "w2").attr("onchange", "superposWChange()");
		if(w2)
			d3.select("#w2")[0][0].checked = true;
		p.append("label").attr("for", "w3").attr("style", "cursor: pointer").html(" W<sub>res</sub>");
		p.append("input").attr("type", "checkbox").attr("id", "w3").attr("onchange", "superposWChange()");
		if(w3)
			d3.select("#w3")[0][0].checked = true;
	}
	if(drawWaveControl("start"))
	{
		p.append("button").html("Start").attr("onclick", "startSuperpos()");
		p.append("button").html("Stop").attr("onclick", "stopSuperpos()");
	}
	waveChange();

}
var bStopSuperpos = false;
function stopSuperpos()
{
	bStopSuperpos = true;
}
function superposWChange()
{
	if(drawWaveControl("w123"))
	{
		w1 = d3.select("#w1")[0][0].checked;
		w2 = d3.select("#w2")[0][0].checked;
		w3 = d3.select("#w3")[0][0].checked;
	}
}
function waveChange()
{
	wave_T = parseFloat("0" + d3.select("#wave_T")[0][0].value.replace(',', '.'));
  d3.select("#wave_f")[0][0].value=1 / wave_T;
	wave_lambda = parseFloat("0" + d3.select("#wave_lambda")[0][0].value.replace(',', '.'));
	wave_A = parseFloat(d3.select("#wave_A")[0][0].value.replace(',', '.'));
	if(drawWaveControl("2ndwave"))
	{
		wave_T2 = parseFloat("0" + d3.select("#wave_T2")[0][0].value.replace(',', '.'));
    d3.select("#wave_f2")[0][0].value=1 / wave_T2;
		wave_lambda2 = parseFloat("0" + d3.select("#wave_lambda2")[0][0].value.replace(',', '.'));
		wave_A2 = parseFloat(d3.select("#wave_A2")[0][0].value.replace(',', '.'));
		wave_phi = eval(d3.select("#wave_phi")[0][0].value.replace(',', '.').toLowerCase().replace("pi", "Math.PI"));
	}
	wave_connect = d3.select("#wave_connect")[0][0].checked;
	if(drawWaveControl("helpline"))
		wave_drawhl = d3.select("#wave_hl")[0][0].checked;
	if(drawWaveControl("r"))
		wave_r = parseFloat("0" + d3.select("#wave_r")[0][0].value.replace(',', '.'));
	if(drawWaveControl("impuls"))
	{
		wave_impuls = d3.select("#wave_impuls")[0][0].checked;
	}
	if(drawWaveControl("opposing"))
		wave_opposing = d3.select("#wave_opposing")[0][0].checked;
	if(drawWaveControl("init"))
	{
		wave_init = d3.select("#wave_init")[0][0].checked;
		if(!wave_init && wave_impuls)
		{
			d3.select("#wave_init")[0][0].checked = true;
			wave_init = true;
		}
		if(wave_impuls)
			d3.select("#wave_init")[0][0].disabled = true;
		else
			d3.select("#wave_init")[0][0].disabled = false;
	}
	initWave();
	startSuperpos();
}

function drawElGui()
{
	var m = emptyMenu2();
	var p = m.append("p");
	p.append("input").attr("type", "checkbox").attr("id", "el_intens").attr("onchange", "elItChange()");
	p.append("label").attr("for", "el_intens").attr("style", "cursor: pointer").html(" Intensität zeichnen ");
	p.append("button").attr("id", "el_restart").html("Neustart").attr("onclick", "startElTimer()");
	p.append("button").attr("id", "el_stop").html("Stop").attr("onclick", "stopElTimer()");
	p.append("label").html(" λ=");
	p.append("input").attr("value", e_lambda).attr("id", "e_lambda").attr("size", 5).attr("onchange", "elChange()");
	p.append("label").html(" Spaltbreite=");
	p.append("input").attr("value", e_b).attr("id", "e_b").attr("size", 5).attr("onchange", "elChange()");
	p.append("label").html(" Spaltabstand=");
	p.append("input").attr("value", e_a).attr("id", "e_a").attr("size", 5).attr("onchange", "elChange()");
	p.append("label").html(" Abstand zum 20cm breiten Schirm in Metern=");
	p.append("input").attr("value", e_dist).attr("id", "e_dist").attr("size", 3).attr("onchange", "elChange()");
	initEl();
	elChange();
	startElTimer();
}
function elItChange()
{

	updateIntensity(d3.select("#el_intens")[0][0].checked);
}

function elChange()
{
	e_a = parseFloat("0" + d3.select("#e_a")[0][0].value.replace(",", "."));
	e_b = parseFloat("0" + d3.select("#e_b")[0][0].value.replace(",", "."));
	e_dist = parseFloat("0" + d3.select("#e_dist")[0][0].value.replace(",", "."));
	e_maxangle = Math.atan(0.2 / 2 / e_dist);
  elItChange();
	startElTimer();
}

function drawWavetGui()
{
	var m = emptyMenu2();
	var p = m.append("p");
	if(drawWavetControl("diffraction"))
	{
		m.append("label").html("Simulation über 101 Quellen");
	}
	if(drawWavetControl("nr"))
	{
		var sel = p.append("select").attr("onchange", "wavetChange()").attr("id", "sel_nrOfWaveEmitters");
		sel.append("option").attr("value", 1).html(shaderNames.fs == "wavet1-fs" ? "Eine Quelle" : "Ein Spalt");
		sel.append("option").attr("value", 2).html(shaderNames.fs == "wavet1-fs" ? "Zwei Quellen" : "Zwei Spalte");
		d3.select("#sel_nrOfWaveEmitters").selectAll("option")[0][wavet_selectedIndex].selected = "selected";
	}
	p.append("label").html("λ=");
	p.append("input").attr("placeholder", "λ").attr("value", pre_lambda * 10).attr("id", "wavet_lambda").attr("size", 3).attr("onchange", "wavetChange()");
	p.append("label").html(" T=");
	p.append("input").attr("placeholder", "T").attr("value", pre_T).attr("id", "wavet_T").attr("size", 3).attr("onchange", "wavetChange()");
	p.append("label").html(" f=");
	p.append("input").attr("placeholder", "f").attr("value", 1 / pre_T).attr("id", "wavet_f").attr("size", 3).attr("onchange", "wavetFChange()");

	if(drawWavetControl("nr") || drawWavetControl("d"))
	{
		p.append("label").html(" d=");
		p.append("input").attr("placeholder", "d").attr("value", wavet_d * 20).attr("id", "wavet_d").attr("size", 3).attr("onchange", "wavetChange()");
	}
	if(drawWavetControl("overlay"))
	{
		p.append("label").html(" Overlay");
		p.append("input").attr("type", "checkbox").attr("id", "drawOverlay").attr("onchange", "wavetChange()").attr("checked", true);
	}
	if(drawWavetControl("I"))
	{
		p.append("label").html(" Intensität");
		p.append("input").attr("type", "checkbox").attr("id", "showIntensity").attr("onchange", "wavetChange()");
		if(pre_bShowIntensity)
			d3.select("#showIntensity")[0][0].checked = true;
	}
	wavetChange();
}
function drawWavetControl(s)
{
	return wavet_controlls.indexOf(s) != -1;
}

function drawWaveControl(s)
{
	return wave_controlls.indexOf(s) != -1;
}

function wavetFChange()
{
	d3.select("#wavet_T")[0][0].value = 1 / parseFloat("0" + d3.select("#wavet_f")[0][0].value.replace(',', '.'));
	wavetChange();
}
function waveFChange()
{
	d3.select("#wave_T")[0][0].value = 1 / parseFloat("0" + d3.select("#wave_f")[0][0].value.replace(',', '.'));
	try
	{
		d3.select("#wave_T2")[0][0].value = 1 / parseFloat("0" + d3.select("#wave_f2")[0][0].value.replace(',', '.'));
	}
	catch(e) {}
	waveChange();
}

function wavetChange()
{
	if(drawWavetControl("nr"))
	{
		var sel = d3.select("#sel_nrOfWaveEmitters")[0][0];
		pre_NrOfWaveEmitters = sel.value;
		wavet_selectedIndex = sel.selectedIndex;
		if(shaderNames.fs == "wavet1-fs")
		{
			if(pre_NrOfWaveEmitters == 1)
				waveEmitters = [-1.9, 0.0];
			else
			{
				wavet_d = parseFloat("0" + d3.select("#wavet_d")[0][0].value.replace(',', '.')) / 20;
				waveEmitters = [-1.9, wavet_d, -1.9, -1 * wavet_d];
			}
		}
		else if (shaderNames.fs == "wavet-plane-gaps-fs")
		{
			if(pre_NrOfWaveEmitters == 1)
				waveEmitters = [-1.6, 0.0];
			else
			{
				wavet_d = parseFloat("0" + d3.select("#wavet_d")[0][0].value.replace(',', '.')) / 20;
				waveEmitters = [-1.6, wavet_d, -1.6, -1 * wavet_d];
			}
		}

	}
	else if(shaderNames.fs == "wavet-plane-diffraction-fs")
	{
		wavet_d = parseFloat("0" + d3.select("#wavet_d")[0][0].value.replace(',', '.')) / 20;
	}
	if(drawWavetControl("I"))
		pre_bShowIntensity = d3.select("#showIntensity")[0][0].checked;

	pre_T = parseFloat("0" + d3.select("#wavet_T")[0][0].value.replace(',', '.'));
	d3.select("#wavet_f")[0][0].value = 1 / pre_T;
	pre_lambda = parseFloat("0" + d3.select("#wavet_lambda")[0][0].value.replace(',', '.')) / 10;
	if(drawWavetControl("overlay"))
	{
		if(d3.select("#drawOverlay")[0][0].checked)
			drawOverlay();
		else
			clearSvg();
	}
	webGLStart();
}

function emptyForm1()
{
	var d = d3.select("#form1");
	d.selectAll("*").remove()
	return d;
}
function emptyMenu2()
{
	var d = d3.select("#menu2");
	d.selectAll("*").remove();
	return d;
}
function emptyMenu1()
{
	var d = d3.select("#menu1");
	d.selectAll("*").remove();
	return d;
}

