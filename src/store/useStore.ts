import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Baby, FamilyMember, Task, RestSlot, AIConversation } from '../types';

interface AppState {
  // 当前用户
  currentUser: FamilyMember | null;
  setCurrentUser: (user: FamilyMember | null) => void;

  // 宝宝信息
  baby: Baby | null;
  setBaby: (baby: Baby | null) => void;

  // 家庭成员
  familyMembers: FamilyMember[];
  addFamilyMember: (member: FamilyMember) => void;
  removeFamilyMember: (id: string) => void;

  // 任务管理
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, userId: string) => void;

  // 休息预约
  restSlots: RestSlot[];
  addRestSlot: (slot: RestSlot) => void;
  updateRestSlot: (id: string, updates: Partial<RestSlot>) => void;
  deleteRestSlot: (id: string) => void;

  // AI对话
  aiConversations: AIConversation[];
  addAIConversation: (conversation: AIConversation) => void;

  // 初始化示例数据
  initializeDemoData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 当前用户
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // 宝宝信息
      baby: null,
      setBaby: (baby) => set({ baby }),

      // 家庭成员
      familyMembers: [],
      addFamilyMember: (member) =>
        set((state) => ({
          familyMembers: [...state.familyMembers, member],
        })),
      removeFamilyMember: (id) =>
        set((state) => ({
          familyMembers: state.familyMembers.filter((m) => m.id !== id),
        })),

      // 任务管理
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      completeTask: (id, userId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString(),
                  completedBy: userId,
                }
              : t
          ),
        })),

      // 休息预约
      restSlots: [],
      addRestSlot: (slot) =>
        set((state) => ({
          restSlots: [...state.restSlots, slot],
        })),
      updateRestSlot: (id, updates) =>
        set((state) => ({
          restSlots: state.restSlots.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteRestSlot: (id) =>
        set((state) => ({
          restSlots: state.restSlots.filter((s) => s.id !== id),
        })),

      // AI对话
      aiConversations: [],
      addAIConversation: (conversation) =>
        set((state) => ({
          aiConversations: [conversation, ...state.aiConversations],
        })),

      // 初始化示例数据
      initializeDemoData: () => {
        const mom: FamilyMember = { id: 'mom-1', name: '妈妈', role: 'mom' };
        const dad: FamilyMember = { id: 'dad-1', name: '爸爸', role: 'dad' };
        const grandma: FamilyMember = { id: 'grandma-1', name: '奶奶', role: 'grandma' };

        const baby: Baby = {
          id: 'baby-1',
          name: '小宝',
          nickname: '宝宝',
          birthDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6个月前
          gender: 'male',
        };

        const now = new Date();
        const tasks: Task[] = [
          {
            id: generateId(),
            title: '冲奶粉喂养',
            description: '180ml奶粉',
            category: 'feeding',
            priority: 'high',
            status: 'pending',
            assigneeId: 'mom-1',
            createdBy: 'mom-1',
            createdAt: now.toISOString(),
            dueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: generateId(),
            title: '换尿布',
            category: 'diaper',
            priority: 'medium',
            status: 'pending',
            createdBy: 'mom-1',
            createdAt: now.toISOString(),
          },
          {
            id: generateId(),
            title: '陪宝宝玩积木',
            description: '锻炼手眼协调',
            category: 'play',
            priority: 'low',
            status: 'pending',
            assigneeId: 'dad-1',
            createdBy: 'mom-1',
            createdAt: now.toISOString(),
          },
          {
            id: generateId(),
            title: '下午小睡',
            description: '1-2小时',
            category: 'sleep',
            priority: 'high',
            status: 'pending',
            createdBy: 'mom-1',
            createdAt: now.toISOString(),
            dueAt: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: generateId(),
            title: '采购尿布和湿巾',
            category: 'shopping',
            priority: 'medium',
            status: 'pending',
            assigneeId: 'dad-1',
            createdBy: 'mom-1',
            createdAt: now.toISOString(),
          },
        ];

        set({
          currentUser: mom,
          baby,
          familyMembers: [mom, dad, grandma],
          tasks,
          restSlots: [],
          aiConversations: [],
        });
      },
    }),
    {
      name: 'daiwa-storage',
    }
  )
);
