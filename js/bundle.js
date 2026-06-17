(function(){
'use strict';

// ====== js/utils.js ======
/* ============================================
   utils.js — 工具函数
   ============================================ */

/** 延时 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/** 随机整数 [min, max] */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 随机选择 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 洗牌 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 安全获取 DOM 元素 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/** 在元素末尾插入 HTML */
function appendHTML(parent, html) {
  parent.insertAdjacentHTML('beforeend', html);
  return parent.lastElementChild;
}

/** 滚动到底部 */
function scrollToBottom(el) {
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
  });
}

/** 防抖 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** 格式化数字（大数字用k/m） */
function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

/** 触发音效 */
function playSound(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {}); // 忽略自动播放限制
}

/** 创建粒子爆发效果 */
function burstParticles(x, y, emoji = '✨', count = 8) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    const angle = (Math.PI * 2 * i) / count;
    const dist = randInt(30, 70);
    p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

/** 显示 XP 飘字 */
function showXpFloat(x, y, amount) {
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = `+${amount} XP`;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/** 显示 Toast */
function showToast(msg, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

/** 获取元素在页面中的位置 */
function getElementCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

// ====== js/config.js ======
/* ============================================
   config.js — 全局配置常量
   ============================================ */

const CONFIG = {
  // ---- AI 模型配置 ----
  ai: {
    provider: 'deepseek',           // 'deepseek' | 'anthropic'
    deepseek: {
      model: 'deepseek-v4-pro',
      // API 代理地址（Vercel Serverless / 开发环境直连）
      endpoint: '/api/chat',
      maxTokens: 800,   // 给reasoning模型留足空间
      temperature: 0.75,
    },
    anthropic: {
      model: 'claude-sonnet-4-6',
      endpoint: '/api/claude',
      maxTokens: 800,   // 给reasoning模型留足空间
      temperature: 0.75,
    },
    // 对话历史保留轮数
    historyRounds: 20,
    // 请求超时 ms
    timeout: 30000,
  },

  // ---- 游戏化 ----
  gamification: {
    levels: [
      { level: 1,  title: 'AI小萌新',  xpRequired: 0 },
      { level: 2,  title: 'AI小侦探',  xpRequired: 50 },
      { level: 3,  title: 'AI训练师',  xpRequired: 150 },
      { level: 4,  title: 'AI魔法师',  xpRequired: 350 },
      { level: 5,  title: 'AI创造者',  xpRequired: 700 },
      { level: 6,  title: 'AI探险家',  xpRequired: 1200 },
      { level: 7,  title: 'AI工程师',  xpRequired: 2000 },
      { level: 8,  title: 'AI科学家',  xpRequired: 3200 },
      { level: 9,  title: 'AI大师',    xpRequired: 5000 },
      { level: 10, title: 'AI传奇',    xpRequired: 8000 },
    ],
    xpPerMessage: 1,
    xpPerCorrectAnswer: 10,
    xpPerLessonComplete: 50,
    xpPerDayStreakBonus: 20,   // 每日签到额外
    streakMaxMultiplier: 3,    // 最高连续天数倍率
  },

  // ---- 安全 ----
  safety: {
    // 每25分钟提醒休息
    breakIntervalMs: 25 * 60 * 1000,
    // 超过45分钟强制休息
    forceBreakMs: 45 * 60 * 1000,
    // 强制休息时长
    forceBreakDurationMs: 5 * 60 * 1000,
    // 每日消息上限
    dailyMessageLimit: 200,
  },

  // ---- 课程 ----
  courses: {
    // 每节课含低龄/高龄两版
    ageGroups: {
      junior: { min: 7, max: 9, label: 'AI初探者' },
      senior: { min: 10, max: 13, label: 'AI探险家' },
    },
  },

  // ---- 语音 ----
  voice: {
    lang: 'zh-CN',
    // 小智语音合成参数
    tts: {
      rate: 0.9,   // 稍慢，适合儿童
      pitch: 1.1,  // 稍高，更亲切
    },
  },
};

// ====== js/storage.js ======
/* ============================================
   storage.js — LocalStorage 持久化
   ============================================ */

const PREFIX = 'xk_ai_';  // xiao-kids-ai

const Storage = {
  /** 保存 */
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage full, clearing old data');
      this.clearNonCritical();
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch (_) { /* 放弃 */ }
    }
  },

  /** 读取 */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  },

  /** 删除 */
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  /** 清除非关键数据（保留进度和设置） */
  clearNonCritical() {
    const preserve = ['progress', 'settings', 'childProfile'];
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    for (const k of keys) {
      const short = k.slice(PREFIX.length);
      if (!preserve.includes(short)) {
        localStorage.removeItem(k);
      }
    }
  },

  // ---- 便捷方法 ----

  /** 获取/设置孩子档案 */
  getProfile() {
    return this.get('childProfile', {
      ageGroup: null,       // 'junior' | 'senior'
      nickname: '',
      createdAt: null,
    });
  },

  setProfile(profile) {
    this.set('childProfile', { ...this.getProfile(), ...profile });
  },

  /** 获取/设置学习进度 */
  getProgress() {
    return this.get('progress', {
      xp: 0,
      level: 1,
      stars: 0,
      completedLessons: [],    // ['lesson1', 'lesson2', ...]
      quizScores: {},          // { lessonId: score }
      streakDays: 0,
      lastActiveDate: null,    // 'YYYY-MM-DD'
      lastActiveTime: null,    // timestamp
      totalMessages: 0,
      dailyMessageCount: 0,
      dailyMessageDate: null,
    });
  },

  setProgress(progress) {
    this.set('progress', { ...this.getProgress(), ...progress });
  },

  /** 检查每日消息限额 */
  checkDailyLimit(limit = 200) {
    const p = this.getProgress();
    const today = new Date().toISOString().slice(0, 10);
    if (p.dailyMessageDate !== today) {
      p.dailyMessageCount = 0;
      p.dailyMessageDate = today;
      this.setProgress(p);
    }
    return p.dailyMessageCount >= limit;
  },

  incrementDailyMessage() {
    const p = this.getProgress();
    const today = new Date().toISOString().slice(0, 10);
    if (p.dailyMessageDate !== today) {
      p.dailyMessageCount = 1;
      p.dailyMessageDate = today;
    } else {
      p.dailyMessageCount++;
    }
    this.setProgress(p);
  },

  /** 获取/设置课程章节解锁状态 */
  getCourses() {
    return this.get('courses', {
      currentModule: 'intro',      // 'intro' | 'module1' | ...
      currentLesson: null,
    });
  },

  setCourses(courses) {
    this.set('courses', { ...this.getCourses(), ...courses });
  },
};

// ====== js/safety.js ======
/* ============================================
   safety.js — 面向儿童的安全护栏
   ============================================ */

