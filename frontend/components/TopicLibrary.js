// Topic Library page component
const TopicLibrary = {
  template: `
    <div class="topic-library-page">
      <!-- iPad Top Nav (visible on iPad only) -->
      <div class="ipad-top-nav">
        <div class="logo">
          <span>⚡</span>
          <span>KnowCraft</span>
        </div>
        <div class="nav-tabs">
          <div class="nav-tab" @click="goHome">
            <span class="nav-tab-icon">🏠</span>
            <span>首页</span>
          </div>
          <div class="nav-tab active">
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

      <!-- iPad Page Header -->
      <div class="ipad-page-header">
        <div class="page-title">话题库</div>
        <div class="page-subtitle">探索所有辩题，选择你感兴趣的话题</div>
      </div>

      <!-- Mobile Status Bar (hidden on iPad) -->
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="icons">
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <!-- Mobile Nav Bar (hidden on iPad) -->
      <div class="nav-bar">
        <div class="nav-back" @click="goHome">←</div>
        <div class="nav-title">话题库</div>
      </div>

      <!-- Content Area -->
      <div class="topic-library-content">
        <!-- Search & Filter Card -->
        <div class="topic-library-search-card">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="搜索话题..." v-model="searchQuery" class="search-input">
          </div>
          <button class="filter-btn">筛选</button>
        </div>

        <!-- Filter Tags -->
        <div class="topic-library-filters">
          <div
            v-for="tag in filterTags"
            :key="tag"
            :class="['filter-tag', { active: selectedTag === tag }]"
            @click="selectedTag = tag"
          >{{ tag }}</div>
        </div>

        <!-- Topic Count -->
        <div class="topic-library-count">
          共 <span class="count-number">{{ filteredTopics.length }}</span> 个话题
        </div>

        <!-- Topics List -->
        <div class="topic-library-list">
          <div
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="topic-card"
            @click="goToTopic(topic)"
          >
            <div class="topic-thumbnail" :style="{ background: topic.gradient }">
              <div class="play-button">▶️</div>
              <div class="topic-duration">{{ topic.duration }}</div>
              <div v-if="topic.tag" class="topic-tag">{{ topic.tag }}</div>
            </div>
            <div class="topic-info">
              <div class="topic-title">{{ topic.title }}</div>
              <div class="topic-description">{{ topic.description }}</div>
              <div class="topic-meta">
                <span v-for="t in topic.tags" :key="t" class="topic-tag-small">{{ t }}</span>
                <span class="topic-stats">{{ topic.views }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Nav (hidden on iPad) -->
      <div class="bottom-nav">
        <div class="nav-item" @click="goHome">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">首页</span>
        </div>
        <div class="nav-item active">
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
      searchQuery: '',
      selectedTag: '全部',
      filterTags: ['全部', '科技', '教育', '社会', '伦理', '青少年', '心理', '文化'],
      topics: [],
      user: API.getUserInfo() || { avatar: '', streak_days: 0 },
    };
  },
  computed: {
    filteredTopics() {
      let result = this.topics;
      if (this.selectedTag !== '全部') {
        result = result.filter(t => t.tags.includes(this.selectedTag));
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        result = result.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return result;
    }
  },
  async mounted() {
    try {
      this.user = await API.getMe();
    } catch (e) {
      console.warn('getMe failed:', e.message);
    }
    try {
      const data = await API.getTopics();
      const gradients = [
        'linear-gradient(135deg, #6C5CE7, #A29BFE)',
        'linear-gradient(135deg, #00B894, #55EFC4)',
        'linear-gradient(135deg, #E17055, #FDCB6E)',
        'linear-gradient(135deg, #0984E3, #74B9FF)',
        'linear-gradient(135deg, #6C5CE7, #FD79A8)',
        'linear-gradient(135deg, #636E72, #2D3436)',
        'linear-gradient(135deg, #A29BFE, #DFE6E9)',
        'linear-gradient(135deg, #FDCB6E, #E17055)',
      ];
      this.topics = data.map((t, i) => ({
        id: t.id,
        title: t.title,
        description: t.summary || '',
        duration: t.video?.duration || '未知',
        tag: t.tags?.[0] || '',
        tags: t.tags || [],
        views: t.view_count
          ? (t.view_count >= 1000
              ? `${(t.view_count / 1000).toFixed(1)}k 人观看`
              : `${t.view_count} 人观看`)
          : '0 人观看',
        gradient: gradients[i % gradients.length],
      }));
    } catch (err) {
      console.error('Failed to load topics:', err);
      this.topics = [];
    }
  },
  methods: {
    goHome() {
      this.$router.push('/home');
    },
    goToProfile() {
      this.$router.push('/profile');
    },
    goToTopic(topic) {
      this.$router.push('/topic/' + topic.id);
    }
  }
};
