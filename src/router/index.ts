import { createRouter, createWebHistory } from 'vue-router'
import LoginApp from '@/components/login/LoginApp.vue'
import MenuApp from '@/components/login/MenuApp.vue'
import user from '@/router/user.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',     
      name: 'login', 
      component: LoginApp 
    },
    { path: '/menu', 
      name: 'menu',  
      component: MenuApp,
      meta: { requiresAuth: true } // Adicione meta campos para rotas protegidas
    },
    ...user,
  ],
})

// Adicione um guarda de navegação para proteger rotas
router.beforeEach((to, from, next) => {
  // Aqui você verificaria se o usuário está realmente autenticado
  // Por enquanto estamos usando a variável local apenas para demonstração
  let user = JSON.parse(sessionStorage.getItem('usuario_app') ?? 'null')  
  const isAuthenticated = user?.token ? true : false // Substitua por sua lógica real
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/') // Redireciona para login se não autenticado
  } else {
    next() // Continua a navegação
  }
})

export default router
