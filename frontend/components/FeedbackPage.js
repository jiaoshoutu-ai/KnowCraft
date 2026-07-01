// 反馈评价页面组件
const FeedbackPage = {
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
          <div class="nav-back" @click="goHome">←</div>
          <div class="nav-title">辩论评价</div>
        </div>

        <!-- 主内容区 -->
        <div style="padding: 20px;">
          <!-- 总体评价卡片 -->
          <div style="background: linear-gradient(135deg, var(--primary), #8B5CF6); border-radius: var(--radius); padding: 24px; margin-bottom: 20px; color: white; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">辩论完成！</div>
            <div style="font-size: 64px; font-weight: 800; margin-bottom: 8px;">{{ evaluation.totalScore }}</div>
            <div style="font-size: 14px; opacity: 0.9;">总分（满分 50 分）</div>
          </div>

          <!-- 五维度评分 -->
          <div style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 20px;">
              📊 能力评估
            </h3>

            <div v-for="(score, index) in evaluation.scores" :key="index" style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 20px;">{{ score.icon }}</span>
                  <span style="font-size: 14px; font-weight: 600; color: var(--text);">{{ score.name }}</span>
                </div>
                <div style="font-size: 18px; font-weight: 700; color: var(--primary);">
                  {{ score.value }}/10
                </div>
              </div>
              <div style="height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden;">
                <div :style="{
                  height: '100%',
                  width: (score.value * 10) + '%',
                  background: 'linear-gradient(90deg, var(--primary), #8B5CF6)',
                  transition: 'width 1s ease',
                  borderRadius: '4px'
                }"></div>
              </div>
            </div>
          </div>

          <!-- 优点 -->
          <div style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              ✨ 你的亮点
            </h3>
            <div v-for="(strength, index) in evaluation.strengths" :key="index"
                 style="background: #F0FFF4; border-left: 4px solid var(--accent); padding: 12px; margin-bottom: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 14px; color: var(--text); line-height: 1.6;">
                {{ strength }}
              </div>
            </div>
          </div>

          <!-- 改进建议 -->
          <div style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              💡 改进建议
            </h3>
            <div v-for="(suggestion, index) in evaluation.suggestions" :key="index"
                 style="background: #FFF9E6; border-left: 4px solid var(--warning); padding: 12px; margin-bottom: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 14px; color: var(--text); line-height: 1.6;">
                {{ suggestion }}
              </div>
            </div>
          </div>

          <!-- 精彩时刻 -->
          <div style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              🌟 精彩时刻
            </h3>
            <div v-for="(moment, index) in evaluation.highlights" :key="index" class="highlight-moment">
              <div class="hm-title">{{ moment.title }}</div>
              <p>{{ moment.content }}</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn-secondary" @click="goHome">
              返回首页
            </button>
            <button class="btn-primary" @click="goProfile" style="flex: 1;">
              查看我的档案
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
      evaluation: {
        totalScore: 42,
        scores: [
          { name: '逻辑性', icon: '🧠', value: 8 },
          { name: '证据力', icon: '📚', value: 9 },
          { name: '表达力', icon: '🗣️', value: 8 },
          { name: '反驳力', icon: '⚔️', value: 8 },
          { name: '多角度', icon: '👁️', value: 9 }
        ],
        strengths: [
          '论证逻辑清晰，因果关系明确，能够有效支撑观点',
          '引用了具体的数据和案例，增强了说服力',
          '语言表达流畅，用词准确，表达有条理'
        ],
        suggestions: [
          '可以尝试引入更多角度的论据，丰富论证层次',
          '在反驳对方观点时，可以先承认其合理性，再进行反驳',
          '建议多关注相关领域的最新动态，积累更多素材'
        ],
        highlights: [
          {
            title: '有力的数据支撑',
            content: '你提到"根据某调查显示，70%的青少年每天使用短视频超过2小时"，这个数据引用非常有力，直接支撑了你的核心论点。'
          },
          {
            title: '巧妙的类比',
            content: '你将短视频算法比作"数字糖果"，这个类比形象生动，帮助听众更好地理解算法的本质。'
          }
        ]
      }
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId
    this.stanceIndex = parseInt(this.$route.params.stanceIndex)
    this.angleIndex = parseInt(this.$route.params.angleIndex)
    this.difficultyIndex = parseInt(this.$route.params.difficultyIndex)
  },

  methods: {
    goHome() {
      this.$router.push('/')
    },
    goProfile() {
      this.$router.push('/profile')
    }
  }
}
