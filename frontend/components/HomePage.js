// 首页组件
const HomePage = {
  template: `
    <div class="home-page">
      <!-- Desktop Sidebar -->
      <div class="sidebar">
        <div class="sidebar-logo">
          <div class="logo">
            <span>⚡</span>
            <span>KnowCraft</span>
          </div>
        </div>
        <div class="sidebar-nav">
          <div class="nav-item active">
            <span class="nav-item-icon">🏠</span>
            <span>首页</span>
          </div>
          <div class="nav-item" @click="goToTopicLibrary">
            <span class="nav-item-icon">📚</span>
            <span>话题库</span>
          </div>
          <div class="nav-item" @click="goToProfile">
            <span class="nav-item-icon">👤</span>
            <span>个人中心</span>
          </div>
        </div>
        <div class="sidebar-admin">
          <div class="admin-label">管理后台</div>
          <div class="nav-item" @click="goToAdmin">
            <span class="nav-item-icon">📊</span>
            <span>话题管理</span>
          </div>
        </div>
        <div class="sidebar-user">
          <div class="user-avatar">👨‍🎓</div>
          <div class="user-info">
            <div class="user-name">小明同学</div>
            <div class="user-level">Lv.3 思辨小达人</div>
          </div>
        </div>
      </div>

      <!-- Top Bar -->
      <div class="top-bar">
        <div>
          <div class="page-title">欢迎回来，思辨小达人</div>
          <div class="page-subtitle">今天想要挑战哪个话题？</div>
        </div>
        <div class="top-actions">
          <button class="btn-primary">
            <span>🔍</span>
            <span>搜索话题</span>
          </button>
        </div>
      </div>

      <!-- Content Container -->
      <div class="content-container">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">完成辩论</div>
            <div class="stat-value">12</div>
            <div class="stat-change">
              <span>↑</span>
              <span>本周 +3</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均得分</div>
            <div class="stat-value">8.5</div>
            <div class="stat-change">
              <span>↑</span>
              <span>较上月 +0.8</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">连续打卡</div>
            <div class="stat-value">7天</div>
            <div class="stat-change">
              <span>🔥</span>
              <span>继续保持</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">能力等级</div>
            <div class="stat-value">Lv.3</div>
            <div class="stat-change">
              <span>距离 Lv.4 还需 5 场</span>
            </div>
          </div>
        </div>

        <!-- Section Header -->
        <div class="section-header">
          <div class="section-title">今日推荐</div>
          <div class="view-all" @click="goToTopicLibrary">
            <span>查看全部</span>
            <span>→</span>
          </div>
        </div>

        <!-- Topics Grid -->
        <div class="topics-grid">
          <div v-for="topic in topics" :key="topic.id"
               @click="goToTopic(topic)"
               class="topic-card">
            <div class="topic-thumbnail">
              <div class="play-button">▶️</div>
              <div class="topic-duration">{{ topic.duration }}</div>
              <div v-if="topic.tag" class="topic-tag">{{ topic.tag }}</div>
            </div>
            <div class="topic-info">
              <div class="topic-title">{{ topic.title }}</div>
              <div class="topic-description">{{ topic.description }}</div>
              <div class="topic-meta">
                <span v-for="tag in topic.tags" :key="tag" class="topic-tag-small">
                  {{ tag }}
                </span>
                <span class="topic-stats">
                  <span>👁️</span>
                  <span>{{ topic.views }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topics: [],
      loading: true
    }
  },

  async mounted() {
    await this.loadTopics()
  },

  methods: {
    async loadTopics() {
      try {
        const data = await fetch(`${CONFIG.API_BASE}/api/topics`).then(r => r.json())
        this.topics = data.map(t => ({
          id: t.id,
          title: t.title,
          description: t.summary || t.description || '',
          duration: t.video?.duration || '未知',
          tag: t.tags?.[0] || '',
          tags: t.tags || [],
          views: t.view_count ? (t.view_count >= 1000 ? `${(t.view_count/1000).toFixed(1)}k` : t.view_count.toString()) : '0'
        }))
      } catch (err) {
        console.error('Failed to load topics:', err)
        this.topics = []
      } finally {
        this.loading = false
      }
    },

    goToTopic(topic) {
      this.$router.push(`/topic/${topic.id}`);
    },
    goToTopicLibrary() {
      alert('话题库功能开发中...');
    },
    goToProfile() {
      this.$router.push('/profile');
    },
    goToAdmin() {
      this.$router.push('/admin');
    }
  }
}
