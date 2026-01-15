import { useState } from 'react';
import { useStore } from '../store/useStore';
import { TASK_CATEGORIES, FAMILY_ROLES, type TaskCategory, type TaskPriority } from '../types';
import { formatRelativeTime, generateId } from '../utils/helpers';
import {
  Plus,
  Check,
  Clock,
  Filter,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';

type FilterType = 'all' | 'pending' | 'completed' | 'mine';

export function Tasks() {
  const { tasks, familyMembers, currentUser, addTask, completeTask, deleteTask } = useStore();
  const [filter, setFilter] = useState<FilterType>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // 新任务表单状态
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'other' as TaskCategory,
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    dueAt: '',
  });

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending' || task.status === 'in_progress';
      case 'completed':
        return task.status === 'completed';
      case 'mine':
        return task.assigneeId === currentUser?.id;
      default:
        return true;
    }
  });

  // 按优先级排序
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // 添加新任务
  const handleAddTask = () => {
    if (!newTask.title.trim() || !currentUser) return;

    addTask({
      id: generateId(),
      title: newTask.title,
      description: newTask.description || undefined,
      category: newTask.category,
      priority: newTask.priority,
      status: 'pending',
      assigneeId: newTask.assigneeId || undefined,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      dueAt: newTask.dueAt || undefined,
    });

    setNewTask({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      assigneeId: '',
      dueAt: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="tasks-page">
      <header className="page-header">
        <h1>任务管理</h1>
        <div className="header-actions">
          <button
            className="filter-btn"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={18} />
            {filter === 'all' && '全部'}
            {filter === 'pending' && '待完成'}
            {filter === 'completed' && '已完成'}
            {filter === 'mine' && '我的'}
            <ChevronDown size={14} />
          </button>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
          </button>
        </div>

        {showFilterMenu && (
          <div className="filter-menu">
            {(['all', 'pending', 'completed', 'mine'] as FilterType[]).map(f => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => {
                  setFilter(f);
                  setShowFilterMenu(false);
                }}
              >
                {f === 'all' && '全部'}
                {f === 'pending' && '待完成'}
                {f === 'completed' && '已完成'}
                {f === 'mine' && '我的任务'}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="tasks-list">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <p>暂无任务</p>
          </div>
        ) : (
          sortedTasks.map(task => {
            const category = TASK_CATEGORIES[task.category];
            const assignee = familyMembers.find(m => m.id === task.assigneeId);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`task-item ${isCompleted ? 'completed' : ''} priority-${task.priority}`}
              >
                <button
                  className="complete-btn"
                  onClick={() => currentUser && completeTask(task.id, currentUser.id)}
                  disabled={isCompleted}
                >
                  {isCompleted ? <Check size={20} /> : <div className="circle" />}
                </button>

                <div className="task-body">
                  <div className="task-header">
                    <span
                      className="category-tag"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.emoji} {category.label}
                    </span>
                    {task.priority === 'urgent' && (
                      <span className="urgent-tag">
                        <AlertCircle size={12} /> 紧急
                      </span>
                    )}
                  </div>
                  <h3 className={isCompleted ? 'line-through' : ''}>{task.title}</h3>
                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}
                  <div className="task-footer">
                    {assignee && (
                      <span className="assignee">
                        {FAMILY_ROLES[assignee.role].emoji} {assignee.name}
                      </span>
                    )}
                    {task.dueAt && !isCompleted && (
                      <span className="due">
                        <Clock size={12} /> {formatRelativeTime(task.dueAt)}
                      </span>
                    )}
                    {isCompleted && task.completedBy && (
                      <span className="completed-by">
                        由 {familyMembers.find(m => m.id === task.completedBy)?.name || '未知'} 完成
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 添加任务模态框 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>添加任务</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>任务名称 *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="例如：冲奶粉喂养"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="可选的详细说明"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>类型</label>
                  <select
                    value={newTask.category}
                    onChange={e => setNewTask({ ...newTask, category: e.target.value as TaskCategory })}
                  >
                    {Object.entries(TASK_CATEGORIES).map(([key, { label, emoji }]) => (
                      <option key={key} value={key}>
                        {emoji} {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>优先级</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>分配给</label>
                <select
                  value={newTask.assigneeId}
                  onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                >
                  <option value="">不指定</option>
                  {familyMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {FAMILY_ROLES[member.role].emoji} {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>截止时间</label>
                <input
                  type="datetime-local"
                  value={newTask.dueAt}
                  onChange={e => setNewTask({ ...newTask, dueAt: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
              >
                添加任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
