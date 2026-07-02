// Vue Router configuration
const routes = [
  {
    path: '/',
    component: HomePage
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
    path: '/feedback/:topicId/:debateTopicId/:userStance/:difficulty',
    component: FeedbackPage
  },
  {
    path: '/profile',
    component: ProfilePage
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
      }
    ]
  }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});
