// Feedback page component - matches prototype design
const FeedbackPage = {
  template: `
    <div class="phone-frame feedback-page">
      <DesktopSidebar active-tab="debates"></DesktopSidebar>
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
            <div class="feedback-hero">
              <div class="feedback-hero-content">
                <div class="feedback-kicker">辩论完成</div>
                <div class="feedback-hero-title">你的本场辩论评价</div>
                <div class="feedback-hero-summary">{{ evaluation.summary || '本次辩论已完成，继续保持表达和思辨练习。' }}</div>
              </div>
              <div class="score-overview">
                <div class="score-label">总体评分</div>
                <div class="score-value">{{ evaluation.totalScore }}</div>
                <div class="score-max">/ 50 分</div>
              </div>
            </div>

            <div class="feedback-grid">
              <!-- Dimension scores breakdown -->
              <div class="score-breakdown feedback-card">
                <div class="feedback-card-title">📊 能力维度评分</div>

                <div class="score-table">
                  <div v-for="(score, index) in evaluation.scores" :key="index" class="score-cell">
                    <div class="score-cell-name">{{ score.name }}</div>
                    <div class="score-cell-value">{{ score.value.toFixed(1) }}<span>/10</span></div>
                    <div class="score-cell-level">{{ getScoreLevel(score.value) }}</div>
                  </div>
                </div>
              </div>

              <!-- Feedback details section -->
              <div class="feedback-section feedback-card feedback-summary-card">
                <div class="feedback-card-title">评价要点</div>
                <div class="feedback-points-grid">
                  <div class="feedback-point-group">
                    <div class="feedback-point-title">亮点</div>
                    <ol class="feedback-point-list">
                      <li v-for="(strength, index) in evaluation.strengths" :key="'s' + index">
                        {{ strength.text }}
                      </li>
                    </ol>
                  </div>

                  <div class="feedback-point-group">
                    <div class="feedback-point-title">改进建议</div>
                    <ol class="feedback-point-list">
                      <li v-for="(suggestion, index) in evaluation.suggestions" :key="'g' + index">
                        {{ suggestion.text }}
                      </li>
                    </ol>
                  </div>
                </div>
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
        suggestions: [],
        summary: ''
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
              { name: '表达力', icon: '💬', value: e.expression },
              { name: '反驳力', icon: '⚔️', value: e.rebuttal },
              { name: '多角度', icon: '👁️', value: e.critical_thinking }
            ],
            strengths: (e.strengths || []).map(text => ({
              icon: '🎯', label: '亮点', text
            })),
            suggestions: (e.improvements || []).map(text => ({
              icon: '💡', label: '建议', text
            })),
            summary: e.summary || ''
          };
        }
      } catch (err) {
        console.warn('Failed to load evaluation:', err.message);
      }
    }
    this.loading = false;
  },

  methods: {
    getScoreLevel(value) {
      if (value >= 9) return '优秀'
      if (value >= 7) return '良好'
      if (value >= 5) return '继续练习'
      return '需要加强'
    },

    goHome() {
      this.$router.push('/home')
    },
    debateAgain() {
      this.$router.push(`/vote/${this.topicId}`)
    }
  }
}
