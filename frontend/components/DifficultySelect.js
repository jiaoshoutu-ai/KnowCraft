// 难度选择页面组件
const DifficultySelect = {
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
          <div class="nav-title">选择难度</div>
        </div>

        <!-- 主内容区 -->
        <div style="padding: 20px;">
          <!-- 标题 -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚡</div>
            <h2 style="font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 12px;">
              选择辩论难度
            </h2>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
              难度越高，AI 的反驳越犀利，挑战越大
            </p>
          </div>

          <!-- 难度选项 -->
          <div v-for="(level, index) in difficultyLevels" :key="index"
               @click="selectDifficulty(index)"
               :style="{
                 background: selectedDifficulty === index ? level.bgColor : 'var(--card)',
                 border: selectedDifficulty === index ? '2px solid ' + level.color : '2px solid var(--border)',
                 borderRadius: 'var(--radius)',
                 padding: '24px',
                 marginBottom: '16px',
                 cursor: 'pointer',
                 transition: 'all 0.2s',
                 boxShadow: selectedDifficulty === index ? 'var(--shadow-lg)' : 'var(--shadow)'
               }">

            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <!-- 选择框 -->
              <div :style="{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: selectedDifficulty === index ? '6px solid ' + level.color : '2px solid var(--border)',
                background: 'white',
                flexShrink: 0,
                marginTop: '2px',
                transition: 'all 0.2s'
              }"></div>

              <!-- 难度信息 -->
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 28px;">{{ level.icon }}</span>
                  <div>
                    <div style="font-size: 18px; font-weight: 700; color: var(--text);">{{ level.name }}</div>
                    <div style="font-size: 13px; color: var(--text-light);">{{ level.stars }}</div>
                  </div>
                </div>
                <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
                  {{ level.description }}
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span v-for="tag in level.tags" :key="tag"
                        :style="{
                          background: level.tagBgColor,
                          color: level.color,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 开始辩论按钮 -->
          <button class="btn-primary"
                  :disabled="selectedDifficulty === null"
                  :style="{ opacity: selectedDifficulty === null ? 0.5 : 1, cursor: selectedDifficulty === null ? 'not-allowed' : 'pointer' }"
                  @click="startDebate">
            开始辩论 ⚔️
          </button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topicId: '',
      debateTopicId: '',
      userStance: '',
      selectedDifficulty: null,
      difficultyLevels: [
        {
          name: '新手友好',
          icon: '🌱',
          stars: '⭐',
          description: 'AI 温和回应，适合初学者。提供论点提示和脚手架帮助，让你逐步建立辩论信心。',
          tags: ['温和回应', '论点提示', '脚手架帮助'],
          color: '#00B894',
          bgColor: '#E0FFF5',
          tagBgColor: '#D0F5E8'
        },
        {
          name: '进阶挑战',
          icon: '⚡',
          stars: '⭐⭐⭐',
          description: 'AI 有理有据地反驳，指出逻辑漏洞。适合有一定辩论经验的同学，提升思辨能力。',
          tags: ['逻辑分析', '指出漏洞', '中等难度'],
          color: '#6C5CE7',
          bgColor: '#F0EEFF',
          tagBgColor: '#E8E5FF'
        },
        {
          name: '高手对决',
          icon: '🔥',
          stars: '⭐⭐⭐⭐⭐',
          description: 'AI 犀利质疑，多角度攻击。适合辩论高手，真正考验你的思辨能力和应变能力。',
          tags: ['犀利质疑', '多角度攻击', '高难度'],
          color: '#E17055',
          bgColor: '#FFE8E5',
          tagBgColor: '#FFD8D0'
        }
      ]
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId;
    this.debateTopicId = this.$route.params.debateTopicId;
    this.userStance = this.$route.params.userStance;
  },

  methods: {
    goBack() {
      this.$router.push(`/vote/${this.topicId}`);
    },
    selectDifficulty(index) {
      this.selectedDifficulty = index;
    },
    startDebate() {
      if (this.selectedDifficulty === null) return;
      const difficultyName = this.difficultyLevels[this.selectedDifficulty].name;
      this.$router.push(`/debate/${this.topicId}/${this.debateTopicId}/${this.userStance}/${difficultyName}`);
    }
  }
}
