// Vue Router configuration
const routes = [
  {
    path: '/',
    component: LoginPage
  },
  {
    path: '/home',
    component: HomePage
  },
  {
    path: '/topic-library',
    component: TopicLibrary
  },
  {
    path: '/topic/:id',
    component: TopicDetail
  },
  {
    path: '/vote/:topicId',
    component: VotePage
  },
  {
    path: '/debate/:topicId/:debateTopicId/:userStance/:difficulty',
    component: DebatePage
  },
  {
    path: '/feedback/session/:sessionId',
    component: FeedbackPage
  },
  {
    path: '/feedback/:topicId/:debateTopicId/:userStance/:difficulty',
    component: FeedbackPage
  },
  {
    path: '/profile',
    component: ProfilePage
  },
  {
    path: '/debate-records',
    component: DebateRecordsPage
  },
  // Admin routes
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        component: AdminDashboard
      },
      {
        path: 'topics',
        component: AdminTopicList
      },
      {
        path: 'topics/create',
        component: AdminTopicForm
      },
      {
        path: 'topics/edit/:topicId',
        component: AdminTopicForm
      },
      {
        path: 'users',
        component: AdminUsersPage
      }
    ]
  }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});

// Route guard — guests can browse, debate, and view their own debate records.
router.beforeEach((to, from, next) => {
  const user = API.getUserInfo();

  if (to.path.startsWith('/admin')) {
    if (!API.isLoggedIn() || !user || user.role !== 'admin') {
      next('/home');
      return;
    }
  }

  if (to.path === '/profile' && (!API.isLoggedIn() || !user || user.role === 'guest')) {
    next('/home');
    return;
  }

  if (to.path === '/debate-records' && !API.isLoggedIn()) {
    alert('请先进入游客模式或绑定邮箱后查看辩论记录');
    next('/');
    return;
  }

  next();
});

