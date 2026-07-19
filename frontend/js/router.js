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

// Route guard — require login for all routes except the login page ('/')
router.beforeEach((to, from, next) => {
  const publicRoutes = ['/'];
  if (!publicRoutes.includes(to.path) && !API.isLoggedIn()) {
    next('/');
    return;
  }

  if (to.path.startsWith('/admin')) {
    const user = API.getUserInfo();
    if (!user || user.role !== 'admin') {
      next('/home');
      return;
    }
  }

  next();
});