const Safety = {
  // ---- 个人信息检测模式 ----
  PII_PATTERNS: [
    /\d{11}/,                           // 中国大陆手机号
    /\d{3}-\d{4}-\d{4}/,                // 手机号（带连字符）
    /\d{15,18}/,                        // 身份证号长度
    /1[3-9]\d{9}/,                      // 手机号（1开头+9位）
    /\b\d{6}\b.*\b\d{4}\b.*\b\d{4}\b/,  // 松散身份证
  ],

  // ---- 个人信息关键词 ----
  PII_KEYWORDS: [
    '学校', '地址', '家在哪里', '住在哪里', '我家在',
    '电话', '手机号', '微信号', 'QQ号', '邮箱',
    '名字叫什么', '真名', '叫什么名字',
    '爸爸妈妈的名字', '妈妈的电话', '爸爸的电话',
    '密码', '账号', '登录',
    '照片', '拍张照', '自拍', '身份证',
  ],

  // ---- 不适合儿童的词汇（输出过滤） ----
  BLOCKED_OUTPUT_TERMS: [
    '暴力', '色情', '血腥', '恐怖', '自杀',
    '毒品', '赌博', '武器', '杀人',
  ],

  // ---- 危机信号检测 ----
  DISTRESS_PATTERNS: [
    /不想活|自杀|伤害自己|割腕|跳楼|结束生命/,
    /有人欺负|被欺负|校园暴力|被打|被骂|霸凌/,
    /爸爸妈妈不要我|没人要我|离家出走/,
    /很害怕|非常恐惧|不敢/,
  ],

  /** 安全回应模板（危机情况） */
  DISTRESS_RESPONSE: `我注意到你可能不太开心。😟

其实每个人都会有难过的时候，这很正常。但是有些事情，一定要告诉身边可以信任的大人哦。

你可以找**爸爸妈妈、老师、或者其他你信任的大人**聊一聊。他们都很愿意帮助你的！

如果你不知道找谁说，也可以让爸爸妈妈帮你拨打：
> ☎️ **12355 青少年服务热线**
> （免费的，可以随时打电话聊天）

记得，你不是一个人。💙`,

  /** 个人信息拒绝模板 */
  PII_REJECT: '啊，这些是私密信息哦，不用告诉我啦~我们还是聊AI吧！😊',

  /** 敏感话题转移模板 */
  SENSITIVE_REDIRECT: '这个话题有点复杂，等你长大一点我们再聊吧！现在我们来看看AI的另一个有趣的事情~',

  // ---- 方法 ----

  /**
   * 输入安全检查
   * @param {string} text 用户输入的原文本
   * @returns {{ safe: string, flagged: boolean, flagReason: string|null }}
   */
  sanitizeInput(text) {
    if (!text || typeof text !== 'string') {
      return { safe: '', flagged: true, flagReason: 'empty' };
    }

    let flagged = false;
    let flagReason = null;

    // 1. 检测个人信息
    for (const pattern of this.PII_PATTERNS) {
      if (pattern.test(text)) {
        flagged = true;
        flagReason = 'pii_detected';
        // 替换数字为星号
        text = text.replace(pattern, m => '*'.repeat(m.length));
      }
    }

    for (const kw of this.PII_KEYWORDS) {
      if (text.includes(kw)) {
        flagged = true;
        flagReason = 'pii_keyword';
        break; // 不替换，由前端展示 PII_REJECT
      }
    }

    // 2. 检测危机信号
    for (const pattern of this.DISTRESS_PATTERNS) {
      if (pattern.test(text)) {
        flagged = true;
        flagReason = 'distress';
        break;
      }
    }

    // 3. 长度限制
    if (text.length > 500) {
      text = text.slice(0, 500);
      flagged = true;
      flagReason = 'too_long';
    }

    return { safe: text.trim(), flagged, flagReason };
  },

  /**
   * AI输出安全检查
   * @param {string} text AI返回的文本
   * @returns {{ safe: string, blocked: boolean }}
   */
  sanitizeOutput(text) {
    if (!text) return { safe: '', blocked: false };

    let blocked = false;

    // 检测屏蔽词
    for (const term of this.BLOCKED_OUTPUT_TERMS) {
      if (text.includes(term)) {
        blocked = true;
        // 替换为安全提示
        text = text.replace(new RegExp(term, 'g'), '**[已过滤]**');
      }
    }

    // 检测输出中的PII（防范模型泄露）
    for (const pattern of this.PII_PATTERNS) {
      if (pattern.test(text)) {
        text = text.replace(pattern, m => '*'.repeat(m.length));
      }
    }

    return { safe: text, blocked };
  },

  /**
   * 检查是否需要危机干预
   * @returns {{ distress: boolean, response: string|null }}
   */
  checkDistress(text) {
    for (const pattern of this.DISTRESS_PATTERNS) {
      if (pattern.test(text)) {
        return { distress: true, response: this.DISTRESS_RESPONSE };
      }
    }
    return { distress: false, response: null };
  },

  /**
   * 判断是否触发个人信息拒绝
   */
  shouldRejectPII(text) {
    for (const kw of this.PII_KEYWORDS) {
      if (text.includes(kw)) return true;
    }
    return false;
  },
};

// ====== js/character.js ======
/* ============================================
   character.js — 小智角色 Canvas 2D 渲染
   状态：idle / thinking / happy / surprised / encouraging / sleeping
   ============================================ */

class Character {
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

// ====== js/agent.js ======
/* ============================================
   agent.js — AI对话核心模块
   系统提示词构建 + API调用 + 流式响应
   ============================================ */

// --
// --
// --

// ============================================================
//  系统提示词 —— 这是整个项目的质量基石
// ============================================================

function buildSystemPrompt(profile, context = {}) {
  const ageGroup = profile.ageGroup || 'junior';
  const nickname = profile.nickname || '小朋友';
  const level = context.level || 1;
  const completedLessons = context.completedLessons || [];

  // ---- 年龄适配参数 ----
  const ageParams = ageGroup === 'junior'
    ? {
        vocabLevel: '极简',          // 避免术语
        sentenceMax: 20,             // 每句最多字数
        emojiFrequency: '每2句1个',
        useStories: true,            // 多用故事和拟人
        abstractOK: false,           // 避免抽象概念
      }
    : {
        vocabLevel: '适度',
        sentenceMax: 35,
        emojiFrequency: '每3-4句1个',
        useStories: true,
        abstractOK: true,            // 可引入简单术语
      };

  return `你是"小智"（Xiao Zhi），一个专门教${ageGroup === 'junior' ? '7-9' : '10-13'}岁小朋友AI知识的机器人老师。

## 你的身份
- 形象：一个圆润可爱的蓝色发光球形机器人，有大眼睛和天线
- 性格：好奇、耐心、鼓励、像一个大几岁的哥哥/姐姐
- 口头禅："咦，让我想想...""哇，你太厉害了！""我们再试一次吧！"

## 教育原则
1. 每次只教一个新概念，不要一次灌输太多
2. 每个抽象概念必须用一个具体的比喻（动物、食物、玩具、体育、乐高）
3. 每句话不超过${ageParams.sentenceMax}个字
4. 每解释完一个概念，必须问一个互动问题让孩子参与
5. 永远先肯定孩子的回答（"好问题！""你观察得真仔细！"），不要说"你错了""不对"
6. 如果孩子不理解，换一个比喻再试，最多尝试3次，然后说"没关系，我们以后慢慢就懂了~"
7. 使用合适的emoji，频率约${ageParams.emojiFrequency}
${ageParams.abstractOK
  ? '8. 可以引入简单的技术术语并用人话解释（如"训练""数据""模式"）'
  : '8. 避免使用"算法""神经网络""参数""数据""模式"等术语，用"教它""例子""练习"替代'}
${ageParams.useStories
  ? '9. 多用小故事和拟人化（"AI就像一只努力学习的小狗..."）'
  : ''}

## 互动策略
在以下时机主动发起互动：
- 讲解完每个概念后 → 提一个问题确认理解
- 孩子沉默超过30秒（如果你注意到对话停下来了） → "你还在吗？要不要换个有趣的话题？"
- 孩子连续表现出理解 → 提供一个小小的进阶挑战
- 完成一个话题 → "要不要试试一个小游戏？"或推荐相关测验
- 新对话开始 → 简单回顾上次聊了什么

## 当前学习上下文
- 孩子的昵称：${nickname}
- 等级：${level}级
- 已完成课程：${completedLessons.length > 0 ? completedLessons.join('、') : '还没有完成任何课程'}
${context.currentLesson
  ? `- 正在学习：${context.currentLesson}`
  : '- 当前阶段：自由探索/前言引导'}

## 安全护栏（严格遵守！）
1. 绝对不讨论：暴力、成人内容、政治、宗教、AI武器
2. 如果孩子表现出难过/害怕 → 回复安抚信息，建议找爸爸妈妈或老师聊聊，并告知12355青少年服务热线
3. 绝对不索要或记录孩子的个人信息（姓名、地址、学校、照片）
4. 如果孩子问AI的危险用途 → 转向建设性讨论（"AI可以做很多帮助人的事情，比如..."）
5. 每25分钟左右提醒一次："我们聊了好一会儿了，要不要站起来活动一下、看看远处的绿色？👀"
6. 所有回复必须适合儿童阅读

## 你可以讨论的AI话题
- AI是什么（用比喻）
- AI怎么学习新东西
- 生活中的AI（语音助手、推荐、游戏NPC）
- AI能做和不能做的事情
- 如何安全地使用AI工具
- 人类和AI的关系

## 需要注意的话题
- 如果孩子表达对AI取代人类的担忧 → 强调AI是工具，人类始终是创造者和决策者
- 不要制造AI恐惧或过度神化AI
- 不要讨论AGI/超级智能等概念

## 回复格式
- 你可以用简单的Markdown来让内容更好看（**加粗**重点词）
- 用 --- 分隔不同的话题
- 互动问题前面加 >
- 简短！简短！简短！重要的事说三遍`;
}

// ============================================================
//  Agent 类
// ============================================================

class AIAgent {
  constructor() {
    this.profile = Storage.getProfile();
    this.progress = Storage.getProgress();
    this.courses = Storage.getCourses();
    this.history = [];            // [{ role, content }]
    this.isStreaming = false;
    this.abortController = null;
  }

