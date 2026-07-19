// Topic detail page component
const TopicDetail = {
  template: `
    <div class="topic-detail-page">
      <DesktopSidebar active-tab="topics"></DesktopSidebar>
      <!-- Nav bar with back arrow and title -->
      <div class="nav-bar">
        <div class="nav-back" @click="goBack">←</div>
        <div class="nav-title">话题详情</div>
      </div>

      <!-- Video player -->
      <div class="video-player">
        <!-- Bilibili embed -->
        <iframe
          src="https://player.bilibili.com/player.html?isOutside=true&aid=116746019148801&bvid=BV1s1Jc6FEh5&cid=39102122405&p=1&autoplay=0"
          style="width:100%;height:100%;border:none;"
          scrolling="no"
          frameborder="no"
          framespacing="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen="true"
        ></iframe>
        <button
          v-if="bilibiliId"
          class="video-open-link"
          type="button"
          @click="openVideo"
        >
          新窗口打开
        </button>
        <!-- Direct video URL -->
        <video
          v-else-if="isDirectVideo"
          :src="topic.video && topic.video.url"
          style="width:100%;height:100%;object-fit:contain;"
          controls
          preload="metadata"
        ></video>
        <!-- Placeholder for external video links -->
        <div v-else-if="topic.video && topic.video.url" class="video-placeholder" @click="openVideo">
          <div class="big-play">▶️</div>
          <div class="video-label">{{ topic.video.duration || '' }}</div>
        </div>
        <!-- No video -->
        <div v-else class="video-placeholder">
          <div class="big-play">🎬</div>
          <div class="video-label">暂无视频</div>
        </div>
      </div>

      <!-- Video info section -->
      <div class="video-info">
        <div class="video-title">{{ topic.title }}</div>
        <div class="video-summary">{{ topic.summary }}</div>

        <!-- Key points with full descriptions -->
        <div v-if="topic.debate_topics && topic.debate_topics.length > 0" class="key-points">
          <div class="key-points-title">🔑 关键争议点</div>
          <div class="key-points-list">
            <div v-for="dt in topic.debate_topics" :key="dt.id" class="key-point">
              {{ dt.description || dt.title }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action button -->
      <div style="padding: 0 24px 24px;">
        <button class="btn btn-primary" @click="startDebate">开始辩论</button>
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
      this.$router.push('/home')
    },

    startDebate() {
      this.$router.push(`/vote/${this.topic.id}`)
    },

    openVideo() {
      if (this.topic.video?.url) {
        window.open(this.topic.video.url, '_blank')
      }
    }
  }
}
