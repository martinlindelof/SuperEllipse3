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

  // Download button
  select('#downloadBtn').mousePressed(downloadSVG);
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
  stroke('#454545ff');
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

  // Helper to draw the shape path
  let drawShape = () => {
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += 0.05) {
      let na = 2 / n;
      let x = a * Math.pow(Math.abs(cos(angle)), na) * sgn(cos(angle));
      let y = b * Math.pow(Math.abs(sin(angle)), na) * sgn(sin(angle));
      vertex(x, y);
    }
    endShape(CLOSE);
  };

  // 1. Fill the shape
  noStroke();
  fill(cFill);
  drawShape();

  // 2. Inner glow using clipping
  push();
  beginClip();
  drawShape();
  endClip();

  noFill();
  stroke(cStroke);
  strokeWeight(10); // Slightly increased to help spread the glow

  // Base glow
  drawingContext.shadowBlur = 45; // Increased size of the glow
  drawingContext.shadowColor = cStroke.toString();
  drawShape();

  // Additional 45% intensity boost
  let cGlowBoost = color(red(cStroke), green(cStroke), blue(cStroke), 255 * 0.45);
  drawingContext.shadowColor = cGlowBoost.toString();
  drawShape();
  pop();

  // 3. Crisp outline
  noFill();
  stroke(cStroke);
  strokeWeight(3);
  drawShape();
}

function downloadSVG() {
  let nRaw = parseFloat(nInput.value());
  let aRaw = parseFloat(aInput.value());
  let bRaw = parseFloat(bInput.value());

  let n = isNaN(nRaw) ? 2.9 : nRaw;
  let a = isNaN(aRaw) ? 256 : aRaw;
  let b = isNaN(bRaw) ? 256 : bRaw;

  // Create superellipse path
  let d = "";
  for (let angle = 0; angle <= TWO_PI + 0.05; angle += 0.05) {
    let na = 2 / n;
    let x = a * Math.pow(Math.abs(cos(angle)), na) * sgn(cos(angle));
    let y = b * Math.pow(Math.abs(sin(angle)), na) * sgn(sin(angle));

    // Offset to center in SVG canvas
    let cx = width / 2 + x;
    let cy = height / 2 + y;

    if (angle === 0) {
      d += `M ${cx.toFixed(2)} ${cy.toFixed(2)} `;
    } else {
      d += `L ${cx.toFixed(2)} ${cy.toFixed(2)} `;
    }
  }
  d += "Z";

  // Re-calculate color
  colorMode(HSB, 360, 100, 100, 1);
  let h = map(n, 0.1, 10, 240, 360);
  let cStroke = color(h, 90, 100);
  let cFill = color(h, 90, 100, 0.15);
  colorMode(RGB, 255);

  // Generate grid lines
  let gridLines = "";
  let step = 20;
  for (let x = 0; x <= width / 2; x += step) {
    gridLines += `<line x1="${width / 2 + x}" y1="0" x2="${width / 2 + x}" y2="${height}" stroke="#454545" stroke-width="1"/>\n`;
    gridLines += `<line x1="${width / 2 - x}" y1="0" x2="${width / 2 - x}" y2="${height}" stroke="#454545" stroke-width="1"/>\n`;
  }
  for (let y = 0; y <= height / 2; y += step) {
    gridLines += `<line x1="0" y1="${height / 2 + y}" x2="${width}" y2="${height / 2 + y}" stroke="#454545" stroke-width="1"/>\n`;
    gridLines += `<line x1="0" y1="${height / 2 - y}" x2="${width}" y2="${height / 2 - y}" stroke="#454545" stroke-width="1"/>\n`;
  }

  // Construct SVG
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#121212"/>
    ${gridLines}
    <!-- Base shape without glow -->
    <path d="${d}" fill="${cFill.toString()}" stroke="${cStroke.toString()}" stroke-width="3"/>
  </svg>`;

  // Trigger download
  let blob = new Blob([svgContent], { type: "image/svg+xml" });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = `superellipse_n${n.toFixed(1)}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