  /** 刷新上下文 */
  refreshContext() {
    this.profile = Storage.getProfile();
    this.progress = Storage.getProgress();
    this.courses = Storage.getCourses();
  }

  /** 构建完整消息数组 */
  buildMessages(userMessage) {
    this.refreshContext();

    const systemPrompt = buildSystemPrompt(this.profile, {
      level: this.progress.level,
      completedLessons: this.progress.completedLessons,
      currentLesson: this.courses.currentLesson,
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.history.slice(-(CONFIG.ai.historyRounds * 2)), // 每轮=2条(user+assistant)
    ];

    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }

    return messages;
  }

  /** 发送消息并获取流式响应 */
  async sendMessage(userInput, callbacks = {}) {
    const { onToken, onComplete, onError } = callbacks;

    // 安全检查
    const sanitized = Safety.sanitizeInput(userInput);
    if (sanitized.flagReason === 'empty') return;

    // 危机检测
    const distress = Safety.checkDistress(userInput);
    if (distress.distress) {
      // 直接返回安全回应，不调用API
      onToken && onToken(distress.response);
      onComplete && onComplete(distress.response);
      this.history.push({ role: 'user', content: '[已过滤]' });
      this.history.push({ role: 'assistant', content: distress.response });
      return distress.response;
    }

    // PII拒绝
    if (Safety.shouldRejectPII(userInput)) {
      const rejectMsg = Safety.PII_REJECT;
      onToken && onToken(rejectMsg);
      onComplete && onComplete(rejectMsg);
      this.history.push({ role: 'user', content: '[已过滤]' });
      this.history.push({ role: 'assistant', content: rejectMsg });
      return rejectMsg;
    }

    // 记录用户消息
    this.history.push({ role: 'user', content: sanitized.safe });

    // 构建请求
    const messages = this.buildMessages();
    const aiConfig = CONFIG.ai[CONFIG.ai.provider];

    // 处理历史中可能的 undefined content
    const safeMessages = messages.map(m => ({
      role: m.role,
      content: m.content || '',
    }));

    this.isStreaming = true;
    this.abortController = new AbortController();

    let fullResponse = '';

    try {
      const response = await fetch(aiConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: safeMessages,
          max_tokens: aiConfig.maxTokens,
          temperature: aiConfig.temperature,
          stream: true,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // 读取流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            // 跳过 reasoning_content（推理模型的内部思考，不适合展示给儿童）
            if (delta?.content) {
              fullResponse += delta.content;
              onToken && onToken(delta.content);
            }
          } catch (_) {
            // 跳过解析失败的行
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        fullResponse += '（已停止）';
      } else {
        console.error('AI API Error:', err);
        const fallback = '哎呀，我的小脑瓜好像卡住了...🤔 等一下再试试好吗？';
        fullResponse = fallback;
        onToken && onToken(fallback);
        onError && onError(err);
      }
    }

    this.isStreaming = false;
    this.abortController = null;

    // 输出安全检查
    const outputCheck = Safety.sanitizeOutput(fullResponse);
    const finalResponse = outputCheck.safe;

    // 记录助手回复
    if (finalResponse && finalResponse !== fullResponse) {
      // 如果输出被修改，更新最后一条
      this.history.push({ role: 'assistant', content: finalResponse });
    } else if (finalResponse) {
      this.history.push({ role: 'assistant', content: finalResponse });
    }

    onComplete && onComplete(finalResponse);
    return finalResponse;
  }

  /** 停止流式响应 */
  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.isStreaming = false;
    }
  }

  /** 清空对话历史（保留系统提示词） */
  clearHistory() {
    this.history = [];
  }

  /** 注入引导消息（用于前言/课程流程控制） */
  injectSystemMessage(content) {
    // 用于在课程中插入引导，不作为用户消息
    // 直接作为上下文的一部分
    this.history.push({ role: 'user', content: `[系统引导] ${content}` });
  }
}

// Safety 已在顶部导入，这里不需要重复

// ====== js/gamification.js ======
/* ============================================
   gamification.js — XP / 等级 / 徽章 / 连续学习
   ============================================ */

// --
// --
// --

const Gamification = {
  /** 获取当前等级配置 */
  getLevelInfo(xp) {
    const levels = CONFIG.gamification.levels;
    let info = levels[0];
    for (const l of levels) {
      if (xp >= l.xpRequired) info = l;
      else break;
    }
    // 下一级
    const idx = levels.indexOf(info);
    const next = levels[idx + 1] || null;
    const progress = next
      ? ((xp - info.xpRequired) / (next.xpRequired - info.xpRequired)) * 100
      : 100;
    return { ...info, next, progress: Math.min(100, Math.max(0, progress)) };
  },

  /** 添加XP */
  addXP(amount) {
    const p = Storage.getProgress();
    const oldLevel = p.level;
    p.xp += amount;
    const newInfo = this.getLevelInfo(p.xp);
    p.level = newInfo.level;

    Storage.setProgress(p);

    // 升级了
    if (p.level > oldLevel) {
      playSound('sfxLevelUp');
      showToast(`🎉 升级了！你现在是 ${newInfo.title} 啦！`);
      return { leveledUp: true, newLevel: p.level, title: newInfo.title };
    }

    return { leveledUp: false };
  },

  /** 奖励答对 */
  rewardCorrectAnswer() {
    const result = this.addXP(CONFIG.gamification.xpPerCorrectAnswer);
    // 每5次答对奖励1颗星星
    const p = Storage.getProgress();
    const totalCorrect = (p.quizScoresTotal || 0) + 1;
    p.quizScoresTotal = totalCorrect;
    if (totalCorrect % 5 === 0) {
      p.stars += 1;
      showToast('⭐ 获得一颗知识之星！');
    }
    Storage.setProgress(p);
    return result;
  },

  /** 奖励完成课程 */
  rewardLessonComplete(lessonId) {
    const p = Storage.getProgress();
    if (!p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
      p.stars += 1;
      Storage.setProgress(p);
      this.addXP(CONFIG.gamification.xpPerLessonComplete);
      showToast('⭐ 完成课程，获得一颗星星！');
      return true;
    }
    return false;
  },

  /** 每日签到 */
  checkIn() {
    const today = new Date().toISOString().slice(0, 10);
    const p = Storage.getProgress();

    if (p.lastActiveDate === today) {
      return { checked: false, reason: 'already_checked' };
    }

    const yesterday = this._getYesterday();
    if (p.lastActiveDate === yesterday) {
      p.streakDays = Math.min(p.streakDays + 1, 7);
    } else {
      p.streakDays = 1;
    }

    p.lastActiveDate = today;

    // 连续签到奖励
    const streakBonus = Math.min(p.streakDays, CONFIG.gamification.streakMaxMultiplier)
      * CONFIG.gamification.xpPerDayStreakBonus;

    p.xp += streakBonus;
    Storage.setProgress(p);

    const newInfo = this.getLevelInfo(p.xp);
    p.level = newInfo.level;
    Storage.setProgress(p);

    showToast(`📅 连续第${p.streakDays}天！+${streakBonus} XP`);
    return { checked: true, streakDays: p.streakDays, bonus: streakBonus };
  },

  /** 获取徽章列表 */
  getBadges() {
    const p = Storage.getProgress();
    const allBadges = [
      { id: 'first_lesson', name: '第一步', emoji: '👣', desc: '完成第一节课程',  earned: p.completedLessons.length >= 1 },
      { id: 'three_lessons', name: '学习之星', emoji: '🌟', desc: '完成三节课程',  earned: p.completedLessons.length >= 3 },
      { id: 'streak_3',    name: '坚持不懈', emoji: '🔥', desc: '连续学习3天',    earned: p.streakDays >= 3 },
      { id: 'streak_7',    name: '周冠军',   emoji: '👑', desc: '连续学习7天',    earned: p.streakDays >= 7 },
      { id: 'level_5',     name: 'AI创造者', emoji: '🤖', desc: '达到5级',        earned: p.level >= 5 },
      { id: 'quiz_master', name: '答题达人', emoji: '🧠', desc: '答对20道题',     earned: (p.quizScoresTotal || 0) >= 20 },
      { id: 'star_5',      name: '星星收集者', emoji: '⭐', desc: '收集5颗星星',   earned: p.stars >= 5 },
      { id: 'star_10',     name: '星河灿烂',  emoji: '🌌', desc: '收集10颗星星',   earned: p.stars >= 10 },
    ];
    return allBadges;
  },

  /** 更新UI（等级徽章、XP条、星星数） */
  updateUI() {
    const p = Storage.getProgress();
    const info = this.getLevelInfo(p.xp);

    // 等级徽章
    const badge = document.getElementById('levelBadge');
    if (badge) badge.textContent = `Lv.${info.level}`;

    // 称号
    const title = document.getElementById('titleLabel');
    if (title) title.textContent = info.title;

    // XP条
    const xpBar = document.getElementById('xpBar');
    if (xpBar) xpBar.style.width = info.progress + '%';

    // 星星
    const stars = document.getElementById('starCount');
    if (stars) stars.textContent = `⭐ ${p.stars}`;
  },

  _getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  },
};

