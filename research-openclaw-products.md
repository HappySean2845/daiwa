# OpenClaw 免部署产品调研与可行性分析

> 调研日期：2026-04-05

---

## 一、OpenClaw 是什么

OpenClaw 是一个开源的自主 AI agent，由奥地利开发者 Peter Steinberger 创建。最初于 2025 年 11 月以 "Clawdbot" 名义发布，后因 Anthropic 商标投诉于 2026 年 1 月 27 日改名 "Moltbot"，三天后再改名 "OpenClaw"。

**核心能力：**
- 通过 LLM（Claude、DeepSeek、GPT 等）执行任务
- 以消息平台为主要用户界面（Telegram、WhatsApp、Slack、Discord、飞书、钉钉、微信、Signal、iMessage 等 20+ 渠道）
- 本地运行，连接外部大模型

**增长数据：**
- 截至 2026 年 3 月 2 日，GitHub 247,000 stars / 47,700 forks
- 2026 年 3 月 3 日，超越 React 成为 GitHub 最多 star 的项目（250,829 stars）
- NVIDIA CEO Jensen Huang 评价："Probably the single most important release of software, probably ever"
- 2026 年 2 月 14 日，Steinberger 宣布加入 OpenAI，项目将移交开源基金会

---

## 二、现有免部署 OpenClaw 产品全景

### 2.1 大厂官方云产品（第一梯队）

#### ArkClaw（火山引擎 / 字节跳动）
- **上线时间：** 2026 年 3 月 9 日
- **定位：** OpenClaw 官方云 SaaS 版
- **核心特点：**
  - 一键部署在专属 ECS 资源上，7x24 在线
  - 深度适配飞书办公套件（日程预约、多维表格、文档生成）
  - 兼容 LUI 和 Terminal 两种模式
  - 集成火山方舟模型平台，原生支持豆包 Seed-2.0、Kimi2.5、MiniMax2.5、GLM 等
  - 内置 Skills 安全扫描 + 云存储
- **定价：**
  - Coding Plan Lite：首月 ¥9.9 + 7 天免费试用
  - Coding Plan Pro：订阅期内免费使用 ArkClaw
  - Pro 用户模型用量是 Claude Pro 的数倍

#### MaxClaw（MiniMax / 稀宇科技）
- **上线时间：** 2026 年 2 月 25 日
- **定位：** 基于 OpenClaw 的云托管 AI agent
- **核心特点：**
  - 10 秒内从 MiniMax Agent Dashboard 部署，无需服务器/Docker/API key
  - 内置长期记忆（跨天跨周持久化）
  - 10,000+ 预配置 "Experts"（多 agent 工作流模板）
  - 支持图像/视频理解和生成
  - 可绑定 Telegram、Discord、Slack、飞书、钉钉
  - 由 MiniMax M2.5（229B 参数）驱动，成本约同类模型 1/10
- **定价：**
  - 免费层（每日送 credits）
  - 付费起步 $16-19/月
  - 订阅包含所有模型用量，无单独 API 费用

#### KimiClaw（月之暗面 / Moonshot AI）
- **上线时间：** 2026 年 2 月 15 日
- **定位：** 浏览器原生 OpenClaw，内嵌于 kimi.com
- **核心特点：**
  - 一键云部署，无需终端或 Docker
  - 5,000+ 预装 ClawHub Skills
  - 40GB 云存储（支持 RAG 工作流）
  - 由 Kimi K2.5（1 万亿参数 MoE 架构）驱动
  - "Bring Your Own Claw" 混合连接：可将第三方 OpenClaw 连到 kimi.com
  - 可桥接到 Telegram 群聊等外部平台

### 2.2 托管服务商（第二梯队）

| 产品 | 特点 | 适合人群 |
|------|------|----------|
| **xCloud** | 一键部署，预配 Telegram/WhatsApp，5 分钟内就绪 | 非技术用户 |
| **ClawHost** | 开源自托管云平台，1 分钟内部署到专属 VPS | 开发者 |
| **Hostinger VPS** | 一键 OpenClaw Docker 部署 | 有一定技术基础 |
| **Rapid Claw** | 全托管云平台，无需 DevOps | 企业用户 |

### 2.3 生态内其他框架

| 项目 | 说明 |
|------|------|
| **ZeroClaw** | 社区驱动的 Rust 重写版 |
| **PicoClaw** | Sipeed 的 Go 语言 IoT 版 |
| **NanoBot** | 港大 HKUDS 的超轻量版（~4000 行 Python，比 OpenClaw 小 99%） |
| **DeerFlow 2.0** | 字节跳动开源通用 agent 平台，支持 Telegram/Slack/飞书 |

---

## 三、竞品对比：Manus

Manus 是由 Monica.im 团队创建的自主 AI agent 产品，2025 年底被 Meta 以约 $20 亿收购。

