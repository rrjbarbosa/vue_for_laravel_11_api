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


async function autenticar(){
  if (email.value && senha.value) {
    try {
      const login = {
        email: email.value,
        password: senha.value,
        acao: 'LOGIN'
      }
        const {data} = await axiosPlugin.post('login', login)
        
        let user          = data.usuario                                         //-Seta Objeto user
        user.token        = data.token
        user.permissoes   = data.permissoes 
        user.filtros_user = data.filtros_user 
        sessionStorage.setItem('usuario_app',JSON.stringify(user));     //-Persistir usuário logado na sessão trasformando tokem e usuário recebito do backEnd em string... O mesmo volta a ser objeto ao recarregar o componente Home
        router.push('/menu')
    }catch (e:any) {
      Object.assign(mensagensModal, modalMsgErro({erro:[e.response.data.message]}));
      modalAbrir('loginAppMsgErro') 
    }
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