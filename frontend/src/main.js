import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import vuetify from './plugins/vuetify'

const routes = [
  { path: '/login', component: () => import('./views/LoginView.vue') },
  { path: '/', component: () => import('./views/HomeView.vue'), meta: { auth: true } },
  { path: '/items', component: () => import('./views/AllItemsView.vue'), meta: { auth: true } },
  { path: '/items/new', component: () => import('./views/ItemCreateView.vue'), meta: { auth: true } },
  { path: '/containers', component: () => import('./views/ContainersView.vue'), meta: { auth: true } },
  { path: '/containers/:id', component: () => import('./views/ContainerDetailView.vue'), meta: { auth: true } },
  { path: '/items/:id', component: () => import('./views/ItemView.vue'), meta: { auth: true } },
  { path: '/scan', component: () => import('./views/ScanView.vue'), meta: { auth: true } },
  { path: '/history', component: () => import('./views/HistoryView.vue'), meta: { auth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.token) {
    return '/login'
  }
})

const pinia = createPinia()
const app = createApp(App)
app.use(vuetify)
app.use(pinia)
app.use(router)
app.mount('#app')