| 维度 | Manus | OpenClaw 云产品（ArkClaw/MaxClaw/KimiClaw） |
|------|-------|----------------------------------------------|
| **产品形态** | 统一成品 SaaS agent | 托管 OpenClaw 工作区 |
| **核心卖点** | 自主完成多步任务、交付成果 | 用户拥有自己的 agent 环境，可配置 |
| **定价** | $20/月起（4000 credits），Pro $199/月 | ArkClaw ¥9.9起；MaxClaw $16-19/月 |
| **计费模式** | Credit 消耗制（单任务可能消耗 1000+ credits） | 订阅制 / 按模型用量 |
| **渠道** | Web 为主，后加 Slack/WhatsApp/Telegram | 原生支持 20+ 聊天渠道 |
| **可定制性** | 低（官方定义能力） | 高（Skills、模型、渠道、工具均可配置） |
| **开源** | 否 | OpenClaw 开源，云产品闭源 |
| **归属** | Meta | 各自独立（字节/MiniMax/Moonshot） |

---

## 四、可行性分析：现在做"免部署 OpenClaw 平台"还有机会吗？

### 4.1 市场现状判断

**结论：大厂已经先手占位，但市场远未封闭。**

- ArkClaw、MaxClaw、KimiClaw 三家都在 2026 年 2-3 月密集上线
- 它们的策略都是：**用 OpenClaw 做流量入口，卖自家模型用量**
- 36Kr 报道将此现象称为"养虾（龙虾）运动"——大厂争相围绕 OpenClaw 做商业化
- NVIDIA 也推出了 NemoClaw（安全附加层），说明生态在快速扩展

### 4.2 现有产品的共同弱点

尽管大厂入场，现有产品仍有明确短板：

1. **强绑定自家模型生态**
   - ArkClaw 绑定火山方舟（豆包系列）
   - MaxClaw 绑定 MiniMax M2.5
   - KimiClaw 绑定 Kimi K2.5
   - 用户无法真正自由切换最佳模型

2. **渠道连接仍需配置**
   - 虽然声称"免部署"，但要接 Telegram/飞书等渠道，多数仍需用户自己完成 bot 配置
   - 离"注册即用、零配置开聊"仍有距离

3. **平台锁定严重**
   - 数据/配置/Skills 迁移困难
   - 用户的 agent 工作区被锁在单一平台

4. **中国大陆市场和海外市场分裂**
   - ArkClaw/KimiClaw 主要面向中国
   - 海外用户选择少，MaxClaw 有一定国际化但还早

### 4.3 仍然存在的机会空间

#### 机会 A：模型中立的 OpenClaw Cloud
- **差异点：** 不绑定单一模型，用户可自由选择 Claude/GPT/Gemini/DeepSeek 等
- **类比：** 像 Vercel 之于 Next.js，而不是像字节之于豆包
- **目标用户：** 对模型有选择权需求的开发者和团队

#### 机会 B："注册即聊"的极简入口
- **差异点：** 真正做到零配置——用户注册付费后，TG/飞书里立刻有一个可用的 AI 助手
- **现状：** 目前没有产品做到这一步，都还需要一定程度的渠道配置
- **目标用户：** 非技术用户、想快速上手的个人

#### 机会 C：海外 / 出海市场
- **差异点：** ArkClaw/KimiClaw 以中国市场为主，海外缺乏成熟的 managed OpenClaw
- **目标用户：** 海外 Telegram 重度用户、跨境团队

#### 机会 D：垂直行业 / 企业私有化
- **差异点：** 不做通用平台，做行业定制的 OpenClaw workspace
- **目标用户：** 法律、金融、医疗等对数据隐私有要求的行业

### 4.4 不建议做的方向

1. **不要做又一个通用 OpenClaw 托管商**
   - xCloud、ClawHost、Hostinger 已经在做
   - 纯 hosting 利润薄，和大厂拼不过

2. **不要做"统一成品 agent"去和 Manus 竞争**
   - Manus 背后是 Meta，$20 亿收购
   - 这条路资源门槛太高

3. **不要强绑定单一模型**
   - 大厂做这件事是因为他们本身就是模型厂商
   - 你做这件事只会让自己变成某家模型的代理商

### 4.5 可行性评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术可行性 | 8/10 | OpenClaw 开源，架构清晰，接入文档完善 |
| 产品可行性 | 6/10 | 需求真实，但大厂已占位，需要找准差异化 |
| 商业可行性 | 5/10 | 模型成本可控，但获客和留存是核心挑战 |
| 竞争壁垒 | 4/10 | 技术壁垒低，大厂资源碾压 |
| 时机 | 6/10 | 不算太晚，生态仍在快速演化 |

---

## 五、如果要做，最可行的首版方案

### 5.1 推荐定位

**"模型中立的 OpenClaw Cloud + 零配置渠道接入"**

一句话：用户注册付费后，自动拥有一个完整的 OpenClaw workspace，可自由选择模型，TG/飞书开箱即聊。

### 5.2 与现有产品的差异

