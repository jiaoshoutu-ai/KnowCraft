// 投票页面组件
const VotePage = {
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
          <div class="nav-title">立场投票</div>
        </div>

        <!-- 主内容区 -->
        <div style="padding: 20px;">
          <!-- 标题 -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗳️</div>
            <h2 style="font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 12px;">
              你的立场是？
            </h2>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
              选择一个你认同的观点，稍后将与 AI 进行辩论
            </p>
          </div>

          <!-- 立场选项 -->
          <div style="margin-bottom: 24px;">
            <div v-for="(stance, index) in stances" :key="index"
                 @click="selectStance(index)"
                 :style="{
                   background: selectedStance === index ? 'var(--primary-bg)' : 'var(--card)',
                   border: selectedStance === index ? '2px solid var(--primary)' : '2px solid var(--border)',
                   borderRadius: 'var(--radius)',
                   padding: '20px',
                   marginBottom: '12px',
                   cursor: 'pointer',
                   transition: 'all 0.2s',
                   boxShadow: 'var(--shadow)'
                 }">

              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <!-- 单选框 -->
                <div :style="{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: selectedStance === index ? '6px solid var(--primary)' : '2px solid var(--border)',
                  background: 'white',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'all 0.2s'
                }"></div>

                <!-- 立场内容 -->
                <div style="flex: 1;">
                  <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px;">
                    {{ stance.role }}
                  </div>
                  <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
                    {{ stance.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 投票统计（投票后显示） -->
          <div v-if="hasVoted" style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow);">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              📊 投票统计
            </h3>

            <div v-for="(stat, index) in voteStats" :key="index" style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 13px; color: var(--text);">{{ stat.role }}</span>
                <span style="font-size: 13px; font-weight: 700; color: var(--primary);">{{ stat.percentage }}%</span>
              </div>
              <div style="height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden;">
                <div :style="{
                  height: '100%',
                  width: stat.percentage + '%',
                  background: 'linear-gradient(90deg, var(--primary), #8B5CF6)',
                  transition: 'width 0.8s ease'
                }"></div>
              </div>
            </div>

            <p style="font-size: 12px; color: var(--text-light); text-align: center; margin-top: 12px;">
              共有 {{ totalVotes }} 人参与投票
            </p>
          </div>

          <!-- 确认按钮 -->
          <button class="btn-primary"
                  :disabled="selectedStance === null"
                  :style="{ opacity: selectedStance === null ? 0.5 : 1, cursor: selectedStance === null ? 'not-allowed' : 'pointer' }"
                  @click="confirmVote">
            {{ hasVoted ? '继续选择角度' : '确认投票' }}
          </button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topicId: '',
      selectedStance: null,
      hasVoted: false,
      stances: [
        {
          role: '👨‍👩‍👧 家长代表',
          description: '短视频平台应该承担主要责任，算法推荐机制诱导孩子沉迷，影响学习和身心健康。'
        },
        {
          role: '🏢 平台代表',
          description: '算法是技术中性的工具，关键在于用户如何使用。平台已提供青少年模式，家长应加强监管。'
        },
        {
          role: '🎓 学生代表',
          description: '短视频也有教育价值，不应一刀切禁止。学生需要学会自律，合理使用时间。'
        },
        {
          role: '🏛️ 政府代表',
          description: '需要建立完善的监管框架，平衡技术创新与青少年保护，制定行业标准。'
        }
      ],
      voteStats: [
        { role: '👨‍👩‍👧 家长代表', percentage: 45 },
        { role: '🏢 平台代表', percentage: 15 },
        { role: '🎓 学生代表', percentage: 25 },
        { role: '🏛️ 政府代表', percentage: 15 }
      ],
      totalVotes: 1247
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId;
  },

  methods: {
    goBack() {
      this.$router.push(`/topic/${this.topicId}`);
    },
    selectStance(index) {
      if (!this.hasVoted) {
        this.selectedStance = index;
      }
    },
    confirmVote() {
      if (this.selectedStance === null) return;

      if (!this.hasVoted) {
        this.hasVoted = true;
        // 模拟投票统计更新
        this.voteStats[this.selectedStance].percentage += 1;
      } else {
        // 进入角度选择页面
        this.$router.push(`/angle/${this.topicId}/${this.selectedStance}`);
      }
    }
  }
}
