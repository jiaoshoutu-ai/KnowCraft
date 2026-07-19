// Vue 应用初始化
const app = Vue.createApp({});

// 全局组件
app.component('DesktopSidebar', DesktopSidebar);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
