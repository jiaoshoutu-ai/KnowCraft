# KnowCraft 项目实施总结

## 项目概述

KnowCraft 是一个面向中学生的思辨能力训练平台，通过新闻视频和 AI 辩论提升批判性思维能力。

**核心功能：**
- 观看新闻短视频（来自官媒：新闻1+1、焦点访谈等）
- 选择辩题并选择正方/反方立场
- 与 AI 进行辩论
- 获得多维度评价和改进建议

**技术栈：**
- 前端：Vue 3 (CDN) + Vue Router (CDN) + 原生 CSS
- 后端：FastAPI + SQLAlchemy + SQLite (aiosqlite)
- AI：通义千问 API（内容生成、辩论对手、评价）

---

## 实施阶段总结

### Phase 1: 数据模型迁移 ✅ 完成

**目标：** 从"视角/角色"模型迁移到"辩题 + 正反方立场"模型

**完成内容：**
1. 更新 `Topic` 数据模型
   - 移除 `perspectives`（视角列表）
   - 新增 `debate_topics`（辩题列表）
   
2. 创建 `DebateTopic` 模型
   - `title`: 辩题标题
   - `pro_stance`: 正方立场描述
   - `con_stance`: 反方立场描述
   - `participant_count`: 参与人数

3. 更新 `DebateSession` 模型
   - 新增 `debate_topic_id`（选择的辩题 ID）
   - 新增 `user_stance` 和 `ai_stance`（明确正反方）
   - 评价维度：`perspective` → `critical_thinking`

**影响文件：**
- `backend/models/topic.py`
- `backend/models/debate.py`
- `backend/data/topics/short-video-algorithm.json`

**关键决策：**
- 使用 SQLite 作为数据库（轻量级、零配置）
- SQLAlchemy ORM 管理模型和查询
- aiosqlite 提供异步支持

---

### Phase 2: 后端 API 更新 ✅ 完成

**目标：** 更新 API 以支持新的辩题模型

**完成内容：**

#### 话题 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/topics` | GET | 获取话题列表（支持 `include_unpublished` 参数） |
| `/api/topics/:id` | GET | 获取话题详情（含视频和辩题） |
| `/api/topics` | POST | 创建话题（管理员） |
| `/api/topics/:id` | PUT | 更新话题（管理员） |
| `/api/topics/:id` | DELETE | 删除话题（管理员） |
| `/api/topics/generate` | POST | AI 从视频转写文本生成辩题 |

#### 辩论 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/debate/start` | POST | 开始辩论会话 |
| `/api/debate/message` | POST | 发送用户消息，获取 AI 回复 |
| `/api/debate/evaluate` | POST | 结束辩论，获取评价 |
| `/ws/debate` | WebSocket | 实时辩论会话 |

#### AI 内容生成
- **功能：** 从视频转写文本自动生成辩题
- **实现：** `POST /api/topics/generate`
- **Prompt：** 分析转写文本，提取争议焦点，生成 2-3 个辩题及正反方立场

**影响文件：**
- `backend/api/topics.py`
- `backend/api/debate.py`
- `backend/core/content_generation.py`
- `backend/prompts/debate.py`
- `backend/prompts/evaluation.py`

---

### Phase 3: 前端选择辩题页面 ✅ 完成

**目标：** 实现"选择辩题"交互流程

**完成内容：**

#### VotePage.js（完全重写）
**交互流程：**
1. 展示 3 个辩题卡片（标题 + 参与人数）
2. 用户点击辩题卡片 → 卡片展开，显示正方/反方立场选择
3. 用户选择立场（蓝色正方 / 红色反方）
4. 点击"确认并继续" → 进入难度选择

**视觉设计（严格匹配原型）：**
- 辩题卡片：圆角 16px、阴影、选中时边框高亮
- 立场卡片：始终显示蓝/红色背景（未选中时不灰显）
- 立场区域：分隔线 2px、"选择你的立场"标题
- 确认按钮：禁用状态、渐变背景

#### 路由更新
```javascript
/vote/:topicId
/difficulty/:topicId/:debateTopicId/:userStance
/debate/:topicId/:debateTopicId/:userStance/:difficulty
/feedback/:topicId/:debateTopicId/:userStance/:difficulty
```

#### 其他组件更新
- **TopicDetail.js**: 显示辩题列表预览
- **DifficultySelect.js**: 接收新路由参数
- **DebatePage.js**: WebSocket 消息格式更新
- **FeedbackPage.js**: 评分维度更新
- **api.js**: 新增 `generateDebateTopics()` 方法

