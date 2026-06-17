/* ============================================
   agent.js — AI对话核心模块
   系统提示词构建 + API调用 + 流式响应
   ============================================ */

import { CONFIG } from './config.js';
import { Storage } from './storage.js';
import { Safety } from './safety.js';

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

export class AIAgent {
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
