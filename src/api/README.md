# 带娃助手 API 设计文档

## 基础信息

- **Base URL**: `https://api.daiwa.app/v1`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

---

## 数据模型

### Baby (宝宝)
```typescript
{
  id: string;
  name: string;
  nickname?: string;
  birthDate: string;       // ISO 8601
  gender: 'male' | 'female';
  avatar?: string;
  familyId: string;
}
```

### FamilyMember (家庭成员)
```typescript
{
  id: string;
  userId: string;
  familyId: string;
  name: string;
  role: 'mom' | 'dad' | 'grandpa' | 'grandma' | 'other';
  avatar?: string;
}
```

### Task (任务)
```typescript
{
  id: string;
  familyId: string;
  title: string;
  description?: string;
  category: 'feeding' | 'sleep' | 'diaper' | 'bath' | 'play' | 'medical' | 'shopping' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigneeId?: string;
  createdBy: string;
  createdAt: string;
  dueAt?: string;
  completedAt?: string;
  completedBy?: string;
}
```

### RestSlot (休息预约)
```typescript
{
  id: string;
  familyId: string;
  requesterId: string;
  coveredBy: string;
  startTime: string;
  endTime: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  note?: string;
}
```

---

## API 端点

### 认证 Authentication

#### POST /auth/register
注册新用户
```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "张三"
}

// Response 201
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "jwt-token-here"
}
```

#### POST /auth/login
用户登录
```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response 200
{
  "user": { ... },
  "token": "jwt-token-here"
}
```

---

### 家庭 Family

#### POST /families
创建家庭
```json
// Request
{
  "name": "张家"
}

// Response 201
{
  "id": "family-123",
  "name": "张家",
  "inviteCode": "ABC123"
}
```

#### POST /families/join
加入家庭（使用邀请码）
```json
// Request
{
  "inviteCode": "ABC123",
  "role": "dad",
  "name": "爸爸"
}
```

#### GET /families/:id/members
获取家庭成员列表

---

### 宝宝 Baby

#### POST /babies
添加宝宝
```json
// Request
{
  "familyId": "family-123",
  "name": "小宝",
  "nickname": "宝宝",
  "birthDate": "2025-07-15",
  "gender": "male"
}
```

#### GET /babies/:id
获取宝宝信息

#### PUT /babies/:id
更新宝宝信息

---

### 任务 Tasks

#### GET /tasks
获取任务列表
- Query params:
  - `familyId` (required)
  - `status` - pending, completed, all
  - `assigneeId` - 过滤指定成员的任务
  - `date` - 按日期过滤

#### POST /tasks
创建任务
```json
// Request
{
  "familyId": "family-123",
  "title": "冲奶粉喂养",
  "description": "180ml奶粉",
  "category": "feeding",
  "priority": "high",
  "assigneeId": "member-456",
  "dueAt": "2025-01-15T14:00:00Z"
}
```

#### PUT /tasks/:id
更新任务

#### POST /tasks/:id/complete
完成任务
```json
// Request
{
  "completedBy": "member-789"
}
```

#### DELETE /tasks/:id
删除任务

---

### 休息预约 Rest Slots

#### GET /rest-slots
获取休息预约列表
- Query params:
  - `familyId` (required)
  - `date` - 按日期过滤
  - `status` - requested, confirmed, completed

#### POST /rest-slots
创建休息预约
```json
// Request
{
  "familyId": "family-123",
  "coveredBy": "member-456",
  "startTime": "2025-01-15T14:00:00Z",
  "endTime": "2025-01-15T16:00:00Z",
  "note": "想去做个头发"
}
```

#### PUT /rest-slots/:id/confirm
确认休息预约

#### PUT /rest-slots/:id/complete
完成休息预约

---

### AI 顾问 AI Advisor

#### POST /ai/ask
AI问答
```json
// Request
{
  "question": "宝宝多大可以添加辅食？",
  "babyId": "baby-123",
  "context": {
    "babyMonths": 5
  }
}

// Response 200
{
  "id": "conv-123",
  "answer": "根据世界卫生组织建议...",
  "category": "feeding",
  "relatedTips": [...]
}
```

#### GET /ai/tips
获取月龄相关的育儿提示
- Query params:
  - `babyId` (required)

---

### 统计 Statistics

#### GET /stats/family/:familyId
获取家庭统计数据
```json
// Response 200
{
  "tasksByMember": {
    "member-123": 15,
    "member-456": 8
  },
  "restHoursByMember": {
    "member-123": 5.5,
    "member-456": 12
  },
  "weeklyTrend": [
    { "date": "2025-01-08", "tasksCompleted": 12 },
    { "date": "2025-01-09", "tasksCompleted": 15 }
  ]
}
```

---

## 错误响应

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 错误码
| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 无权限访问该资源 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## WebSocket 事件 (实时同步)

### 连接
```
wss://api.daiwa.app/ws?token=jwt-token
```

### 事件类型

#### task.created
新任务创建

#### task.updated
任务更新

#### task.completed
任务完成

#### rest.requested
新休息预约

#### rest.confirmed
休息预约确认

#### member.joined
新成员加入家庭

---

## 推送通知 Payload

```json
{
  "type": "task_reminder",
  "title": "任务提醒",
  "body": "冲奶粉喂养 - 还有30分钟",
  "data": {
    "taskId": "task-123",
    "action": "open_task"
  }
}
```

### 通知类型
- `task_reminder` - 任务提醒
- `task_assigned` - 任务分配
- `rest_request` - 休息请求
- `rest_confirmed` - 休息确认
- `daily_summary` - 每日汇总
