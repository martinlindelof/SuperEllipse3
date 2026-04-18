let nSlider, aSlider, bSlider;
let nInput, aInput, bInput;
let nValue, aValue, bValue;

function setup() {
  // Canvas is slightly larger than 512x512 to prevent clipping of the stroke at the edges
  let canvas = createCanvas(550, 550);
  canvas.parent('canvas-container');
  
  nSlider = select('#nSlider');
  aSlider = select('#aSlider');
  bSlider = select('#bSlider');
  
  nInput = select('#nInput');
  aInput = select('#aInput');
  bInput = select('#bInput');
  
  nValue = select('#nValue');
  aValue = select('#aValue');
  bValue = select('#bValue');

  // Sync sliders to inputs
  nSlider.input(() => nInput.value(nSlider.value()));
  aSlider.input(() => aInput.value(aSlider.value()));
  bSlider.input(() => bInput.value(bSlider.value()));

  // Sync inputs to sliders
  nInput.input(() => nSlider.value(nInput.value()));
  aInput.input(() => aSlider.value(aInput.value()));
  bInput.input(() => bSlider.value(bInput.value()));
}

function sgn(val) {
  if (val > 0) return 1;
  if (val < 0) return -1;
  return 0;
}

function draw() {
  background('#121212');
  translate(width / 2, height / 2);
  
  // Draw grid
  stroke('#2a2a2a');
  strokeWeight(1);
  let step = 20;
  for (let x = 0; x <= width / 2; x += step) {
    line(x, -height / 2, x, height / 2);
    line(-x, -height / 2, -x, height / 2);
  }
  for (let y = 0; y <= height / 2; y += step) {
    line(-width / 2, y, width / 2, y);
    line(-width / 2, -y, width / 2, -y);
  }
  
  let nRaw = parseFloat(nInput.value());
  let aRaw = parseFloat(aInput.value());
  let bRaw = parseFloat(bInput.value());
  
  let n = isNaN(nRaw) ? 2.9 : nRaw;
  let a = isNaN(aRaw) ? 256 : aRaw;
  let b = isNaN(bRaw) ? 256 : bRaw;
  
  nValue.html(n.toFixed(1));
  aValue.html(a);
  bValue.html(b);
  
  // Map n from 0.1 to 10 to a hue from 240 (blue) to 360 (red)
  colorMode(HSB, 360, 100, 100, 1);
  let h = map(n, 0.1, 10, 240, 360);
  let cStroke = color(h, 90, 100);
  let cFill = color(h, 90, 100, 0.15);
  colorMode(RGB, 255); // Reset to default
  
  stroke(cStroke);
  strokeWeight(3);
  fill(cFill);
  
  beginShape();
  for (let angle = 0; angle < TWO_PI; angle += 0.05) {
    let na = 2 / n;
    let x = a * Math.pow(Math.abs(cos(angle)), na) * sgn(cos(angle));
    let y = b * Math.pow(Math.abs(sin(angle)), na) * sgn(sin(angle));
    vertex(x, y);
  }
  endShape(CLOSE);
}