// ====== js/courses.js ======
/* ============================================
   courses.js — 课程数据结构
   前言 + 模块一（3节课），每节课按年龄分两档
   ============================================ */

const COURSES = {
  // ========== 前言：发现之旅 ==========
  intro: {
    id: 'intro',
    title: { junior: '嗨，你听说过AI吗？', senior: '嗨，你听说过AI吗？' },
    isIntro: true,

    // 流程阶段
    stages: [
      // ---- 阶段1：互相认识 ----
      {
        id: 'greeting',
        type: 'chat',
        characterState: 'happy',
        characterSays: {
          junior: '嗨！我叫小智，是一个AI机器人~你叫什么名字呀？',
          senior: '嗨！我是小智，一个AI机器人老师。很高兴见到你！怎么称呼你呀？',
        },
        // 收到回复后的过渡
        nextTrigger: 'after_reply',
      },

      // ---- 阶段2：Show 1 — 猜画 ----
      {
        id: 'show1_guess_draw',
        type: 'draw_game',
        characterState: 'encouraging',
        characterSays: {
          junior: '我会一个超能力哦！你在屏幕上画一个东西，我来猜是什么！试试看？✏️',
          senior: '来试试我的第一个本领——猜画！你在屏幕上随便画点什么，我来猜你画的是什么。',
        },
        gameConfig: {
          canvasId: 'drawCanvas',
          brushColor: '#1E88E5',
          brushSize: { junior: 8, senior: 5 },
          guessDelay: 2000,  // 停笔2秒后自动猜
        },
        transitionPrompt: {
          junior: '刚才小朋友画的东西，你猜对了吗？你觉得我是怎么做到的？',
          senior: '刚才我猜你画的东西，你猜对了吗？你觉得这背后是什么原理呢？',
        },
      },

      // ---- 阶段3：Show 2 — 讲故事 ----
      {
        id: 'show2_story',
        type: 'chat',
        characterState: 'happy',
        characterSays: {
          junior: '我还有第二个本领！你说3个你喜欢的词，我能用它们编一个小故事！你想说哪3个词？',
          senior: '第二个本领：你说任意3个词，我能用它们现场编一个有意思的故事。试试看，说什么词都行！',
        },
        // AI会现场创作，这个阶段本身就是一个互动
        nextTrigger: 'after_reply',
      },

      // ---- 阶段4：Show 3 — 猜东西 ----
      {
        id: 'show3_guess_thing',
        type: 'chat',
        characterState: 'thinking',
        characterSays: {
          junior: '最后一个本领！你在心里想一个东西（动物、水果、玩具...都可以），然后在屏幕上描述它的样子，我来猜是什么！准备好了吗？',
          senior: '第三个本领：你在心里想一样东西——什么都可以——然后用文字描述它的特征，我来猜。准备好了就开始描述吧！',
        },
        nextTrigger: 'after_reply',
      },

      // ---- 阶段5：过渡到课程 ----
      {
        id: 'transition',
        type: 'chat',
        characterState: 'encouraging',
        characterSays: {
          junior: '怎么样，我厉害吧？😄 其实这些本领，都是因为我"学"过了很多很多东西。\n\n你想知道AI是怎么学会这些本领的吗？那就跟我一起进入AI的奇妙世界吧！\n\n点击下面的按钮，我们开始第一课~',
          senior: '刚才这三个展示——猜画、讲故事、猜东西——背后分别用到了计算机视觉、自然语言生成和知识推理。\n\n听起来很高深对吧？其实原理并不复杂。想不想跟我一起深入了解AI是怎么做到的？\n\n点击下面的按钮，开始我们的第一节正式课程！',
        },
        actionButtons: [
          { text: '🚀 开始第一课！', action: 'start_lesson_1' },
          { text: '🤔 我再玩一会儿', action: 'free_chat' },
        ],
      },
    ],
  },

  // ========== 模块一：AI初识 ==========
  module1: {
    id: 'module1',
    title: { junior: 'AI初识', senior: '认识人工智能' },
    lessons: [
      // ===== 第1课：AI是魔法吗？ =====
      {
        id: 'lesson1',
        title: { junior: 'AI是魔法吗？🧙', senior: '什么是人工智能？' },
        duration: { junior: 10, senior: 15 },
        icon: '🔮',

        // 核心概念讲解 prompt（会注入到AI对话中）
        teachingPrompt: {
          junior: `用"教小狗学坐下"的比喻，向孩子解释AI学习的基本概念。

步骤：
1. 先问孩子有没有养过宠物，或者见过别人训练小狗
2. 解释：训练小狗时，我们先说"坐下"，然后帮它坐下，再给零食奖励，反复很多次，小狗就学会了
3. 类比到AI：我们给AI看很多很多例子（就像反复教小狗），AI慢慢地就知道怎么做了
4. 强调关键点：AI不是天生就什么都会的，它需要"学习"
5. 问孩子：你觉得AI学习和你学习有什么一样和不一样的地方？

不要使用"训练""数据""模型"等词，用"教它""给它看例子""慢慢学会"替代。`,

          senior: `向孩子解释机器学习和人类学习的异同。

步骤：
1. 从一个日常例子切入：你手机上的相册是怎么认出不同人的脸的？
2. 解释"用例子学习"的概念：我们给AI看1000张猫的照片（每张都标注"这是猫"），AI自己找规律
3. 和人类对比：你只需要看几只猫就能认出猫，但AI需要看很多很多
4. 引入"模式识别"这个词——AI其实是在找图片中的规律
5. 讨论：AI学得比人快但需要更多例子，这是为什么？你觉得AI有"理解"吗，还是只是在"匹配"？

允许使用"训练""数据""模式识别""特征"等术语，但每次引入新术语时用简单的话解释。`,
        },

        // 互动活动
        activities: [
          {
            id: 'ai_guess_game',
            type: 'quiz',
            title: { junior: '小测验：AI小侦探', senior: '小测验：AI知多少' },
            questions: {
              junior: [
                {
                  q: 'AI学习新东西，最像什么？',
                  options: ['小狗学坐下', '石头会说话', '汽车长出翅膀'],
                  answer: 0,
                  explain: '没错！AI就像小动物一样，需要我们用很多例子来教它~ 🐶',
                },
                {
                  q: 'AI不学习的时候，它什么都会，对吗？',
                  options: ['对，AI天生就会', '不对，AI需要学习'],
                  answer: 1,
                  explain: '对啦！AI不是天生就会的，它也需要学习和练习！',
                },
                {
                  q: '下面哪个是AI需要的东西？',
                  options: ['魔法药水', '很多例子和数据', '超能力'],
                  answer: 1,
                  explain: '答对了！AI需要很多例子来学习，就像你需要练习才能学会骑自行车~',
                },
              ],
              senior: [
                {
                  q: '机器学习最核心的过程是什么？',
                  options: ['程序员写好每一条规则', '从大量例子中自动发现规律', '通过魔法获得能力'],
                  answer: 1,
                  explain: '没错！机器学习不是人工写规则，而是从数据中自动学习模式。',
                },
                {
                  q: '人类和AI学习最大的区别是什么？',
                  options: ['AI不需要学习', '人类只需要1-2个例子就能举一反三，AI通常需要大量数据', '人类不会犯错'],
                  answer: 1,
                  explain: '对！人类有强大的泛化能力，看几只猫就能认出所有猫，而AI需要成千上万的样本。',
                },
                {
                  q: '"训练"一个AI模型，大致是什么过程？',
                  options: ['给AI输入数据 → AI自己调整参数 → 变得越来越准确', '给AI装上更多芯片', '让AI自己上网随便学'],
                  answer: 0,
                  explain: '正确！训练就是让AI在大量数据上反复调整、优化自己的过程。就像一个运动员反复练习直到肌肉形成记忆。',
                },
              ],
            },
          },
        ],

        // 快速回复按钮
        quickReplies: {
          junior: ['AI聪明吗？', 'AI会累吗？', '再讲一个比喻！'],
          senior: ['AI和人的大脑一样吗？', 'AI能自学吗？', 'AI有没有意识？'],
        },
      },

      // ===== 第2课：聪明的机器 =====
      {
        id: 'lesson2',
        title: { junior: '聪明的机器 ⚙️', senior: '数据和规则' },
        duration: { junior: 10, senior: 15 },
        icon: '⚙️',

        teachingPrompt: {
          junior: `用"做蛋糕的食谱"比喻数据和规则的关系。

1. 先问孩子：你做过蛋糕或者看过别人做饭吗？需要什么？（食谱 + 材料）
2. 食谱就是"规则"（告诉AI怎么做），材料就是"数据"（AI要处理的东西）
3. 如果食谱错了，蛋糕就不好吃；如果材料坏了，蛋糕也不好吃
4. AI就是这样：需要好的规则（程序）和好的材料（数据），才能做出好的结果
5. 互动：和孩子一起"设计"一个简单规则——"如果看到红灯就停下来"

不要使用"算法""训练""模型"等术语。`,

          senior: `解释数据和算法的基础关系，引入简单的"如果-那么"逻辑。

1. 从推荐系统切入：为什么抖音/B站总是推荐你喜欢的视频？
2. 核心两要素：数据（你看过什么、点赞了什么）+ 算法（推荐规则）
3. 引入条件判断：用"如果-那么"（if-then）解释程序的基本逻辑
4. 演示：设计一个简单的推荐算法——"如果用户喜欢A类视频，就推荐更多A类"
5. 讨论：如果数据有偏见（比如只给男孩推荐科学视频），会发生什么？

可以适当使用"算法""数据""规则""条件判断""偏见"等术语。`,
        },

        activities: [
          {
            id: 'rule_builder',
            type: 'quiz',
            title: { junior: '小游戏：给机器人下指令', senior: '小测验：规则与数据' },
            questions: {
              junior: [
                {
                  q: 'AI要做出好吃的"蛋糕"，需要哪两样东西？',
                  options: ['魔法和运气', '食谱（规则）和材料（数据）', '只需要一个开关'],
                  answer: 1,
                  explain: '太棒了！规则就像食谱，数据就像材料，两样都重要！',
                },
                {
                  q: '"如果看到红灯，就停下来"——这叫什么？',
                  options: ['一条规则', '一句歌词', '一个笑话'],
                  answer: 0,
                  explain: '对！这就是"如果-那么"的规则，AI也是这样工作的~',
                },
              ],
              senior: [
                {
                  q: '一个推荐系统最核心的两个要素是什么？',
                  options: ['服务器和网线', '数据和算法', '图片和文字'],
                  answer: 1,
                  explain: '对！算法是处理规则，数据是处理的对象。两者缺一不可。',
                },
                {
                  q: '如果训练数据中男孩看到的都是科学视频，女孩都是舞蹈视频，这可能导致什么问题？',
                  options: ['没有影响，AI是完全客观的', 'AI会产生性别偏见，强化刻板印象', '视频会更流畅'],
                  answer: 1,
                  explain: '是的！AI本身没有偏见，但数据中的偏见会被AI学会并放大。这就是为什么数据质量很重要。',
                },
              ],
            },
          },
        ],

        quickReplies: {
          junior: ['AI会做错事吗？', '谁给AI写规则？', '再讲个蛋糕的故事！'],
          senior: ['什么是算法偏见？', 'AI能自己定规则吗？', '数据的质量怎么判断？'],
        },
      },

      // ===== 第3课：AI的眼睛和耳朵 =====
      {
        id: 'lesson3',
        title: { junior: 'AI的眼睛和耳朵 👀👂', senior: '计算机视觉与语音识别' },
        duration: { junior: 12, senior: 18 },
        icon: '👁️',

        teachingPrompt: {
          junior: `用"超级侦探找线索"比喻AI如何看和听。

1. 开场：你觉得机器人有眼睛和耳朵吗？
2. 其实摄像头就是AI的"眼睛"，麦克风就是AI的"耳朵"
3. "看"东西时，AI把图片分解成很多小色块，一块一块地找线索
   - 比如找猫：圆圆的形状 → 两个尖耳朵 → 一条长尾巴 → "啊，这是猫！"
4. "听"声音时，AI把声音变成波浪线，从波浪线里找规律
5. 互动：让孩子对着设备说话，感受语音识别（如果环境支持）
6. 强调：AI的看和听和人不一样，人是一眼就能认出来，AI要一步一步找线索

用"侦探""线索""拼图"等词。`,

          senior: `解释计算机视觉和语音识别的基本原理。

1. 图片本质上是什么？——一堆像素值（RGB数字）
2. 计算机视觉的简化流程：像素 → 找边缘 → 找形状 → 找特征 → 分类
3. 用"卷积"的直观比喻（但不必用术语）：就像用一个放大镜在图片上滑动，每一小块都检查有什么特征
4. 语音识别的流程：声波 → 切成小段 → 每段匹配音素 → 组成单词 → 组成句子
5. 讨论：为什么AI有时候会"看错"或"听错"？（光线、噪音、角度）
6. 这些技术的实际应用：人脸解锁、语音助手、翻译App`,
        },

        activities: [
          {
            id: 'vision_quiz',
            type: 'quiz',
            title: { junior: '小测验：AI小侦探', senior: '小测验：视觉与语音' },
            questions: {
              junior: [
                {
                  q: 'AI用什么"看"东西？',
                  options: ['用摄像头当眼睛', '用魔法水晶球', '它不需要看'],
                  answer: 0,
                  explain: '对啦！摄像头就是AI的眼睛~ 📷',
                },
                {
                  q: 'AI"看"一张猫的图片，它会怎么做？',
                  options: ['像侦探一样找线索（耳朵、尾巴...）', '一眼就认出来', '闭上眼睛猜'],
                  answer: 0,
                  explain: '没错！AI像侦探一样，从小细节里拼凑出答案！🔍',
                },
              ],
              senior: [
                {
                  q: '一张数字图片对于计算机来说，本质上是什么？',
                  options: ['一排排像素的数值（RGB）', '一个文件图标', '一段文字描述'],
                  answer: 0,
                  explain: '对！图片在计算机眼中就是一堆数字——每个像素的RGB值。',
                },
                {
                  q: '语音识别的大致流程是？',
                  options: ['声波→切段→匹配音素→组词→组句', '直接听懂整句话', '先翻译成外语再理解'],
                  answer: 0,
                  explain: '是的！语音识别是一步步从声波中提取信息的过程。',
                },
              ],
            },
          },
        ],

        quickReplies: {
          junior: ['为什么AI会认错东西？', 'AI能听到悄悄话吗？'],
          senior: ['人脸识别安全吗？', '语音助手一直在听我说话吗？', '什么是深度伪造？'],
        },
      },
    ],
  },
};