| 你 | ArkClaw | MaxClaw | KimiClaw |
|----|---------|---------|----------|
| 模型中立（BYOK + 平台托管） | 绑豆包生态 | 绑 MiniMax M2.5 | 绑 Kimi K2.5 |
| 渠道零配置（平台代管 bot） | 需配置飞书/钉钉 | 需绑定渠道 | 需配置或用 Web |
| 海外 + 中国双市场 | 主要中国 | 有国际化 | 主要中国 |
| 完整 OpenClaw 功能 | 完整 | 完整 | 完整 |

### 5.3 首版渠道策略

**第一阶段：Telegram + Web 控制台**
- Telegram Bot API 成熟，全球用户量大
- 最适合验证"注册即聊"的核心假设

**第二阶段：飞书应用机器人**
- 飞书应用机器人支持单聊、事件订阅、卡片交互
- 适合企业内部场景
- 注意：不要用飞书自定义机器人（只能群推送）

**第三阶段：钉钉**
- 钉钉自定义机器人不支持单聊
- 需要等有明确客户需求再接入

### 5.4 首版技术架构

```
                  SaaS Control Plane
       (auth / billing / workspace provisioning / admin)
                          |
                          v
                Channel Gateway Layer
          (统一接收 TG/飞书 webhook → 路由到租户)
                          |
             +------------+------------+
             |                         |
             v                         v
     Tenant Workspace A         Tenant Workspace B
      OpenClaw Runtime           OpenClaw Runtime
      - channels                 - channels
      - models (自选)            - models (自选)
      - files                    - files
      - actions/skills           - actions/skills
      - sessions                 - sessions
             |                         |
      TG / 飞书 / Web           TG / 飞书 / Web
```

**隔离模式：** Control Plane 共享，Runtime 隔离（每租户独立容器）

### 5.5 成本参考

按 Gemini 2.5 Flash-Lite 最低成本模型估算：
- 输入 $0.10/1M tokens，输出 $0.40/1M tokens
- 每用户每天 20 轮对话（800 in / 1200 out per round）
- **单用户月模型成本约 $0.34**

| 用户规模 | 月模型成本 | 参考定价建议 |
|----------|-----------|-------------|
| 100 | ~$34 | $9.9/月起 |
| 1,000 | ~$340 | $9.9/月起 |
| 10,000 | ~$3,400 | 分层定价 |

---

## 六、最终结论

### 回答原始问题："有什么产品能免部署直接用上 OpenClaw？"

**答案：已经有多个成熟产品。**

- **ArkClaw**（字节/火山引擎）：最适合中国飞书用户，¥9.9 起
- **MaxClaw**（MiniMax）：最便宜的全功能云 OpenClaw，$16-19/月
- **KimiClaw**（Moonshot AI）：浏览器原生体验，5000+ Skills
- **xCloud / ClawHost / Hostinger**：更偏托管服务

### 回答延伸问题："自己做一个还有可行性吗？"

**有条件的可行。**

- 如果做"又一个 OpenClaw hosting"——不建议，已经太拥挤
- 如果做"模型中立 + 零配置渠道 + 海外市场"——有差异化空间
- 如果做"垂直行业 OpenClaw 私有化"——有企业付费意愿
- 核心挑战不是技术，而是：获客、留存、与大厂的竞争

---

## 参考来源

- [OpenClaw - Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [OpenClaw Explained - KDnuggets](https://www.kdnuggets.com/openclaw-explained-the-free-ai-agent-tool-going-viral-already-in-2026)
- [ArkClaw - AICost Blog](https://aicost.org/blog/arkclaw-2026-byte-dance-openclaw-cloud-ai-agent)
- [ArkClaw - AIBase](https://www.aibase.com/news/26049)
- [MaxClaw Official](https://maxclaw.ai/)
- [MaxClaw - LinkStartAI Review](https://www.linkstartai.com/en/agents/maxclaw)
- [KimiClaw - MarkTechPost](https://www.marktechpost.com/2026/02/15/moonshot-ai-launches-kimi-claw-native-openclaw-on-kimi-com-with-5000-community-skills-and-40gb-cloud-storage-now/)
- [KimiClaw Introduction](https://www.kimi.com/resources/kimi-claw-introduction)
- [Manus AI Pricing - Lindy](https://www.lindy.ai/blog/manus-ai-pricing)
- [Manus AI Review - CyberNews](https://cybernews.com/ai-tools/manus-ai-review/)
- [OpenClaw Hosting Guide - xCloud](https://xcloud.host/best-openclaw-hosting-providers/)
- [Claw Ecosystem Comparison](https://maxclaw.ai/claw-ecosystem)
- [NVIDIA NemoClaw](https://nvidianews.nvidia.com/news/nvidia-announces-nemoclaw)
- [OpenClaw Statistics 2026](https://www.gradually.ai/en/openclaw-statistics/)
- [36Kr - 大厂"养龙虾"](https://eu.36kr.com/en/p/3717904404936072)
