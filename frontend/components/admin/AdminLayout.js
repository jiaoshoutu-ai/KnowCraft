// Admin Dashboard Layout
const AdminLayout = {
  template: `
    <div class="admin-layout">
      <DesktopSidebar :active-tab="activeTab"></DesktopSidebar>
      <main class="admin-main">
        <router-view></router-view>
      </main>
    </div>
  `,
  computed: {
    activeTab() {
      if (this.$route.path.startsWith('/admin/topics')) {
        return 'topic-admin';
      }
      if (this.$route.path.startsWith('/admin/users')) {
        return 'users';
      }
      if (this.$route.path.startsWith('/admin/settings')) {
        return 'settings';
      }
      return 'dashboard';
    }
  }
}

// Admin Dashboard (overview)
const AdminDashboard = {
  template: `
    <div class="admin-page">
      <div class="admin-container">
        <div class="admin-header">
          <h1>数据概览</h1>
        </div>

        <div class="dashboard-stats">
          <div class="dashboard-card">
            <div class="dashboard-icon" style="background: #E3F2FD;">📊</div>
            <div class="dashboard-info">
              <div class="dashboard-value">{{ stats.totalTopics }}</div>
              <div class="dashboard-label">话题总数</div>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="dashboard-icon" style="background: #E8F5E9;">👥</div>
            <div class="dashboard-info">
              <div class="dashboard-value">{{ stats.totalUsers }}</div>
              <div class="dashboard-label">用户总数</div>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="dashboard-icon" style="background: #FFF3E0;">⚔️</div>
            <div class="dashboard-info">
              <div class="dashboard-value">{{ stats.totalDebates }}</div>
              <div class="dashboard-label">辩论次数</div>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="dashboard-icon" style="background: #FCE4EC;">🎯</div>
            <div class="dashboard-info">
              <div class="dashboard-value">{{ stats.avgScore }}</div>
              <div class="dashboard-label">平均得分</div>
            </div>
          </div>
        </div>

        <div class="dashboard-section">
          <h2>快捷操作</h2>
          <div class="quick-actions">
            <router-link to="/admin/topics/create" class="action-card">
              <span class="action-icon">➕</span>
              <span class="action-text">新增话题</span>
            </router-link>
            <router-link to="/admin/topics" class="action-card">
              <span class="action-icon">📋</span>
              <span class="action-text">查看话题</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      stats: {
        totalTopics: 0,
        totalUsers: 0,
        totalDebates: 0,
        avgScore: '0.0'
      }
    }
  },

  async mounted() {
    await this.loadStats()
  },

  methods: {
    async loadStats() {
      try {
        const topics = await API.getAllTopics(true)
        this.stats.totalTopics = topics.length
        this.stats.totalDebates = topics.reduce((sum, t) => sum + t.debate_count, 0)
      } catch (err) {
        console.error('Failed to load stats:', err)
      }
    }
  }
}
