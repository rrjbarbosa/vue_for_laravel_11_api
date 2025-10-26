import { createRouter, createWebHistory } from 'vue-router'
import LoginApp from '@/components/login/LoginApp.vue'
import MenuApp from '@/components/login/MenuApp.vue'
import user from '@/router/user.ts'
import empresas from '@/router/empresas.ts'

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
      meta: { obrigaAutenticar: true }                                                  //-Meta campos para rotas protegidas com autenticação necessária
    },
    ...user,                                                                            //-Seta rotas de User
    ...empresas,                                                                        //-Seta rotas de Empresas
  ],
})


router.beforeEach((to, from, next) => {                                                 //-router.beforeEach... Executada antes de cada navegação verifica se existe user logado no sessionStore 
  let user              = JSON.parse(sessionStorage.getItem('usuario_app') ?? 'null')   //-Verifica se existe token
  const userAutenticado = user?.token ? true : false
  
  if (to.meta.obrigaAutenticar && !userAutenticado) {
    next('/')                                                                           //-Redireciona para login se não autenticado
  } else {
    next()                                                                              //-Continua a navegação
  }
})

export default router
