import { useState } from 'react';
import { useStore } from '../store/useStore';
import { FAMILY_ROLES } from '../types';
import { formatTimeRange, generateId } from '../utils/helpers';
import { format, addHours, startOfToday, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Plus,
  Clock,
  Coffee,
  CheckCircle,
  X,
  Calendar,
  Heart,
} from 'lucide-react';

export function RestSchedule() {
  const { restSlots, familyMembers, currentUser, addRestSlot, updateRestSlot, deleteRestSlot } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  // 新休息预约表单
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    coveredBy: '',
    note: '',
  });

  // 生成接下来7天的日期选项
  const dateOptions = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  // 过滤当日的休息安排
  const todaySlots = restSlots.filter(slot => {
    const slotDate = new Date(slot.startTime).toDateString();
    return slotDate === selectedDate.toDateString();
  });

  // 快捷时间选项
  const quickSlots = [
    { label: '午休 1小时', start: 12, duration: 1 },
    { label: '下午休息 2小时', start: 14, duration: 2 },
    { label: '晚间自由 1.5小时', start: 20, duration: 1.5 },
    { label: '早起休息 1小时', start: 6, duration: 1 },
  ];

  const handleQuickAdd = (start: number, duration: number) => {
    const startTime = new Date(selectedDate);
    startTime.setHours(start, 0, 0, 0);
    const endTime = addHours(startTime, duration);

    setNewSlot({
      ...newSlot,
      startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
    });
    setShowAddModal(true);
  };

  const handleAddSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.coveredBy || !currentUser) return;

    addRestSlot({
      id: generateId(),
      requesterId: currentUser.id,
      coveredBy: newSlot.coveredBy,
      startTime: new Date(newSlot.startTime).toISOString(),
      endTime: new Date(newSlot.endTime).toISOString(),
      status: 'requested',
      note: newSlot.note || undefined,
    });

    setNewSlot({ startTime: '', endTime: '', coveredBy: '', note: '' });
    setShowAddModal(false);
  };

  const handleConfirm = (id: string) => {
    updateRestSlot(id, { status: 'confirmed' });
  };

  const handleComplete = (id: string) => {
    updateRestSlot(id, { status: 'completed' });
  };

  // 计算本周休息统计
  const weeklyStats = familyMembers.map(member => {
    const hours = restSlots
      .filter(s => s.requesterId === member.id && s.status === 'completed')
      .reduce((acc, s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);
    return { member, hours: Math.round(hours * 10) / 10 };
  });

  return (
    <div className="rest-page">
      <header className="page-header">
        <h1>休息调度</h1>
        <p className="subtitle">
          <Heart size={14} /> 照顾好自己，才能更好地照顾宝宝
        </p>
      </header>

      {/* 日期选择 */}
      <section className="date-selector">
        {dateOptions.map(date => (
          <button
            key={date.toISOString()}
            className={`date-btn ${date.toDateString() === selectedDate.toDateString() ? 'active' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <span className="day">{format(date, 'EEE', { locale: zhCN })}</span>
            <span className="date">{format(date, 'd')}</span>
          </button>
        ))}
      </section>

      {/* 快捷添加 */}
      <section className="quick-add">
        <h3>快速预约</h3>
        <div className="quick-slots">
          {quickSlots.map((slot, index) => (
            <button
              key={index}
              className="quick-slot-btn"
              onClick={() => handleQuickAdd(slot.start, slot.duration)}
            >
              <Coffee size={16} />
              {slot.label}
            </button>
          ))}
        </div>
      </section>

      {/* 当日休息安排 */}
      <section className="day-schedule">
        <div className="section-header">
          <h3>
            <Calendar size={18} />
            {format(selectedDate, 'M月d日', { locale: zhCN })} 休息安排
          </h3>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
          </button>
        </div>

        {todaySlots.length === 0 ? (
          <div className="empty-state">
            <Clock size={32} />
            <p>暂无休息安排</p>
            <p className="hint">点击上方快速预约，让家人来帮忙</p>
          </div>
        ) : (
          <div className="slots-list">
            {todaySlots.map(slot => {
              const requester = familyMembers.find(m => m.id === slot.requesterId);
              const helper = familyMembers.find(m => m.id === slot.coveredBy);

              return (
                <div key={slot.id} className={`slot-card status-${slot.status}`}>
                  <div className="slot-time">
                    <Clock size={16} />
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </div>
                  <div className="slot-info">
                    <div className="slot-people">
                      <span className="requester">
                        {requester && `${FAMILY_ROLES[requester.role].emoji} ${requester.name}`} 休息
                      </span>
                      <span className="helper">
                        {helper && `${FAMILY_ROLES[helper.role].emoji} ${helper.name}`} 照看宝宝
                      </span>
                    </div>
                    {slot.note && <p className="slot-note">{slot.note}</p>}
                  </div>
                  <div className="slot-actions">
                    {slot.status === 'requested' && (
                      <button className="confirm-btn" onClick={() => handleConfirm(slot.id)}>
                        <CheckCircle size={16} /> 确认
                      </button>
                    )}
                    {slot.status === 'confirmed' && (
                      <button className="complete-btn" onClick={() => handleComplete(slot.id)}>
                        <CheckCircle size={16} /> 完成
                      </button>
                    )}
                    {slot.status === 'completed' && (
                      <span className="completed-badge">
                        <CheckCircle size={14} /> 已完成
                      </span>
                    )}
                    <button className="delete-btn" onClick={() => deleteRestSlot(slot.id)}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 本周统计 */}
      <section className="weekly-stats">
        <h3>本周休息时长</h3>
        <div className="stats-list">
          {weeklyStats.map(({ member, hours }) => (
            <div key={member.id} className="stat-item">
              <span className="member">
                {FAMILY_ROLES[member.role].emoji} {member.name}
              </span>
              <div className="stat-bar">
                <div
                  className="bar-fill"
                  style={{ width: `${Math.min(100, (hours / 10) * 100)}%` }}
                />
              </div>
              <span className="hours">{hours}小时</span>
            </div>
          ))}
        </div>
      </section>

      {/* 添加休息预约模态框 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>预约休息时间</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>开始时间</label>
                  <input
                    type="datetime-local"
                    value={newSlot.startTime}
                    onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>结束时间</label>
                  <input
                    type="datetime-local"
                    value={newSlot.endTime}
                    onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>谁来帮忙照看宝宝？</label>
                <select
                  value={newSlot.coveredBy}
                  onChange={e => setNewSlot({ ...newSlot, coveredBy: e.target.value })}
                >
                  <option value="">请选择</option>
                  {familyMembers
                    .filter(m => m.id !== currentUser?.id)
                    .map(member => (
                      <option key={member.id} value={member.id}>
                        {FAMILY_ROLES[member.role].emoji} {member.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>备注（可选）</label>
                <textarea
                  value={newSlot.note}
                  onChange={e => setNewSlot({ ...newSlot, note: e.target.value })}
                  placeholder="例如：想去做个头发"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleAddSlot}
                disabled={!newSlot.startTime || !newSlot.endTime || !newSlot.coveredBy}
              >
                预约休息
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
