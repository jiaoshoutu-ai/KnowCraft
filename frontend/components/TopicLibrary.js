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
            <span>7天</span>
          </div>
          <div class="user-avatar" @click="goToProfile">👤</div>
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
      topics: [
        {
          id: 1,
          title: '短视频算法正在"偷走"孩子的时间？',
          description: '探讨短视频推荐算法对青少年的影响，平台、家长、学生、政府各方应承担什么责任。',
          duration: '25分钟',
          tag: '热门',
          tags: ['科技', '教育'],
          views: '12.5k 人观看',
          gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)'
        },
        {
          id: 2,
          title: '学生用 AI 写作业，该不该禁止？',
          description: 'AI 工具的普及让作业变得复杂，学校应该如何应对？技术进步与学术诚信如何平衡？',
          duration: '20分钟',
          tag: '新',
          tags: ['教育', '科技'],
          views: '8.3k 人观看',
          gradient: 'linear-gradient(135deg, #00B894, #55EFC4)'
        },
        {
          id: 3,
          title: '学校禁止带手机，合理吗？',
          description: '多地学校出台手机禁令，学生、家长、教师对此看法不一。自由与管理的边界在哪里？',
          duration: '18分钟',
          tags: ['教育', '社会'],
          views: '15.2k 人观看',
          gradient: 'linear-gradient(135deg, #E17055, #FDCB6E)'
        },
        {
          id: 4,
          title: '网络游戏是"电子海洛因"吗？',
          description: '游戏产业快速发展带来争议，游戏对青少年的影响究竟是正面还是负面？',
          duration: '22分钟',
          tags: ['社会', '青少年'],
          views: '9.8k 人观看',
          gradient: 'linear-gradient(135deg, #0984E3, #74B9FF)'
        },
        {
          id: 5,
          title: '容貌焦虑：社交媒体该背锅吗？',
          description: '滤镜、美颜、精修照片让青少年对自己的外貌越来越不满意，谁该为此负责？',
          duration: '15分钟',
          tags: ['社会', '伦理'],
          views: '7.6k 人观看',
          gradient: 'linear-gradient(135deg, #6C5CE7, #FD79A8)'
        },
        {
          id: 6,
          title: '双减之后，教育公平实现了吗？',
          description: '校外培训被限制后，家庭教育资源差距是否反而加大？减负的真实效果如何？',
          duration: '30分钟',
          tag: '深度',
          tags: ['教育', '社会'],
          views: '11.2k 人观看',
          gradient: 'linear-gradient(135deg, #636E72, #2D3436)'
        },
        {
          id: 7,
          title: '追星有错吗？饭圈文化之辩',
          description: '青少年追星现象普遍存在，打榜、应援、集资，这是热爱还是迷失？',
          duration: '16分钟',
          tags: ['社会', '青少年'],
          views: '13.7k 人观看',
          gradient: 'linear-gradient(135deg, #A29BFE, #DFE6E9)'
        },
        {
          id: 8,
          title: '校园霸凌：谁是旁观者？',
          description: '霸凌事件中，沉默的大多数是否也有责任？如何从根源上杜绝校园霸凌？',
          duration: '28分钟',
          tags: ['教育', '伦理'],
          views: '16.4k 人观看',
          gradient: 'linear-gradient(135deg, #FDCB6E, #E17055)'
        }
      ]
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
