import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Sector from '../views/Sector.vue'
import Company from '../views/Company.vue'

const router = createRouter({
  history: createWebHashHistory('/a-shares/'),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/sector/:id', name: 'Sector', component: Sector },
    { path: '/company/:symbol', name: 'Company', component: Company },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
