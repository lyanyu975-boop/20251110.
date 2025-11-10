// 全局變數
let bubbles = [];
let particles = [];
let score = 0; // 新增：計分變數
const text_color = '#83c5be'; // 文字顏色
const text_size = 32;       // 文字大小
const TARGET_COLOR = '#fff9e9'; // 目標得分顏色


const colors = [
  '#dfe7fd',
  '#cbeef3',
  '#cce3de',
  TARGET_COLOR, // 這是得分顏色
  '#bee9e8'
];
const numBubbles = 50;




// ===================================================
// 粒子的類別 (Class) (保持不變)
// ===================================================
class Particle {
  constructor(x, y, color) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(random(2, 6));
    this.acceleration = createVector(0, 0.1);
    this.lifespan = 255;
    this.size = random(3, 8);
    this.color = color;


    let r = unhex(this.color.substring(1, 3));
    let g = unhex(this.color.substring(3, 5));
    let b = unhex(this.color.substring(5, 7));
    this.rgb = [r, g, b];
  }


  run() {
    this.update();
    this.display();
  }


  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 5;
  }


  display() {
    let alpha = map(this.lifespan, 0, 255, 0, 255);
    fill(this.rgb[0], this.rgb[1], this.rgb[2], alpha);
    noStroke();
    ellipse(this.position.x, this.position.y, this.size);
  }


  isDead() {
    return this.lifespan < 0;
  }
}


// ===================================================
// 圓形的類別 (Class) - Bubble
// 新增：`isClicked(mx, my)` 檢查點擊
// ===================================================
class Bubble {
  constructor(color) {
    this.x = random(width);
    this.y = random(height + 200);
    this.diameter = random(50, 200);
    this.alpha = floor(random(50, 150));
    this.fillColorBase = color;
    this.fillColor = color + hex(this.alpha, 2);
    this.speed = random(0.5, 2.5);
    this.xOffset = random(1000);
    this.isPopped = false;
  }


  // 判斷滑鼠座標 (mx, my) 是否在氣球範圍內
  isClicked(mx, my) {
    if (this.isPopped) return false;
    let distance = dist(this.x, this.y, mx, my);
    return distance < this.diameter / 2;
  }


  pop() {
    this.isPopped = true;
    let numParticles = floor(random(10, 25));
    for (let i = 0; i < numParticles; i++) {
      let particleColor = this.fillColorBase;
      particles.push(new Particle(this.x, this.y, particleColor));
    }


    // 根據顏色更新分數
    if (this.fillColorBase === TARGET_COLOR) {
      score += 1; // 點擊目標顏色氣球加 1 分
    } else {
      score -= 1; // 點擊其他顏色氣球扣 1 分
    }
  }


  move() {
    if (this.isPopped) return;


    this.y -= this.speed;
    let wobble = map(noise(this.xOffset), 0, 1, -1, 1);
    this.x += wobble * 0.5;
    this.xOffset += 0.01;


    // 氣球飄出畫布頂端後，重置到畫布底部
    if (this.y < -this.diameter / 2) {
      this.reset();
    }
  }
 
  reset() {
      this.y = height + this.diameter / 2;
      this.x = random(width);
      this.diameter = random(50, 200);
      this.speed = random(0.5, 2.5);
      this.isPopped = false;
      this.alpha = floor(random(50, 150));
      this.fillColor = this.fillColorBase + hex(this.alpha, 2);
  }


  display() {
    if (this.isPopped) return;


    noStroke();
    fill(this.fillColor);
    circle(this.x, this.y, this.diameter);


    // 繪製星形的部分 (保持不變)
    let starSize = this.diameter / 7;
    let starAlpha = 150;
    let angle = -PI / 4;
    let radius = this.diameter / 2;
    let innerRadiusForStar = radius * 0.7;


    let starX = this.x + innerRadiusForStar * cos(angle);
    let starY = this.y + innerRadiusForStar * sin(angle);


    fill(255, 255, 255, starAlpha);
    drawStar(starX, starY, starSize / 2.5, starSize, 5);
  }
}


// ===================================================
// 自定義的繪製星形函數 (保持不變)
// ===================================================
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;


  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}


// ===================================================
// setup 和 draw 函數
// ===================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  // 設置文字相關屬性一次
  textSize(text_size);
  textAlign(LEFT, TOP);


  for (let i = 0; i < numBubbles; i++) {
    let randomColor = colors[i % colors.length];
    let newBubble = new Bubble(randomColor);
    bubbles.push(newBubble);
  }
}




function draw() {
  background('#cfe1b9');


  // 1. 處理氣球的移動與顯示
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let bubble = bubbles[i];
    bubble.move();
    bubble.display();
   
    // 如果氣球爆破了，重置它，讓它從底部重新開始
    if (bubble.isPopped) {
        bubble.reset();
    }
  }


  // 2. 處理粒子的移動與顯示
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    particle.run();


    if (particle.isDead()) {
      particles.splice(i, 1);
    }
  }


  // 3. 繪製 HUD (平視顯示器) 文字
  fill(text_color); // 設定文字顏色


  // 左上角文字
  textAlign(LEFT, TOP);
  text("414730266", 10, 10); // 座標 (10, 10)


  // 右上角分數
  textAlign(RIGHT, TOP);
  text(`Score: ${score}`, width - 10, 10); // 座標 (width - 10, 10)
}


// ===================================================
// 核心互動功能：滑鼠點擊事件
// ===================================================
function mousePressed() {
  // 遍歷所有氣球，檢查是否被點擊
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let bubble = bubbles[i];
   
    if (bubble.isClicked(mouseX, mouseY)) {
      // 點擊到氣球，觸發爆破 (爆破方法內部會處理計分)
      bubble.pop();
      // 由於一次點擊只可能點到一個氣球，可以立即停止迴圈
      return;
    }
  }
}




function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

