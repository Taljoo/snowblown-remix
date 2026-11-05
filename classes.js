// Stand-in versions of the classes snowblown.js uses but doesn't define
// (on OpenProcessing they lived in other tabs). If you get the original tabs,
// delete this file and add theirs to index.html instead.
//
// Flow map encoding used here: red = x direction, green = y direction,
// 128 = no flow, 0 = full negative, 255 = full positive.

const FLOW_STRENGTH = 1.2;

class FlowField {
	constructor(cols, rows, cellSize) {
		this.cols = cols;
		this.rows = rows;
		this.cellSize = cellSize;
		this.field = [];
		this.brushOpacity = 0.5;
		this.magMult = 0.5;
		this.paintField = createGraphics(cols * cellSize, rows * cellSize);
		this.paintField.pixelDensity(1);
	}

	initEmpty() {
		this.field = [];
		for (let i = 0; i < this.cols * this.rows; i++) {
			this.field.push(createVector(0, 0));
		}
		this.paintField.background(128, 128, 128);
	}

	initByImage(img) {
		this.paintField.image(img, 0, 0, this.paintField.width, this.paintField.height);
		this.initByPaintField();
	}

	// Re-read the grid of vectors from the colours in paintField
	initByPaintField() {
		let pf = this.paintField;
		pf.loadPixels();
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				let px = floor((i + 0.5) * this.cellSize);
				let py = floor((j + 0.5) * this.cellSize);
				let idx = 4 * (py * pf.width + px);
				let vx = (pf.pixels[idx] - 128) / 127;
				let vy = (pf.pixels[idx + 1] - 128) / 127;
				this.field[j * this.cols + i].set(vx, vy);
			}
		}
	}

	// Paint one mouse segment into the colour map. Uses the sketch's global paintbrushSize.
	paintVector(x1, y1, x2, y2) {
		let d = createVector(x2 - x1, y2 - y1).mult(this.magMult * 0.15);
		d.limit(1);
		let pf = this.paintField;
		pf.noStroke();
		pf.fill(128 + d.x * 127, 128 + d.y * 127, 128, this.brushOpacity * 255);
		let steps = max(1, ceil(dist(x1, y1, x2, y2) / 4));
		for (let s = 0; s <= steps; s++) {
			let t = s / steps;
			pf.circle(lerp(x1, x2, t), lerp(y1, y2, t), paintbrushSize * 2);
		}
	}

	blurField() {
		this.paintField.filter(BLUR, 2);
		this.initByPaintField();
	}

	noisifyField(amount) {
		let pf = this.paintField;
		pf.noStroke();
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				let v = this.field[j * this.cols + i];
				let nx = constrain(v.x + random(-amount, amount), -1, 1);
				let ny = constrain(v.y + random(-amount, amount), -1, 1);
				pf.fill(128 + nx * 127, 128 + ny * 127, 128);
				pf.rect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize);
			}
		}
		this.initByPaintField();
	}

	saveFlowMap() {
		save(this.paintField, "flowMap.png");
	}

	lookup(x, y) {
		let i = floor(x / this.cellSize);
		let j = floor(y / this.cellSize);
		if (i < 0 || j < 0 || i >= this.cols || j >= this.rows) {
			return null;
		}
		return this.field[j * this.cols + i];
	}
}

class SnowParticle {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.vel = createVector(0, 0);
		this.accel = createVector(0, 0);
		this.weight = random(0.6, 1.4);
	}

	// Returns -1 once the flake leaves the painting so the sketch can respawn it
	update() {
		this.accel.add(0, 0.12 * this.weight);
		this.accel.add(random(-0.1, 0.1), random(-0.1, 0.1));
		let flow = flowMap.lookup(this.pos.x, this.pos.y);
		if (flow) {
			this.accel.add(p5.Vector.mult(flow, FLOW_STRENGTH / 0.3));
		}
		this.vel.mult(0.92);
		this.vel.add(this.accel.mult(0.3 / this.weight));
		this.pos.add(this.vel);
		this.accel.set(0, 0);

		if (this.pos.x < -10 || this.pos.x > basePainting.width + 60 || this.pos.y > basePainting.height + 10 || this.pos.y < -200) {
			return -1;
		}
		return 1;
	}
}

class VectorPaintUI {
	constructor(img, x, y) {
		this.img = img;
		this.x = x;
		this.y = y;
		this.w = img.width;
		this.h = img.height;
		this.trackX = 140;
		this.trackW = 140;
		this.rowY = [50, 100, 150];
		this.slider1pos = map(paintbrushSize, 2, 30, 0, 1);
		this.slider2pos = 0.5;
		this.slider3pos = 0.5;
		this.dragging = -1;
	}

	render() {
		if (this.dragging >= 0) {
			if (mouseIsPressed) {
				this.setSlider(this.dragging, mouseX);
			} else {
				this.dragging = -1;
			}
		}
		image(this.img, this.x, this.y);
		let vals = [this.slider1pos, this.slider2pos, this.slider3pos];
		for (let k = 0; k < 3; k++) {
			let ty = this.y + this.rowY[k];
			stroke(150);
			strokeWeight(3);
			line(this.x + this.trackX, ty, this.x + this.trackX + this.trackW, ty);
			noStroke();
			fill(snowColor);
			circle(this.x + this.trackX + vals[k] * this.trackW, ty, 14);
		}
	}

	// True if the click landed on the panel (so it shouldn't paint)
	mouseInput() {
		if (mouseX < this.x || mouseX > this.x + this.w || mouseY < this.y || mouseY > this.y + this.h) {
			return false;
		}
		for (let k = 0; k < 3; k++) {
			if (abs(mouseY - (this.y + this.rowY[k])) < 15) {
				this.dragging = k;
				this.setSlider(k, mouseX);
			}
		}
		return true;
	}

	setSlider(k, mx) {
		let v = constrain((mx - this.x - this.trackX) / this.trackW, 0, 1);
		if (k === 0) this.slider1pos = v;
		if (k === 1) this.slider2pos = max(v, 0.1);
		if (k === 2) this.slider3pos = max(v, 0.1);
		uiUpdate();
	}
}
