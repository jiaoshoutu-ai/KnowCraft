# KnowCraft 系统设计文档

> 基于最新原型设计（2026-01-22更新）  
> 核心变更：从"视角/角色"模型迁移到"辩题 + 正反方立场"模型

---

## 目录

1. [系统概述](#系统概述)
2. [数据模型](#数据模型)
3. [用户流程](#用户流程)
4. [API 设计](#api-设计)
5. [前端架构](#前端架构)
6. [后台管理](#后台管理)
7. [AI 能力设计](#ai-能力设计)
8. [技术实现计划](#技术实现计划)

---

## 系统概述

KnowCraft 是一个面向中学生的思辨能力训练平台，通过新闻视频和 AI 辩论提升批判性思维能力。

### 核心功能
- 观看新闻短视频（来自官媒：新闻1+1、焦点访谈等）
- 选择辩题并选择正方/反方立场
- 与 AI 进行辩论
- 获得多维度评价和改进建议

### 用户类型
- **学生用户**：移动端/iPad/桌面端浏览，参与辩论
- **管理员**：桌面端后台，管理话题、用户、系统配置

---

## 数据模型

### Topic（话题）

```python
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class Video(BaseModel):
    url: str
    duration: str = ""
    cover: str = ""
    transcript: str = ""  # 视频转写文本，用于 AI 生成内容

class DebateTopic(BaseModel):
    """辩题：包含辩题标题和正反方立场"""
    id: str
    title: str  # 辩题标题，如"短视频平台是否应该为青少年沉迷承担主要责任？"
    pro_stance: str  # 正方立场描述
    con_stance: str  # 反方立场描述
    participant_count: int = 0  # 参与人数

class Topic(BaseModel):
    id: str
    title: str  # 话题标题
    source: str  # 内容来源：新闻1+1、焦点访谈等
    summary: str  # 话题简介
    tags: List[str] = []  # 分类标签
    video: Video
    
    # 辩题列表（核心变更：替代原来的 perspectives）
    debate_topics: List[DebateTopic]
    
    # 元数据
    created_at: datetime
    updated_at: datetime
    is_published: bool = False
    view_count: int = 0
    debate_count: int = 0
```

**与旧模型的区别：**
- ❌ 移除 `perspectives: List[Perspective]`（角色/视角列表）
- ✅ 新增 `debate_topics: List[DebateTopic]`（辩题列表）
- ✅ 每个 `DebateTopic` 包含正方和反方立场
- ✅ `Video.transcript` 存储转写文本，用于 AI 内容生成

### DebateSession（辩论会话）

```python
from typing import List, Optional
from pydantic import BaseModel
from enum import Enum

class Stance(str, Enum):
    PRO = "pro"      # 正方
    CON = "con"      # 反方

class DebateMessage(BaseModel):
    role: str  # "user" or "ai"
    stance: Stance  # 该消息代表的立场
    content: str
    timestamp: datetime

class DebateScores(BaseModel):
    logic: int          # 逻辑性 0-10
    evidence: int       # 论据充分性 0-10
    expression: int     # 表达能力 0-10
    rebuttal: int       # 反驳能力 0-10
    critical_thinking: int  # 批判性思维 0-10

    @property
    def total(self) -> int:
        return self.logic + self.evidence + self.expression + self.rebuttal + self.critical_thinking

class Evaluation(BaseModel):
    scores: DebateScores
    strengths: List[str]  # 亮点
    improvements: List[str]  # 改进建议
    summary: str  # 总体评价

class DebateSession(BaseModel):
    session_id: str
    user_id: str
    topic_id: str
    debate_topic_id: str  # 选择的辩题
    user_stance: Stance  # 用户选择的立场
    ai_stance: Stance  # AI 的立场（与用户相反）
    
    round_number: int = 0
    max_rounds: int = 5
    
    messages: List[DebateMessage] = []
    phase: str = "init"  # init | debating | evaluating | done
    
    evaluation: Optional[Evaluation] = None
    
    created_at: datetime
    completed_at: Optional[datetime] = None
```

**关键变更：**
- ❌ 移除 `perspective_id`（AI 对手的视角 ID）
- ✅ 新增 `debate_topic_id`（选择的辩题 ID）
- ✅ 新增 `user_stance` 和 `ai_stance`（明确正反方）
- ✅ `DebateMessage.stance` 标记每条消息的立场
- ✅ 评价维度从 `perspective`（视角多样性）改为 `critical_thinking`（批判性思维）

### User（用户）

```python
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"

class User(BaseModel):
    id: str
    username: str
    avatar: str = ""
    role: UserRole = UserRole.STUDENT
    
    # 学生统计数据
    debate_count: int = 0
    average_score: float = 0.0
    streak_days: int = 0
    
    created_at: datetime
    last_active_at: datetime
```

---

## 用户流程

### 学生用户流程

```
1. 首页
   └─> 2. 话题列表
         └─> 3. 话题详情（观看视频）
               └─> 4. 选择辩题
                     ├─> 展示辩题列表（卡片形式）
                     └─> 选择辩题后展示正方/反方立场
                           └─> 5. 选择难度
                                 └─> 6. 辩论（文字/语音）
                                       └─> 7. 评价和改进建议
```

### 关键页面说明

#### 选择辩题页（Vote Screen）

**交互逻辑：**
1. 展示 3 个辩题卡片（标题 + 参与人数）
2. 用户点击辩题卡片 → 卡片展开，显示正方/反方立场选择
3. 用户选择立场（蓝色正方 / 红色反方）
4. 点击"确认并继续" → 进入难度选择

**UI 元素：**
```
┌─────────────────────────────────────┐
│ ○ 辩题 1                             │
│   短视频平台是否应该为青少年沉迷     │
│   承担主要责任？                     │
│   已有 1,234 人参与                  │
└─────────────────────────────────────┘
     ↓ 点击后展开
┌─────────────────────────────────────┐
│ ● 辩题 1（已选择，边框高亮）         │
│   短视频平台是否应该为青少年沉迷     │
│   承担主要责任？                     │
├─────────────────────────────────────┤
│ 选择你的立场：                       │
│ ┌──────────┐  ┌──────────┐          │
│ │ 正方     │  │ 反方     │          │
│ │ 平台算法 │  │ 技术中性 │          │
│ │ 诱导沉迷 │  │ 家长监管 │          │
│ └──────────┘  └──────────┘          │
└─────────────────────────────────────┘
```

#### 辩论页（Debate Screen）

**布局：**
- 顶部显示辩题和双方立场
- 消息列表（用户消息靠右，AI 消息靠左）
- 每条消息标记立场（正方/反方）
- 输入区域支持文字和语音切换

---

## API 设计

### 话题相关

```
GET    /api/topics
       获取话题列表（分页、筛选）
       Query: page, limit, tags, source
       Response: { topics: [TopicListItem], total: int }

GET    /api/topics/{topic_id}
       获取话题详情（含辩题列表）
       Response: Topic

POST   /api/topics
       创建话题（管理员）
       Body: { title, source, summary, tags, video, debate_topics }
       Response: Topic

PUT    /api/topics/{topic_id}
       更新话题（管理员）
       Body: { ...partial Topic fields }
       Response: Topic

DELETE /api/topics/{topic_id}
       删除话题（管理员）
       Response: { success: true }
```

### AI 内容生成

```
POST   /api/topics/generate
       从视频转写文本生成话题内容
       Body: { transcript: str }
       Response: {
         summary: str,
         debate_topics: [
           { title: str, pro_stance: str, con_stance: str }
         ]
       }
       
       实现：调用 LLM 分析转写文本，提取争议焦点，生成辩题和立场
```

### 辩论相关

```
POST   /api/debate/start
       开始辩论会话
       Body: {
         topic_id: str,
         debate_topic_id: str,
         user_stance: "pro" | "con",
         difficulty: "beginner" | "intermediate" | "advanced"
       }
       Response: { session_id: str, messages: [] }

POST   /api/debate/message
       发送用户消息并获取 AI 回复
       Body: {
         session_id: str,
         message: str
       }
       Response: {
         ai_message: DebateMessage,
         round_number: int,
         is_last_round: bool
       }

POST   /api/debate/evaluate
       结束辩论并获取评价
       Body: { session_id: str }
       Response: Evaluation

GET    /api/debate/sessions
       获取用户的辩论历史
       Query: page, limit
       Response: { sessions: [DebateSessionSummary], total: int }
```

### 用户相关

```
POST   /api/auth/login
       用户登录（微信/手机号）
       Body: { provider: "wechat" | "phone", code: str }
       Response: { user: User, token: str }

GET    /api/users/me
       获取当前用户信息
       Response: User

PUT    /api/users/me
       更新用户信息
       Body: { username?, avatar? }
       Response: User
```

### 后台管理

```
GET    /api/admin/stats
       获取系统统计数据
       Response: {
         total_users: int,
         total_debates: int,
         active_topics: int,
         recent_activity: [...]
       }

GET    /api/admin/users
       获取用户列表（管理员）
       Query: page, limit, role, status
       Response: { users: [User], total: int }

PUT    /api/admin/users/{user_id}/status
       启用/禁用用户（管理员）
       Body: { is_active: bool }
       Response: User
```

---

## 前端架构

### 技术栈
- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **UI 库**：Tailwind CSS + 自定义组件
- **状态管理**：Pinia
- **路由**：Vue Router
- **HTTP 客户端**：Axios

### 页面组件结构

```
src/
├── views/
│   ├── HomeView.vue              # 首页（推荐话题）
│   ├── TopicListView.vue         # 话题列表
│   ├── TopicDetailView.vue       # 话题详情（视频播放）
│   ├── VoteView.vue              # 选择辩题 ⭐ 核心页面
│   ├── DifficultyView.vue        # 选择难度
│   ├── DebateView.vue            # 辩论页面
│   ├── EvaluationView.vue        # 评价页面
│   └── ProfileView.vue           # 个人中心
├── components/
│   ├── topic/
│   │   ├── TopicCard.vue         # 话题卡片
│   │   ├── VideoPlayer.vue       # 视频播放器
│   │   └── DebateTopicCard.vue   # 辩题卡片（含立场选择）⭐
│   ├── debate/
│   │   ├── MessageBubble.vue     # 消息气泡
│   │   ├── DebateHeader.vue      # 辩论顶部（辩题+立场）
│   │   └── InputArea.vue         # 输入区域（文字/语音切换）
│   └── common/
│       ├── Button.vue
│       ├── Modal.vue
│       └── LoadingSpinner.vue
├── stores/
│   ├── topicStore.ts             # 话题状态
│   ├── debateStore.ts            # 辩论会话状态
│   └── userStore.ts              # 用户状态
├── api/
│   ├── topicApi.ts
│   ├── debateApi.ts
│   └── userApi.ts
└── router/
    └── index.ts
```

### VoteView 组件设计

```vue
<template>
  <div class="vote-view">
    <h1>选择辩题</h1>
    <p>从以下辩题中选择一个，然后选择你的立场</p>
    
    <div class="debate-topics">
      <DebateTopicCard
        v-for="topic in debateTopics"
        :key="topic.id"
        :topic="topic"
        :is-selected="selectedTopicId === topic.id"
        :selected-stance="selectedStance"
        @select-topic="handleSelectTopic"
        @select-stance="handleSelectStance"
      />
    </div>
    
    <ButtonGroup>
      <Button variant="secondary" @click="$router.back()">返回</Button>
      <Button
        variant="primary"
        :disabled="!selectedTopicId || !selectedStance"
        @click="proceed"
      >
        确认并继续 →
      </Button>
    </ButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTopicStore } from '@/stores/topicStore'
import DebateTopicCard from '@/components/topic/DebateTopicCard.vue'

const route = useRoute()
const router = useRouter()
const topicStore = useTopicStore()

const selectedTopicId = ref<string | null>(null)
const selectedStance = ref<'pro' | 'con' | null>(null)

const debateTopics = computed(() => {
  const topic = topicStore.currentTopic
  return topic?.debate_topics || []
})

function handleSelectTopic(topicId: string) {
  selectedTopicId.value = topicId
  selectedStance.value = null  // 重置立场选择
}

function handleSelectStance(stance: 'pro' | 'con') {
  selectedStance.value = stance
}

function proceed() {
  if (selectedTopicId.value && selectedStance.value) {
    // 存储选择到 store
    topicStore.setDebateChoice(selectedTopicId.value, selectedStance.value)
    router.push({ name: 'difficulty' })
  }
}
</script>
```

### DebateTopicCard 组件设计

```vue
<template>
  <div
    class="debate-topic-card"
    :class="{ selected: isSelected }"
    @click="$emit('select-topic', topic.id)"
  >
    <div class="card-header">
      <div class="radio-indicator" :class="{ active: isSelected }"></div>
      <div class="topic-info">
        <h3>辩题</h3>
        <h2>{{ topic.title }}</h2>
        <p>已有 {{ topic.participant_count }} 人参与</p>
      </div>
    </div>
    
    <div v-if="isSelected" class="stance-options">
      <p>选择你的立场：</p>
      <div class="stance-grid">
        <div
          class="stance-card pro"
          :class="{ active: selectedStance === 'pro' }"
          @click.stop="$emit('select-stance', 'pro')"
        >
          <strong>正方</strong>
          <p>{{ topic.pro_stance }}</p>
        </div>
        <div
          class="stance-card con"
          :class="{ active: selectedStance === 'con' }"
          @click.stop="$emit('select-stance', 'con')"
        >
          <strong>反方</strong>
          <p>{{ topic.con_stance }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  topic: {
    id: string
    title: string
    pro_stance: string
    con_stance: string
    participant_count: number
  }
  isSelected: boolean
  selectedStance: 'pro' | 'con' | null
}>()

defineEmits<{
  'select-topic': [topicId: string]
  'select-stance': [stance: 'pro' | 'con']
}>()
</script>

<style scoped>
.debate-topic-card {
  border: 2px solid #E9ECEF;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.debate-topic-card.selected {
  border-color: #6C5CE7;
  background: #F8F9FA;
}

.stance-options {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #E9ECEF;
}

.stance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.stance-card {
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.stance-card.pro {
  background: #E3F2FD;
  border: 2px solid #64B5F6;
}

.stance-card.con {
  background: #FFEBEE;
  border: 2px solid #E57373;
}

.stance-card.active {
  transform: scale(1.03);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.stance-card.pro strong {
  color: #1976D2;
}

.stance-card.con strong {
  color: #D32F2F;
}
</style>
```

---

## 后台管理

### 话题创建流程

```
1. 基本信息
   ├─ 话题标题
   ├─ 内容来源（新闻1+1、焦点访谈等）
   ├─ 分类标签（可多选）
   └─ 话题简介

2. 视频信息
   ├─ 视频链接（B站/YouTube）
   ├─ 视频时长
   ├─ 封面图片 URL
   ├─ 视频转写文本（大文本框）
   └─ [🤖 AI 一键生成] 按钮
      ├─ 自动生成话题简介
      ├─ 自动生成辩题列表
      └─ 自动生成正反方立场

3. 辩题配置
   ├─ 辩题 1
   │   ├─ 辩题标题
   │   ├─ 正方立场
   │   └─ 反方立场
   ├─ 辩题 2（可选）
   └─ [+ 添加更多辩题]

4. [保存草稿] | [发布上线]
```

### 管理功能列表

| 功能 | 描述 | 权限 |
|------|------|------|
| 话题管理 | 创建、编辑、上下线、删除话题 | 管理员 |
| 用户管理 | 查看用户列表、启用/禁用账户 | 管理员 |
| 辩论记录 | 查看辩论历史、导出数据 | 管理员 |
| 数据统计 | 系统概览、活跃用户、热门话题 | 管理员 |
| 系统设置 | AI 模型配置、难度参数调整 | 管理员 |

---

## AI 能力设计

### 1. 内容生成（从视频转写文本）

**输入：** 视频转写文本（纯文本）

**输出：**
```json
{
  "summary": "本期节目深入探讨了短视频平台算法推荐机制对未成年人的潜在危害...",
  "debate_topics": [
    {
      "title": "短视频平台是否应该为青少年沉迷承担主要责任？",
      "pro_stance": "平台算法诱导沉迷，应担主责。短视频平台利用算法精准推送...",
      "con_stance": "技术中性，家长监管才是关键。技术本身是中性的，算法推荐是为了优化用户体验..."
    },
    {
      "title": "是否应该完全禁止未成年人使用短视频？",
      "pro_stance": "禁止是保护未成年人的最有效手段...",
      "con_stance": "一刀切不现实，应培养自律能力..."
    }
  ]
}
```

**Prompt 设计：**
```
你是一个专业的教育内容编辑，负责从新闻视频中提取辩论素材。

请分析以下视频转写文本，生成适合中学生辩论的内容：

【视频转写文本】
{transcript}

请输出 JSON 格式，包含：
1. summary: 话题简介（100-150字，概括核心争议）
2. debate_topics: 辩题列表（2-3个辩题），每个辩题包含：
   - title: 辩题标题（以问句形式）
   - pro_stance: 正方立场（50-80字）
   - con_stance: 反方立场（50-80字）

要求：
- 辩题应该具有争议性，能够引发深入思考
- 正反方立场应该均衡，都有合理的论据支持
- 语言简洁明了，适合中学生理解
```

### 2. 辩论对手 AI

**角色设定：**
- AI 扮演与用户相反立场的辩手
- 根据难度调整反驳力度
- 每轮回复控制在 100-150 字

**Prompt 模板：**
```
你正在参与一场辩论，辩题是：{debate_topic_title}

你的立场是：{ai_stance}
对方（用户）的立场是：{user_stance}

难度级别：{difficulty}
- beginner: 温和引导，多肯定对方观点，轻微反驳
- intermediate: 正常辩论，有理有据地反驳
- advanced: 激烈辩论，犀利反驳，挑战对方逻辑漏洞

当前辩论进度：第 {round_number} 轮，共 {max_rounds} 轮

历史对话：
{messages}

请根据你的立场回复用户的最新发言。回复要求：
1. 先简要回应用户的观点
2. 提出你的论点或反驳
3. 用事实或逻辑支撑你的观点
4. 控制在 100-150 字以内
5. 语气符合难度级别要求
```

### 3. 辩论评价 AI

**评价维度：**
1. **逻辑性** (0-10)：论证结构是否清晰，推理是否合理
2. **论据充分性** (0-10)：是否使用事实、数据、案例支撑观点
3. **表达能力** (0-10)：语言是否流畅，表达是否清晰
4. **反驳能力** (0-10)：是否有效回应对方的反驳
5. **批判性思维** (0-10)：是否能多角度思考，识别逻辑谬误

**Prompt 模板：**
```
你是一位专业的辩论教练，请评价以下辩论会话。

辩题：{debate_topic_title}
用户立场：{user_stance}

辩论记录：
{messages}

请从以下 5 个维度评价用户的表现（每项 0-10 分）：
1. 逻辑性：论证结构是否清晰，推理是否合理
2. 论据充分性：是否使用事实、数据、案例支撑观点
3. 表达能力：语言是否流畅，表达是否清晰
4. 反驳能力：是否有效回应对方的反驳
5. 批判性思维：是否能多角度思考，识别逻辑谬误

输出 JSON 格式：
{
  "scores": {
    "logic": 分数,
    "evidence": 分数,
    "expression": 分数,
    "rebuttal": 分数,
    "critical_thinking": 分数
  },
  "strengths": ["亮点1", "亮点2"],
  "improvements": ["改进建议1", "改进建议2"],
  "summary": "总体评价（50-100字）"
}
```

---

## 技术实现计划

### 数据库：SQLite + SQLAlchemy
- 轻量级文件数据库，零配置
- SQLAlchemy ORM 管理模型和查询
- aiosqlite 提供异步支持

### Phase 1: 数据模型迁移 ✅ 已完成

**完成日期：** 2026-07-02

**已完成任务：**
- [x] 更新 `Topic` 模型，添加 `debate_topics` 字段
- [x] 创建 `DebateTopic` 模型
- [x] 更新 `DebateSession` 模型，添加 `debate_topic_id`、`user_stance`、`ai_stance`
- [x] 更新 `Evaluation` 模型，将 `perspective` 改为 `critical_thinking`
- [x] 数据库迁移脚本（如果已有数据）

**影响文件：**
- `backend/models/topic.py`
- `backend/models/debate.py`
- `backend/data/topics/*.json`（更新示例数据）

### Phase 2: API 更新 ✅ 已完成

**完成日期：** 2026-07-02

**已完成任务：**
- [x] 实现 `POST /api/topics/generate` 端点（AI 内容生成）
- [x] 更新 `POST /api/debate/start` 接受 `debate_topic_id` 和 `user_stance`
- [x] 更新辩论逻辑，根据 `ai_stance` 生成对立立场回复
- [x] 更新评价逻辑，使用新的 5 维度评分

**影响文件：**
- `backend/api/topics.py`
- `backend/api/debate.py`
- `backend/core/llm_adapter.py`（添加内容生成方法）
- `backend/prompts/`（更新 prompt 模板）

### Phase 3: 前端原型实现 ✅ 已完成

**完成日期：** 2026-07-02

**已完成任务：**
- [x] 重写 `VotePage.js` 组件，实现辩题卡片列表 + 立场选择交互
- [x] 更新 `router.js`，移除角度选择路由，使用新的 `debateTopicId`/`userStance` 参数
- [x] 更新 `TopicDetail.js`，显示辩题列表预览
- [x] 更新 `DifficultySelect.js`，接收新路由参数
- [x] 更新 `DebatePage.js`，WebSocket 消息适配辩题模型
- [x] 更新 `FeedbackPage.js`，评分维度"多角度"→"批判性思维"
- [x] 更新 `api.js`，新增 `generateDebateTopics()` 方法
- [x] 从 `index.html` 移除 `AngleSelect.js` 引用

**影响文件：**
- `frontend/components/VotePage.js`（重写）
- `frontend/js/router.js`（更新）
- `frontend/components/TopicDetail.js`（更新）
- `frontend/components/DifficultySelect.js`（更新）
- `frontend/components/DebatePage.js`（更新）
- `frontend/components/FeedbackPage.js`（更新）
- `frontend/js/api.js`（更新）
- `frontend/index.html`（移除 AngleSelect 引用）

### Phase 4: 后台管理（2-3天）

**任务：**
- [ ] 创建话题创建表单（含视频转写文本输入）
- [ ] 实现 AI 一键生成功能
- [ ] 实现辩题动态添加/删除
- [ ] 实现话题编辑功能

**影响文件：**
- `frontend/src/views/admin/TopicCreateView.vue`（新建）
- `frontend/src/views/admin/TopicEditView.vue`（新建）
- `frontend/src/api/topicApi.ts`（添加生成 API）

### Phase 5: 测试与优化（1-2天）

**任务：**
- [ ] 端到端测试用户流程
- [ ] 优化 AI prompt，提升生成质量
- [ ] 性能优化（视频播放、消息流）
- [ ] 移动端适配测试

---

## 附录

### 示例话题数据结构

```json
{
  "id": "short-video-algorithm",
  "title": "短视频算法对孩子的危害",
  "source": "新闻1+1",
  "summary": "本期节目深入探讨了短视频平台算法推荐机制对未成年人的潜在危害。调查显示，大量中小学生每天花费数小时刷短视频，导致注意力下降、学习成绩滑坡、社交能力退化。",
  "tags": ["科技", "教育", "青少年"],
  "video": {
    "url": "https://www.bilibili.com/video/BV1example",
    "duration": "25min",
    "cover": "https://example.com/cover.jpg",
    "transcript": "本期节目深入探讨了短视频平台算法推荐机制对未成年人的潜在危害..."
  },
  "debate_topics": [
    {
      "id": "dt1",
      "title": "短视频平台是否应该为青少年沉迷承担主要责任？",
      "pro_stance": "平台算法诱导沉迷，应担主责。短视频平台利用算法精准推送，让孩子沉迷其中无法自拔，平台应该为青少年沉迷承担主要责任。",
      "con_stance": "技术中性，家长监管才是关键。技术本身是中性的，算法推荐是为了优化用户体验。平台已推出青少年模式，关键在于家长是否合理使用。",
      "participant_count": 1234
    },
    {
      "id": "dt2",
      "title": "是否应该完全禁止未成年人使用短视频？",
      "pro_stance": "禁止是保护未成年人的最有效手段。完全禁止未成年人使用短视频可以从根本上避免沉迷问题，保护他们的身心健康和学习专注力。",
      "con_stance": "一刀切不现实，应培养自律能力。完全禁止不现实，短视频也有教育价值。关键是培养未成年人的自律能力和媒介素养，合理使用时间。",
      "participant_count": 987
    },
    {
      "id": "dt3",
      "title": "青少年模式能否真正解决短视频沉迷问题？",
      "pro_stance": "技术手段配合监管可以有效控制。青少年模式结合家长监管和学校教育，可以形成有效的保护机制。",
      "con_stance": "青少年模式形同虚设，技术解决不了人性问题。很多孩子轻易绕过青少年模式，技术手段无法根治沉迷问题。",
      "participant_count": 654
    }
  ],
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-20T15:30:00Z",
  "is_published": true,
  "view_count": 12500,
  "debate_count": 3200
}
```

---

**文档版本：** v2.0  
**最后更新：** 2026-01-22  
**维护者：** KnowCraft 开发团队
