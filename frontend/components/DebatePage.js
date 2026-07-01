// 辩论对话页面组件
const DebatePage = {
  template: `
    <div class="phone-frame">
      <div class="screen-container">
        <!-- 状态栏 -->
        <div class="status-bar">
          <span class="time">9:41</span>
          <div class="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <!-- 导航栏 -->
        <div class="nav-bar">
          <div class="nav-back" @click="goBack">←</div>
          <div class="nav-title">辩论进行中</div>
          <div style="background: var(--primary-bg); color: var(--primary); padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
            第 {{ currentRound }}/{{ totalRounds }} 轮
          </div>
        </div>

        <!-- 辩论阶段指示器 -->
        <div style="background: var(--card); padding: 12px 20px; border-bottom: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div v-for="(phase, index) in phases" :key="index" style="flex: 1;">
              <div :style="{
                height: '4px',
                borderRadius: '2px',
                background: index <= currentPhase ? 'var(--primary)' : 'var(--border)',
                transition: 'background 0.3s'
              }"></div>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); text-align: center;">
            {{ phaseNames[currentPhase] }}
          </div>
        </div>

        <!-- 消息区域 -->
        <div ref="messagesContainer"
             style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 400px; max-height: 500px;">

          <div v-for="(msg, index) in messages" :key="index">
            <!-- 系统消息 -->
            <div v-if="msg.type === 'system'" class="msg-system">
              {{ msg.content }}
            </div>

            <!-- AI 消息 -->
            <div v-else-if="msg.type === 'ai'" style="display: flex; gap: 10px;">
              <div style="width: 36px; height: 36px; background: var(--primary-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                {{ msg.avatar }}
              </div>
              <div class="msg msg-ai">
                <div class="msg-role">{{ msg.role }}</div>
                <div>{{ msg.content }}<span v-if="msg.streaming" class="streaming-cursor">▌</span></div>
              </div>
            </div>

            <!-- 用户消息 -->
            <div v-else-if="msg.type === 'user'" style="display: flex; justify-content: flex-end;">
              <div class="msg msg-user">
                <div class="msg-role">你</div>
                <div>{{ msg.content }}</div>
              </div>
            </div>

            <!-- 脚手架提示 -->
            <div v-else-if="msg.type === 'scaffold'" class="scaffold-hint">
              <div class="hint-title">💡 {{ msg.title }}</div>
              <div>{{ msg.content }}</div>
            </div>
          </div>

          <!-- AI 正在输入指示器 -->
          <div v-if="isTyping" style="display: flex; gap: 10px;">
            <div style="width: 36px; height: 36px; background: var(--primary-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              {{ opponentAvatar }}
            </div>
            <div class="msg msg-ai">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速回复 -->
        <div v-if="showQuickReplies" class="quick-replies">
          <div v-for="(reply, index) in quickReplies" :key="index"
               class="quick-reply"
               @click="useQuickReply(reply)">
            {{ reply }}
          </div>
        </div>

        <!-- 输入区域 -->
        <div style="background: var(--card); padding: 12px 16px; border-top: 1px solid var(--border);">
          <div style="display: flex; gap: 8px;">
            <textarea
              v-model="userInput"
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="!canSend"
              placeholder="输入你的观点..."
              rows="2"
              style="flex: 1; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; resize: none; font-family: inherit;">
            </textarea>
            <button @click="sendMessage"
                    :disabled="!canSend"
                    :style="{
                      background: canSend ? 'var(--primary)' : 'var(--border)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: canSend ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }">
              发送
            </button>
          </div>
          <div style="text-align: center; margin-top: 8px;">
            <button @click="endDebate"
                    style="background: none; border: none; color: var(--text-light); font-size: 13px; cursor: pointer;">
              结束辩论
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topicId: '',
      stanceIndex: 0,
      angleIndex: 0,
      difficultyIndex: 0,
      ws: null,
      messages: [],
      userInput: '',
      currentRound: 1,
      totalRounds: 5,
      currentPhase: 0,
      phases: [0, 1, 2],
      phaseNames: ['开场陈述', '质询交锋', '总结陈词'],
      isTyping: false,
      opponentAvatar: '🤖',
      opponentRole: 'AI 对手',
      showQuickReplies: true,
      quickReplies: ['我不同意，因为...', '你说得有道理，但是...', '让我们换个角度看...']
    }
  },

  computed: {
    canSend() {
      return this.userInput.trim() && !this.isTyping && this.ws && this.ws.readyState === WebSocket.OPEN
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId
    this.stanceIndex = parseInt(this.$route.params.stanceIndex)
    this.angleIndex = parseInt(this.$route.params.angleIndex)
    this.difficultyIndex = parseInt(this.$route.params.difficultyIndex)

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
        stance_index: this.stanceIndex,
        angle_index: this.angleIndex,
        difficulty_index: this.difficultyIndex
      }
      this.ws.send(JSON.stringify(message))
    },

    handleMessage(data) {
      if (data.type === 'ai_message') {
        this.isTyping = false
        if (data.streaming) {
          const lastMsg = this.messages[this.messages.length - 1]
          if (lastMsg && lastMsg.type === 'ai' && lastMsg.streaming) {
            lastMsg.content += data.content
          } else {
            this.messages.push({
              type: 'ai',
              content: data.content,
              streaming: true,
              avatar: this.opponentAvatar,
              role: this.opponentRole
            })
          }
        } else {
          const lastMsg = this.messages[this.messages.length - 1]
          if (lastMsg && lastMsg.type === 'ai' && lastMsg.streaming) {
            lastMsg.content = data.content
            lastMsg.streaming = false
          } else {
            this.messages.push({
              type: 'ai',
              content: data.content,
              streaming: false,
              avatar: this.opponentAvatar,
              role: this.opponentRole
            })
          }
        }
        this.scrollToBottom()
      } else if (data.type === 'system') {
        this.messages.push({
          type: 'system',
          content: data.content
        })
        if (data.round) {
          this.currentRound = data.round
        }
        if (data.phase !== undefined) {
          this.currentPhase = data.phase
        }
        this.scrollToBottom()
      } else if (data.type === 'scaffold') {
        this.messages.push({
          type: 'scaffold',
          title: data.title,
          content: data.content
        })
        this.scrollToBottom()
      } else if (data.type === 'end') {
        this.endDebate()
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
      this.$router.push(`/feedback/${this.topicId}/${this.stanceIndex}/${this.angleIndex}/${this.difficultyIndex}`)
    },

    goBack() {
      if (confirm('确定要退出辩论吗？进度将不会保存。')) {
        this.$router.push(`/difficulty/${this.topicId}/${this.stanceIndex}/${this.angleIndex}`)
      }
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
