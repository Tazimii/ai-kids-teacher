/* ============================================
   gamification.js — XP / 等级 / 徽章 / 连续学习
   ============================================ */

import { CONFIG } from './config.js';
import { Storage } from './storage.js';
import { playSound, showToast } from './utils.js';

export const Gamification = {
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
