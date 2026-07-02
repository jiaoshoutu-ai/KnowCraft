// Topic detail page component
const TopicDetail = {
  template: `
    <div class="topic-detail-page">
      <!-- Top bar -->
      <div class="top-bar">
        <div>
          <div class="page-title">话题详情</div>
          <div class="page-subtitle">{{ topic.title }}</div>
        </div>
        <div class="top-actions">
          <button class="btn-secondary" @click="goBack">
            <span>←</span>
            <span>返回首页</span>
          </button>
        </div>
      </div>

      <!-- Content container -->
      <div class="detail-content">
        <!-- Video section -->
        <div class="video-section">
          <!-- Bilibili embed -->
          <div v-if="bilibiliId" class="video-player-large">
            <iframe
              :src="'https://player.bilibili.com/player.html?bvid=' + bilibiliId + '&page=1&autoplay=0'"
              class="video-iframe"
              scrolling="no"
              frameborder="no"
              allowfullscreen="true"
            ></iframe>
          </div>
          <!-- Direct video URL -->
          <div v-else-if="topic.video?.url" class="video-player-large">
            <video
              v-if="isDirectVideo"
              :src="topic.video.url"
              class="video-element"
              controls
              preload="metadata"
            ></video>
            <div v-else class="video-placeholder" @click="openVideo">
              <div class="play-button-large">▶️</div>
              <div class="video-duration-badge">{{ topic.video?.duration || '' }}</div>
              <div class="video-open-hint">点击在浏览器中打开视频</div>
            </div>
          </div>
          <!-- No video -->
          <div v-else class="video-player-large video-placeholder">
            <div class="play-button-large">🎬</div>
            <div style="color: white; font-size: 14px; opacity: 0.7; margin-top: 12px;">暂无视频</div>
          </div>

          <div class="video-info">
            <h1 class="video-title">{{ topic.title }}</h1>

            <div class="video-description">
              {{ topic.summary }}
            </div>

            <!-- Key points from debate topics -->
            <div v-if="topic.debate_topics && topic.debate_topics.length > 0" class="key-points-section">
              <div class="key-points-title">🔑 关键争议点</div>
              <div class="key-points-list">
                <div v-for="dt in topic.debate_topics" :key="dt.id" class="key-point-item">
                  {{ dt.title }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats section -->
        <div class="stats-section">
          <div class="stats-title">📊 话题数据</div>
          <div class="stats-grid">
            <div class="stat-card-mini">
              <div class="stat-label-mini">观看人数</div>
              <div class="stat-value-mini">{{ formatNumber(topic.view_count || 12500) }}</div>
            </div>
            <div class="stat-card-mini">
              <div class="stat-label-mini">辩论次数</div>
              <div class="stat-value-mini">{{ formatNumber(topic.debate_count || 3200) }}</div>
            </div>
            <div class="stat-card-mini">
              <div class="stat-label-mini">平均得分</div>
              <div class="stat-value-mini">7.8</div>
            </div>
            <div class="stat-card-mini">
              <div class="stat-label-mini">视频时长</div>
              <div class="stat-value-mini">{{ topic.video?.duration || '25分钟' }}</div>
            </div>
          </div>
        </div>

        <!-- Debate topics preview -->
        <div class="debate-topics-preview">
          <div class="preview-title">⚔️ 可选辩题（{{ topic.debate_topics?.length || 0 }} 个）</div>
          <div class="preview-list">
            <div v-for="(dt, index) in topic.debate_topics" :key="dt.id" class="preview-item">
              <div class="preview-number">{{ index + 1 }}</div>
              <div class="preview-content">
                <div class="preview-item-title">{{ dt.title }}</div>
                <div class="preview-item-count">👥 {{ dt.participant_count || 0 }} 人参与</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action button -->
        <div class="action-section">
          <button class="btn-primary-large" @click="startDebate">
            开始辩论
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      topic: {}
    }
  },

  computed: {
    bilibiliId() {
      const url = this.topic.video?.url || ''
      const match = url.match(/BV[a-zA-Z0-9]+/)
      return match ? match[0] : null
    },
    isDirectVideo() {
      const url = this.topic.video?.url || ''
      return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
    }
  },

  async mounted() {
    const topicId = this.$route.params.id
    try {
      this.topic = await API.getTopic(topicId)
    } catch (err) {
      console.error('Failed to load topic:', err)
      alert('加载话题失败')
      this.goBack()
    }
  },

  methods: {
    goBack() {
      this.$router.push('/')
    },

    startDebate() {
      this.$router.push(`/vote/${this.topic.id}`)
    },

    openVideo() {
      if (this.topic.video?.url) {
        window.open(this.topic.video.url, '_blank')
      }
    },

    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    }
  }
}