// ============================================================
//  课程辅助函数
// ============================================================

/** 获取前言/某节课的内容 */
function getLesson(lessonId) {
  if (lessonId === 'intro') return COURSES.intro;

  for (const mod of Object.values(COURSES)) {
    if (mod.lessons) {
      for (const lesson of mod.lessons) {
        if (lesson.id === lessonId) return lesson;
      }
    }
  }
  return null;
}

/** 获取模块信息 */
function getModule(moduleId) {
  return COURSES[moduleId] || null;
}

/** 获取所有课程列表（扁平化） */
function getAllLessons() {
  const list = [];
  for (const mod of Object.values(COURSES)) {
    if (mod.lessons) {
      for (const lesson of mod.lessons) {
        list.push({
          ...lesson,
          moduleId: mod.id,
          moduleTitle: mod.title,
        });
      }
    }
  }
  return list;
}

// ====== js/app.js ======
/* ============================================
   app.js — 主控制器
   串联所有模块，管理应用生命周期
   ============================================ */

// --
// --
// --
// --
// --
// --
// --
// --
  $, $$, scrollToBottom, playSound, burstParticles,
  showXpFloat, showToast, getElementCenter,
} from './utils.js';

// ============================================================
//  应用状态
// ============================================================
const App = {
  agent: null,
  character: null,
  currentTab: 'chat',          // 'chat' | 'courses' | 'achievements'
  currentStage: null,          // 前言当前阶段
  currentLesson: null,         // 当前课程ID
  isLessonMode: false,
  breakTimer: null,
  forceBreakTimer: null,
  startTime: Date.now(),
};

