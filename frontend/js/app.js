// Vue 应用初始化
const app = Vue.createApp({});

const cachedUser = API.getUserInfo();
if (API.isLoggedIn() && cachedUser && cachedUser.role === 'guest') {
  const hasActiveGuestSession = sessionStorage.getItem('knowcraft_guest_session_active');
  if (!hasActiveGuestSession) {
    API.logout({ keepalive: true });
  }
}

// 全局组件
app.component('DesktopSidebar', DesktopSidebar);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
