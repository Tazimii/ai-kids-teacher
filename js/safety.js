/* ============================================
   safety.js — 面向儿童的安全护栏
   ============================================ */

export const Safety = {
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
