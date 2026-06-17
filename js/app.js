/* ============================================
   app.js — 主控制器
   串联所有模块，管理应用生命周期
   ============================================ */

import { Character } from './character.js';
import { AIAgent } from './agent.js';
import { Gamification } from './gamification.js';
import { Storage } from './storage.js';
import { Safety } from './safety.js';
import { COURSES, getLesson } from './courses.js';
import { CONFIG } from './config.js';
import {
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
