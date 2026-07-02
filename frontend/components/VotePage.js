// Vote page - Select debate topic, stance, and difficulty (Desktop Layout)
const VotePage = {
  template: `
    <div class="vote-page">
      <!-- Top Bar -->
      <div class="top-bar">
        <div>
          <div class="page-title">准备辩论</div>
          <div class="page-subtitle">选择辩题、立场和难度</div>
        </div>
        <div class="top-actions">
          <button class="btn btn-secondary" @click="goBack">
            <span>←</span>
            <span>返回详情</span>
          </button>
        </div>
      </div>

      <div class="content-container">
        <div class="vote-container">
          <!-- Loading state -->
          <div v-if="loading" class="vote-state-center">
            <div class="vote-state-icon">⏳</div>
            <p class="vote-state-text">加载中...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="vote-state-center">
            <div class="vote-state-icon">❌</div>
            <p class="vote-state-text vote-state-error">{{ error }}</p>
            <button class="btn-primary" @click="goBack">返回重试</button>
          </div>

          <!-- Debate topics and difficulty -->
          <div v-else>
            <!-- Step 1: Debate topic cards -->
            <div class="vote-section">
              <h3 class="vote-section-title">选择辩题</h3>
              <div class="vote-options">
                <div v-for="(topic, index) in debateTopics" :key="topic.id"
                     class="debate-topic-card"
                     :class="{ 'is-selected': selectedTopic === index }"
                     @click="selectTopic(index)">

                  <!-- Card header -->
                  <div class="debate-card-row">
                    <div class="topic-radio" :class="{ active: selectedTopic === index }"></div>
                    <div class="debate-card-body">
                      <div class="debate-card-label">辩题 {{ index + 1 }}</div>
                      <div class="debate-card-title">{{ topic.title }}</div>
                      <div class="debate-card-count">已有 {{ formatCount(topic.participant_count) }} 人参与</div>
                    </div>
                  </div>

                  <!-- Stance options (shown when card is selected) -->
                  <div v-if="selectedTopic === index" class="stance-section">
                    <div class="stance-label">选择你的立场：</div>
                    <div class="stance-grid">
                      <div class="stance-card pro"
                           :class="{ active: selectedStance === 'pro' }"
                           @click.stop="selectStance('pro')">
                        <div class="stance-type">正方</div>
                        <div class="stance-desc">{{ topic.pro_stance }}</div>
                      </div>
                      <div class="stance-card con"
                           :class="{ active: selectedStance === 'con' }"
                           @click.stop="selectStance('con')">
                        <div class="stance-type">反方</div>
                        <div class="stance-desc">{{ topic.con_stance }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Difficulty selection (shown after stance is selected) -->
            <div v-if="selectedStance" class="vote-section">
              <h3 class="vote-section-title">选择难度</h3>
              <div class="difficulty-options">
                <div v-for="(level, index) in difficultyLevels" :key="index"
                     class="difficulty-card"
                     :class="{ 'is-selected': selectedDifficulty === index }"
                     @click="selectDifficulty(index)">

                  <div class="difficulty-card-header">
                    <!-- Radio button -->
                    <div class="topic-radio" :class="{ active: selectedDifficulty === index }"></div>

                    <!-- Icon and basic info -->
                    <div class="difficulty-icon">{{ level.icon }}</div>
                    <div class="difficulty-info">
                      <div class="difficulty-name">{{ level.name }}</div>
                      <div class="difficulty-stars">{{ level.stars }}</div>
                    </div>

                    <!-- Expand button -->
                    <button class="difficulty-expand-btn" @click.stop="toggleDescription(index)">
                      {{ expandedDifficulty === index ? '收起' : '详情' }}
                    </button>
                  </div>

                  <!-- Expandable description -->
                  <div v-if="expandedDifficulty === index" class="difficulty-details">
                    <p class="difficulty-description">{{ level.description }}</p>
                    <div class="difficulty-tags">
                      <span v-for="tag in level.tags" :key="tag" class="difficulty-tag">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Button group -->
            <div class="button-group">
              <button class="btn btn-secondary" @click="goBack">
                返回
              </button>
              <button class="btn btn-primary"
                      :disabled="!canStartDebate"
                      @click="startDebate">
                开始辩论 ⚔️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topicId: '',
      loading: true,
      error: null,
      debateTopics: [],
      selectedTopic: null,
      selectedStance: null,
      selectedDifficulty: null,
      expandedDifficulty: null,
      difficultyLevels: [
        {
          name: '新手友好',
          icon: '🌱',
          stars: '⭐',
          description: 'AI 温和回应，适合初学者。提供论点提示和脚手架帮助，让你逐步建立辩论信心。',
          tags: ['温和回应', '论点提示', '脚手架帮助'],
          color: '#00B894'
        },
        {
          name: '进阶挑战',
          icon: '⚡',
          stars: '⭐⭐⭐',
          description: 'AI 有理有据地反驳，指出逻辑漏洞。适合有一定辩论经验的同学，提升思辨能力。',
          tags: ['逻辑分析', '指出漏洞', '中等难度'],
          color: '#6C5CE7'
        },
        {
          name: '高手对决',
          icon: '🔥',
          stars: '⭐⭐⭐⭐⭐',
          description: 'AI 犀利质疑，多角度攻击。适合辩论高手，真正考验你的思辨能力和应变能力。',
          tags: ['犀利质疑', '多角度攻击', '高难度'],
          color: '#E17055'
        }
      ]
    }
  },

  computed: {
    canStartDebate() {
      return this.selectedTopic !== null && this.selectedStance !== null && this.selectedDifficulty !== null
    }
  },

  async mounted() {
    this.topicId = this.$route.params.topicId
    await this.fetchTopic()
  },

  methods: {
    async fetchTopic() {
      try {
        const topic = await API.getTopic(this.topicId)
        this.debateTopics = topic.debate_topics || []
        this.loading = false
      } catch (err) {
        this.error = err.message
        this.loading = false
      }
    },

    goBack() {
      this.$router.push(`/topic/${this.topicId}`)
    },

    selectTopic(index) {
      if (this.selectedTopic === index) {
        this.selectedTopic = null
        this.selectedStance = null
      } else {
        this.selectedTopic = index
        this.selectedStance = null
      }
    },

    selectStance(stance) {
      this.selectedStance = stance
    },

    selectDifficulty(index) {
      this.selectedDifficulty = index
    },

    toggleDescription(index) {
      this.expandedDifficulty = this.expandedDifficulty === index ? null : index
    },

    startDebate() {
      if (!this.canStartDebate) return
      const debateTopic = this.debateTopics[this.selectedTopic]
      const difficultyName = this.difficultyLevels[this.selectedDifficulty].name
      this.$router.push(`/debate/${this.topicId}/${debateTopic.id}/${this.selectedStance}/${difficultyName}`)
    },

    formatCount(num) {
      return num ? num.toLocaleString() : '0'
    }
  }
}
