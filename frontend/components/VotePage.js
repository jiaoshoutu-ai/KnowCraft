// Vote page - Select debate topic, stance, and difficulty (Mobile-first Layout)
const VotePage = {
  template: `
    <div class="vote-page">
      <DesktopSidebar active-tab="topics"></DesktopSidebar>
      <!-- Nav Bar (mobile-first, matches prototype) -->
      <div class="nav-bar">
        <div class="nav-back" @click="goBack">←</div>
        <div class="nav-title">准备辩论</div>
      </div>

      <div class="vote-container" style="padding-bottom: 24px;">
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
          <!-- Step 1: Select debate topic -->
          <div class="vote-section">
            <div class="vote-section-title">选择辩题</div>
            <div class="vote-options">
              <div v-for="(topic, index) in debateTopics" :key="topic.id"
                   class="debate-topic-card"
                   :class="{ 'is-selected': selectedTopic === index }"
                   @click="selectTopic(index)">

                <!-- Card header row -->
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
          <div v-if="selectedStance" class="vote-section difficulty-section">
            <div class="difficulty-section-toggle" @click="toggleDifficultySection">
              <div>
                <div class="vote-section-title difficulty-section-title">选择难度</div>
                <div class="difficulty-selected-summary">
                  当前难度：{{ selectedDifficultyLevel.icon }} {{ selectedDifficultyLevel.name }} {{ selectedDifficultyLevel.stars }}
                </div>
              </div>
              <button class="difficulty-section-expand-btn" type="button">
                {{ isDifficultyExpanded ? '收起' : '展开' }}
              </button>
            </div>

            <div v-if="isDifficultyExpanded" class="difficulty-options">
              <div v-for="(level, index) in difficultyLevels" :key="index"
                   class="difficulty-card"
                   :class="{ 'is-selected': selectedDifficulty === index }"
                   @click="selectDifficulty(index)">

                <div class="difficulty-card-header">
                  <div class="topic-radio" :class="{ active: selectedDifficulty === index }"></div>
                  <div class="difficulty-icon">{{ level.icon }}</div>
                  <div class="difficulty-info">
                    <div class="difficulty-name">{{ level.name }}</div>
                    <div class="difficulty-stars">{{ level.stars }}</div>
                  </div>
                  <button class="difficulty-expand-btn" @click.stop="toggleDescription(index)">
                    {{ expandedDifficulty === index ? '收起' : '详情' }}
                  </button>
                </div>

                <!-- Expandable description -->
                <div v-if="expandedDifficulty === index" class="difficulty-details">
                  <div class="difficulty-description">{{ level.description }}</div>
                  <div class="difficulty-tags">
                    <span v-for="tag in level.tags" :key="tag" class="difficulty-tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Single start debate button (matches prototype) -->
          <div style="padding: 0 24px;">
            <button class="btn btn-primary"
                    :disabled="!canStartDebate"
                    @click="startDebate">
              开始辩论 ⚔️
            </button>
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
      selectedDifficulty: 0,
      expandedDifficulty: null,
      isDifficultyExpanded: false,
      difficultyLevels: [
        {
          name: '新手友好',
          icon: '🌱',
          stars: '⭐',
          description: 'AI 温和回应，适合初学者。提供论点提示和脚手架帮助。',
          tags: ['💡 论点提示', '🤝 温和反驳', '📝 脚手架辅助'],
          color: '#00B894'
        },
        {
          name: '进阶挑战',
          icon: '⚡',
          stars: '⭐⭐⭐',
          description: 'AI 有理有据地反驳，指出逻辑漏洞。适合有一定辩论经验的同学。',
          tags: ['🔍 逻辑分析', '🎯 针对性反驳'],
          color: '#6C5CE7'
        },
        {
          name: '高手对决',
          icon: '🔥',
          stars: '⭐⭐⭐⭐⭐',
          description: 'AI 犀利质疑，多角度攻击。适合辩论高手，真正考验思辨能力。',
          tags: ['💥 犀利质疑', '🧠 深度追问', '⏱️ 快节奏'],
          color: '#E17055'
        }
      ]
    }
  },

  computed: {
    selectedDifficultyLevel() {
      return this.difficultyLevels[this.selectedDifficulty] || this.difficultyLevels[0]
    },

    canStartDebate() {
      return this.selectedTopic !== null && this.selectedStance !== null && this.selectedDifficulty !== null
    }
  },

  async mounted() {
    this.topicId = this.$route.params.topicId
    this.loadSavedDifficulty()
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
      localStorage.setItem('knowcraft_last_difficulty', String(index))
    },

    toggleDifficultySection() {
      this.isDifficultyExpanded = !this.isDifficultyExpanded
    },

    loadSavedDifficulty() {
      const savedDifficulty = Number(localStorage.getItem('knowcraft_last_difficulty'))
      if (Number.isInteger(savedDifficulty) && savedDifficulty >= 0 && savedDifficulty < this.difficultyLevels.length) {
        this.selectedDifficulty = savedDifficulty
      }
    },

    toggleDescription(index) {
      this.expandedDifficulty = this.expandedDifficulty === index ? null : index
    },

    startDebate() {
      if (!this.canStartDebate) return
      if (!API.canGuestStartDebate()) {
        const shouldBindEmail = confirm('游客可免费体验 2 场辩论。绑定邮箱后可继续辩论并保存评价记录，是否现在绑定？')
        if (shouldBindEmail) {
          this.$router.push('/')
        }
        return
      }

      API.recordGuestDebateStart()
      const debateTopic = this.debateTopics[this.selectedTopic]
      const difficultyName = this.difficultyLevels[this.selectedDifficulty].name
      this.$router.push(`/debate/${this.topicId}/${debateTopic.id}/${this.selectedStance}/${difficultyName}`)
    },

    formatCount(num) {
      return num ? num.toLocaleString() : '0'
    }
  }
}
