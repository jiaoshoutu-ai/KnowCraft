// 首页组件
const HomePage = {
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

        <!-- 主内容区 -->
        <div style="padding: 20px; padding-bottom: 80px;">
          <!-- 头部 -->
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 32px; font-weight: 800; color: var(--primary); margin-bottom: 8px;">
              ⚡ 思辨力
            </h1>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
              看新闻，选立场，练思维
            </p>

            <!-- 打卡信息 -->
            <div style="display: flex; align-items: center; gap: 12px; background: var(--primary-bg); padding: 12px 16px; border-radius: var(--radius-sm);">
              <div style="flex: 1;">
                <div style="font-size: 13px; color: var(--text-secondary);">今日打卡</div>
                <div style="font-size: 24px; font-weight: 700; color: var(--primary);">第 7 天 🔥</div>
              </div>
              <div style="text-align: center; padding: 0 12px; border-left: 1px solid var(--border);">
                <div style="font-size: 13px; color: var(--text-secondary);">等级</div>
                <div style="font-size: 16px; font-weight: 700; color: var(--accent);">Lv.3</div>
              </div>
            </div>
          </div>

          <!-- 今日推荐 -->
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--text);">今日推荐</h2>
              <span style="font-size: 13px; color: var(--primary); cursor: pointer;">查看全部 →</span>
            </div>

            <!-- 话题卡片列表 -->
            <div v-for="topic in topics" :key="topic.id"
                 @click="goToTopic(topic)"
                 style="background: var(--card); border-radius: var(--radius); overflow: hidden; margin-bottom: 16px; box-shadow: var(--shadow); cursor: pointer; transition: transform 0.2s;"
                 @mouseenter="$event.target.style.transform = 'translateY(-2px)'"
                 @mouseleave="$event.target.style.transform = 'translateY(0)'">

              <!-- 视频封面 -->
              <div style="position: relative; aspect-ratio: 16/9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                  <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    ▶️
                  </div>
                </div>
                <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                  {{ topic.duration }}
                </div>
                <div v-if="topic.tag" style="position: absolute; top: 12px; right: 12px; background: var(--accent); color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                  {{ topic.tag }}
                </div>
              </div>

              <!-- 话题信息 -->
              <div style="padding: 16px;">
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 8px; line-height: 1.4;">
                  {{ topic.title }}
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                  {{ topic.description }}
                </p>

                <!-- 标签和统计 -->
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span v-for="tag in topic.tags" :key="tag"
                        style="background: var(--primary-bg); color: var(--primary); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                    {{ tag }}
                  </span>
                  <span style="margin-left: auto; font-size: 12px; color: var(--text-light);">
                    {{ topic.views }} 人观看
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部导航 -->
        <div class="bottom-nav">
          <div class="nav-item active">
            <div class="nav-icon">🏠</div>
            <div class="nav-label">首页</div>
          </div>
          <div class="nav-item" @click="goToTopicLibrary">
            <div class="nav-icon">📚</div>
            <div class="nav-label">话题库</div>
          </div>
          <div class="nav-item" @click="goToProfile">
            <div class="nav-icon">👤</div>
            <div class="nav-label">我的</div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topics: [
        {
          id: 'short-video-algorithm',
          title: '短视频算法正在"偷走"孩子的时间？',
          description: '探讨短视频推荐算法对青少年的影响，平台、家长、学生、政府各方应承担什么责任。',
          duration: '25分钟',
          tag: '热门',
          tags: ['科技', '教育', '社会'],
          views: '12.5k'
        },
        {
          id: 'ai-homework',
          title: '学生用 AI 写作业，该不该禁止？',
          description: 'AI 工具的普及让作业变得复杂，学校应该如何应对？技术进步与学术诚信如何平衡？',
          duration: '20分钟',
          tag: '新',
          tags: ['教育', '科技', '伦理'],
          views: '8.3k'
        },
        {
          id: 'school-phone-ban',
          title: '学校禁止带手机，合理吗？',
          description: '多地学校出台手机禁令，学生、家长、教师对此看法不一。自由与管理的边界在哪里？',
          duration: '18分钟',
          tags: ['教育', '管理', '青少年'],
          views: '15.2k'
        }
      ]
    }
  },

  methods: {
    goToTopic(topic) {
      this.$router.push(`/topic/${topic.id}`);
    },
    goToTopicLibrary() {
      alert('话题库功能开发中...');
    },
    goToProfile() {
      this.$router.push('/profile');
    }
  }
}
