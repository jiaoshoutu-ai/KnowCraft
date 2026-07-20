// Shared desktop sidebar component
const DesktopSidebar = {
  props: {
    activeTab: {
      type: String,
      default: 'home'
    }
  },
  template: `
    <div class="desktop-shell">
      <header class="desktop-topbar">
        <div class="desktop-topbar-brand">
          <span>⚡</span>
          <span>KnowCraft</span>
        </div>
      </header>

      <aside class="desktop-sidebar">
        <nav class="desktop-sidebar-nav">
        <div class="desktop-sidebar-item" :class="{ active: activeTab === 'home' }" @click="goHome">
          <span class="desktop-sidebar-icon">🏠</span>
          <span>首页</span>
        </div>
        <div class="desktop-sidebar-item" :class="{ active: activeTab === 'topics' }" @click="goTopicLibrary">
          <span class="desktop-sidebar-icon">📚</span>
          <span>话题库</span>
        </div>
        <div class="desktop-sidebar-item" :class="{ active: activeTab === 'debate-records' }" @click="goDebateRecords">
          <span class="desktop-sidebar-icon">⚔️</span>
          <span>辩论记录</span>
        </div>
        <div v-if="!isGuest" class="desktop-sidebar-item" :class="{ active: activeTab === 'profile' }" @click="goProfile">
          <span class="desktop-sidebar-icon">👤</span>
          <span>个人中心</span>
        </div>
      </nav>

      <nav v-if="isAdmin" class="desktop-sidebar-admin">
        <div class="desktop-sidebar-admin-label">管理后台</div>
        <div class="desktop-sidebar-item" :class="{ active: activeTab === 'dashboard' }" @click="goAdmin">
          <span class="desktop-sidebar-icon">📊</span>
          <span>数据概览</span>
        </div>
        <div class="desktop-sidebar-item" :class="{ active: activeTab === 'topic-admin' }" @click="goAdminTopics">
          <span class="desktop-sidebar-icon">📚</span>
          <span>话题管理</span>
        </div>
        <div class="desktop-sidebar-item" :class="{ active: activeTab === 'users' }" @click="goAdminUsers">
          <span class="desktop-sidebar-icon">👥</span>
          <span>用户管理</span>
        </div>
        <div class="desktop-sidebar-item" :class="{ active: activeTab === 'settings' }">
          <span class="desktop-sidebar-icon">⚙️</span>
          <span>系统设置</span>
        </div>
      </nav>

      <div class="desktop-sidebar-user">
        <div class="desktop-sidebar-avatar">{{ user.avatar || '👨‍🎓' }}</div>
        <div class="desktop-sidebar-user-info">
          <div class="desktop-sidebar-user-name">{{ user.username || '小明同学' }}</div>
          <div class="desktop-sidebar-user-level">Lv.{{ level.level }} {{ level.title }}</div>
        </div>
        <button class="desktop-sidebar-logout" @click="logout">退出</button>
      </div>
      </aside>
    </div>
  `,
  data() {
    return {
      user: API.getUserInfo() || {
        username: '小明同学',
        avatar: '👨‍🎓',
        debate_count: 0,
      },
    };
  },
  computed: {
    isAdmin() {
      return this.user.role === 'admin';
    },
    isGuest() {
      return this.user.role === 'guest';
    },
    level() {
      return getUserLevel(this.user.debate_count || 0);
    }
  },
  async mounted() {
    try {
      this.user = await API.getMe();
    } catch (e) {
      console.warn('DesktopSidebar getMe failed:', e.message);
    }
  },
  methods: {
    goHome() {
      this.$router.push('/home');
    },
    goTopicLibrary() {
      this.$router.push('/topic-library');
    },
    goDebateRecords() {
      this.$router.push('/debate-records');
    },
    goProfile() {
      this.$router.push('/profile');
    },
    goAdmin() {
      this.$router.push('/admin');
    },
    goAdminTopics() {
      this.$router.push('/admin/topics');
    },
    goAdminUsers() {
      this.$router.push('/admin/users');
    },
    logout() {
      API.logout();
      this.$router.push('/');
    }
  }
};
