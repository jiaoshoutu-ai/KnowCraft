// API module
const API = {
  async getTopics() {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics`);
    if (!response.ok) {
      throw new Error('获取话题列表失败');
    }
    return await response.json();
  },

  async getTopic(id) {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics/${id}`);
    if (!response.ok) {
      throw new Error('获取话题详情失败');
    }
    return await response.json();
  },

  // Admin API methods
  async getAllTopics(includeUnpublished = true) {
    const url = includeUnpublished
      ? `${CONFIG.API_BASE}/api/topics?include_unpublished=true`
      : `${CONFIG.API_BASE}/api/topics`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('获取全部话题失败');
    }
    return await response.json();
  },

  async createTopic(topicData) {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData)
    });
    if (!response.ok) {
      throw new Error('创建话题失败');
    }
    return await response.json();
  },

  async updateTopic(topicId, topicData) {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics/${topicId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData)
    });
    if (!response.ok) {
      throw new Error('更新话题失败');
    }
    return await response.json();
  },

  async deleteTopic(topicId) {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics/${topicId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('删除话题失败');
    }
    return await response.json();
  },

  // AI generate debate topics from transcript
  async generateDebateTopics(transcript, numTopics = 3) {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: transcript,
        num_topics: numTopics
      })
    });
    if (!response.ok) {
      throw new Error('生成辩题失败');
    }
    return await response.json();
  },

  // WebSocket connection
  createWebSocketConnection() {
    return new WebSocket(`${CONFIG.WS_BASE}/ws/debate`);
  }
};
