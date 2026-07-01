// 角度选择页面组件
const AngleSelect = {
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
          <div class="nav-title">选择辩论角度</div>
        </div>

        <!-- 主内容区 -->
        <div style="padding: 20px;">
          <!-- 标题 -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
            <h2 style="font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 12px;">
              选择你的辩论角度
            </h2>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
              选择一个角度进行辩论，AI 将扮演其他角色与你辩论
            </p>
          </div>

          <!-- 你的立场 -->
          <div style="background: var(--primary-bg); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; border-left: 4px solid var(--primary);">
            <div style="font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 8px;">
              你的立场
            </div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px;">
              {{ userStance.role }}
            </div>
            <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
              {{ userStance.description }}
            </div>
          </div>

          <!-- 角度选项 -->
          <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
            选择辩论角度
          </h3>

          <div v-for="(angle, index) in angles" :key="index"
               @click="selectAngle(index)"
               :style="{
                 background: selectedAngle === index ? 'var(--primary-bg)' : 'var(--card)',
                 border: selectedAngle === index ? '2px solid var(--primary)' : '2px solid var(--border)',
                 borderRadius: 'var(--radius)',
                 padding: '20px',
                 marginBottom: '12px',
                 cursor: 'pointer',
                 transition: 'all 0.2s',
                 boxShadow: 'var(--shadow)'
               }">

            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <!-- 选择框 -->
              <div :style="{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: selectedAngle === index ? '6px solid var(--primary)' : '2px solid var(--border)',
                background: 'white',
                flexShrink: 0,
                marginTop: '2px',
                transition: 'all 0.2s'
              }"></div>

              <!-- 角度信息 -->
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 24px;">{{ angle.icon }}</span>
                  <span style="font-size: 16px; font-weight: 700; color: var(--text);">{{ angle.name }}</span>
                </div>
                <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px;">
                  {{ angle.description }}
                </div>
                <div style="font-size: 13px; color: var(--text-light);">
                  💬 AI 将扮演此角色与你辩论
                </div>
              </div>
            </div>
          </div>

          <!-- 确认按钮 -->
          <button class="btn-primary"
                  :disabled="selectedAngle === null"
                  :style="{ opacity: selectedAngle === null ? 0.5 : 1, cursor: selectedAngle === null ? 'not-allowed' : 'pointer' }"
                  @click="confirmAngle">
            继续选择难度
          </button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topicId: '',
      stanceIndex: 0,
      selectedAngle: null,
      userStance: {},
      angles: []
    }
  },

  mounted() {
    this.topicId = this.$route.params.topicId;
    this.stanceIndex = parseInt(this.$route.params.stanceIndex);

    // 模拟数据
    const allStances = [
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
    ];

    this.userStance = allStances[this.stanceIndex];

    // 其他角度作为选项
    this.angles = allStances.filter((_, index) => index !== this.stanceIndex).map((stance, index) => ({
      ...stance,
      icon: stance.role.split(' ')[0],
      name: stance.role.split(' ').slice(1).join(' ')
    }));
  },

  methods: {
    goBack() {
      this.$router.push(`/vote/${this.topicId}`);
    },
    selectAngle(index) {
      this.selectedAngle = index;
    },
    confirmAngle() {
      if (this.selectedAngle === null) return;
      this.$router.push(`/difficulty/${this.topicId}/${this.stanceIndex}/${this.selectedAngle}`);
    }
  }
}
