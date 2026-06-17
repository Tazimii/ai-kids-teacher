/* ============================================
   storage.js — LocalStorage 持久化
   ============================================ */

const PREFIX = 'xk_ai_';  // xiao-kids-ai

export const Storage = {
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
