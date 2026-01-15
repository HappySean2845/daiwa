import { useState } from 'react';
import { useStore } from '../store/useStore';
import { FAMILY_ROLES, type FamilyMember } from '../types';
import { getBabyAge, generateId } from '../utils/helpers';
import { format } from 'date-fns';
import {
  Baby,
  Users,
  UserPlus,
  X,
  Edit2,
  Trash2,
  Database,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';

export function Settings() {
  const {
    baby,
    setBaby,
    currentUser,
    setCurrentUser,
    familyMembers,
    addFamilyMember,
    removeFamilyMember,
    initializeDemoData,
  } = useStore();

  const [showBabyModal, setShowBabyModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showUserSelect, setShowUserSelect] = useState(false);

  const [babyForm, setBabyForm] = useState({
    name: baby?.name || '',
    nickname: baby?.nickname || '',
    birthDate: baby?.birthDate ? format(new Date(baby.birthDate), 'yyyy-MM-dd') : '',
    gender: baby?.gender || 'male' as const,
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    role: 'other' as FamilyMember['role'],
  });

  const handleSaveBaby = () => {
    if (!babyForm.name || !babyForm.birthDate) return;

    setBaby({
      id: baby?.id || generateId(),
      name: babyForm.name,
      nickname: babyForm.nickname || undefined,
      birthDate: new Date(babyForm.birthDate).toISOString(),
      gender: babyForm.gender,
    });

    setShowBabyModal(false);
  };

  const handleAddMember = () => {
    if (!memberForm.name) return;

    addFamilyMember({
      id: generateId(),
      name: memberForm.name,
      role: memberForm.role,
    });

    setMemberForm({ name: '', role: 'other' });
    setShowMemberModal(false);
  };

  const handleSelectUser = (member: FamilyMember) => {
    setCurrentUser(member);
    setShowUserSelect(false);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem('daiwa-storage');
      window.location.reload();
    }
  };

  const handleLoadDemo = () => {
    if (confirm('这将覆盖现有数据，确定要加载示例数据吗？')) {
      initializeDemoData();
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>设置</h1>
      </header>

      {/* 当前用户 */}
      <section className="settings-section">
        <h3>当前用户</h3>
        <button
          className="setting-item"
          onClick={() => setShowUserSelect(!showUserSelect)}
        >
          <div className="setting-info">
            {currentUser ? (
              <>
                <span className="emoji">{FAMILY_ROLES[currentUser.role].emoji}</span>
                <span>{currentUser.name}</span>
              </>
            ) : (
              <span className="placeholder">请选择当前用户</span>
            )}
          </div>
          <ChevronRight size={18} />
        </button>

        {showUserSelect && (
          <div className="user-select-list">
            {familyMembers.map(member => (
              <button
                key={member.id}
                className={`user-option ${currentUser?.id === member.id ? 'active' : ''}`}
                onClick={() => handleSelectUser(member)}
              >
                <span className="emoji">{FAMILY_ROLES[member.role].emoji}</span>
                <span>{member.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 宝宝信息 */}
      <section className="settings-section">
        <h3>
          <Baby size={18} /> 宝宝信息
        </h3>
        <div className="setting-item" onClick={() => setShowBabyModal(true)}>
          {baby ? (
            <div className="setting-info">
              <div className="baby-avatar">
                {baby.gender === 'male' ? '👶' : '👧'}
              </div>
              <div className="baby-details">
                <span className="name">{baby.nickname || baby.name}</span>
                <span className="age">{getBabyAge(baby.birthDate)}</span>
              </div>
            </div>
          ) : (
            <div className="setting-info">
              <span className="placeholder">点击添加宝宝信息</span>
            </div>
          )}
          <Edit2 size={18} />
        </div>
      </section>

      {/* 家庭成员 */}
      <section className="settings-section">
        <div className="section-header">
          <h3>
            <Users size={18} /> 家庭成员
          </h3>
          <button className="add-btn" onClick={() => setShowMemberModal(true)}>
            <UserPlus size={18} />
          </button>
        </div>
        <div className="members-list">
          {familyMembers.length === 0 ? (
            <p className="empty-hint">还没有添加家庭成员</p>
          ) : (
            familyMembers.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <span className="emoji">{FAMILY_ROLES[member.role].emoji}</span>
                  <span className="name">{member.name}</span>
                  <span className="role">{FAMILY_ROLES[member.role].label}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => removeFamilyMember(member.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 数据管理 */}
      <section className="settings-section">
        <h3>
          <Database size={18} /> 数据管理
        </h3>
        <button className="setting-item warning" onClick={handleLoadDemo}>
          <div className="setting-info">
            <span>加载示例数据</span>
            <span className="hint">体验App功能</span>
          </div>
          <RotateCcw size={18} />
        </button>
        <button className="setting-item danger" onClick={handleReset}>
          <div className="setting-info">
            <span>重置所有数据</span>
            <span className="hint">清除本地存储的所有数据</span>
          </div>
          <Trash2 size={18} />
        </button>
      </section>

      {/* 关于 */}
      <section className="settings-section about">
        <h3>关于</h3>
        <p>带娃助手 v1.0.0</p>
        <p className="copyright">让每一位父母都能得到喘息的机会</p>
      </section>

      {/* 宝宝信息模态框 */}
      {showBabyModal && (
        <div className="modal-overlay" onClick={() => setShowBabyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{baby ? '编辑宝宝信息' : '添加宝宝信息'}</h2>
              <button onClick={() => setShowBabyModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>宝宝姓名 *</label>
                <input
                  type="text"
                  value={babyForm.name}
                  onChange={e => setBabyForm({ ...babyForm, name: e.target.value })}
                  placeholder="大名"
                />
              </div>

              <div className="form-group">
                <label>小名</label>
                <input
                  type="text"
                  value={babyForm.nickname}
                  onChange={e => setBabyForm({ ...babyForm, nickname: e.target.value })}
                  placeholder="可选"
                />
              </div>

              <div className="form-group">
                <label>出生日期 *</label>
                <input
                  type="date"
                  value={babyForm.birthDate}
                  onChange={e => setBabyForm({ ...babyForm, birthDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>性别</label>
                <div className="gender-select">
                  <button
                    className={babyForm.gender === 'male' ? 'active' : ''}
                    onClick={() => setBabyForm({ ...babyForm, gender: 'male' })}
                  >
                    👶 男宝
                  </button>
                  <button
                    className={babyForm.gender === 'female' ? 'active' : ''}
                    onClick={() => setBabyForm({ ...babyForm, gender: 'female' })}
                  >
                    👧 女宝
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowBabyModal(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveBaby}
                disabled={!babyForm.name || !babyForm.birthDate}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加成员模态框 */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>添加家庭成员</h2>
              <button onClick={() => setShowMemberModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>姓名 *</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="称呼"
                />
              </div>

              <div className="form-group">
                <label>角色</label>
                <div className="role-select">
                  {Object.entries(FAMILY_ROLES).map(([key, { label, emoji }]) => (
                    <button
                      key={key}
                      className={memberForm.role === key ? 'active' : ''}
                      onClick={() => setMemberForm({ ...memberForm, role: key as FamilyMember['role'] })}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowMemberModal(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleAddMember}
                disabled={!memberForm.name}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
