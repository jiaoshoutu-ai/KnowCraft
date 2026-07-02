// Admin Topic List Page
const AdminTopicList = {
  template: `
    <div class="admin-page">
      <div class="admin-container">
        <!-- Header -->
        <div class="admin-header">
          <h1>话题管理</h1>
          <router-link to="/admin/topics/create" class="btn-primary">
            + 新增话题
          </router-link>
        </div>

        <!-- Stats -->
        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-label">已发布话题</div>
            <div class="stat-value">{{ publishedCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">草稿</div>
            <div class="stat-value">{{ draftCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">总辩论次数</div>
            <div class="stat-value">{{ totalDebates }}</div>
          </div>
        </div>

        <!-- Topic Table -->
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>话题</th>
                <th>来源</th>
                <th>辩题数</th>
                <th>观看</th>
                <th>辩论</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="topic in topics" :key="topic.id">
                <td>
                  <div class="topic-title">{{ topic.title }}</div>
                  <div class="topic-tags">
                    <span v-for="tag in topic.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                </td>
                <td>{{ topic.source }}</td>
                <td>{{ topic.debate_topic_count }}</td>
                <td>{{ formatCount(topic.view_count) }}</td>
                <td>{{ formatCount(topic.debate_count) }}</td>
                <td>
                  <span class="status-badge" :class="topic.is_published ? 'published' : 'draft'">
                    {{ topic.is_published ? '已发布' : '草稿' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <router-link :to="'/admin/topics/edit/' + topic.id" class="btn-sm btn-edit">
                      编辑
                    </router-link>
                    <button @click="togglePublish(topic)" class="btn-sm btn-toggle">
                      {{ topic.is_published ? '下线' : '发布' }}
                    </button>
                    <button @click="deleteTopic(topic)" class="btn-sm btn-danger">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="topics.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无话题</p>
          <router-link to="/admin/topics/create" class="btn-primary">
            创建第一个话题
          </router-link>
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

  computed: {
    publishedCount() {
      return this.topics.filter(t => t.is_published).length
    },
    draftCount() {
      return this.topics.filter(t => !t.is_published).length
    },
    totalDebates() {
      return this.topics.reduce((sum, t) => sum + t.debate_count, 0)
    }
  },

  async mounted() {
    await this.loadTopics()
  },

  methods: {
    async loadTopics() {
      this.loading = true
      try {
        this.topics = await API.getAllTopics(true)
      } catch (err) {
        console.error('Failed to load topics:', err)
        alert('加载话题失败')
      } finally {
        this.loading = false
      }
    },

    async togglePublish(topic) {
      try {
        await API.updateTopic(topic.id, {
          is_published: !topic.is_published
        })
        topic.is_published = !topic.is_published
      } catch (err) {
        console.error('Failed to toggle publish:', err)
        alert('操作失败')
      }
    },

    async deleteTopic(topic) {
      if (!confirm(`确定要删除话题「${topic.title}」吗？此操作不可恢复。`)) {
        return
      }
      try {
        await API.deleteTopic(topic.id)
        this.topics = this.topics.filter(t => t.id !== topic.id)
      } catch (err) {
        console.error('Failed to delete topic:', err)
        alert('删除失败')
      }
    },

    formatCount(num) {
      return num ? num.toLocaleString() : '0'
    }
  }
}
