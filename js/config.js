/* ============================================
   config.js — 全局配置常量
   ============================================ */

export const CONFIG = {
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
