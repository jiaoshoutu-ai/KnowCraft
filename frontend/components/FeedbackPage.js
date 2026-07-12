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
          <div v-if="loading" style="text-align: center; padding: 40px; color: #B2BEC3;">
            正在加载评价...
          </div>
          <template v-else>
            <!-- Overall score card -->
            <div class="score-overview">
              <div class="score-label">总体评分</div>
              <div class="score-value">{{ evaluation.totalScore }}</div>
              <div class="score-max">/ 50 分</div>
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
          </template>
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
      sessionId: '',
      loading: true,
      evaluation: {
        totalScore: 0,
        scores: [
          { name: '逻辑性', icon: '🧠', value: 0 },
          { name: '证据力', icon: '📚', value: 0 },
          { name: '表达力', icon: '🗣️', value: 0 },
          { name: '反驳力', icon: '⚔️', value: 0 },
          { name: '多角度', icon: '👁️', value: 0 }
        ],
        strengths: [],
        suggestions: []
      }
    }
  },

  async mounted() {
    this.topicId = this.$route.params.topicId
    this.debateTopicId = this.$route.params.debateTopicId
    this.userStance = this.$route.params.userStance
    this.difficulty = this.$route.params.difficulty
    this.sessionId = this.$route.query.sessionId || ''

    if (this.sessionId) {
      try {
        const detail = await API.getHistoryDetail(this.sessionId);
        if (detail.evaluation) {
          const e = detail.evaluation;
          this.evaluation = {
            totalScore:
              e.logic + e.evidence + e.expression + e.rebuttal + e.critical_thinking,
            scores: [
              { name: '逻辑性', icon: '🧠', value: e.logic },
              { name: '证据力', icon: '📚', value: e.evidence },
              { name: '表达力', icon: '🗣️', value: e.expression },
              { name: '反驳力', icon: '⚔️', value: e.rebuttal },
              { name: '多角度', icon: '👁️', value: e.critical_thinking }
            ],
            strengths: (e.strengths || []).map(text => ({
              icon: '🎯', label: '亮点', text
            })),
            suggestions: (e.improvements || []).map(text => ({
              icon: '💡', label: '建议', text
            }))
          };
          // Append summary as a strength card if present
          if (e.summary) {
            this.evaluation.strengths.unshift({
              icon: '📝', label: '总评', text: e.summary
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load evaluation:', err.message);
      }
    }
    this.loading = false;
  },

  methods: {
    goHome() {
      this.$router.push('/home')
    },
    debateAgain() {
      this.$router.push(`/vote/${this.topicId}`)
    }
  }
}
