import { useStore } from '../store/useStore';
import { getBabyAge, formatRelativeTime, getTipsForAge } from '../utils/helpers';
import { TASK_CATEGORIES, FAMILY_ROLES } from '../types';
import { differenceInMonths } from 'date-fns';
import { CheckCircle, Clock, AlertCircle, Users, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { baby, currentUser, familyMembers, tasks } = useStore();

  // 获取今日任务
  const todayTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5);
  const completedToday = tasks.filter(t => t.status === 'completed');

  // 计算贡献统计
  const contributionStats = familyMembers.map(member => {
    const completed = tasks.filter(t => t.completedBy === member.id).length;
    return { member, completed };
  }).sort((a, b) => b.completed - a.completed);

  // 获取育儿建议
  const babyMonths = baby ? differenceInMonths(new Date(), new Date(baby.birthDate)) : 0;
  const tips = getTipsForAge(babyMonths);

  return (
    <div className="dashboard">
      {/* 顶部问候 */}
      <header className="dashboard-header">
        <div className="greeting">
          <h1>
            {currentUser ? `${FAMILY_ROLES[currentUser.role].emoji} ${currentUser.name}` : '你好'}
            ，辛苦啦！
          </h1>
          {baby && (
            <p className="baby-info">
              {baby.nickname || baby.name} · {getBabyAge(baby.birthDate)}
            </p>
          )}
        </div>
      </header>

      {/* 今日概览 */}
      <section className="stats-cards">
        <div className="stat-card pending">
          <Clock size={20} />
          <div className="stat-content">
            <span className="stat-number">{todayTasks.length}</span>
            <span className="stat-label">待完成</span>
          </div>
        </div>
        <div className="stat-card completed">
          <CheckCircle size={20} />
          <div className="stat-content">
            <span className="stat-number">{completedToday.length}</span>
            <span className="stat-label">已完成</span>
          </div>
        </div>
        <div className="stat-card family">
          <Users size={20} />
          <div className="stat-content">
            <span className="stat-number">{familyMembers.length}</span>
            <span className="stat-label">家人</span>
          </div>
        </div>
      </section>

      {/* 待办任务 */}
      <section className="section">
        <div className="section-header">
          <h2>待办任务</h2>
          <Link to="/tasks" className="see-all">查看全部</Link>
        </div>
        <div className="task-list">
          {todayTasks.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={32} />
              <p>太棒了，暂无待办！</p>
            </div>
          ) : (
            todayTasks.map(task => {
              const category = TASK_CATEGORIES[task.category];
              const assignee = familyMembers.find(m => m.id === task.assigneeId);

              return (
                <div key={task.id} className={`task-card priority-${task.priority}`}>
                  <div className="task-category" style={{ backgroundColor: category.color }}>
                    {category.emoji}
                  </div>
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    <div className="task-meta">
                      {assignee && (
                        <span className="assignee">
                          {FAMILY_ROLES[assignee.role].emoji} {assignee.name}
                        </span>
                      )}
                      {task.dueAt && (
                        <span className="due-time">
                          <Clock size={12} /> {formatRelativeTime(task.dueAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.priority === 'urgent' && (
                    <AlertCircle className="urgent-icon" size={20} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 家人贡献 */}
      <section className="section">
        <div className="section-header">
          <h2>家人贡献</h2>
        </div>
        <div className="contribution-list">
          {contributionStats.map(({ member, completed }, index) => (
            <div key={member.id} className="contribution-item">
              <div className="rank">{index + 1}</div>
              <div className="member-info">
                <span className="member-emoji">{FAMILY_ROLES[member.role].emoji}</span>
                <span className="member-name">{member.name}</span>
              </div>
              <div className="contribution-bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.min(100, (completed / Math.max(1, tasks.length)) * 100)}%`,
                  }}
                />
              </div>
              <span className="contribution-count">{completed}项</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI育儿提示 */}
      <section className="section tips-section">
        <div className="section-header">
          <h2>
            <Lightbulb size={20} /> {babyMonths}月龄提示
          </h2>
          <Link to="/ai" className="see-all">问AI</Link>
        </div>
        <div className="tips-list">
          {tips.slice(0, 2).map((tip, index) => (
            <div key={index} className="tip-card">
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
