// API module
const API = {
  // Internal fetch helper — auto-attaches Authorization header when a token exists
  async _fetch(url, options = {}) {
    const token = this.getToken();
    const headers = Object.assign({}, options.headers || {});
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      // Token invalid / expired — force logout
      this.logout();
      if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
        window.location.hash = '#/';
      }
      throw new Error('登录已过期，请重新登录');
    }
    return response;
  },

  async getTopics() {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/topics`);
    if (!response.ok) {
      throw new Error('获取话题列表失败');
    }
    return await response.json();
  },

  async getTopic(id) {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/topics/${id}`);
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
    const response = await this._fetch(url);
    if (!response.ok) {
      throw new Error('获取全部话题失败');
    }
    return await response.json();
  },

  async createTopic(topicData) {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/topics`, {
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
    const response = await this._fetch(`${CONFIG.API_BASE}/api/topics/${topicId}`, {
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
    const response = await this._fetch(`${CONFIG.API_BASE}/api/topics/${topicId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('删除话题失败');
    }
    return await response.json();
  },

  // AI generate debate topics from transcript
  async generateDebateTopics(transcript, numTopics = 3) {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/topics/generate`, {
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

  // WebSocket connection — passes token as query param for auth
  createWebSocketConnection() {
    const token = this.getToken();
    const url = token
      ? `${CONFIG.WS_BASE}/ws/debate?token=${encodeURIComponent(token)}`
      : `${CONFIG.WS_BASE}/ws/debate`;
    return new WebSocket(url);
  },

  // Auth API methods (these don't need auth header)
  async sendVerificationCode(email) {
    const response = await fetch(`${CONFIG.API_BASE}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || '发送验证码失败');
    }
    return await response.json();
  },

  async verifyLogin(email, code) {
    const response = await fetch(`${CONFIG.API_BASE}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || '验证失败');
    }
    return await response.json();
  },

  // Current user (authenticated) APIs
  async getMe() {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/auth/me`);
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    const user = await response.json();
    // Keep local cache in sync
    this.setUserInfo(user);
    return user;
  },

  async getHistory() {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/users/me/history`);
    if (!response.ok) {
      throw new Error('获取辩论历史失败');
    }
    return await response.json();
  },

  async getHistoryDetail(sessionId) {
    const response = await this._fetch(
      `${CONFIG.API_BASE}/api/users/me/history/${encodeURIComponent(sessionId)}`
    );
    if (!response.ok) {
      throw new Error('获取辩论详情失败');
    }
    return await response.json();
  },

  async updateProfile(data) {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/users/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || '更新资料失败');
    }
    const user = await response.json();
    this.setUserInfo(user);
    return user;
  },

  async getAdminUsers() {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/users/admin/users`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || '获取用户列表失败');
    }
    return await response.json();
  },

  async updateAdminUserRole(userId, role) {
    const response = await this._fetch(`${CONFIG.API_BASE}/api/users/admin/users/${encodeURIComponent(userId)}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || '更新用户权限失败');
    }
    return await response.json();
  },

  // Token helpers
  getToken() {
    return localStorage.getItem('knowcraft_token');
  },

  setToken(token) {
    localStorage.setItem('knowcraft_token', token);
  },

  setUserInfo(user) {
    localStorage.setItem('knowcraft_user', JSON.stringify(user));
  },

  getUserInfo() {
    const data = localStorage.getItem('knowcraft_user');
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem('knowcraft_token');
    localStorage.removeItem('knowcraft_user');
  },

  isLoggedIn() {
    return !!this.getToken();
  }
};

// Level helper — derive user level from debate_count
function getUserLevel(debateCount) {
  const levels = [
    { min: 0,  level: 1, title: '新手辩手' },
    { min: 5,  level: 2, title: '初级辩手' },
    { min: 12, level: 3, title: '进阶辩手' },
    { min: 25, level: 4, title: '高级辩手' },
    { min: 50, level: 5, title: '辩论大师' },
  ];
  return [...levels].reverse().find(l => debateCount >= l.min) || levels[0];
}

