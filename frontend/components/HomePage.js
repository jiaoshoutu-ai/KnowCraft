// 首页组件
const HomePage = {
  template: `
    <div class="home-page">
      <!-- Mobile Header (max-width: 768px) -->
      <div class="mobile-header">
        <h1>⚡ KnowCraft</h1>
        <p>思辨能力学习平台</p>
      </div>

      <!-- Desktop Sidebar (min-width: 1025px) -->
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
          <div class="user-avatar">{{ user.avatar || '👨‍🎓' }}</div>
          <div class="user-info">
            <div class="user-name">{{ user.username || '同学' }}</div>
            <div class="user-level">Lv.{{ level.level }} {{ level.title }}</div>
          </div>
        </div>
      </div>

      <!-- iPad Top Nav (769px - 1024px) -->
      <div class="ipad-top-nav">
        <div class="logo">
          <span>⚡</span>
          <span>KnowCraft</span>
        </div>
        <div class="nav-tabs">
          <div class="nav-tab active" @click="goToHome">
            <span class="nav-tab-icon">🏠</span>
            <span>首页</span>
          </div>
          <div class="nav-tab" @click="goToTopicLibrary">
            <span class="nav-tab-icon">📚</span>
            <span>话题库</span>
          </div>
          <div class="nav-tab">
            <span class="nav-tab-icon">⚔️</span>
            <span>我的辩论</span>
          </div>
        </div>
        <div class="user-info">
          <div class="streak-badge">
            <span>🔥</span>
            <span>{{ user.streak_days }}天</span>
          </div>
          <div class="user-avatar" @click="goToProfile">{{ user.avatar || '👤' }}</div>
        </div>
      </div>

      <!-- iPad Page Header (769px - 1024px) -->
      <div class="ipad-page-header">
        <div class="page-title">欢迎回来，{{ user.username || '同学' }}</div>
        <div class="page-subtitle">今天想要挑战哪个话题？</div>
      </div>

      <!-- Desktop Top Bar (min-width: 1025px) -->
      <div class="top-bar">
        <div>
          <div class="page-title">欢迎回来，{{ user.username || '同学' }}</div>
          <div class="page-subtitle">今天想要挑战哪个话题？</div>
        </div>
        <div class="top-actions">
          <button class="btn-primary">
            <span>🔍</span>
            <span>搜索话题</span>
          </button>
        </div>
      </div>

      <!-- Mobile Stats Section (max-width: 768px) -->
      <div class="mobile-stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">完成辩论</div>
            <div class="stat-value">{{ user.debate_count }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均得分</div>
            <div class="stat-value">{{ avgScoreText }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">连续打卡</div>
            <div class="stat-value">{{ user.streak_days }}天</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">能力等级</div>
            <div class="stat-value">Lv.{{ level.level }}</div>
          </div>
        </div>
      </div>

      <!-- Content Container -->
      <div class="content-container">
        <!-- Stats Grid (Desktop/iPad only) -->
        <div class="stats-grid desktop-ipad-stats">
          <div class="stat-card">
            <div class="stat-label">完成辩论</div>
            <div class="stat-value">{{ user.debate_count }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均得分</div>
            <div class="stat-value">{{ avgScoreText }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">连续打卡</div>
            <div class="stat-value">{{ user.streak_days }}天</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">能力等级</div>
            <div class="stat-value">Lv.{{ level.level }}</div>
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

      <!-- Mobile Bottom Navigation (max-width: 768px) -->
      <div class="mobile-bottom-nav">
        <div class="nav-item active" @click="goToHome">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">首页</span>
        </div>
        <div class="nav-item" @click="goToTopicLibrary">
          <span class="nav-icon">📚</span>
          <span class="nav-label">话题库</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">⚔️</span>
          <span class="nav-label">我的辩论</span>
        </div>
        <div class="nav-item" @click="goToProfile">
          <span class="nav-icon">👤</span>
          <span class="nav-label">我的</span>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topics: [],
      loading: true,
      user: API.getUserInfo() || {
        username: '同学',
        avatar: '',
        debate_count: 0,
        average_score: 0,
        streak_days: 0,
      },
    }
  },

  computed: {
    level() {
      return getUserLevel(this.user.debate_count || 0);
    },
    avgScoreText() {
      const s = this.user.average_score;
      return typeof s === 'number' ? s.toFixed(1) : '0.0';
    },
  },

  async mounted() {
    try {
      this.user = await API.getMe();
    } catch (e) {
      console.warn('getMe failed:', e.message);
    }
    await this.loadTopics();
  },

  methods: {
    async loadTopics() {
      try {
        const data = await API.getTopics();
        this.topics = data.map(t => ({
          id: t.id,
          title: t.title,
          description: t.summary || t.description || '',
          duration: t.video?.duration || '未知',
          tag: t.tags?.[0] || '',
          tags: t.tags || [],
          views: t.view_count ? (t.view_count >= 1000 ? `${(t.view_count/1000).toFixed(1)}k 人观看` : `${t.view_count} 人观看`) : '0 人观看'
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
    },
    goToHome() {
      // Already on home page
    }
  }
}