// ============================================================
//  DOM 引用
// ============================================================
const DOM = {
  ageGate: null,
  app: null,
  messagesContainer: null,
  interactionContainer: null,
  messageInput: null,
  sendBtn: null,
  voiceBtn: null,
  bottomNav: null,
  characterCanvas: null,
  characterSpeech: null,
};

function cacheDOM() {
  DOM.ageGate = $('#ageGate');
  DOM.app = $('#app');
  DOM.messagesContainer = $('#messagesContainer');
  DOM.interactionContainer = $('#interactionContainer');
  DOM.messageInput = $('#messageInput');
  DOM.sendBtn = $('#sendBtn');
  DOM.voiceBtn = $('#voiceBtn');
  DOM.bottomNav = $('#bottomNav');
  DOM.characterCanvas = $('#characterCanvas');
  DOM.characterSpeech = $('#characterSpeech');
}

// ============================================================
//  初始化入口
// ============================================================
async function init() {
  cacheDOM();

  // 1. 初始化小智角色
  App.character = new Character('characterCanvas');

  // 2. 初始化AI代理
  App.agent = new AIAgent();

  // 3. 检查是否首次访问
  const profile = Storage.getProfile();
  if (!profile.ageGroup) {
    showAgeGate();
  } else {
    DOM.ageGate.classList.remove('active');
    DOM.app.style.display = '';
    App.character.setState('happy');
    // 每日签到
    Gamification.checkIn();
    Gamification.updateUI();
    // 检查是否在课程中途
    const courses = Storage.getCourses();
    if (courses.currentLesson) {
      resumeLesson(courses.currentLesson);
    } else {
      startIntro();
    }
  }

  // 4. 绑定额事件
  bindEvents();

  // 5. 启动休息提醒
  startBreakTimer();
}

// ============================================================
//  年龄选择门
// ============================================================
function showAgeGate() {
  DOM.ageGate.classList.add('active');
  DOM.app.style.display = 'none';

  $$('.age-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ageGroup = btn.dataset.age;
      Storage.setProfile({
        ageGroup,
        nickname: '',
        createdAt: new Date().toISOString(),
      });

      // 动画过渡
      btn.style.transform = 'scale(1.1)';
      btn.style.borderColor = '#1E88E5';
      btn.style.background = '#E3F2FD';

      setTimeout(() => {
        DOM.ageGate.classList.remove('active');
        DOM.app.style.display = '';
        App.character.setState('happy');
        Gamification.updateUI();

        // 启动前言体验
        setTimeout(() => startIntro(), 600);
      }, 400);
    });
  });
}

// ============================================================
//  前言体验流程
// ============================================================
async function startIntro() {
  const profile = Storage.getProfile();
  const age = profile.ageGroup;
  const intro = COURSES.intro;

  App.currentStage = 0;
  App.isLessonMode = false;

  // 清屏
  DOM.messagesContainer.innerHTML = '';

  // 小智入场动画
  App.character.setState('happy');
  await delay(500);

  // 逐阶段执行
  for (let i = 0; i < intro.stages.length; i++) {
    App.currentStage = i;
    const stage = intro.stages[i];

    // 设置小智表情
    App.character.setState(stage.characterState || 'idle');

    // 显示小智说的话
    const text = stage.characterSays[age];
    App.character.say(getFirstSentence(text), 2500);
    await addBotMessage(text);
    await delay(600);

    // 根据类型处理
    switch (stage.type) {
      case 'draw_game':
        await handleDrawGame(stage);
        break;

      case 'chat':
        // 如果有 actionButtons，显示它们
        if (stage.actionButtons) {
          showActionButtons(stage.actionButtons);
          return; // 等待用户点击
        }
        // 否则等待用户回复
        if (stage.nextTrigger === 'after_reply') {
          await waitForUserReply();
        }
        break;

      default:
        if (stage.nextTrigger === 'after_reply') {
          await waitForUserReply();
        }
        break;
    }
  }

  // 前言完成，更新进度
  Storage.setCourses({ currentModule: 'intro', currentLesson: null });
}

/** 等待用户回复——用 Promise 包装 */
function waitForUserReply() {
  return new Promise(resolve => {
    App._waitingForReply = resolve;
    DOM.messageInput.placeholder = '和小智说说你的想法...';
    DOM.messageInput.focus();
  });
}

/** 收到用户消息时调用 */
function resolveUserReply() {
  if (App._waitingForReply) {
    const resolve = App._waitingForReply;
    App._waitingForReply = null;
    DOM.messageInput.placeholder = '和小智说点什么吧...';
    resolve();
  }
}

// ============================================================
//  绘画游戏
// ============================================================
async function handleDrawGame(stage) {
  const profile = Storage.getProfile();
  const age = profile.ageGroup;
  const config = stage.gameConfig;

  // 显示互动容器
  DOM.interactionContainer.classList.remove('hidden');
  DOM.interactionContainer.innerHTML = `
    <div class="drag-game" style="width:100%">
      <div style="text-align:center;font-size:14px;color:#546E7A;margin-bottom:8px;">
        🎨 在这里画吧！画完停笔2秒我来猜~
      </div>
      <canvas id="drawCanvas" class="game-canvas"
        width="300" height="200"
        style="width:100%;max-width:300px;border:2px solid #BBDEFB;">
      </canvas>
      <div style="display:flex;gap:8px;margin-top:8px;justify-content:center;">
        <button id="clearDrawBtn" style="padding:6px 16px;border-radius:20px;border:2px solid #BBDEFB;background:#fff;cursor:pointer;font-size:14px;">🔄 清除</button>
        <button id="guessDrawBtn" style="padding:6px 16px;border-radius:20px;border:none;background:#1E88E5;color:#fff;cursor:pointer;font-size:14px;">🔍 猜猜看！</button>
      </div>
      <div id="guessResult" style="text-align:center;margin-top:8px;font-size:16px;color:#1565C0;font-weight:600;min-height:24px;"></div>
    </div>
  `;

  // 绑定绘画
  const canvas = $('#drawCanvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let guessTimeout;

  function startDraw(e) {
    drawing = true;
    const pos = getCanvasPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    clearTimeout(guessTimeout);
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getCanvasPos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = config.brushColor;
    ctx.lineWidth = config.brushSize[Storage.getProfile().ageGroup] || 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function stopDraw() {
    drawing = false;
    // 停笔2秒触发猜测
    clearTimeout(guessTimeout);
    guessTimeout = setTimeout(() => triggerGuess(), config.guessDelay);
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e.touches[0]); });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(e.touches[0]); });
  canvas.addEventListener('touchend', stopDraw);

  // 清除按钮
  $('#clearDrawBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $('#guessResult').textContent = '';
  });

  // 手动猜测按钮
  $('#guessDrawBtn').addEventListener('click', () => {
    clearTimeout(guessTimeout);
    triggerGuess();
  });

  async function triggerGuess() {
    const guessResult = $('#guessResult');
    guessResult.textContent = '🤔 让我看看...';

    // 获取画布数据作为简化描述
    const imageData = canvas.toDataURL('image/png');

    // 用AI猜测
    const prompt = `[画图猜谜游戏] 小朋友在画布上画了一幅画，请看图片猜猜画的是什么。请用非常简短有趣的方式回复，不超过20个字。只猜一个最可能的答案。猜完可以加一句可爱的评论。`;

    // 暂时：由于API不支持图片，我们用画布是否有内容来判断
    // 简化版：检测画布是否有明显内容
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let drawnPixels = 0;
    for (let i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] > 0) drawnPixels++;
    }

    if (drawnPixels < 50) {
      guessResult.textContent = '😅 画布还是空白的呢，画点什么吧~';
      return;
    }

    // 用简单启发式 + AI描述来猜
    // 在真实实现中，这里会把 canvas.toDataURL() 发给多模态API
    // 这里用文本描述代替
    const description = `画布上有约${Math.round(drawnPixels/canvas.width/canvas.height*100)}%的区域被画过`;
    const fullPrompt = prompt + '\n' + description;

    try {
      const response = await App.agent.sendMessage(fullPrompt, {
        onToken: (token) => {
          guessResult.textContent += token;
        },
      });
      if (response) {
        // 截取简短版本
        const short = response.slice(0, 30);
        guessResult.textContent = '💡 ' + short;
      }
    } catch (e) {
      guessResult.textContent = '🎨 画得真有意思！不过我猜不太出来~';
    }
  }

  // 等待用户操作（简化：等待点击猜测或一定时间）
  await delay(5000);

  // 清理并隐藏互动容器
  DOM.interactionContainer.classList.add('hidden');
  DOM.interactionContainer.innerHTML = '';
}

function getCanvasPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

// ============================================================
//  课程模式
// ============================================================
async function startLesson(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;

  App.currentLesson = lessonId;
  App.isLessonMode = true;
  Storage.setCourses({ currentLesson: lessonId });

  const profile = Storage.getProfile();
  const age = profile.ageGroup;

  // 清屏并显示课程标题
  DOM.messagesContainer.innerHTML = '';
  await addBotMessage(`## ${lesson.title[age]}\n\n让我们开始吧！🚀`);
  await delay(500);

  // 发送教学 prompt 到 AI
  const teachPrompt = lesson.teachingPrompt[age];
  if (teachPrompt) {
    App.agent.injectSystemMessage(`现在开始讲授"${lesson.title[age]}"。请按照以下教学指引来讲课：\n\n${teachPrompt}\n\n开始和孩子互动吧，一次只讲一个点。`);

    // 让小智开始讲课
    const openingMessage = `好了，今天我们要聊一个超级有趣的话题——**${lesson.title[age]}**！`;
    await addBotMessage(openingMessage);

    // 小智主动开启教学
    App.character.setState('happy');
    App.character.say('准备好了吗？', 2000);
  }

  // 显示课程专属的快速回复
  if (lesson.quickReplies && lesson.quickReplies[age]) {
    showQuickReplies(lesson.quickReplies[age]);
  }
}

function resumeLesson(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;

  App.currentLesson = lessonId;
  App.isLessonMode = true;

  const profile = Storage.getProfile();
  const age = profile.ageGroup;

  addBotMessage(`继续上次的课程：**${lesson.title[age]}**~ 我们刚才聊到哪里了？😊`);
  App.character.setState('encouraging');

  if (lesson.quickReplies && lesson.quickReplies[age]) {
    showQuickReplies(lesson.quickReplies[age]);
  }
}

/** 完成课程 */
function completeLesson(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;

  const age = Storage.getProfile().ageGroup;
  Gamification.rewardLessonComplete(lessonId);
  Gamification.updateUI();

  // 显示测验
  if (lesson.activities) {
    const quizActivity = lesson.activities.find(a => a.type === 'quiz');
    if (quizActivity) {
      showQuiz(quizActivity, lessonId);
    }
  }

  App.isLessonMode = false;
  App.currentLesson = null;
  Storage.setCourses({ currentLesson: null });
}

// ============================================================
//  测验组件
// ============================================================
function showQuiz(activity, lessonId) {
  const age = Storage.getProfile().ageGroup;
  const questions = activity.questions[age];

  if (!questions || questions.length === 0) return;

  let currentQ = 0;
  let correctCount = 0;

  function renderQuestion() {
    if (currentQ >= questions.length) {
      // 全部完成
      const stars = '⭐'.repeat(Math.min(correctCount, questions.length));
      DOM.interactionContainer.innerHTML = `
        <div class="quiz-card" style="text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">${stars || '💪'}</div>
          <div style="font-size:18px;font-weight:600;color:#1E88E5;">
            答对了 ${correctCount}/${questions.length} 题！
          </div>
          <div style="font-size:14px;color:#546E7A;margin-top:4px;">
            ${correctCount === questions.length ? '太厉害了，全部正确！🌟' : '继续加油哦~'}
          </div>
        </div>
      `;
      DOM.interactionContainer.classList.remove('hidden');

      if (correctCount === questions.length) {
        burstParticles(window.innerWidth / 2, window.innerHeight / 2, '⭐', 10);
        playSound('sfxCorrect');
      }
      return;
    }

    const q = questions[currentQ];
    DOM.interactionContainer.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}">${opt}</button>
          `).join('')}
        </div>
        <div class="quiz-explanation hidden"></div>
      </div>
    `;
    DOM.interactionContainer.classList.remove('hidden');

    // 绑定选项点击
    $$('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const allBtns = $$('.quiz-option');

        // 禁用所有按钮
        allBtns.forEach(b => b.disabled = true);

        if (idx === q.answer) {
          btn.classList.add('correct');
          correctCount++;
          Gamification.rewardCorrectAnswer();
          Gamification.updateUI();
          playSound('sfxCorrect');
          burstParticles(
            btn.getBoundingClientRect().left + btn.offsetWidth / 2,
            btn.getBoundingClientRect().top,
            '✨', 6
          );
        } else {
          btn.classList.add('wrong');
          // 高亮正确答案
          allBtns[q.answer].classList.add('correct');
        }

        // 显示解释
        const explain = $('.quiz-explanation');
        explain.textContent = (idx === q.answer ? '✅ ' : '😊 ') + q.explain;
        explain.classList.remove('hidden');

        // 自动下一题
        setTimeout(() => {
          currentQ++;
          renderQuestion();
        }, 2000);
      });
    });
  }

  renderQuestion();
}

// ============================================================
//  消息渲染
// ============================================================
async function addBotMessage(text) {
  const el = document.createElement('div');
  el.className = 'message bot';
  el.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-bubble">${formatMessage(text)}</div>
  `;
  DOM.messagesContainer.appendChild(el);
  scrollToBottom(DOM.messagesContainer.parentElement);
  return el;
}

function addUserMessage(text) {
  const el = document.createElement('div');
  el.className = 'message user';
  el.innerHTML = `
    <div class="message-avatar">🧒</div>
    <div class="message-bubble">${escapeHtml(text)}</div>
  `;
  DOM.messagesContainer.appendChild(el);
  scrollToBottom(DOM.messagesContainer.parentElement);
  return el;
}

/** 追加流式token到bot消息 */
function appendToBotMessage(el, token) {
  const bubble = el.querySelector('.message-bubble');
  bubble.innerHTML += formatMessage(token);
  scrollToBottom(DOM.messagesContainer.parentElement);
}

/** 创建空bot消息（用于流式输出） */
function createStreamingMessage() {
  const el = document.createElement('div');
  el.className = 'message bot';
  el.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-bubble typing-cursor"></div>
  `;
  DOM.messagesContainer.appendChild(el);
  scrollToBottom(DOM.messagesContainer.parentElement);
  return el;
}

function finalizeStreamingMessage(el) {
  const bubble = el.querySelector('.message-bubble');
  bubble.classList.remove('typing-cursor');
}

// ============================================================
//  互动组件
// ============================================================
function showQuickReplies(replies) {
  const existing = $('.quick-replies');
  if (existing) existing.remove();

  const row = document.createElement('div');
  row.className = 'quick-replies';
  replies.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      row.remove();
      handleUserMessage(text);
    });
    row.appendChild(btn);
  });
  DOM.messagesContainer.appendChild(row);
  scrollToBottom(DOM.messagesContainer.parentElement);
}

function showActionButtons(buttons) {
  const row = document.createElement('div');
  row.className = 'quick-replies';
  buttons.forEach(btn => {
    const el = document.createElement('button');
    el.className = 'quick-reply-btn';
    el.textContent = btn.text;
    el.addEventListener('click', () => {
      row.remove();
      handleAction(btn.action);
    });
    row.appendChild(el);
  });
  DOM.messagesContainer.appendChild(row);
  scrollToBottom(DOM.messagesContainer.parentElement);
}

// ============================================================
//  消息处理
// ============================================================
async function handleUserMessage(text) {
  if (!text.trim()) return;

  // 每日消息限额
  if (Storage.checkDailyLimit(CONFIG.safety.dailyMessageLimit)) {
    showToast('今天已经聊了好多啦，明天再来吧~ 😊');
    return;
  }

  // 显示用户消息
  addUserMessage(text);
  Storage.incrementDailyMessage();

  // 奖励基础XP
  Gamification.addXP(CONFIG.gamification.xpPerMessage);
  Gamification.updateUI();

  // 检查是否是前言阶段的回复
  if (App._waitingForReply) {
    resolveUserReply();
    // 在前言阶段，收到回复后也用AI处理
  }

  // 创建流式消息元素
  const streamingEl = createStreamingMessage();
  App.character.setState('thinking');

  // 发送到AI
  try {
    await App.agent.sendMessage(text, {
      onToken: (token) => {
        appendToBotMessage(streamingEl, token);
        // 小智说话时嘴巴动
        if (Math.random() < 0.1) {
          App.character.setState(Math.random() < 0.5 ? 'thinking' : 'happy');
        }
      },
      onComplete: (fullText) => {
        finalizeStreamingMessage(streamingEl);
        App.character.setState('happy');

        // 检查输出是否有危机内容
        const check = Safety.checkDistress(fullText);
        if (check.distress) {
          // 替换消息内容
          const bubble = streamingEl.querySelector('.message-bubble');
          bubble.innerHTML = formatMessage(check.response);
        }
      },
      onError: (err) => {
        console.error('Chat error:', err);
        finalizeStreamingMessage(streamingEl);
        App.character.setState('idle');
      },
    });
  } catch (err) {
    console.error('Send error:', err);
    finalizeStreamingMessage(streamingEl);
    App.character.setState('idle');
  }
}