**影响文件：**
- `frontend/components/VotePage.js`（重写）
- `frontend/components/TopicDetail.js`（更新）
- `frontend/components/DifficultySelect.js`（更新）
- `frontend/components/DebatePage.js`（更新）
- `frontend/components/FeedbackPage.js`（更新）
- `frontend/js/router.js`（更新）
- `frontend/js/api.js`（更新）
- `frontend/css/style.css`（新增 VotePage 样式）

**清理工作：**
- 删除 `AngleSelect.js`（已废弃）
- 从 `index.html` 移除引用

---

### Phase 4: 后台话题管理页面 ✅ 完成

**目标：** 实现管理员话题管理功能

**完成内容：**

#### AdminLayout.js
**布局：**
- 侧边栏导航（数据概览、话题管理、用户管理、系统设置）
- 顶部标题栏
- 主内容区

#### AdminTopicList.js
**功能：**
- 话题列表（表格视图）
- 统计卡片（已发布、草稿、总辩论次数）
- 操作按钮（编辑、发布/下线、删除）
- 状态徽章（已发布/草稿）

#### AdminTopicForm.js
**功能：**
1. **基本信息**
   - 话题标题、内容来源、话题简介
   - 分类标签（动态添加/删除）

2. **视频信息**
   - 视频链接、时长、封面图
   - 视频转写文本（大文本框）

3. **AI 一键生成**
   - 按钮：`🤖 AI 一键生成`
   - 自动生成话题简介
   - 自动生成辩题列表（2-3 个）
   - 自动生成正反方立场

4. **辩题配置**
   - 动态添加/删除辩题
   - 每个辩题：标题、正方立场、反方立场
   - 预填 2 个示例辩题

5. **操作按钮**
   - 保存草稿
   - 发布话题

**影响文件：**
- `frontend/components/admin/AdminLayout.js`（新建）
- `frontend/components/admin/AdminTopicList.js`（新建）
- `frontend/components/admin/AdminTopicForm.js`（新建）
- `frontend/css/style.css`（新增管理后台样式）

---

### Phase 5: 测试与优化 ✅ 完成

**目标：** 确保视觉原型一致性和功能完整性

**完成内容：**

#### 视觉一致性修复
1. **ProfilePage 能力维度**
   - ❌ 问题：显示"多角度"
   - ✅ 修复：改为"批判性思维"

2. **ProfilePage 辩论历史**
   - ❌ 问题：显示"家长代表/学生代表"
   - ✅ 修复：显示"正方/反方"

3. **HomePage 话题卡片**
   - ❌ 问题：使用 inline style，hover 效果不完整
   - ✅ 修复：移至 CSS 类，添加完整 hover 动画

#### 代码清理
- 删除 `AngleSelect.js`（已废弃组件）

#### API 测试
- ✅ GET /api/topics - 获取列表
- ✅ GET /api/topics/:id - 获取详情
- ✅ POST /api/topics - 创建话题
- ✅ PUT /api/topics/:id - 更新话题
- ✅ DELETE /api/topics/:id - 删除话题
- ✅ POST /api/topics/generate - AI 生成辩题
- ✅ WebSocket /ws/debate - 辩论会话

#### 浏览器兼容性测试
- ✅ Chrome 120+
- ✅ Safari 17+
- ✅ Firefox 121+

---

## 项目统计

### 代码行数
```
前端组件：~1,900 行
前端样式：~2,000 行
前端脚本：~150 行
后端代码：~2,500 行（估算）
总计：~6,550 行
```

### 文件结构
```
frontend/
├── components/
│   ├── HomePage.js
│   ├── TopicDetail.js
│   ├── VotePage.js
│   ├── DifficultySelect.js
│   ├── DebatePage.js
│   ├── FeedbackPage.js
│   ├── ProfilePage.js
│   └── admin/
│       ├── AdminLayout.js
│       ├── AdminTopicList.js
│       └── AdminTopicForm.js
├── js/
│   ├── api.js
│   ├── app.js
│   └── router.js
├── css/
│   └── style.css
└── index.html

backend/
├── api/
│   ├── topics.py
│   ├── debate.py
│   └── websocket.py
├── models/
│   ├── topic.py
│   ├── debate.py
│   └── db_models.py
├── core/
│   ├── content_generation.py
│   ├── llm_adapter.py
│   └── qwen_adapter.py
├── prompts/
│   ├── debate.py
│   └── evaluation.py
├── database.py
├── config.py
└── main.py
```

---

## 关键设计决策

### 1. 数据模型：辩题 vs 视角
**决策：** 使用"辩题 + 正反方立场"替代"视角/角色"

**原因：**
- 真正的辩论需要围绕具体辩题展开
- 正反方立场更清晰，便于 AI 生成对立观点
- 更符合辩论赛的实际形式

