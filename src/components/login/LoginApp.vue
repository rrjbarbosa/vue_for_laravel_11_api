<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { axiosPlugin } from '@/plugins/axios'
import ModalApp from '@/components/diversos/modal/ModalApp.vue'
import { modalAppCod } from '@/components/diversos/modal/modalAppCod'

const router = useRouter()
const email = ref('')
const senha = ref('')

const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
const mensagensModal = reactive<string[]>([]);

const user             = JSON.parse(sessionStorage.getItem('usuario_app') || 'null')
if(user?.token){
  router.push('/menu')
  setTimeout(() => {
    window.location.reload();
  }, 500); // Recarrega após 0.5 segundos
}


async function autenticar() {
  if (!email.value || !senha.value) return; // evita enviar sem campos

  try {
    const response = await axiosPlugin.post('login', {email: email.value, password: senha.value, acao: 'LOGIN'});    
    const data = response?.data;                                          // garante que response.data existe antes de usar
    if (!data) throw new Error('Resposta inválida do servidor.');

    const user = data.usuario ?? {};
    user.token = data.token ?? '';
    user.permissoes = data.permissoes ?? [];
    user.filtros_user = data.filtros_user ?? {};

    sessionStorage.setItem('usuario_app', JSON.stringify(user));
    router.push('/menu');
    
  } catch (e: any) {    
    let mensagem = 'Erro desconhecido';                                                   // monta mensagem amigável sem acessar e.response direto sem checagem
    if (e?.response) {                                                                    // servidor respondeu com status 4xx/5xx
      mensagem = e.response.data?.message ?? `Erro do servidor: ${e.response.status}`;
    } else if (e?.request) {                                                              // requisição foi feita, mas sem resposta (ex: connection refused)
      mensagem = 'Servidor não respondeu. Verifique com o administrador do sistema.';
    } else if (e?.message) {
      mensagem = e.message;
    }
   
    senha.value = '';                                                                     // limpa senha por segurança antes de mostrar modal  
    localStorage.clear()                                                                  // limpa tudo do localStorage
    sessionStorage.clear()                                                                // limpa tudo do sessionStorage                   

    Object.assign(mensagensModal, modalMsgErro({ erro: [mensagem] }));
    modalAbrir('loginAppMsgErro');
    
  } finally {
    senha.value = '';                                                                     // garante que credencial sensível é removida da variável do formulário 
  }
}
</script>

<template>
  <div class="d-flex justify-content-center align-items-center h-100">
    <div class="card" style="width: 400px;">
      <div class="card-body">
        <div class="card-title text-center mb-4">
          <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        </div>
        <h2 class="card-title text-center mb-4">Login</h2>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input 
            type="email" 
            class="form-control campos" 
            id="email" 
            v-model="email" 
            required
          >
        </div>
        <div class="mb-3">
          <label for="senha" class="form-label">Senha</label>
          <input 
            type="password" 
            class="form-control campos" 
            id="senha" 
            v-model="senha" 
            required
          >
        </div>        
        <button @click="autenticar()" class="btn btn-primary w-100">Entrar</button>
      </div>
    </div>
  </div>
  <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
  <ModalApp   :isOpen="modal.loginAppMsgErro" @close="modalFechar('loginAppMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>
    
</template>

<style scoped>
@import '@/assets/main.css'; 
.campos{
  border-color: rgb(146, 144, 144);
  padding: 20px;
  font-size: 15px;
}

</style>