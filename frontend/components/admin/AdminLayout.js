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

const AdminUsersPage = {
  template: `
    <div class="admin-page admin-users-page">
      <div class="admin-container">
        <div class="admin-users-toolbar">
          <input
            v-model="keyword"
            class="admin-users-search"
            type="text"
            placeholder="搜索用户昵称、邮箱..."
          />
          <select v-model="roleFilter" class="admin-users-filter">
            <option value="all">全部角色</option>
            <option value="student">普通用户</option>
            <option value="admin">管理员</option>
          </select>
          <select v-model="statusFilter" class="admin-users-filter">
            <option value="all">全部状态</option>
            <option value="normal">正常</option>
          </select>
        </div>

        <div v-if="loading" class="admin-users-empty">正在加载用户列表...</div>
        <div v-else-if="error" class="admin-users-empty">{{ error }}</div>
        <div v-else class="admin-users-table-wrap">
          <table class="admin-users-table">
            <thead>
              <tr>
                <th>用户</th>
                <th>角色</th>
                <th>辩论次数</th>
                <th>注册时间</th>
                <th>最近活跃</th>
                <th>平均得分</th>
                <th>连续打卡</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0">
                <td class="admin-users-empty-row" colspan="9">暂无匹配用户</td>
              </tr>
              <tr v-for="siteUser in filteredUsers" :key="siteUser.id">
                <td>
                  <div class="admin-users-profile">
                    <div class="admin-users-avatar">{{ siteUser.avatar || defaultAvatar(siteUser) }}</div>
                    <div>
                      <div class="admin-users-name">{{ siteUser.username || '未命名用户' }}</div>
                      <div class="admin-users-contact">{{ maskContact(siteUser.email) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="admin-users-role" :class="siteUser.role">{{ formatRole(siteUser.role) }}</span>
                </td>
                <td>{{ siteUser.debate_count || 0 }}</td>
                <td>{{ formatDate(siteUser.created_at) }}</td>
                <td>{{ formatDate(siteUser.last_active_at) }}</td>
                <td>{{ formatScore(siteUser.average_score) }}</td>
                <td>{{ siteUser.streak_days || 0 }}天</td>
                <td><span class="admin-users-status">正常</span></td>
                <td>
                  <div class="admin-users-actions">
                    <button class="admin-users-link" @click="showUserDetail(siteUser)">详情</button>
                    <select
                      class="admin-users-role-select"
                      :value="siteUser.role"
                      :disabled="updatingUserId === siteUser.id"
                      @change="updateUserRole(siteUser, $event.target.value)"
                    >
                      <option value="student">设为普通用户</option>
                      <option value="admin">设为管理员</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: true,
      error: '',
      users: [],
      keyword: '',
      roleFilter: 'all',
      statusFilter: 'all',
      updatingUserId: ''
    }
  },
  computed: {
    filteredUsers() {
      const normalizedKeyword = this.keyword.trim().toLowerCase()
      return this.users.filter(user => {
        const matchesKeyword = !normalizedKeyword
          || (user.username || '').toLowerCase().includes(normalizedKeyword)
          || (user.email || '').toLowerCase().includes(normalizedKeyword)
        const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter
        const matchesStatus = this.statusFilter === 'all' || this.statusFilter === 'normal'
        return matchesKeyword && matchesRole && matchesStatus
      })
    }
  },
  async mounted() {
    await this.loadUsers()
  },
  methods: {
    async loadUsers() {
      try {
        this.error = ''
        this.users = await API.getAdminUsers()
      } catch (err) {
        this.error = err.message || '加载用户列表失败'
      } finally {
        this.loading = false
      }
    },
    async updateUserRole(siteUser, role) {
      if (siteUser.role === role) return

      const previousRole = siteUser.role
      siteUser.role = role
      this.updatingUserId = siteUser.id
      try {
        const updatedUser = await API.updateAdminUserRole(siteUser.id, role)
        Object.assign(siteUser, updatedUser)
      } catch (err) {
        siteUser.role = previousRole
        this.error = err.message || '更新用户权限失败'
      } finally {
        this.updatingUserId = ''
      }
    },
    showUserDetail(siteUser) {
      window.alert(`用户：${siteUser.username || '未命名用户'}\n邮箱：${siteUser.email || '未设置'}\n辩论次数：${siteUser.debate_count || 0}`)
    },
    defaultAvatar(siteUser) {
      return siteUser.role === 'admin' ? '👩‍🏫' : '👨‍🎓'
    },
    formatRole(role) {
      return role === 'admin' ? '管理员' : '玩家'
    },
    formatScore(score) {
      return typeof score === 'number' ? score.toFixed(1) : '0.0'
    },
    formatDate(time) {
      if (!time) return '未知'
      return new Date(time).toISOString().slice(0, 10)
    },
    maskContact(email) {
      if (!email) return '未设置邮箱'
      const [name, domain] = email.split('@')
      if (!domain) return email
      const prefix = name.slice(0, 3)
      return `${prefix}***@${domain}`
    }
  }
}

const DebateRecordsPage = {
  template: `
    <div class="debate-records-page">
      <DesktopSidebar active-tab="debate-records"></DesktopSidebar>
      <main class="admin-main">
        <div class="admin-page">
          <div class="admin-container">
            <div class="admin-header">
              <h1>辩论记录</h1>
            </div>

            <div v-if="loading" class="dashboard-section">正在加载辩论记录...</div>
            <div v-else-if="error" class="dashboard-section">{{ error }}</div>
            <div v-else-if="histories.length === 0" class="dashboard-section">暂无辩论记录</div>
            <div v-else class="dashboard-section">
              <h2>最近记录</h2>
              <div class="admin-record-list">
                <div v-for="history in histories" :key="history.session_id || history.id" class="admin-record-card">
                  <div class="admin-record-title">{{ history.topic_title || history.debate_topic_title || '未命名辩论' }}</div>
                  <div class="admin-record-meta">
                    <span>立场：{{ formatStance(history.user_stance) }}</span>
                    <span>难度：{{ history.difficulty || '未知' }}</span>
                    <span>得分：{{ formatScore(history.score || history.total_score) }}</span>
                  </div>
                  <div class="admin-record-time">{{ formatTime(history.created_at || history.updated_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  data() {
    return {
      loading: true,
      error: '',
      histories: []
    }
  },
  async mounted() {
    try {
      this.histories = await API.getHistory()
    } catch (err) {
      this.error = err.message || '加载辩论记录失败'
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatStance(stance) {
      if (stance === 'pro') return '正方'
      if (stance === 'con') return '反方'
      return '未知'
    },
    formatScore(score) {
      return typeof score === 'number' ? score.toFixed(1) : '暂无'
    },
    formatTime(time) {
      return time ? new Date(time).toLocaleString() : '时间未知'
    }
  }
}
