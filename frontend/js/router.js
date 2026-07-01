// Vue Router 配置
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
    path: '/angle/:topicId/:stanceIndex',
    component: AngleSelect
  },
  {
    path: '/difficulty/:topicId/:stanceIndex/:angleIndex',
    component: DifficultySelect
  },
  {
    path: '/debate/:topicId/:stanceIndex/:angleIndex/:difficultyIndex',
    component: DebatePage
  },
  {
    path: '/feedback/:topicId/:stanceIndex/:angleIndex/:difficultyIndex',
    component: FeedbackPage
  },
  {
    path: '/profile',
    component: ProfilePage
  }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});
