// Admin Topic Create/Edit Page
const AdminTopicForm = {
  template: `
    <div class="admin-page">
      <div class="admin-container">
        <!-- Header -->
        <div class="admin-header">
          <router-link to="/admin/topics" class="back-link">← 返回话题列表</router-link>
          <h1>{{ isEdit ? '编辑话题' : '新增话题' }}</h1>
        </div>

        <form @submit.prevent="submitForm" class="admin-form">
          <!-- Basic Info Section -->
          <div class="form-section">
            <h2>📝 基本信息</h2>
            <div class="form-row">
              <div class="form-group">
                <label>话题标题 <span class="required">*</span></label>
                <input v-model="form.title" type="text" placeholder="例如：短视频算法对孩子的危害" required />
              </div>
              <div class="form-group">
                <label>内容来源 <span class="required">*</span></label>
                <select v-model="form.source" required>
                  <option value="">请选择来源</option>
                  <option value="新闻1+1">新闻1+1</option>
                  <option value="焦点访谈">焦点访谈</option>
                  <option value="今日说法">今日说法</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>话题简介 <span class="required">*</span></label>
              <textarea v-model="form.summary" placeholder="简要描述这个话题核心内容和争议焦点（100-200字）" rows="4" required></textarea>
              <div class="char-count">{{ form.summary.length }}/200</div>
            </div>

            <div class="form-group">
              <label>分类标签</label>
              <div class="tag-input">
                <input v-model="newTag" type="text" placeholder="输入标签后按回车添加" @keydown.enter.prevent="addTag" />
                <button type="button" @click="addTag" class="btn-tag-add">+ 添加</button>
              </div>
              <div class="tag-list">
                <span v-for="(tag, index) in form.tags" :key="index" class="tag-item">
                  {{ tag }}
                  <button type="button" @click="removeTag(index)" class="tag-remove">×</button>
                </span>
              </div>
            </div>
          </div>

          <!-- Video Section -->
          <div class="form-section">
            <h2>🎬 视频信息</h2>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>视频链接 <span class="required">*</span></label>
                <input v-model="form.video.url" type="url" placeholder="https://www.bilibili.com/video/..." required />
              </div>
              <div class="form-group flex-1">
                <label>视频时长</label>
                <input v-model="form.video.duration" type="text" placeholder="例如：25min" />
              </div>
            </div>
            <div class="form-group">
              <label>封面图片 URL</label>
              <input v-model="form.video.cover" type="url" placeholder="https://example.com/cover.jpg" />
              <div v-if="form.video.cover" class="cover-preview">
                <img :src="form.video.cover" alt="封面预览" />
              </div>
            </div>

            <!-- Transcript Section -->
            <div class="form-group">
              <label>视频转写文本</label>
              <div class="transcript-header">
                <span class="hint-text">粘贴视频的语音转写文本，可用于 AI 自动生成辩题</span>
                <button type="button" @click="generateFromTranscript" :disabled="!form.video.transcript || generating" class="btn-ai-generate">
                  {{ generating ? '⏳ 生成中...' : '🤖 AI 一键生成' }}
                </button>
              </div>
              <textarea v-model="form.video.transcript" placeholder="粘贴视频转写文本...（建议 500 字以上以获得更好的生成效果）" rows="8"></textarea>
              <div class="char-count">{{ form.video.transcript.length }} 字</div>
            </div>
          </div>

          <!-- Debate Topics Section -->
          <div class="form-section">
            <h2>⚔️ 辩题配置</h2>
            <p class="section-desc">每个话题至少需要 2 个辩题，每个辩题需要正方和反方立场</p>

            <div v-for="(dt, index) in form.debate_topics" :key="index" class="debate-topic-item">
              <div class="debate-topic-header">
                <span class="debate-topic-num">辩题 {{ index + 1 }}</span>
                <button type="button" @click="removeDebateTopic(index)" class="btn-remove" :disabled="form.debate_topics.length <= 1">
                  🗑️ 删除
                </button>
              </div>

              <div class="form-group">
                <label>辩题标题 <span class="required">*</span></label>
                <input v-model="dt.title" type="text" placeholder="以问句形式，例如：短视频平台是否应该为青少年沉迷承担主要责任？" required />
              </div>

              <div class="stance-row">
                <div class="form-group stance-pro">
                  <label>👍 正方立场 <span class="required">*</span></label>
                  <textarea v-model="dt.pro_stance" placeholder="正方观点描述（50-100字）" rows="3" required></textarea>
                </div>
                <div class="form-group stance-con">
                  <label>👎 反方立场 <span class="required">*</span></label>
                  <textarea v-model="dt.con_stance" placeholder="反方观点描述（50-100字）" rows="3" required></textarea>
                </div>
              </div>
            </div>

            <button type="button" @click="addDebateTopic" class="btn-add-debate">
              + 添加辩题
            </button>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" @click="saveDraft" class="btn-secondary">
              💾 保存草稿
            </button>
            <button type="submit" class="btn-primary">
              {{ isEdit ? '✅ 更新话题' : '🚀 发布话题' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,

  data() {
    return {
      isEdit: false,
      topicId: null,
      loading: false,
      generating: false,
      newTag: '',
      form: {
        title: '',
        source: '',
        summary: '',
        tags: [],
        video: {
          url: '',
          duration: '',
          cover: '',
          transcript: ''
        },
        debate_topics: [
          { title: '', pro_stance: '', con_stance: '' },
          { title: '', pro_stance: '', con_stance: '' }
        ],
        is_published: false
      }
    }
  },

  async mounted() {
    const routeTopicId = this.$route.params.topicId
    if (routeTopicId) {
      this.isEdit = true
      this.topicId = routeTopicId
      await this.loadTopic()
    }
  },

  methods: {
    async loadTopic() {
      this.loading = true
      try {
        const topic = await API.getTopic(this.topicId)
        this.form = {
          title: topic.title,
          source: topic.source,
          summary: topic.summary,
          tags: topic.tags || [],
          video: {
            url: topic.video?.url || '',
            duration: topic.video?.duration || '',
            cover: topic.video?.cover || '',
            transcript: topic.video?.transcript || ''
          },
          debate_topics: topic.debate_topics?.map(dt => ({
            title: dt.title,
            pro_stance: dt.pro_stance,
            con_stance: dt.con_stance
          })) || [{ title: '', pro_stance: '', con_stance: '' }],
          is_published: topic.is_published
        }
      } catch (err) {
        console.error('Failed to load topic:', err)
        alert('加载话题失败')
      } finally {
        this.loading = false
      }
    },

    addTag() {
      const tag = this.newTag.trim()
      if (tag && !this.form.tags.includes(tag)) {
        this.form.tags.push(tag)
        this.newTag = ''
      }
    },

    removeTag(index) {
      this.form.tags.splice(index, 1)
    },

    addDebateTopic() {
      this.form.debate_topics.push({ title: '', pro_stance: '', con_stance: '' })
    },

    removeDebateTopic(index) {
      if (this.form.debate_topics.length > 1) {
        this.form.debate_topics.splice(index, 1)
      }
    },

    async generateFromTranscript() {
      if (!this.form.video.transcript || this.generating) return

      this.generating = true
      try {
        const result = await API.generateDebateTopics(this.form.video.transcript, 3)

        if (result.debate_topics && result.debate_topics.length > 0) {
          // Replace empty debate topics with generated ones
          this.form.debate_topics = result.debate_topics.map(dt => ({
            title: dt.title,
            pro_stance: dt.pro_stance,
            con_stance: dt.con_stance
          }))

          // Auto-generate summary if empty
          if (!this.form.summary) {
            this.form.summary = this.generateSummaryFromTranscript()
          }

          alert(`✅ 成功生成 ${result.debate_topics.length} 个辩题！`)
        }
      } catch (err) {
        console.error('Failed to generate debate topics:', err)
        alert('AI 生成失败，请稍后重试')
      } finally {
        this.generating = false
      }
    },

    generateSummaryFromTranscript() {
      // Simple summary: first 150 chars of transcript
      const text = this.form.video.transcript.trim()
      if (text.length > 150) {
        return text.substring(0, 150) + '...'
      }
      return text
    },

    validateForm() {
      if (!this.form.title.trim()) {
        alert('请输入话题标题')
        return false
      }
      if (!this.form.source) {
        alert('请选择内容来源')
        return false
      }
      if (!this.form.summary.trim()) {
        alert('请输入话题简介')
        return false
      }
      if (!this.form.video.url.trim()) {
        alert('请输入视频链接')
        return false
      }

      // Validate debate topics
      for (let i = 0; i < this.form.debate_topics.length; i++) {
        const dt = this.form.debate_topics[i]
        if (!dt.title.trim()) {
          alert(`辩题 ${i + 1} 的标题不能为空`)
          return false
        }
        if (!dt.pro_stance.trim()) {
          alert(`辩题 ${i + 1} 的正方立场不能为空`)
          return false
        }
        if (!dt.con_stance.trim()) {
          alert(`辩题 ${i + 1} 的反方立场不能为空`)
          return false
        }
      }

      return true
    },

    async saveDraft() {
      this.form.is_published = false
      await this.doSubmit()
    },

    async submitForm() {
      if (!this.validateForm()) return
      this.form.is_published = true
      await this.doSubmit()
    },

    async doSubmit() {
      this.loading = true
      try {
        if (this.isEdit) {
          await API.updateTopic(this.topicId, this.form)
          alert('✅ 话题更新成功！')
        } else {
          await API.createTopic(this.form)
          alert('✅ 话题创建成功！')
          this.$router.push('/admin/topics')
        }
      } catch (err) {
        console.error('Failed to save topic:', err)
        alert('保存失败：' + err.message)
      } finally {
        this.loading = false
      }
    }
  }
}