### 2. 数据库：SQLite
**决策：** 使用 SQLite 作为数据库

**原因：**
- 轻量级、零配置
- 适合 MVP 阶段
- 易于部署和维护
- 后续可迁移到 PostgreSQL/MySQL

### 3. 前端：Vue 3 CDN
**决策：** 使用 Vue 3 CDN 而非构建工具

**原因：**
- 快速原型开发
- 无需复杂的构建流程
- 易于调试和修改
- 后续可迁移到 Vite + TypeScript

### 4. AI 内容生成
**决策：** 从视频转写文本自动生成辩题

**原因：**
- 减少管理员工作量
- 保证辩题质量（基于真实内容）
- 快速扩展话题库
- 人工可编辑生成的内容

---

## 用户流程

### 学生用户流程
```
1. 首页 (/)
   └─> 浏览推荐话题
   └─> 点击话题卡片

2. 话题详情 (/topic/:id)
   └─> 观看视频
   └─> 阅读话题摘要
   └─> 点击"开始辩论"

3. 选择辩题 (/vote/:topicId)
   └─> 浏览 3 个辩题
   └─> 选择一个辩题
   └─> 选择正方或反方立场
   └─> 点击"确认并继续"

4. 选择难度 (/difficulty/:topicId/:debateTopicId/:userStance)
   └─> 新手友好 / 进阶挑战 / 高手对决
   └─> 点击"开始辩论"

5. 辩论 (/debate/:topicId/:debateTopicId/:userStance/:difficulty)
   └─> 与 AI 进行 5 轮辩论
   └─> 实时消息流
   └─> 点击"结束辩论"

6. 反馈 (/feedback/:topicId/:debateTopicId/:userStance/:difficulty)
   └─> 查看总分（满分 50 分）
   └─> 五维度评分（逻辑性、证据力、表达力、反驳力、批判性思维）
   └─> 查看亮点和改进建议
   └─> 点击"返回首页"
```

### 管理员流程
```
1. 后台首页 (/admin)
   └─> 查看系统统计（话题数、用户数、辩论次数）

2. 话题管理 (/admin/topics)
   └─> 查看话题列表
   └─> 发布/下线话题
   └─> 删除话题

3. 创建话题 (/admin/topics/create)
   └─> 填写基本信息
   └─> 输入视频转写文本
   └─> 点击"AI 一键生成"
   └─> 编辑生成的辩题
   └─> 保存草稿或发布

4. 编辑话题 (/admin/topics/edit/:id)
   └─> 更新话题信息
   └─> 保存更新
```

---

## 待优化项

### 低优先级
- [ ] 移动端手势支持（滑动返回）
- [ ] 语音输入功能（原型中有，未实现）
- [ ] 话题库筛选功能
- [ ] 用户登录/注册页面
- [ ] 辩论历史记录页面
- [ ] 用户管理页面
- [ ] 系统设置页面

### 中等优先级
- [ ] 错误边界处理
- [ ] 加载状态优化
- [ ] 空状态提示
- [ ] 表单验证增强
- [ ] 图片懒加载
- [ ] 代码分割（按需加载）

### 技术债务
- [ ] TypeScript 支持
- [ ] 单元测试
- [ ] E2E 测试
- [ ] API 文档（Swagger/OpenAPI）
- [ ] 数据库索引优化
- [ ] 缓存机制（Redis）

---

## 部署说明

### 后端部署
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install -r requirements.txt
python main.py
```

**访问地址：** http://localhost:8000

### 前端部署
```bash
cd frontend
python3 -m http.server 3000
```

**访问地址：** http://localhost:3000

### 环境变量
```bash
# backend/.env
DASHSCOPE_API_KEY=your_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./data/knowcraft.db
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=["http://localhost:3000"]
```

---

## 总结

KnowCraft 项目已成功完成 5 个阶段的开发：

1. ✅ **数据模型迁移** - 从"视角"到"辩题+立场"
2. ✅ **后端 API 更新** - 完整的话题管理和辩论 API
3. ✅ **前端选择辩题页面** - 严格匹配原型的交互设计
4. ✅ **后台话题管理** - AI 辅助的内容生成
5. ✅ **测试与优化** - 视觉一致性和功能完整性验证

**项目亮点：**
- 严格遵循原型设计，视觉一致性高
- AI 辅助内容生成，提高运营效率
- 清晰的代码结构，易于维护
- 完整的端到端用户流程

**下一步：**
- 用户测试和反馈收集
- 性能优化和扩展功能
- 移动端适配和手势支持
- 用户认证和个性化推荐

---

**项目完成时间：** 2026-07-02  
**开发人员：** Claude AI Assistant  
**项目状态：** MVP 版本完成，可投入使用
