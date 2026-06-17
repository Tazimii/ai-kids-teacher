/* ============================================
   utils.js — 工具函数
   ============================================ */

/** 延时 */
export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/** 随机整数 [min, max] */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 随机选择 */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 洗牌 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 安全获取 DOM 元素 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/** 在元素末尾插入 HTML */
export function appendHTML(parent, html) {
  parent.insertAdjacentHTML('beforeend', html);
  return parent.lastElementChild;
}

/** 滚动到底部 */
export function scrollToBottom(el) {
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
  });
}

/** 防抖 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** 格式化数字（大数字用k/m） */
export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

/** 触发音效 */
export function playSound(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {}); // 忽略自动播放限制
}

/** 创建粒子爆发效果 */
export function burstParticles(x, y, emoji = '✨', count = 8) {
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
export function showXpFloat(x, y, amount) {
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = `+${amount} XP`;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/** 显示 Toast */
export function showToast(msg, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

/** 获取元素在页面中的位置 */
export function getElementCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}
