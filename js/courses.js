/* ============================================
   courses.js — 课程数据结构
   前言 + 模块一（3节课），每节课按年龄分两档
   ============================================ */

export const COURSES = {
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
export function getLesson(lessonId) {
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
export function getModule(moduleId) {
  return COURSES[moduleId] || null;
}

/** 获取所有课程列表（扁平化） */
export function getAllLessons() {
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
