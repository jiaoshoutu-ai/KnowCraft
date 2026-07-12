// Profile page component
const ProfilePage = {
  template: `
    <div class="phone-frame">
      <div class="screen-container">
        <!-- Status bar -->
        <div class="status-bar">
          <span class="time">9:41</span>
          <div class="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <!-- Nav bar -->
        <div class="nav-bar">
          <div class="nav-back" @click="goBack">←</div>
          <div class="nav-title">我的</div>
          <div class="nav-action" @click="logout">退出</div>
        </div>

        <!-- Centered profile header: avatar above, name below -->
        <div class="profile-header">
          <div class="profile-avatar">{{ user.avatar || '👤' }}</div>
          <div class="profile-name">{{ user.username || '用户' }}</div>
          <div class="profile-level">Lv.{{ level.level }} {{ level.title }}</div>
        </div>

        <!-- Stats card overlapping header -->
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="profile-stat-value">{{ user.debate_count }}</div>
            <div class="profile-stat-label">完成辩论</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">{{ avgScoreText }}</div>
            <div class="profile-stat-label">平均得分</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">{{ user.streak_days }}天</div>
            <div class="profile-stat-label">连续打卡</div>
          </div>
        </div>

        <!-- Badges section -->
        <div class="badges-section">
          <div class="section-header">
            <div class="section-title">🏆 成就徽章</div>
          </div>

          <div class="badges-grid">
            <div v-for="(badge, index) in badges" :key="index"
                 class="badge-card" :class="{ locked: !badge.unlocked }">
              <div class="badge-icon">{{ badge.icon }}</div>
              <div class="badge-name">{{ badge.name }}</div>
            </div>
          </div>
        </div>

        <!-- Spacer for bottom nav -->
        <div style="height: 100px;"></div>

        <!-- Bottom navigation -->
        <div class="bottom-nav">
          <div class="nav-item" @click="goHome">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">首页</span>
          </div>
          <div class="nav-item" @click="goTopicLibrary">
            <span class="nav-icon">📚</span>
            <span class="nav-label">话题库</span>
          </div>
          <div class="nav-item">
            <span class="nav-icon">⚔️</span>
            <span class="nav-label">我的辩论</span>
          </div>
          <div class="nav-item active">
            <span class="nav-icon">👤</span>
            <span class="nav-label">我的</span>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      user: API.getUserInfo() || {
        username: '用户',
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
    badges() {
      const c = this.user.debate_count || 0;
      const s = this.user.streak_days || 0;
      return [
        { icon: '🌟', name: '初出茅庐',  unlocked: c >= 1 },
        { icon: '🔥', name: '连续7天',   unlocked: s >= 7 },
        { icon: '⚡', name: '进阶辩手',  unlocked: c >= 12 },
        { icon: '👑', name: '辩论之王',  unlocked: c >= 25 },
        { icon: '💎', name: '完美辩手',  unlocked: c >= 50 },
        { icon: '🏅', name: '百人斩',    unlocked: c >= 100 },
      ];
    },
  },

  async mounted() {
    try {
      this.user = await API.getMe();
    } catch (e) {
      console.warn('getMe failed:', e.message);
    }
  },

  methods: {
    goBack() {
      this.$router.push('/home')
    },
    goHome() {
      this.$router.push('/home')
    },
    goTopicLibrary() {
      this.$router.push('/topic-library')
    },
    logout() {
      API.logout();
      this.$router.push('/');
    },
  }
}
