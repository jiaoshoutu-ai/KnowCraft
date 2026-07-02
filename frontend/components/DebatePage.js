// 辩论对话页面组件 - 匹配桌面端原型设计
const DebatePage = {
  template: `
    <div class="debate-page">
      <!-- Desktop Sidebar -->
      <div class="sidebar">
        <div class="sidebar-logo">
          <div class="logo">
            <span>⚡</span>
            <span>KnowCraft</span>
          </div>
        </div>
        <div class="sidebar-nav">
          <div class="nav-item" @click="goHome">
            <span class="nav-item-icon">🏠</span>
            <span>首页</span>
          </div>
          <div class="nav-item" @click="goToTopicLibrary">
            <span class="nav-item-icon">📚</span>
            <span>话题库</span>
          </div>
          <div class="nav-item" @click="goToProfile">
            <span class="nav-item-icon">👤</span>
            <span>个人中心</span>
          </div>
        </div>
        <div class="sidebar-admin">
          <div class="admin-label">管理后台</div>
          <div class="nav-item" @click="goToAdmin">
            <span class="nav-item-icon">📊</span>
            <span>话题管理</span>
          </div>
        </div>
        <div class="sidebar-user">
          <div class="user-avatar">👨‍🎓</div>
          <div class="user-info">
            <div class="user-name">小明同学</div>
            <div class="user-level">Lv.3 思辨小达人</div>
          </div>
        </div>
      </div>

      <!-- Top Bar -->
      <div class="top-bar">
        <div>
          <div class="page-title">辩论进行中</div>
          <div class="page-subtitle">
            <span class="subtitle-topic-text">{{ debateTopicTitle }}</span>
            <span class="subtitle-stance-toggle" @click="showStancePopup = !showStancePopup" title="查看双方立场">👥</span>
          </div>
          <!-- Stance Popup -->
          <div v-show="showStancePopup" class="stance-popup">
            <div class="stance-popup-row pro">
              <span class="stance-popup-side">👍 正方</span>
              <span class="stance-popup-desc">{{ proStanceDesc }}</span>
              <span class="stance-popup-who">{{ userStance === 'pro' ? '👤 你' : opponentEmoji + ' ' + opponentName }}</span>
            </div>
            <div class="stance-popup-row con">
              <span class="stance-popup-side">👎 反方</span>
              <span class="stance-popup-desc">{{ conStanceDesc }}</span>
              <span class="stance-popup-who">{{ userStance === 'con' ? '👤 你' : opponentEmoji + ' ' + opponentName }}</span>
            </div>
          </div>
        </div>
        <div class="top-actions">
          <button class="btn btn-primary" @click="endDebate">
            <span>⏭️</span>
            <span>结束辩论</span>
          </button>
        </div>
      </div>

      <div class="content-container">
        <div class="debate-container">
          <!-- Main Debate Area -->
          <div class="debate-main">
            <!-- Debate Header with Round and Timer -->
            <div class="debate-header">
              <div class="debate-round">第 {{ currentRound }}/{{ totalRounds }} 轮</div>
              <div class="debate-timer">
                <span>⏱️</span>
                <span>{{ phaseNames[currentPhase] }}</span>
              </div>
            </div>

            <!-- Messages Area -->
            <div ref="messagesContainer" class="debate-messages">
              <div v-for="(msg, index) in messages" :key="index"
                   :class="['message', msg.type]">
                <div v-if="msg.type !== 'system' && msg.type !== 'scaffold'" class="message-role">
                  {{ msg.type === 'user' ? '👤 你' : opponentEmoji + ' ' + opponentName }}
                </div>
                <div class="message-bubble">
                  <div v-if="msg.type === 'scaffold'" class="scaffold-content">
                    <strong>💡 {{ msg.title }}</strong>
                    <div>{{ msg.content }}</div>
                  </div>
                  <template v-else>
                    {{ msg.content }}
                    <span v-if="msg.streaming" class="streaming-cursor">▌</span>
                  </template>
                </div>
              </div>

              <!-- AI Typing Indicator -->
              <div v-if="isTyping" class="message ai">
                <div class="message-role">{{ opponentEmoji }} {{ opponentName }}</div>
                <div class="message-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <div class="debate-input">
              <input
                v-model="userInput"
                @keydown.enter.exact.prevent="sendMessage"
                :disabled="isTyping || !ws || ws.readyState !== 1"
                type="text"
                class="input-field"
                placeholder="输入你的观点..."
              />
              <button
                @click="sendMessage"
                :disabled="!canSend"
                class="send-btn"
              >
                ➤
              </button>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="debate-sidebar">
            <!-- Quick Replies -->
            <div v-if="showQuickReplies && quickReplies.length > 0" class="sidebar-card">
              <div class="sidebar-title">💡 快速回复</div>
              <div class="hint-list">
                <div
                  v-for="(reply, index) in quickReplies"
                  :key="index"
                  class="hint-item"
                  @click="useQuickReply(reply)"
                >
                  {{ reply }}
                </div>
              </div>
            </div>

            <!-- Debate Stats -->
            <div class="sidebar-card">
              <div class="sidebar-title">📊 辩论数据</div>
              <div class="data-row">
                <span class="data-label">你的发言</span>
                <span class="data-value">{{ userMessageCount }} 次</span>
              </div>
              <div class="data-row">
                <span class="data-label">AI 发言</span>
                <span class="data-value">{{ aiMessageCount }} 次</span>
              </div>
              <div class="data-row">
                <span class="data-label">总字数</span>
                <span class="data-value">{{ totalChars }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">当前回合</span>
                <span class="data-value">{{ currentRound }}/{{ totalRounds }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topicId: '',
      debateTopicId: '',
      userStance: '',
      difficulty: '',
      ws: null,
      messages: [],
      userInput: '',
      currentRound: 1,
      totalRounds: 5,
      currentPhase: 0,
      phases: [0, 1, 2],
      phaseNames: ['开场交锋', '深入讨论', '最后冲刺'],
      isTyping: false,
      opponentEmoji: '🐟',
      opponentName: '网友·小鱼',
      showQuickReplies: true,
      quickReplies: ['我不同意，因为...', '你说得有道理，但是...', '换个角度想想...'],
      debateTopicTitle: '加载中...',
      proStanceDesc: '',
      conStanceDesc: '',
      showStancePopup: false
    }
  },

  computed: {
    canSend() {
      return this.userInput.trim() && !this.isTyping && this.ws && this.ws.readyState === WebSocket.OPEN
    },
    userMessageCount() {
      return this.messages.filter(m => m.type === 'user').length
    },
    aiMessageCount() {
      return this.messages.filter(m => m.type === 'ai').length
    },
    totalChars() {
      return this.messages.reduce((sum, m) => sum + (m.content?.length || 0), 0)
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId
    this.debateTopicId = this.$route.params.debateTopicId
    this.userStance = this.$route.params.userStance
    this.difficulty = this.$route.params.difficulty

    this.connectWebSocket()
  },

  beforeUnmount() {
    if (this.ws) {
      this.ws.close()
    }
  },

  methods: {
    connectWebSocket() {
      const wsUrl = `${CONFIG.WS_BASE}/ws/debate`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket 连接成功')
        this.startDebate()
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error)
        this.messages.push({
          type: 'system',
          content: '⚠️ 连接失败，请检查网络后重试'
        })
      }

      this.ws.onclose = () => {
        console.log('WebSocket 连接关闭')
      }
    },

    startDebate() {
      const message = {
        type: 'start',
        topic_id: this.topicId,
        debate_topic_id: this.debateTopicId,
        user_stance: this.userStance,
        difficulty: this.difficulty
      }
      this.ws.send(JSON.stringify(message))
    },

    handleMessage(data) {
      if (data.type === 'ai_message') {
        this.isTyping = false
        const msgData = data.data || {}

        if (msgData.is_streaming) {
          const lastMsg = this.messages[this.messages.length - 1]
          if (lastMsg && lastMsg.type === 'ai' && lastMsg.streaming) {
            lastMsg.content += msgData.content
          } else {
            this.messages.push({
              type: 'ai',
              content: msgData.content,
              streaming: true,
              avatar: this.opponentAvatar,
              role: this.opponentRole
            })
          }
        } else {
          const lastMsg = this.messages[this.messages.length - 1]
          if (lastMsg && lastMsg.type === 'ai' && lastMsg.streaming) {
            lastMsg.content = msgData.content
            lastMsg.streaming = false
          } else {
            this.messages.push({
              type: 'ai',
              content: msgData.content,
              streaming: false,
              avatar: this.opponentAvatar,
              role: this.opponentRole
            })
          }
        }
        this.scrollToBottom()
      } else if (data.type === 'system') {
        const sysData = data.data || {}
        const event = sysData.event

        if (event === 'session_created') {
          this.totalRounds = sysData.max_rounds || 5
          this.debateTopicTitle = sysData.debate_topic_title || '辩论进行中'
          this.proStanceDesc = sysData.pro_stance_desc || ''
          this.conStanceDesc = sysData.con_stance_desc || ''
          if (sysData.opponent_emoji) this.opponentEmoji = sysData.opponent_emoji
          if (sysData.opponent_name) this.opponentName = sysData.opponent_name
          this.messages.push({
            type: 'system',
            content: `开始讨论！你站${this.userStance === 'pro' ? '正方' : '反方'}`
          })
        } else if (event === 'round_start') {
          this.currentRound = sysData.round
          this.currentPhase = Math.min(this.currentRound - 1, this.phases.length - 1)
          this.messages.push({
            type: 'system',
            content: `第 ${this.currentRound} 轮开始`
          })
        } else if (event === 'debate_ended') {
          this.messages.push({
            type: 'system',
            content: '辩论结束，正在生成评价...'
          })
        }
        this.scrollToBottom()
      } else if (data.type === 'scaffold') {
        this.messages.push({
          type: 'scaffold',
          title: data.title,
          content: data.content
        })
        this.scrollToBottom()
      } else if (data.type === 'error') {
        this.messages.push({
          type: 'system',
          content: '⚠️ ' + (data.data?.message || '未知错误')
        })
        this.scrollToBottom()
      }
    },

    sendMessage() {
      if (!this.canSend) return

      const content = this.userInput.trim()
      this.userInput = ''

      this.messages.push({
        type: 'user',
        content: content
      })

      const message = {
        type: 'user_message',
        content: content
      }
      this.ws.send(JSON.stringify(message))

      this.isTyping = true
      this.scrollToBottom()
    },

    useQuickReply(reply) {
      this.userInput = reply
      this.sendMessage()
    },

    endDebate() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'end' }))
      }
      this.$router.push(`/feedback/${this.topicId}/${this.debateTopicId}/${this.userStance}/${this.difficulty}`)
    },

    goBack() {
      if (confirm('确定要退出辩论吗？进度将不会保存。')) {
        this.$router.push(`/vote/${this.topicId}`)
      }
    },

    goHome() {
      this.$router.push('/')
    },

    goToTopicLibrary() {
      this.$router.push('/topics')
    },

    goToProfile() {
      this.$router.push('/profile')
    },

    goToAdmin() {
      this.$router.push('/admin')
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  }
}
