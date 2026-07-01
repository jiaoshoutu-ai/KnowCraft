# HappyLearning 前端

思辨能力学习平台前端，面向初中学生的辩论学习工具。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架（CDN 版本，无需构建）
- **Vue Router 4** - 单页应用路由（Hash 模式，兼容 GitHub Pages）
- **Tailwind CSS** - 实用优先的 CSS 框架（CDN 版本）
- **原生 JavaScript** - 无 TypeScript，无构建步骤

## 功能特性

### 1. 话题浏览
- 查看话题列表，显示标题、来源、标签和观点数量
- 响应式卡片布局，移动端友好

### 2. 话题详情
- 嵌入式视频播放器（支持 Bilibili、YouTube）
- 话题摘要和关键争议点展示
- 选择辩论对手（不同观点立场）

### 3. 实时辩论
- WebSocket 实时通信
- AI 流式回复（逐字显示）
- 回合制辩论（默认 5 轮）
- 聊天界面，用户和 AI 消息气泡
- 实时连接状态显示

### 4. 评价报告
- 五维度评分（逻辑性、证据力、表达力、反驳能力、多角度思考）
- 进度条可视化
- 优点和改进建议
- 总结评语

## 项目结构

```
frontend/
├── index.html              # 主入口 HTML
├── config.js               # API 配置（后端地址）
├── css/
│   └── style.css           # 自定义样式和动画
├── js/
│   ├── app.js              # Vue 应用初始化
│   ├── router.js           # Vue Router 配置
│   └── api.js              # API 封装（REST + WebSocket）
└── components/
    ├── HomePage.js         # 首页组件
    ├── TopicPage.js        # 话题详情组件
    ├── DebatePage.js       # 辩论页组件
    └── EvaluationPage.js   # 评价页组件
```

## 本地开发

### 1. 启动后端
```bash
cd backend
python run.py
```
后端运行在 `http://localhost:8000`

### 2. 配置前端
编辑 `config.js`：
```javascript
const CONFIG = {
  API_BASE: 'http://localhost:8000',
  WS_BASE: 'ws://localhost:8000'
};
```

### 3. 启动前端
使用任意静态服务器：

**Python 3:**
```bash
cd frontend
python -m http.server 8080
```

**Node.js (http-server):**
```bash
npx http-server frontend -p 8080
```

**VS Code:**
安装 Live Server 插件，右键 `index.html` → Open with Live Server

### 4. 访问
打开浏览器访问 `http://localhost:8080`

## 部署到 GitHub Pages

### 1. 推送到 GitHub
```bash
git add frontend/
git commit -m "Add frontend implementation"
git push origin main
```

### 2. 启用 GitHub Pages
1. 进入 GitHub 仓库 → Settings
2. 左侧菜单 → Pages
3. Source → Deploy from a branch
4. Branch → `main` / `root`
5. Save

### 3. 配置生产环境 API
编辑 `config.js`：
```javascript
const CONFIG = {
  API_BASE: 'http://YOUR_SERVER_IP',
  WS_BASE: 'ws://YOUR_SERVER_IP'
};
```

提交并推送：
```bash
git add config.js
git commit -m "Configure production API"
git push origin main
```

### 4. 访问
等待 1-2 分钟，访问 `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## API 对接

### REST API

**获取话题列表**
```javascript
GET /api/topics
Response: [{ id, title, source, cover, perspective_count, tags }]
```

**获取话题详情**
```javascript
GET /api/topics/:id
Response: { id, title, source, video, summary, key_points, perspectives }
```

### WebSocket API

**连接地址**
```
ws://YOUR_HOST/ws/debate
```

**消息协议**

客户端 → 服务端：
```javascript
// 开始辩论
{ type: "start", topic_id: "xxx", perspective_id: "xxx" }

// 发送消息
{ type: "user_message", content: "用户发言内容" }

// 结束辩论
{ type: "end" }
```

服务端 → 客户端：
```javascript
// 系统消息
{ type: "system", session_id: "xxx", data: { event: "session_created", max_rounds: 5 } }
{ type: "system", session_id: "xxx", data: { event: "round_start", round: 1 } }

// AI 流式消息
{ type: "ai_message", session_id: "xxx", data: { content: "片段", is_streaming: true, speaker: "", avatar: "" } }
{ type: "ai_message", session_id: "xxx", data: { content: "完整消息", is_streaming: false, speaker: "平台代表", avatar: "🏢" } }

// 评价报告
{ type: "evaluation", session_id: "xxx", data: { scores: {...}, total_score: 42, strengths: [...], improvements: [...], summary: "..." } }
```

## 用户流程

```
首页（话题列表）
  ↓ 点击话题卡片
话题详情页
  ↓ 选择辩论对手
辩论页
  ↓ AI 开场白 → 用户回复 → AI 反驳（循环 5 轮）
  ↓ 点击"结束辩论"
评价页
  ↓ 点击"返回首页"
首页
```

## 样式定制

### 主题颜色
在 `css/style.css` 中修改：
- 主色：`indigo-600`
- 背景：`blue-50` to `indigo-100`
- 用户消息：`indigo-500`
- AI 消息：`white`

### 动画
- `.streaming-cursor` - AI 流式回复光标
- `.loading-spinner` - 加载动画
- `.message-fade-enter` - 消息淡入
- `.topic-card:hover` - 卡片悬停效果

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- 移动端 Safari (iOS 14+)
- Chrome Android

## 性能优化建议

1. **图片懒加载** - 为话题封面添加 `loading="lazy"`
2. **视频延迟加载** - 仅在用户点击播放时加载 iframe
3. **消息虚拟化** - 辩论消息过多时使用虚拟滚动
4. **Service Worker** - 添加离线缓存（可选）

## 已知限制

1. **GitHub Pages HTTPS** - 如果后端只有 HTTP，浏览器会阻止混合内容
   - 解决方案：后端启用 HTTPS（Let's Encrypt）
   
2. **WebSocket 重连** - 当前未实现自动重连
   - 改进：添加指数退避重连逻辑

3. **本地存储** - 评价数据仅保存在 localStorage
   - 改进：后端持久化辩论历史

## 后续功能（二期）

- [ ] 模拟法庭模式（多角色辩论）
- [ ] 用户登录和进度追踪
- [ ] 辩论历史记录查看
- [ ] 话题搜索和筛选
- [ ] 分享辩论评价到社交媒体
- [ ] PWA 支持（离线使用）

## 故障排查

### WebSocket 连接失败
- 检查后端是否运行
- 检查防火墙是否开放 8000 端口
- 检查 `config.js` 中的 WS_BASE 地址
- 浏览器控制台查看 WebSocket 错误

### API 请求失败
- 检查后端 CORS 配置（`config.py` 中 `cors_origins`）
- 如果前端是 HTTPS，后端也必须是 HTTPS
- 检查浏览器网络请求详情

### 页面空白
- 检查浏览器控制台错误
- 确认 Vue CDN 加载成功
- 检查路由配置是否正确

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
