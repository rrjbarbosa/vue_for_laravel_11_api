<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue';
import { codHeaderToken, codUserLogado } from '@/codigos'
import ModalApp from '@/components/diversos/modal/ModalApp.vue'
import { modalAppCod } from '@/components/diversos/modal/modalAppCod'

// Estado para controlar se o usuário está logado

const usuarioLogado    = ref(false)
const router           = useRouter()
const user             = JSON.parse(sessionStorage.getItem('usuario_app') || 'null')  
usuarioLogado.value    = user?.token ? true : false 
const administrador    = ref(false)

const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
const mensagensModal = reactive<string[]>([]);

onMounted(()=>{
  administrador.value = codUserLogado()['admin'] == 1 ? true : false
})  

function abrirModalMenu(){
  modalAbrir('app')
}

const fazerLogout = () => {  
  sessionStorage.clear()
  router.push('/')
  usuarioLogado.value = false
}

function rota(nome: string){
  modalFechar('app')
  router.push('/'+nome)
}
</script>


<template>
  <div class="app-container">
    <div class="menu">
      <div style="height:10%; display: flex; justify-content: space-between; margin-top: 5px;">
        <div>
          <a class="navbar-brand" href="#" style="margin-left: 5px;">
            <img alt="Vue logo" src="@/assets/logo.svg" width="30" height="30" class="d-inline-block align-top">
            Meu App 
          </a>
        </div>
        <div>
          <span style="margin-right: 10px; font-weight: bold;">{{ codUserLogado().name }}</span>
          <button v-if="usuarioLogado" @click="abrirModalMenu()" type="button" class="btn btn-outline-success btn-sm">Menu</button>
          <button v-if="usuarioLogado" @click="fazerLogout" type="button" class="btn btn-outline-dark btn-sm" style="margin-left: 10px; margin-right: 5px;">Sair</button>
        </div>
      </div>
    </div>
    <div class="aplicacao">
      <RouterView />

      <ModalApp   :isOpen="modal.app" @close="modalFechar('app')"  
              :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Menu" :mensagens="mensagensModal" >
        <div class="d-flex align-items-start" style="padding: 5px;">
          <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            <button class="nav-link active" id="v-pills-cadastro-tab" data-bs-toggle="pill" data-bs-target="#v-pills-cadastro" type="button" role="tab" aria-controls="v-pills-cadastro" aria-selected="true">Cadastro</button>
            <button class="nav-link"        id="v-pills-comercial-tab" data-bs-toggle="pill" data-bs-target="#v-pills-comercial" type="button" role="tab" aria-controls="v-pills-comercial" aria-selected="false">Comercial</button>
            <button class="nav-link"        id="v-pills-messages-tab" data-bs-toggle="pill" data-bs-target="#v-pills-messages" type="button" role="tab" aria-controls="v-pills-messages" aria-selected="false">Medição</button>
            <button class="nav-link"        id="v-pills-settings-tab" data-bs-toggle="pill" data-bs-target="#v-pills-settings" type="button" role="tab" aria-controls="v-pills-settings" aria-selected="false">Settings</button>
          </div>
          <div class="tab-content" id="v-pills-tabContent">
            <div class="tab-pane fade show active " id="v-pills-cadastro" role="tabpanel" aria-labelledby="v-pills-cadastro-tab">
                <button type="button" 
                  @click="rota('user-grid')" 
                  :class="[administrador ? 'btn btn-outline-success btn-sm' : 'btn btn-outline-secondary btn-sm' ]"  
                  :disabled="!administrador">
                  Usuários
                </button>
                <button type="button" 
                  @click="rota('empresas')" 
                  class="btnNavegacao"
                  :class="[administrador ? 'btn btn-outline-success btn-sm' : 'btn btn-outline-secondary btn-sm' ]"  
                  :disabled="!administrador">
                  Empresas
                </button>
                <button type="button" 
                  @click="rota('setores')" 
                  class="btnNavegacao"
                  :class="[administrador ? 'btn btn-outline-success btn-sm' : 'btn btn-outline-secondary btn-sm' ]"  
                  :disabled="!administrador">
                  Setores
                </button>
            </div>
            <div class="tab-pane fade" id="v-pills-comercial" role="tabpanel" aria-labelledby="v-pills-comercial-tab">
              Comerc... Botões
            </div>
            <div class="tab-pane fade" id="v-pills-messages" role="tabpanel" aria-labelledby="v-pills-messages-tab">
              ...
            </div>
            <div class="tab-pane fade" id="v-pills-settings" role="tabpanel" aria-labelledby="v-pills-settings-tab">
              ...
            </div>
          </div>
        </div>
      </ModalApp>  
    </div>
  </div>
</template>

<style scoped>

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.menu {
  height: 5%;
  background-color: #ccc;
}

.aplicacao {
  height: 95%;
  background-color: #eee;
  overflow: auto; /* para permitir rolagem apenas do conteúdo, se necessário */
}

.spanDireita {
 align-items: self-end;
}

.btn-outline-secondary{
  background-color: #e6e7e6;
}

.btnNavegacao{
  margin-left: 10px;
}

.nav-link {
  color: #333; /* Cor normal */
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
  transition: color 0.3s; /* Suave transição */
}

.nav-link:hover {
  color: #305737; /* Azul no hover */
  background-color: #a2c7a9;
}

.nav-link.active {
  color: #ebf8ee; /* Verde quando ativo */
  background-color: rgb(61, 97, 67);
}
</style>