import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getTipsForAge, generateId, getBabyAge } from '../utils/helpers';
import { differenceInMonths, format } from 'date-fns';
import {
  Send,
  Lightbulb,
  Baby,
  Moon,
  Utensils,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from 'lucide-react';

// 预设问题分类
const QUICK_QUESTIONS = [
  { icon: Utensils, label: '喂养', questions: [
    '宝宝多大可以添加辅食？',
    '奶粉冲泡的正确比例是多少？',
    '宝宝厌奶怎么办？',
    '辅食添加的顺序是什么？',
  ]},
  { icon: Moon, label: '睡眠', questions: [
    '宝宝睡觉总是惊醒怎么办？',
    '如何帮助宝宝建立睡眠规律？',
    '宝宝多大可以睡整觉？',
    '夜奶要不要戒？',
  ]},
  { icon: Baby, label: '发育', questions: [
    '宝宝这个月龄应该会什么？',
    '宝宝翻身晚是不是有问题？',
    '怎么促进宝宝语言发育？',
    '早教应该从什么时候开始？',
  ]},
  { icon: Heart, label: '健康', questions: [
    '宝宝发烧多少度需要就医？',
    '湿疹怎么护理？',
    '宝宝拉肚子怎么办？',
    '疫苗接种的注意事项？',
  ]},
];

// 模拟AI回答（实际应该调用后端API）
function getAIResponse(question: string, babyMonths: number): string {
  const q = question.toLowerCase();

  if (q.includes('辅食') || q.includes('添加')) {
    if (babyMonths < 4) {
      return `宝宝目前${babyMonths}个月，建议等到满6个月再添加辅食。世界卫生组织推荐纯母乳喂养至6个月。如果有特殊情况（如母乳不足、体重增长缓慢），可以在4-6个月之间在医生指导下尝试添加。现阶段请继续母乳/配方奶喂养，确保充足的奶量。`;
    } else if (babyMonths >= 4 && babyMonths < 6) {
      return `宝宝${babyMonths}个月了，已经接近可以添加辅食的时间。建议等到满6个月开始，从含铁的米粉开始，每次1-2勺，观察3-5天确认无过敏反应后再添加新食物。开始时一天一次即可，逐渐增加。`;
    } else {
      return `宝宝${babyMonths}个月，可以正式添加辅食了！建议：\n\n1. 从含铁强化米粉开始，用母乳或配方奶调成糊状\n2. 每次尝试一种新食物，观察3-5天\n3. 注意观察过敏反应（皮疹、腹泻等）\n4. 辅食添加顺序：谷物 → 蔬菜 → 水果 → 肉类 → 蛋黄\n5. 质地从泥糊状逐渐过渡到颗粒状\n\n记住：辅食是奶的补充，1岁前奶仍是主要营养来源。`;
    }
  }

  if (q.includes('睡眠') || q.includes('睡觉') || q.includes('睡整觉')) {
    return `关于宝宝睡眠，${babyMonths}个月宝宝的建议：\n\n**睡眠时长参考：**\n- 全天睡眠约14-15小时\n- 白天小睡2-3次\n- 夜间连续睡眠可达6-8小时\n\n**建立规律的方法：**\n1. 固定的睡前程序（洗澡→按摩→喂奶→讲故事）\n2. 区分白天和夜晚（白天光线充足，夜晚昏暗安静）\n3. 观察困倦信号（揉眼睛、打哈欠）及时哄睡\n4. 创造舒适的睡眠环境（温度22-24℃，适当白噪音）\n\n如果经常夜醒，排除饿、尿布湿、生病等原因后，可以尝试"等待法"，给宝宝几分钟自我安抚的机会。`;
  }

  if (q.includes('发烧') || q.includes('体温')) {
    return `宝宝发烧处理指南：\n\n**就医指征（需立即就医）：**\n- 3个月以下宝宝发烧38℃以上\n- 体温超过40℃\n- 发烧伴有皮疹、呕吐、嗜睡\n- 发烧超过3天不退\n- 精神状态差，哭闹不止\n\n**家庭护理：**\n- 多喝水/奶，保证液体摄入\n- 穿着适当，不要捂汗\n- 温水擦浴（腋下、腹股沟）\n- 38.5℃以上可使用退烧药（按体重计算剂量）\n\n**常用退烧药：**\n- 美林（布洛芬）：6个月以上可用\n- 泰诺林（对乙酰氨基酚）：3个月以上可用\n\n注意：不要同时使用两种退烧药，间隔至少4-6小时。`;
  }

  if (q.includes('翻身')) {
    if (babyMonths < 3) {
      return `宝宝${babyMonths}个月，现在翻身还早，大多数宝宝在4-6个月开始翻身。现阶段可以多做趴卧练习（Tummy Time），每天累计15-30分钟，帮助锻炼颈部和背部肌肉，为将来翻身打基础。`;
    } else if (babyMonths >= 3 && babyMonths < 7) {
      return `宝宝${babyMonths}个月，正是学习翻身的关键期！\n\n**翻身时间参考：**\n- 3-4个月：从趴到仰（翻过来）\n- 5-6个月：从仰到趴（翻过去）\n\n**帮助练习的方法：**\n1. 用玩具在侧面吸引注意力\n2. 轻轻辅助推动臀部\n3. 多做趴卧练习\n4. 适当按摩放松肌肉\n\n每个宝宝发育节奏不同，只要7个月前能翻身都是正常的，不必过于焦虑。`;
    } else {
      return `${babyMonths}个月的宝宝如果还不会翻身，建议：\n\n1. 检查是否穿太多/太厚影响活动\n2. 增加地垫自由活动时间\n3. 减少抱的时间，多让宝宝自己探索\n4. 用玩具诱导宝宝转动身体\n\n如果宝宝同时有其他运动发育落后的表现（不会抬头、不会坐等），建议咨询儿科医生或做发育评估。`;
    }
  }

  // 默认回答
  const tips = getTipsForAge(babyMonths);
  return `根据宝宝目前${babyMonths}个月的月龄，这里有一些建议：\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n如果您有更具体的问题，欢迎继续提问，我会尽力解答！`;
}

export function AIAdvisor() {
  const { baby, aiConversations, addAIConversation } = useStore();
  const [question, setQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const babyMonths = baby ? differenceInMonths(new Date(), new Date(baby.birthDate)) : 0;

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;

    setIsTyping(true);
    setQuestion('');

    // 模拟AI响应延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    const answer = getAIResponse(q, babyMonths);

    addAIConversation({
      id: generateId(),
      question: q,
      answer,
      category: selectedCategory !== null ? QUICK_QUESTIONS[selectedCategory].label : '通用',
      createdAt: new Date().toISOString(),
    });

    setIsTyping(false);
    setSelectedCategory(null);
  };

  const handleFeedback = (id: string, helpful: boolean) => {
    // 实际应该更新到store和后端
    console.log('Feedback:', id, helpful);
  };

  return (
    <div className="ai-advisor-page">
      <header className="page-header">
        <h1>AI育儿顾问</h1>
        {baby && (
          <p className="baby-age">
            <Baby size={16} /> {baby.nickname || baby.name} · {getBabyAge(baby.birthDate)}
          </p>
        )}
      </header>

      {/* 快捷问题分类 */}
      <section className="quick-categories">
        {QUICK_QUESTIONS.map((cat, index) => (
          <button
            key={index}
            className={`category-btn ${selectedCategory === index ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === index ? null : index)}
          >
            <cat.icon size={18} />
            <span>{cat.label}</span>
          </button>
        ))}
      </section>

      {/* 快捷问题列表 */}
      {selectedCategory !== null && (
        <section className="quick-questions">
          {QUICK_QUESTIONS[selectedCategory].questions.map((q, index) => (
            <button
              key={index}
              className="question-chip"
              onClick={() => handleAsk(q)}
            >
              <MessageCircle size={14} />
              {q}
            </button>
          ))}
        </section>
      )}

      {/* 月龄提示 */}
      <section className="age-tips">
        <div className="tips-header">
          <Lightbulb size={18} />
          <span>{babyMonths}月龄发育要点</span>
        </div>
        <div className="tips-content">
          {getTipsForAge(babyMonths).slice(0, 2).map((tip, index) => (
            <p key={index}>{tip}</p>
          ))}
        </div>
      </section>

      {/* 对话历史 */}
      <section className="conversation-list">
        {isTyping && (
          <div className="message ai-message typing">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {aiConversations.map(conv => (
          <div key={conv.id} className="conversation-item">
            <div className="message user-message">
              <div className="message-content">{conv.question}</div>
              <div className="message-time">
                {format(new Date(conv.createdAt), 'HH:mm')}
              </div>
            </div>
            <div className="message ai-message">
              <div className="message-content">
                {conv.answer.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <div className="message-actions">
                <button onClick={() => handleFeedback(conv.id, true)}>
                  <ThumbsUp size={14} />
                </button>
                <button onClick={() => handleFeedback(conv.id, false)}>
                  <ThumbsDown size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {aiConversations.length === 0 && !isTyping && (
          <div className="empty-state">
            <MessageCircle size={32} />
            <p>有任何育儿问题都可以问我</p>
          </div>
        )}
      </section>

      {/* 输入框 */}
      <div className="input-area">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="输入您的问题..."
          onKeyDown={e => e.key === 'Enter' && handleAsk(question)}
        />
        <button
          className="send-btn"
          onClick={() => handleAsk(question)}
          disabled={!question.trim() || isTyping}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
