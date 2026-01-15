import { differenceInMonths, differenceInDays, format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 计算宝宝月龄
export function getBabyAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = differenceInMonths(now, birth);
  const days = differenceInDays(now, birth) % 30;

  if (months === 0) {
    return `${days}天`;
  }
  if (days === 0) {
    return `${months}个月`;
  }
  return `${months}个月${days}天`;
}

// 格式化日期时间
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MM月dd日 HH:mm', { locale: zhCN });
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
}

// 格式化时间段
export function formatTimeRange(start: string | Date, end: string | Date): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
}

// 生成唯一ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// 获取今日任务统计
export function getTodayTaskStats(tasks: { status: string; completedBy?: string }[]) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const byMember: Record<string, number> = {};

  tasks
    .filter(t => t.status === 'completed' && t.completedBy)
    .forEach(t => {
      byMember[t.completedBy!] = (byMember[t.completedBy!] || 0) + 1;
    });

  return { completed, total, byMember };
}

// AI 育儿建议数据库（基于月龄）
export const PARENTING_TIPS: Record<number, string[]> = {
  0: [
    '新生儿每天需要16-17小时的睡眠',
    '母乳喂养建议按需喂养，通常2-3小时一次',
    '注意观察黄疸情况，及时就医',
    '保持脐带干燥清洁',
  ],
  1: [
    '宝宝开始能追视移动的物体',
    '可以开始进行抬头练习',
    '注意宝宝的哭声含义：饿了、困了、不舒服',
    '建议每天进行皮肤接触（袋鼠式护理）',
  ],
  2: [
    '宝宝开始学会社交性微笑',
    '可以给宝宝看黑白卡片刺激视觉发育',
    '开始建立作息规律',
    '趴着玩耍时间可以增加到每天15分钟',
  ],
  3: [
    '宝宝手部动作更协调，可以抓握玩具',
    '可以进行更多的亲子互动游戏',
    '开始准备口水巾，可能开始流口水',
    '注意2个月和3个月的疫苗接种',
  ],
  4: [
    '可以考虑开始添加辅食的准备',
    '宝宝开始翻身，注意安全防护',
    '睡眠开始更规律，可以进行睡眠训练',
    '增加腹部时间，锻炼核心肌肉',
  ],
  5: [
    '可以开始尝试添加米粉等辅食',
    '宝宝开始认生，这是正常发展',
    '可以玩藏猫猫游戏',
    '开始长牙的征兆可能出现',
  ],
  6: [
    '正式开始辅食添加，一种一种来',
    '可以开始用学饮杯',
    '宝宝能独坐一小会儿',
    '进行6个月体检和疫苗接种',
  ],
  // 更多月龄建议...
};

// 获取基于月龄的育儿建议
export function getTipsForAge(months: number): string[] {
  const exactTips = PARENTING_TIPS[months];
  if (exactTips) return exactTips;

  // 如果没有精确匹配，返回最近月龄的建议
  const ages = Object.keys(PARENTING_TIPS).map(Number).sort((a, b) => a - b);
  const closest = ages.reduce((prev, curr) =>
    Math.abs(curr - months) < Math.abs(prev - months) ? curr : prev
  );
  return PARENTING_TIPS[closest] || [];
}
