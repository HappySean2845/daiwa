// 家庭成员
export interface FamilyMember {
  id: string;
  name: string;
  role: 'mom' | 'dad' | 'grandpa' | 'grandma' | 'other';
  avatar?: string;
}

// 宝宝信息
export interface Baby {
  id: string;
  name: string;
  nickname?: string;
  birthDate: string;
  gender: 'male' | 'female';
  avatar?: string;
}

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// 任务类型
export type TaskCategory =
  | 'feeding'      // 喂养
  | 'sleep'        // 睡眠
  | 'diaper'       // 换尿布
  | 'bath'         // 洗澡
  | 'play'         // 陪玩
  | 'medical'      // 医疗
  | 'shopping'     // 采购
  | 'other';       // 其他

// 任务
export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: string;        // 分配给谁
  createdBy: string;          // 创建者
  createdAt: string;
  dueAt?: string;             // 截止时间
  completedAt?: string;
  completedBy?: string;
  recurring?: {               // 重复任务
    frequency: 'daily' | 'weekly' | 'monthly';
    times?: number[];         // 每天的时间点
  };
}

// 休息预约
export interface RestSlot {
  id: string;
  requesterId: string;        // 申请人（通常是妈妈）
  coveredBy: string;          // 替班人
  startTime: string;
  endTime: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  note?: string;
}

// AI问答记录
export interface AIConversation {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  helpful?: boolean;
}

// 发育里程碑
export interface Milestone {
  id: string;
  babyId: string;
  title: string;
  description: string;
  expectedMonth: number;      // 预期月龄
  achievedAt?: string;        // 达成日期
  category: 'motor' | 'language' | 'social' | 'cognitive';
}

// 统计数据
export interface FamilyStats {
  tasksByMember: Record<string, number>;
  restHoursByMember: Record<string, number>;
  weeklyTrend: {
    date: string;
    tasksCompleted: number;
  }[];
}

// 任务分类信息
export const TASK_CATEGORIES: Record<TaskCategory, { label: string; emoji: string; color: string }> = {
  feeding: { label: '喂养', emoji: '🍼', color: '#FF9800' },
  sleep: { label: '睡眠', emoji: '😴', color: '#9C27B0' },
  diaper: { label: '换尿布', emoji: '👶', color: '#2196F3' },
  bath: { label: '洗澡', emoji: '🛁', color: '#00BCD4' },
  play: { label: '陪玩', emoji: '🎮', color: '#4CAF50' },
  medical: { label: '医疗', emoji: '🏥', color: '#F44336' },
  shopping: { label: '采购', emoji: '🛒', color: '#795548' },
  other: { label: '其他', emoji: '📝', color: '#607D8B' },
};

// 家庭角色信息
export const FAMILY_ROLES: Record<FamilyMember['role'], { label: string; emoji: string }> = {
  mom: { label: '妈妈', emoji: '👩' },
  dad: { label: '爸爸', emoji: '👨' },
  grandpa: { label: '爷爷/外公', emoji: '👴' },
  grandma: { label: '奶奶/外婆', emoji: '👵' },
  other: { label: '其他', emoji: '👤' },
};
