# vue_for_laravel_11_api
Vue 3 para acessar laravel 11 sanctum

###===========================================================================================
###=================================INSTALAÇÃO================================================
###===========================================================================================
$ npm create vue@latest

> npx
> create-vue

┌  Vue.js - The Progressive JavaScript Framework
│
◇  Project name (target directory):
│  projeto
│
◆  Select features to include in your project: (↑/↓ to navigate, space to select, a to toggle all, enter to confirm)
│  ◼ TypeScript                                                 //-Instalado Type Script
│  ◻ JSX Support
│  ◼ Router (SPA development)                                   //-Instalado Router
│  ◻ Pinia (state management)
│  ◻ Vitest (unit testing)
│  ◻ End-to-End Testing
│  ◻ ESLint (error prevention)
│  ◻ Prettier (code formatting)

###===========================================================================================
###===================================Instalar bootstrap======================================
###===========================================================================================

$ sudo npm i bootstrap                                              //-instalar


import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'                       //-Importar

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'                  //-Importar

const app = createApp(App)

app.use(router)

app.mount('#app')

###===========================================================================================
###====================================Instalar Axios=========================================
###===========================================================================================
$ sudo npm install axios --save                                                     // Instalar Axios

- Criar arquivo em src/plugins/axios.ts
    import axios from 'axios'

    const api = axios.create({                                                      // Cria uma instância base do Axios com configurações padrão
        baseURL: "http://127.0.0.1:8000/api",                                       // URL base para todas as requisições
        timeout: 5000,                                                              // Tempo máximo de espera por resposta (5 segundos)
        headers: {
        'Content-Type': 'application/json'                                        // Define o tipo de conteúdo padrão como JSON
        }
    })  

    api.interceptors.request.use((config) => {                                      // Interceptor para adicionar o token de autenticação às requisições
        const user = JSON.parse(sessionStorage.getItem('usuario_app') ?? 'null')    // Obtém os dados do usuário do sessionStorage // Usa o operador de coalescência nula (??) para evitar erro caso o item não exista
        
        if (user?.token) {                                                          // Verifica se existe um usuário e se tem token
        config.headers.Authorization = `Bearer ${user.token}`                     // Adiciona o token no cabeçalho de autorização no formato Bearer
        }
        
        return config                                                               // Retorna a configuração modificada
    }, (error) => {
        return Promise.reject(error)                                                // Em caso de erro na configuração da requisição, rejeita a promise
    })
    
    export const axiosPlugin = api                                                  // Exporta a instância configurada do Axios para uso direto
    
    export default {                                                                // Exporta como plugin Vue para injeção global
        install: (app: any) => {
        app.config.globalProperties.$api = api                                    // Adiciona a instância do Axios como propriedade global ($api)
        app.provide('api', api)                                                   // Fornece a instância para injeção via composição API
        }
    }
###===========================================================================================
###=====================Recarregar visão de Dados após update/create =========================
###==================================Provide / Inject=========================================
*** no Avô ***
    import { provide } from 'vue'

    provide('acessosParaUserUpdateAtualiza', atualizaAcesso)

    function atualizaAcesso(acesso:tsCampos){
        const index = dados.findIndex(i => i.id === acesso.id)                  //-Encontra o index do item 
        Object.assign(dados[index], acesso)                                     //-Atualiza os dados do objeto existente
        dados.sort((a, b) => (a.acesso ?? '').localeCompare(b.acesso ?? ''))    // Ordena o array pelo campo 'acesso'
        recarregaCss(dados)                                                     // Recarrega o CSS (função já existente)                
    }
*** No Neto ***
    import { inject } from 'vue';

    const acessosParaUserUpdateAtualiza = inject<(acesso: Campos) => void>('acessosParaUserUpdateAtualiza')

    acessosParaUserUpdateAtualiza?.(campos)     //-Atualiza o avô AcessosParaUserUpdate


###===========================================================================================
###===========================================================================================
###===========================================================================================