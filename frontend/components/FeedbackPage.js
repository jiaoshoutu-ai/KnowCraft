// Feedback page component - matches prototype design
const FeedbackPage = {
  template: `
    <div class="phone-frame">
      <div class="screen-container">
        <!-- Status bar -->
        <div class="status-bar">
          <span class="time">9:41</span>
          <div class="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <!-- Navigation bar -->
        <div class="nav-bar">
          <div class="nav-back" @click="goHome">←</div>
          <div class="nav-title">辩论评价</div>
        </div>

        <!-- Main content area -->
        <div class="feedback-container">
          <!-- Overall score card -->
          <div class="score-overview">
            <div class="score-label">总体评分</div>
            <div class="score-value">{{ evaluation.totalScore }}</div>
            <div class="score-max">/ 10 分</div>
          </div>

          <!-- Dimension scores breakdown -->
          <div class="score-breakdown">
            <div class="score-title">📊 能力维度评分</div>

            <div v-for="(score, index) in evaluation.scores" :key="index" class="score-item">
              <div class="score-icon">{{ score.icon }}</div>
              <div class="score-info">
                <div class="score-name">{{ score.name }}</div>
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: (score.value * 10) + '%' }"></div>
                </div>
              </div>
              <div class="score-number">{{ score.value.toFixed(1) }}</div>
            </div>
          </div>

          <!-- Strengths section -->
          <div class="feedback-section">
            <div class="score-title">✨ 亮点</div>
            <div v-for="(strength, index) in evaluation.strengths" :key="'s' + index" class="feedback-item">
              <div class="feedback-header">
                <div class="feedback-icon">{{ strength.icon }}</div>
                <div class="feedback-label">{{ strength.label }}</div>
              </div>
              <div class="feedback-text">{{ strength.text }}</div>
            </div>
          </div>

          <!-- Suggestions section -->
          <div class="feedback-section">
            <div class="score-title">📈 改进建议</div>
            <div v-for="(suggestion, index) in evaluation.suggestions" :key="'g' + index" class="feedback-item">
              <div class="feedback-header">
                <div class="feedback-icon">{{ suggestion.icon }}</div>
                <div class="feedback-label">{{ suggestion.label }}</div>
              </div>
              <div class="feedback-text">{{ suggestion.text }}</div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="button-group">
          <button class="btn btn-secondary" @click="goHome">返回首页</button>
          <button class="btn btn-primary" @click="debateAgain">再辩一次</button>
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
      evaluation: {
        totalScore: 8.5,
        scores: [
          { name: '逻辑性', icon: '🧠', value: 8.5 },
          { name: '证据力', icon: '📚', value: 8.0 },
          { name: '表达力', icon: '🗣️', value: 9.0 },
          { name: '反驳力', icon: '⚔️', value: 8.5 },
          { name: '多角度', icon: '👁️', value: 8.0 }
        ],
        strengths: [
          {
            icon: '🎯',
            label: '论证有力',
            text: '你能够准确抓住算法推荐机制的核心问题，指出其利用心理弱点的设计逻辑，论证清晰有力。'
          },
          {
            icon: '💡',
            label: '观点新颖',
            text: '从青少年自控能力发展阶段的角度进行分析，展现了独特的思考视角。'
          }
        ],
        suggestions: [
          {
            icon: '📊',
            label: '增加数据支撑',
            text: '可以引用相关研究数据或案例来增强论点的说服力，比如青少年使用短视频的具体时长统计。'
          },
          {
            icon: '🔄',
            label: '多角度思考',
            text: '可以尝试从更多角度分析问题，比如考虑技术发展的必然性，或者探讨如何平衡创新与保护。'
          }
        ]
      }
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId
    this.debateTopicId = this.$route.params.debateTopicId
    this.userStance = this.$route.params.userStance
    this.difficulty = this.$route.params.difficulty
  },

  methods: {
    goHome() {
      this.$router.push('/home')
    },
    debateAgain() {
      // Navigate back to vote page with same topic for another debate
      this.$router.push({
        path: '/vote',
        params: {
          topicId: this.topicId,
          debateTopicId: this.debateTopicId
        }
      })
    }
  }
}
