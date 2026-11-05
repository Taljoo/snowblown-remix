//WCCChallenge "Wind" 
//click and drag mouse to create wind (by pushing vectors into flowfield), tracing the path over the cabin so the snow looks like it is being blown 
//press 'F' to enter vector paint mode- (F again to exit when done)
//'+' key to increase brush size, '-' key to decrease, '[' key to decrease opacity, ']' key to increase opacity, '<' to decrease wind velocity relative to mouse motion, '>' to increase velocity
//'B' to blur field smoothing out vectors. 'S' will save image of flow field vectors



let basePainting;
let flowMap;
let fieldCellSize = 20;
let mouseInputVectors = [];
let inputActive = false;
let displayFlowPaint = false;
let paintbrushSize = 20;
let defaultFlowMap;
let posMouseDown;

let snowPart = [];

let lightWind;
let highWind;
let windVector;
let noiseProgress = 0;
let windMult = 2.0;

let snowColor;
let uiimage;
let paintui;

function preload() {
	basePainting = loadImage("procreatePaint_hillCabin.png");
	defaultFlowMap = loadImage("flowMap.png");
	uiimage = loadImage("vectorPaintUI.png");
}

function setup() {
	createCanvas(1000, 1000);
	background(100);

	let fieldW = floor(basePainting.width / fieldCellSize);
	let fieldH = floor(basePainting.height / fieldCellSize);
	flowMap = new FlowField(fieldW, fieldH, fieldCellSize);
	flowMap.initEmpty();
	flowMap.initByImage(defaultFlowMap);

	lightWind = createVector(-2, 0.05);
	highWind = createVector(-4, 0.05);
	windVector = createVector(-3, 0.05);
	
	snowColor = color(243, 236, 224);
	
	paintui = new VectorPaintUI(uiimage, 50, 700);

	initSnow(1200);
}

function draw() {
	image(basePainting, 0, 0, basePainting.width, basePainting.height);
	if (inputActive) {
		mouseInputVectors.push(createVector(mouseX, mouseY));
	}
	if (displayFlowPaint) {
		image(flowMap.paintField.get(), 0, 0);
		paintui.render();
	}
	noiseProgress += 0.1;
	let windNoise = noise(noiseProgress, 0);
	//windMult = map(mouseX, 0, 1000, 0, 10.0);
	windVector.setMag(windNoise * windMult);
	
	/*
	stroke(color(0,255,0));
	let windMarkerX = 900;
	let windMarkerY = 900;
	line(windMarkerX, windMarkerY, windMarkerX + (windVector.x * 10), windMarkerY + (windVector.y * 10));
	*/
	
	noStroke();
	fill(snowColor);
	for (let i = 0; i < snowPart.length; i++) {
		let sp = snowPart[i];
		sp.accel.add(windVector);
		let upd = sp.update();
		if (upd < 0) {
			sp.pos.x = basePainting.width - random(50);
			sp.pos.y = 5 + random(500);
			sp.accel.add(lightWind);
		}
		circle(sp.pos.x, sp.pos.y, 4);
	}
}

function mousePressed() {
	posMouseDown = createVector(mouseX, mouseY);
	mouseInputVectors = [];
	if (displayFlowPaint){
		if (paintui.mouseInput()){
			
		}else{
			inputActive = true;
		}
		
	}
	
}

function mouseReleased() {
	if (inputActive) {
		inputActive = false;
		let lastMouse = posMouseDown;
		for (let i = 0; i < mouseInputVectors.length; i++) {
			let thisv = mouseInputVectors[i];
			let deltaV = createVector(thisv.x - lastMouse.x, thisv.y - lastMouse.y);
			flowMap.paintVector(lastMouse.x, lastMouse.y, thisv.x, thisv.y);
			lastMouse = thisv;

			flowMap.blurField();
			flowMap.initByPaintField();
		}
	}
}

function keyPressed() {
	if (key == '=' || key == '+') {
		paintbrushSize += 2;
		paintui.slider1pos = map(paintbrushSize, 2, 30, 0, 1);
	} else if (key == '-' || key == '_') {
		paintbrushSize -= 2;
		paintui.slider1pos = map(paintbrushSize, 2, 30, 0, 1);
	} else if (key == 's' || key == 'S') {
		flowMap.saveFlowMap();
	} else if (key == 'b' || key == 'B') {
		flowMap.blurField();
	} else if (key == 'f' || key == 'F') {
		displayFlowPaint = !displayFlowPaint;
	}else if (key == '[' || key == '{'){
		flowMap.brushOpacity -= 0.1;
		if (flowMap.brushOpacity < 0.1){
			flowMap.brushOpacity = 0.1;
		}
		paintui.slider2pos = flowMap.brushOpacity;
	}else if (key == ']' || key == '}'){
		flowMap.brushOpacity += 0.1;
		if (flowMap.brushOpacity > 1.0){
			flowMap.brushOpacity = 1.0;
		}
		paintui.slider2pos = flowMap.brushOpacity;
	}else if (key == ',' || key == '<'){
		flowMap.magMult -= 0.1;
		if (flowMap.magMult < 0.1){
			flowMap.magMult = 0.1;
		}
		paintui.slider3pos = flowMap.magMult;
	}else if (key == '.' || key == '>'){
		flowMap.magMult += 0.1;
		if (flowMap.magMult > 1.0){
			flowMap.magMult = 1.0;
		}
		paintui.slider3pos = flowMap.magMult;
	}else if (key == 'n' || key == 'N'){
		flowMap.noisifyField(0.1);
	}
}



function uiUpdate()
{
	paintbrushSize = map(paintui.slider1pos, 0, 1, 2, 30);
	flowMap.brushOpacity = paintui.slider2pos;
	flowMap.magMult = paintui.slider3pos;
}

function initSnow(np) {
	snowPart = [];
	for (let i = 0; i < np; i++) {
		let nsp = new SnowParticle(basePainting.width - random(500), 5 + random(500));
		nsp.accel.add(lightWind);
		snowPart.push(nsp);
	}
}