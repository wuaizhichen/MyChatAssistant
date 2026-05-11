/**
 * 路由配置
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import ChatLayout from '@/views/ChatLayout.vue'

Vue.use(VueRouter)

// 路由配置
const routes = [
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
  mode: 'hash',  // 使用 hash 模式，URL 带 # 号
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title ? `${to.meta.title} - 智能聊天平台` : '智能聊天平台'
  next()
})

export default router