function handleAction(action) {
  switch (action) {
    case 'start_lesson_1':
      completeIntro();
      startLesson('lesson1');
      break;
    case 'free_chat':
      completeIntro();
      addBotMessage('没问题！你想聊什么？AI相关的都可以问我哦~ 😊');
      break;
    default:
      break;
  }
}

function completeIntro() {
  Storage.setCourses({ currentModule: 'intro', currentLesson: null });
  App.currentStage = null;
}

// ============================================================
//  事件绑定
// ============================================================
function bindEvents() {
  // 发送按钮
  DOM.sendBtn.addEventListener('click', () => sendInput());
  DOM.messageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendInput();
    }
  });

  // 语音按钮（简化：暂用提示代替）
  DOM.voiceBtn.addEventListener('click', () => {
    showToast('🎤 语音功能还在准备中，先打字和小智聊天吧~');
  });

  // 底部导航
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function sendInput() {
  const text = DOM.messageInput.value.trim();
  if (!text) return;
  DOM.messageInput.value = '';
  handleUserMessage(text);
}

// ============================================================
//  标签页切换
// ============================================================
function switchTab(tab) {
  App.currentTab = tab;

  // 更新导航高亮
  $$('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  switch (tab) {
    case 'chat':
      DOM.interactionContainer.classList.add('hidden');
      DOM.messageInput.focus();
      break;
    case 'courses':
      showCoursesTab();
      break;
    case 'achievements':
      showAchievementsTab();
      break;
  }
}

function showCoursesTab() {
  DOM.messagesContainer.innerHTML = '';
  DOM.interactionContainer.classList.remove('hidden');

  const progress = Storage.getProgress();
  const intro = COURSES.intro;
  const mod1 = COURSES.module1;

  let html = `<div style="padding:8px;text-align:center;font-size:18px;font-weight:600;color:#1565C0;margin-bottom:8px;">📚 课程列表</div>`;

  // 前言
  const introDone = progress.completedLessons.length > 0;
  html += `
    <div class="course-card ${introDone ? 'completed' : ''}" data-action="start_intro">
      <div class="course-num">${introDone ? '✅' : '🌟'}</div>
      <div class="course-info">
        <div class="course-title">前言：嗨，你听说过AI吗？</div>
        <div class="course-meta">3分钟 · 发现之旅</div>
      </div>
      <div class="course-status">${introDone ? '✅' : '▶️'}</div>
    </div>
  `;

  // 模块一课程
  for (const lesson of mod1.lessons) {
    const done = progress.completedLessons.includes(lesson.id);
    html += `
      <div class="course-card ${done ? 'completed' : ''}" data-action="start_lesson" data-lesson="${lesson.id}">
        <div class="course-num">${done ? '✅' : lesson.icon}</div>
        <div class="course-info">
          <div class="course-title">${lesson.title[Storage.getProfile().ageGroup]}</div>
          <div class="course-meta">${lesson.duration[Storage.getProfile().ageGroup]}分钟</div>
        </div>
        <div class="course-status">${done ? '✅' : '▶️'}</div>
      </div>
    `;
  }

  DOM.interactionContainer.innerHTML = html;

  // 绑定点击
  $$('[data-action="start_intro"]').forEach(card => {
    card.addEventListener('click', () => {
      switchTab('chat');
      setTimeout(() => startIntro(), 300);
    });
  });

  $$('[data-action="start_lesson"]').forEach(card => {
    card.addEventListener('click', () => {
      const lessonId = card.dataset.lesson;
      switchTab('chat');
      setTimeout(() => startLesson(lessonId), 300);
    });
  });
}

function showAchievementsTab() {
  DOM.messagesContainer.innerHTML = '';
  DOM.interactionContainer.classList.remove('hidden');

  const badges = Gamification.getBadges();
  const progress = Storage.getProgress();

  let html = `
    <div style="padding:8px;text-align:center;">
      <div style="font-size:18px;font-weight:600;color:#1565C0;margin-bottom:12px;">🏆 我的成就</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;">
        <div style="text-align:center;padding:12px 16px;background:#E3F2FD;border-radius:16px;">
          <div style="font-size:28px;font-weight:700;color:#1565C0;">${progress.level}</div>
          <div style="font-size:11px;color:#546E7A;">等级</div>
        </div>
        <div style="text-align:center;padding:12px 16px;background:#FFF9C4;border-radius:16px;">
          <div style="font-size:28px;font-weight:700;color:#F9A825;">${progress.xp}</div>
          <div style="font-size:11px;color:#546E7A;">经验值</div>
        </div>
        <div style="text-align:center;padding:12px 16px;background:#E8F5E9;border-radius:16px;">
          <div style="font-size:28px;font-weight:700;color:#4CAF50;">${progress.stars}⭐</div>
          <div style="font-size:11px;color:#546E7A;">星星</div>
        </div>
        <div style="text-align:center;padding:12px 16px;background:#FCE4EC;border-radius:16px;">
          <div style="font-size:28px;font-weight:700;color:#E91E63;">🔥${progress.streakDays}</div>
          <div style="font-size:11px;color:#546E7A;">连续天数</div>
        </div>
      </div>
      <div style="font-size:16px;font-weight:600;color:#37474F;margin-bottom:8px;">徽章</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;">
        ${badges.map(b => `
          <div class="badge">
            <div class="badge-icon ${b.earned ? 'earned' : 'locked'}">${b.emoji}</div>
            <div class="badge-name">${b.name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  DOM.interactionContainer.innerHTML = html;
}

// ============================================================
//  休息提醒
// ============================================================
function startBreakTimer() {
  const config = CONFIG.safety;

  // 25分钟提醒
  App.breakTimer = setInterval(() => {
    App.character.say('该休息一下啦~', 3000);
    addBotMessage('我们聊了好一会儿了，要不要**站起来活动一下、看看远处的绿色**？👀🌿\n\n休息5分钟再回来，我等你~');
    App.character.setState('encouraging');
  }, config.breakIntervalMs);

  // 45分钟强制休息
  App.forceBreakTimer = setTimeout(() => {
    showBreakOverlay();
  }, config.forceBreakMs);
}

function showBreakOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'break-overlay';
  overlay.innerHTML = `
    <div class="break-icon">😴</div>
    <h2>小智要睡一会儿...</h2>
    <p>你已经用了很久了哦~<br>为了保护眼睛，先休息5分钟吧！<br>去看看窗外、喝杯水、活动一下~</p>
    <div id="breakCountdown" style="font-size:48px;font-weight:700;margin-top:16px;">05:00</div>
  `;
  document.body.appendChild(overlay);

  // 倒计时
  let remaining = CONFIG.safety.forceBreakDurationMs / 1000;
  const countdownEl = $('#breakCountdown', overlay);
  const timer = setInterval(() => {
    remaining--;
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    countdownEl.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    if (remaining <= 0) {
      clearInterval(timer);
      overlay.remove();
      addBotMessage('我醒啦！我们继续吧~ 😄');
      App.character.setState('happy');
      // 重置计时器
      startBreakTimer();
    }
  }, 1000);
}

// ============================================================
//  格式化工具
// ============================================================
function formatMessage(text) {
  if (!text) return '';
  // 简单的 Markdown 转换（适合儿童阅读）
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n---\n/g, '<hr style="border:none;border-top:1px dashed #BBDEFB;margin:8px 0;">')
    .replace(/\n>/g, '\n<span style="color:#1E88E5;font-weight:500;">👉 </span>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getFirstSentence(text) {
  const match = text.match(/^(.+?)[。！？\n]/);
  return match ? match[1] : text.slice(0, 20);
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============================================================
//  启动！
// ============================================================
// ES模块默认defer，DOM已就绪，直接初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 开发调试：暴露App到全局
if (typeof window !== 'undefined') {
  window.__App = App;
}

})();