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