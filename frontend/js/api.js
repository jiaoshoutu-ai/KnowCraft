// API 封装模块
const API = {
  // 获取话题列表
  async getTopics() {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics`);
    if (!response.ok) {
      throw new Error('获取话题列表失败');
    }
    return await response.json();
  },

  // 获取话题详情
  async getTopic(id) {
    const response = await fetch(`${CONFIG.API_BASE}/api/topics/${id}`);
    if (!response.ok) {
      throw new Error('获取话题详情失败');
    }
    return await response.json();
  },

  // 创建 WebSocket 连接
  createWebSocketConnection() {
    return new WebSocket(`${CONFIG.WS_BASE}/ws/debate`);
  }
};
