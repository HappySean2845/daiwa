# 带娃助手 (Daiwa Parenting Helper)

让妈妈不再一个人扛 - 家庭育儿协作平台

## 核心功能

### 1. 家庭协作任务管理
- 创建和分配育儿任务
- 任务分类：喂养、睡眠、换尿布、洗澡、陪玩、医疗、采购等
- 优先级管理和到期提醒
- 家人贡献可视化统计

### 2. AI育儿顾问
- 基于宝宝月龄的智能问答
- 喂养、睡眠、发育、健康等分类建议
- 个性化育儿提示

### 3. 休息调度系统
- 预约休息时间
- 家人轮班协调
- 休息时长统计

### 4. 家庭成员管理
- 多成员协作
- 角色分配（妈妈、爸爸、爷爷奶奶等）
- 贡献统计

## 技术栈

- **前端**: React 19 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand (带持久化)
- **路由**: React Router v7
- **UI图标**: Lucide React
- **日期处理**: date-fns

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
src/
├── api/           # API设计文档
├── components/    # 通用组件
├── pages/         # 页面组件
│   ├── Dashboard.tsx    # 首页仪表盘
│   ├── Tasks.tsx        # 任务管理
│   ├── AIAdvisor.tsx    # AI顾问
│   ├── RestSchedule.tsx # 休息调度
│   └── Settings.tsx     # 设置
├── store/         # 状态管理
├── types/         # TypeScript类型定义
└── utils/         # 工具函数
```

## 功能演示

1. 打开应用后，进入「设置」页面
2. 点击「加载示例数据」体验完整功能
3. 或手动添加宝宝信息和家庭成员

## 后续开发计划

- [ ] 后端API实现（见 `src/api/README.md`）
- [ ] 用户认证和多设备同步
- [ ] 推送通知
- [ ] PWA离线支持
- [ ] 数据统计报表
- [ ] 社区功能

## License

MIT
