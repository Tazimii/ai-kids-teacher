/* ============================================
   character.js — 小智角色 Canvas 2D 渲染
   状态：idle / thinking / happy / surprised / encouraging / sleeping
   ============================================ */

export class Character {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.W = this.canvas.width;
    this.H = this.canvas.height;
    this.cx = this.W / 2;
    this.cy = this.H / 2;

    // 状态机
    this.state = 'idle';       // idle | thinking | happy | surprised | encouraging | sleeping
    this.eyeState = 'open';    // open | half | closed
    this.blinkTimer = 0;
    this.blinkInterval = rand(2000, 4000);  // 2-4秒眨一次眼

    // 动画参数
    this.time = 0;
    this.idleBob = 0;
    this.thinkTilt = 0;
    this.surpriseScale = 1;
    this.happyBounce = 0;

    // 粒子
    this.particles = [];

    // 口语泡泡内容
    this.speechText = '';

    // 启动渲染循环
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  // ---- 状态切换 ----
  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.time = 0; // 重置状态时间

    // 特殊状态的初始化
    if (state === 'surprised') this.surpriseScale = 1.3;
    if (state === 'happy') this.spawnParticles('✨', 12);
  }

  /** 说一句话（在角色上方显示气泡） */
  say(text, duration = 3000) {
    this.speechText = text;
    const bubble = document.getElementById('characterSpeech');
    if (bubble) {
      bubble.textContent = text;
      bubble.classList.remove('hidden');
      clearTimeout(this._speechTimeout);
      this._speechTimeout = setTimeout(() => {
        bubble.classList.add('hidden');
        this.speechText = '';
      }, duration);
    }
  }

  // ---- 粒子 ----
  spawnParticles(emoji, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        emoji,
        x: this.cx,
        y: this.cy - 20,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 4 - 2,
        life: 1,
        decay: 0.015 + Math.random() * 0.025,
      });
    }
  }

  // ---- 主循环 ----
  _loop(timestamp) {
    if (!this._lastTime) this._lastTime = timestamp;
    const dt = Math.min(timestamp - this._lastTime, 50); // cap at 50ms
    this._lastTime = timestamp;

    this.time += dt;
    this._update(dt);
    this._draw();
    requestAnimationFrame(this._loop);
  }

  _update(dt) {
    // 眨眼计时器
    this.blinkTimer += dt;
    if (this.blinkTimer >= this.blinkInterval) {
      this.blinkTimer = 0;
      this.blinkInterval = rand(1500, 4000);
      this.eyeState = 'closed';
      setTimeout(() => { this.eyeState = 'half'; }, 60);
      setTimeout(() => { this.eyeState = 'open'; }, 120);
    }

    // 状态更新
    const t = this.time / 1000; // 秒

    switch (this.state) {
      case 'idle':
        this.idleBob = Math.sin(t * 2.5) * 4;
        this.thinkTilt = 0;
        this.surpriseScale += (1 - this.surpriseScale) * 0.15;
        break;
      case 'thinking':
        this.idleBob = Math.sin(t * 1.5) * 2;
        this.thinkTilt = Math.sin(t * 3) * 5;
        this.surpriseScale += (1 - this.surpriseScale) * 0.15;
        break;
      case 'happy':
        this.idleBob = Math.abs(Math.sin(t * 5)) * 12;
        this.surpriseScale += (1 - this.surpriseScale) * 0.15;
        break;
      case 'surprised':
        this.idleBob = 0;
        this.surpriseScale += (1 - this.surpriseScale) * 0.1;
        if (this.surpriseScale < 1.05) {
          this.setState('idle');
        }
        break;
      case 'encouraging':
        this.idleBob = Math.sin(t * 3) * 3;
        this.surpriseScale += (1 - this.surpriseScale) * 0.15;
        break;
      case 'sleeping':
        this.idleBob = Math.sin(t * 1.2) * 2;
        this.eyeState = 'closed';
        this.surpriseScale += (1 - this.surpriseScale) * 0.15;
        break;
    }

    // 更新粒子
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;  // 微重力
      p.life -= p.decay;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  _draw() {
    const ctx = this.ctx;
    const { W, H, cx, cy } = this;

    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.translate(cx, cy + this.idleBob);

    // 缩放（惊讶效果）
    if (this.surpriseScale !== 1) {
      ctx.scale(this.surpriseScale, this.surpriseScale);
    }

    // 旋转（思考效果）
    if (this.thinkTilt) {
      ctx.rotate((this.thinkTilt * Math.PI) / 180);
    }

    // ---- 身体光晕 ----
    const glowGrad = ctx.createRadialGradient(0, 0, 60, 0, 0, 90);
    glowGrad.addColorStop(0, 'rgba(66, 165, 245, 0.3)');
    glowGrad.addColorStop(0.7, 'rgba(66, 165, 245, 0.08)');
    glowGrad.addColorStop(1, 'rgba(66, 165, 245, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();

    // ---- 身体主体 ----
    const bodyGrad = ctx.createRadialGradient(-15, -20, 10, 0, 0, 65);
    bodyGrad.addColorStop(0, '#90CAF9');   // 高光
    bodyGrad.addColorStop(0.4, '#42A5F5'); // 中间色
    bodyGrad.addColorStop(1, '#1565C0');    // 边缘深色
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.fill();

    // 身体描边
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // ---- 天线 ----
    ctx.strokeStyle = '#1565C0';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.quadraticCurveTo(-5, -85, -8, -95);
    ctx.stroke();

    // 天线小球
    const ballGrad = ctx.createRadialGradient(-8, -95, 2, -8, -98, 8);
    ballGrad.addColorStop(0, '#FFEE58');
    ballGrad.addColorStop(1, '#F9A825');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(-8, -98, 8, 0, Math.PI * 2);
    ctx.fill();

    // 天线小球的闪烁效果
    const sparkleAlpha = 0.3 + Math.sin(this.time / 300) * 0.3;
    const sparkleGrad = ctx.createRadialGradient(-8, -98, 2, -8, -98, 12);
    sparkleGrad.addColorStop(0, `rgba(255, 238, 88, ${sparkleAlpha})`);
    sparkleGrad.addColorStop(1, 'rgba(255, 238, 88, 0)');
    ctx.fillStyle = sparkleGrad;
    ctx.beginPath();
    ctx.arc(-8, -98, 14, 0, Math.PI * 2);
    ctx.fill();

    // ---- 眼睛 ----
    this._drawEyes(ctx);

    // ---- 嘴巴 ----
    this._drawMouth(ctx);

    // ---- 脸颊腮红 ----
    ctx.fillStyle = 'rgba(255, 138, 128, 0.25)';
    ctx.beginPath();
    ctx.ellipse(-30, 15, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(30, 15, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ---- 粒子（不受身体变换影响） ----
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.font = '18px sans-serif';
      ctx.fillText(p.emoji, p.x - 9, p.y - 9);
      ctx.restore();
    }
  }

  _drawEyes(ctx) {
    // 眼眶
    const eyeY = -8;
    const eyeSpacing = 22;

    if (this.state === 'sleeping') {
      // 睡觉线
      for (const ex of [-eyeSpacing, eyeSpacing]) {
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ex - 12, eyeY);
        ctx.lineTo(ex + 12, eyeY);
        ctx.stroke();
      }
      // ZZZ
      ctx.fillStyle = '#42A5F5';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Z', 40, -30);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Z', 52, -45);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Z', 64, -62);
      return;
    }

    // 正常眼睛
    for (const ex of [-eyeSpacing, eyeSpacing]) {
      // 眼白
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 14, this.eyeState === 'closed' ? 2 : 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0D47A1';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (this.eyeState !== 'closed') {
        // 瞳孔
        const lookX = this.state === 'thinking' ? (ex > 0 ? 2 : -2) : 0;
        const lookY = this.state === 'surprised' ? -3 : 0;
        ctx.fillStyle = '#0D47A1';
        ctx.beginPath();
        ctx.arc(ex + lookX, eyeY + lookY + 2, 6, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ex + lookX - 2, eyeY + lookY - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 惊讶时的眉毛
    if (this.state === 'surprised') {
      ctx.strokeStyle = '#0D47A1';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      for (const ex of [-eyeSpacing, eyeSpacing]) {
        ctx.beginPath();
        ctx.moveTo(ex - 10, eyeY - 20);
        ctx.quadraticCurveTo(ex, eyeY - 26, ex + 10, eyeY - 20);
        ctx.stroke();
      }
    }
  }

  _drawMouth(ctx) {
    const mouthY = 28;

    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.fillStyle = '#0D47A1';

    switch (this.state) {
      case 'happy':
        // 大笑
        ctx.beginPath();
        ctx.arc(0, mouthY + 5, 14, 0.1, Math.PI - 0.1);
        ctx.stroke();
        // 填充
        ctx.fillStyle = '#EF5350';
        ctx.beginPath();
        ctx.arc(0, mouthY + 5, 13, 0.1, Math.PI - 0.1);
        ctx.fill();
        break;
      case 'surprised':
        // O型嘴
        ctx.fillStyle = '#0D47A1';
        ctx.beginPath();
        ctx.arc(0, mouthY + 2, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'encouraging':
        // 温暖的微笑
        ctx.beginPath();
        ctx.arc(0, mouthY, 12, 0.2, Math.PI - 0.2);
        ctx.stroke();
        break;
      case 'thinking':
        // 歪嘴思考
        ctx.beginPath();
        ctx.moveTo(-8, mouthY);
        ctx.quadraticCurveTo(3, mouthY + 6, 12, mouthY - 2);
        ctx.stroke();
        break;
      default: // idle
        // 小微笑
        ctx.beginPath();
        ctx.arc(0, mouthY - 4, 10, 0.3, Math.PI - 0.3);
        ctx.stroke();
        break;
    }
  }
}

// ---- 辅助函数 ----
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
