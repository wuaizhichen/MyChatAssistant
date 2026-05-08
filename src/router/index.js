import Vue from 'vue'
import VueRouter from 'vue-router'
import ChatLayout from '@/views/ChatLayout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: ChatLayout,
    redirect: '/chat',
    children: [
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/ChatMain.vue'),
        meta: { title: '聊天' }
      },
      {
        path: 'chat/:id',
        name: 'ChatDetail',
        component: () => import('@/views/ChatMain.vue'),
        meta: { title: '聊天' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '设置' }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 智能聊天平台` : '智能聊天平台'
  const token = localStorage.getItem('token')
  const isGuest = localStorage.getItem('isGuest') === 'true'
  if (to.path !== '/login' && !token && !isGuest) {
    next('/login')
  } else if (to.path === '/login' && (token || isGuest)) {
    next('/')
  } else {
    next()
  }
})

export default router
