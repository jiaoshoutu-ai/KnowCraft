// Login page component
const LoginPage = {
  template: `
    <div class="login-page">
      <!-- Status Bar -->
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="icons">
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <div class="login-content">
        <!-- Logo -->
        <div class="login-logo">
          <div class="login-logo-icon">⚡</div>
          <h1 class="login-title">KnowCraft</h1>
          <p class="login-subtitle">思辨能力训练平台</p>
        </div>

        <!-- Login Options -->
        <div class="login-options">
          <!-- WeChat Login -->
          <button class="login-btn login-btn-wechat" @click="goHome">
            <span class="login-btn-icon">💬</span>
            <span>微信登录</span>
          </button>

          <!-- Apple ID Login -->
          <button class="login-btn login-btn-apple" @click="goHome">
            <span class="login-btn-icon">🍎</span>
            <span>Apple 登录</span>
          </button>

          <!-- Phone Number Login -->
          <button class="login-btn login-btn-phone" @click="goHome">
            <span class="login-btn-icon">📱</span>
            <span>手机号登录</span>
          </button>
        </div>

        <!-- Terms -->
        <p class="login-terms">
          登录即表示同意<br>
          <span class="login-terms-link">《用户协议》</span>和<span class="login-terms-link">《隐私政策》</span>
        </p>

        <!-- Skip for demo -->
        <div class="login-skip">
          <button class="login-skip-btn" @click="goHome">
            跳过登录（演示模式）
          </button>
        </div>
      </div>
    </div>
  `,
  methods: {
    goHome() {
      this.$router.push('/home');
    }
  }
};
