// Debate page component - matches mobile prototype design
const DebatePage = {
  template: `
    <div class="debate-page">
        <DesktopSidebar active-tab="debates"></DesktopSidebar>
        <!-- Status Bar (mobile only) -->
        <div class="status-bar">
          <span class="time">9:41</span>
          <div class="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <!-- Nav Bar (mobile only) -->
        <div class="nav-bar">
          <div class="nav-back" @click="goBack">←</div>
          <div class="nav-title">
            <span>辩论进行中</span>
            <span class="nav-title-subtitle">{{ debateTopicTitle }}</span>
          </div>
          <span class="nav-stance-toggle" @click="showStancePopup = !showStancePopup" title="查看双方立场">👥</span>
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

        <!-- iPad Top Nav (iPad only) -->
        <div class="ipad-top-nav">
          <div class="logo">
            <span>⚡</span>
            <span>KnowCraft</span>
          </div>
          <div class="nav-tabs">
            <div class="nav-tab" @click="endDebate">
              <span>⏭️</span>
              <span>结束辩论</span>
            </div>
          </div>
          <div class="user-info">
            <div class="streak-badge">
              <span>🔥</span>
              <span>{{ user.streak_days }}天</span>
            </div>
            <div class="user-avatar">{{ user.avatar || '👤' }}</div>
          </div>
        </div>

        <!-- Debate Container -->
        <div class="debate-container">
          <!-- Debate Header -->
          <div class="debate-header">
            <div class="debate-round">第 {{ currentRound }}/{{ totalRounds }} 轮</div>
            <div class="debate-header-actions">
              <div class="debate-timer">⏱️ {{ timerDisplay }}</div>
              <button class="debate-end-btn" type="button" :disabled="isEndingDebate" @click="endDebate">
                {{ isEndingDebate ? '生成评价中...' : '结束辩论' }}
              </button>
            </div>
          </div>

          <!-- Debate Topic Bar (iPad only) -->
          <div class="debate-topic-bar">
            <span>📋 {{ debateTopicTitle }}</span>
            <span class="nav-stance-toggle" @click="showStancePopup = !showStancePopup" title="查看双方立场">👥</span>
            <div v-show="showStancePopup" class="stance-popup" style="top: 100%; right: 0;">
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
            <button class="input-mode-toggle" @click="toggleInputMode">
              <span class="mode-icon">{{ isVoiceMode ? '⌨️' : '🎤' }}</span>
            </button>
            <div class="text-input-mode" :class="{ hidden: isVoiceMode }">
              <input
                v-model="userInput"
                @keydown.enter.exact.prevent="sendMessage"
                :disabled="isTyping"
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
            <div class="voice-input-mode" :class="{ active: isVoiceMode }">
              <button
                class="voice-btn"
                :class="{ recording: isRecording }"
                @mousedown="startRecording"
                @mouseup="stopRecording"
                @touchstart="startRecording"
                @touchend="stopRecording"
              >
                <span>🎤</span>
                <span>{{ isRecording ? '松开结束录音' : '按住说话' }}</span>
              </button>
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
      user: API.getUserInfo() || { avatar: '', streak_days: 0 },
      lastSessionId: null,
      lastEvaluation: null,
      isEndingDebate: false,
      shouldNavigateAfterEvaluation: false,
      messages: [
        {
          type: 'ai',
          content: '作为平台代表，我想说的是，我们的算法推荐机制本质上是中性的技术工具。它根据用户的兴趣偏好推荐内容，这是为了提升用户体验。如果青少年沉迷其中，更多是因为缺乏自律能力，而不是算法本身的问题。你认为呢？'
        }
      ],
      userInput: '',
      currentRound: 1,
      totalRounds: 5,
      isTyping: false,
      opponentEmoji: '🐟',
      opponentName: '网友·小鱼',
      debateTopicTitle: '短视频平台是否应该为青少年沉迷承担主要责任？',
      proStanceDesc: '平台算法诱导沉迷，应担主责',
      conStanceDesc: '技术中性，家长监管才是关键',
      showStancePopup: false,
      isVoiceMode: false,
      isRecording: false,
      timerSeconds: 150,
      timerInterval: null
    }
  },

  computed: {
    canSend() {
      return this.userInput.trim() && !this.isTyping && this.ws && this.ws.readyState === WebSocket.OPEN
    },
    timerDisplay() {
      const minutes = Math.floor(this.timerSeconds / 60)
      const seconds = this.timerSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId
    this.debateTopicId = this.$route.params.debateTopicId
    this.userStance = this.$route.params.userStance
    this.difficulty = this.$route.params.difficulty

    this.connectWebSocket()
    this.startTimer()
  },

  beforeUnmount() {
    if (this.ws) {
      this.ws.close()
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  },

  methods: {
    connectWebSocket() {
      this.ws = API.createWebSocketConnection()

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.startDebate()
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      }

      this.ws.onerror = (error) => {
        console.log('WebSocket connection failed, using demo mode')
      }

      this.ws.onclose = () => {
        console.log('WebSocket connection closed')
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

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--
        }
      }, 1000)
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
              streaming: true
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
              streaming: false
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
            content: `开始讨论！您站${this.userStance === 'pro' ? '正方' : '反方'}`
          })
          this.timerSeconds = 150
        } else if (event === 'round_start') {
          this.currentRound = sysData.round
          this.timerSeconds = 150
          this.messages.push({
            type: 'system',
            content: `第 ${this.currentRound} 轮开始`
          })
        } else if (event === 'debate_ended') {
          this.isEndingDebate = true
          this.shouldNavigateAfterEvaluation = true
          if (!this.messages.some(message => message.type === 'system' && message.content === '辩论结束，正在生成评价...')) {
            this.messages.push({
              type: 'system',
              content: '辩论结束，正在生成评价...'
            })
          }
        }
        this.scrollToBottom()
      } else if (data.type === 'scaffold') {
        this.messages.push({
          type: 'scaffold',
          title: data.title,
          content: data.content
        })
        this.scrollToBottom()
      } else if (data.type === 'evaluation') {
        // Persist the evaluation + session_id for FeedbackPage
        this.lastSessionId = data.session_id || null;
        this.lastEvaluation = data.data || null;
        this.isEndingDebate = false;
        if (this.shouldNavigateAfterEvaluation) {
          this.navigateToFeedback();
        }
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

    toggleInputMode() {
      this.isVoiceMode = !this.isVoiceMode
    },

    startRecording() {
      this.isRecording = true
    },

    stopRecording() {
      this.isRecording = false
    },

    endDebate() {
      if (this.isEndingDebate) return

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.isEndingDebate = true
        this.shouldNavigateAfterEvaluation = true
        this.messages.push({
          type: 'system',
          content: '辩论结束，正在生成评价...'
        })
        this.ws.send(JSON.stringify({ type: 'end' }))
        this.scrollToBottom()
        return
      }

      this.navigateToFeedback()
    },

    navigateToFeedback() {
      const query = {};
      if (this.lastSessionId) query.sessionId = this.lastSessionId;
      this.$router.push({
        path: `/feedback/${this.topicId}/${this.debateTopicId}/${this.userStance}/${this.difficulty}`,
        query,
      })
    },

    goBack() {
      if (confirm('确定要退出辩论吗？进度将不会保存。')) {
        this.$router.push(`/vote/${this.topicId}`)
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
