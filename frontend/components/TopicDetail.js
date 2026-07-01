// 话题详情页组件
const TopicDetail = {
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
          <div class="nav-title">{{ topic.title }}</div>
        </div>

        <!-- 主内容区 -->
        <div style="padding-bottom: 20px;">
          <!-- 视频播放器 -->
          <div class="video-placeholder">
            <div class="big-play">▶️</div>
            <div class="video-label">点击播放视频</div>
            <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
              {{ topic.duration }}
            </div>
          </div>

          <!-- 视频分段 -->
          <div style="padding: 20px;">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              📺 视频分段
            </h3>

            <div v-for="(segment, index) in topic.segments" :key="index"
                 style="background: var(--card); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; box-shadow: var(--shadow);">
              <div style="display: flex; gap: 12px;">
                <div style="width: 36px; height: 36px; background: var(--primary-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary); flex-shrink: 0;">
                  {{ index + 1 }}
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px;">
                    {{ segment.title }}
                  </div>
                  <div style="font-size: 12px; color: var(--text-light);">
                    {{ segment.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 观看指南 -->
          <div style="padding: 0 20px 20px;">
            <div style="background: var(--primary-bg); border-radius: var(--radius); padding: 20px; border-left: 4px solid var(--primary);">
              <h3 style="font-size: 17px; font-weight: 700; color: var(--primary); margin-bottom: 12px;">
                💡 观看指南
              </h3>
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
                观看视频时，请思考以下问题：
              </p>
              <ul style="list-style: none; padding: 0;">
                <li v-for="(guide, index) in topic.guides" :key="index"
                    style="font-size: 14px; color: var(--text); line-height: 1.8; padding-left: 20px; position: relative;">
                  <span style="position: absolute; left: 0;">•</span>
                  {{ guide }}
                </li>
              </ul>
            </div>
          </div>

          <!-- 关键争议点 -->
          <div style="padding: 0 20px 20px;">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              🎯 关键争议点
            </h3>
            <div v-for="(point, index) in topic.keyPoints" :key="index"
                 style="background: var(--card); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; box-shadow: var(--shadow);">
              <div style="font-size: 14px; color: var(--text); line-height: 1.6;">
                {{ point }}
              </div>
            </div>
          </div>

          <!-- 开始辩论按钮 -->
          <button class="btn-primary" @click="startDebate">
            开始辩论 ⚡
          </button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topic: {
        id: '',
        title: '',
        duration: '',
        segments: [],
        guides: [],
        keyPoints: []
      },
      loading: true,
      error: null
    }
  },

  async mounted() {
    const topicId = this.$route.params.id;
    try {
      this.topic = await API.getTopic(topicId);
      this.loading = false;
    } catch (err) {
      this.error = err.message;
      this.loading = false;
    }
  },

  methods: {
    goBack() {
      this.$router.push('/');
    },
    startDebate() {
      this.$router.push(`/vote/${this.topic.id}`);
    }
  }
}
