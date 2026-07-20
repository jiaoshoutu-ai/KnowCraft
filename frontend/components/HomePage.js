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
      <DesktopSidebar active-tab="home"></DesktopSidebar>

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
          <button v-if="isGuest" class="home-guest-bind-btn" type="button" @click="goToLogin">
            游客登录 · 绑定邮箱
          </button>
          <div class="home-search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              class="home-search-input"
              type="text"
              placeholder="搜索话题..."
            />
            <button
              v-if="searchQuery"
              class="home-search-clear"
              type="button"
              @click="searchQuery = ''"
            >×</button>
          </div>
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
        <div v-if="isGuest" class="home-guest-banner">
          <div>
            <strong>游客模式</strong>
            <span>可免费体验 2 场辩论，绑定邮箱后可继续辩论并保存评价记录。</span>
          </div>
          <button type="button" @click="goToLogin">绑定邮箱</button>
        </div>

        <!-- Stats Grid (Desktop/iPad only) -->
        <div class="stats-grid desktop-ipad-stats">
          <div class="stat-card">
            <div class="stat-label">完成辩论</div>
            <div class="stat-value">{{ user.debate_count }}</div>
            <div class="stat-change">↗ 本周 +3</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均得分</div>
            <div class="stat-value">{{ avgScoreText }}</div>
            <div class="stat-change">↗ 较上月 +0.8</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">连续打卡</div>
            <div class="stat-value">{{ user.streak_days }}天</div>
            <div class="stat-change warning">🔥 继续保持</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">能力等级</div>
            <div class="stat-value">Lv.{{ level.level }}</div>
            <div class="stat-change">距离 Lv.4 还需 5 场</div>
          </div>
        </div>

        <!-- Section Header -->
        <div class="home-section-card">
          <div class="section-header">
            <div class="section-title">今日推荐</div>
            <div class="view-all" @click="goToTopicLibrary">
              <span>查看全部</span>
              <span>→</span>
            </div>
          </div>

          <!-- Topics Grid -->
          <div class="topics-grid" v-if="filteredTopics.length > 0">
          <div v-for="topic in filteredTopics" :key="topic.id"
               @click="goToTopic(topic)"
               class="topic-card">
            <div class="topic-thumbnail">
              <div v-if="topic.badge" class="topic-badge" :class="topic.badgeClass">{{ topic.badge }}</div>
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
        <div v-else class="home-empty-state">
          没有找到匹配的话题
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
        <div class="nav-item" @click="goToDebateRecords">
          <span class="nav-icon">⚔️</span>
          <span class="nav-label">我的辩论</span>
        </div>
        <div v-if="!isGuest" class="nav-item" @click="goToProfile">
          <span class="nav-icon">👤</span>
          <span class="nav-label">我的</span>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topics: [],
      searchQuery: '',
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
    isGuest() {
      return API.isGuest();
    },
    filteredTopics() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.topics;

      return this.topics.filter(topic => {
        const searchableText = [
          topic.title,
          topic.description,
          topic.tag,
          ...(topic.tags || [])
        ].join(' ').toLowerCase();
        return searchableText.includes(query);
      });
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
        this.topics = data.map((t, index) => ({
          id: t.id,
          title: t.title,
          description: t.summary || t.description || '',
          duration: t.video?.duration || '未知',
          tag: t.tags?.[0] || '',
          tags: t.tags || [],
          views: t.view_count ? (t.view_count >= 1000 ? `${(t.view_count/1000).toFixed(1)}k` : `${t.view_count}`) : '0',
          badge: index === 0 ? '热门' : (index === 1 ? '新' : ''),
          badgeClass: index === 0 ? 'hot' : (index === 1 ? 'new' : '')
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
      this.$router.push('/topic-library');
    },
    goToLogin() {
      this.$router.push('/');
    },
    goToDebateRecords() {
      this.$router.push('/debate-records');
    },
    goToProfile() {
      this.$router.push('/profile');
    },
    goToAdmin() {
      this.$router.push('/admin');
    },
    logout() {
      API.logout();
      this.$router.push('/');
    },
    goToHome() {
      // Already on home page
    }
  }
}
