// Login page component
const LoginPage = {
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="status-bar">
          <span class="time">9:41</span>
          <div class="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <div class="login-content">
          <div class="login-logo">
            <div class="login-logo-icon">⚡</div>
            <h1 class="login-title">KnowCraft</h1>
            <p class="login-subtitle">思辨能力训练平台</p>
          </div>

          <!-- Default: Login Options -->
          <div class="login-options" v-if="step === 'options'">
            <button class="login-btn login-btn-email" @click="step = 'email'">
              <span class="login-btn-icon">✉️</span>
              <span>邮箱登录</span>
            </button>

            <button class="login-btn login-btn-wechat" disabled>
              <span class="login-btn-icon">💬</span>
              <span>微信登录（即将上线）</span>
            </button>
          </div>

          <!-- Step: Enter Email -->
          <div class="login-form" v-if="step === 'email'">
            <div class="login-form-group">
              <label class="login-form-label">邮箱地址</label>
              <input
                class="login-form-input"
                type="email"
                v-model="email"
                placeholder="请输入邮箱"
                @keyup.enter="handleSendCode"
              />
            </div>
            <button
              class="login-btn login-btn-primary"
              :disabled="!isValidEmail || sending"
              @click="handleSendCode"
            >
              <span v-if="sending">发送中...</span>
              <span v-else>发送验证码</span>
            </button>
            <p class="login-form-error" v-if="error">{{ error }}</p>
            <button class="login-back-btn" @click="step = 'options'">返回</button>
          </div>

          <!-- Step: Enter Code -->
          <div class="login-form" v-if="step === 'code'">
            <p class="login-form-hint">验证码已发送至 <strong>{{ email }}</strong></p>
            <div class="login-form-group">
              <label class="login-form-label">验证码</label>
              <input
                class="login-form-input login-code-input"
                type="text"
                v-model="code"
                placeholder="请输入 6 位验证码"
                maxlength="6"
                @keyup.enter="handleVerify"
              />
            </div>
            <button
              class="login-btn login-btn-primary"
              :disabled="code.length !== 6 || verifying"
              @click="handleVerify"
            >
              <span v-if="verifying">验证中...</span>
              <span v-else>登录</span>
            </button>
            <p class="login-form-error" v-if="error">{{ error }}</p>
            <div class="login-form-footer">
              <button class="login-back-btn" @click="step = 'email'">更换邮箱</button>
              <button
                class="login-resend-btn"
                :disabled="countdown > 0"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? countdown + 's 后重发' : '重新发送' }}
              </button>
            </div>
          </div>

          <p class="login-terms">
            登录即表示同意<br>
            <span class="login-terms-link">《用户协议》</span>和<span class="login-terms-link">《隐私政策》</span>
          </p>

          <div class="login-skip">
            <button class="login-skip-btn" @click="goHome">
              跳过登录（演示模式）
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      step: 'options',  // 'options' | 'email' | 'code'
      email: '',
      code: '',
      error: '',
      sending: false,
      verifying: false,
      countdown: 0,
      countdownTimer: null,
    };
  },
  computed: {
    isValidEmail() {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    }
  },
  mounted() {
    document.body.classList.add('login-route');
    // If already logged in, redirect to home
    if (API.isLoggedIn()) {
      this.$router.push('/home');
    }
  },
  unmounted() {
    document.body.classList.remove('login-route');
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },
  methods: {
    async handleSendCode() {
      if (!this.isValidEmail) return;
      this.error = '';
      this.sending = true;
      try {
        await API.sendVerificationCode(this.email);
        this.step = 'code';
        this.code = '';
        this.startCountdown();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.sending = false;
      }
    },
    async handleVerify() {
      if (this.code.length !== 6) return;
      this.error = '';
      this.verifying = true;
      try {
        const result = await API.verifyLogin(this.email, this.code);
        API.setToken(result.token);
        API.setUserInfo(result.user);
        this.$router.push('/home');
      } catch (e) {
        this.error = e.message;
      } finally {
        this.verifying = false;
      }
    },
    startCountdown() {
      this.countdown = 60;
      if (this.countdownTimer) clearInterval(this.countdownTimer);
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }
      }, 1000);
    },
    goHome() {
      this.$router.push('/home');
    }
  }
};
