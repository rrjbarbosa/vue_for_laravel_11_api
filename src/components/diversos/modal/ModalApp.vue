<template>
  <div class="modal" :class="{ 'd-block': isOpen }" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-scrollable" role="document" :style="{ marginTop: '20px' }">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="close btn btn-outline-light" @click="close" aria-label="Close">
            <span aria-hidden="true">&#10008;</span>
          </button>
        </div>
        <!--Mensagem de erro--------------------------------------------------------------------------->
        <div v-if="padraoObsOk == 'obs'" class="msgTopBotton">                           
          <div style="background-color: #ffdc84">
            <div class="erroTitulo">ERRO !!!</div>
          </div>
          <div v-for="(msg, index) in mensagens.filter(Boolean)" :key="index" >   <!-- filter(Boolean) Remove null, undefined, "", 0, false e NaN (todos valores falsy): -->
            <div class="msgErro">
              <span style="color: brown; font-size: 20px;">&#8277;</span>{{'  ' + msg}}
            </div>    
          </div>
        </div>
        <!--Mensagem de Sucesso-------------------------------------------------------------------------->
        <div v-else-if="padraoObsOk == 'ok'" class="msgTopBotton">                         
          <div style="background-color: #d3ebd8;">
            <div class="sucessoTitulo">OK !!!</div>
          </div>
          <div v-for="(msg, index) in mensagens.filter(Boolean)" :key="index" >
            <div class="msgSucesso">
              <span style="color: rgb(25, 146, 79); font-size: 20px;">&#10004;</span> {{'  ' + msg}}
            </div>    
          </div>    
        </div>
        <!--Exibição de formulários----------------------------------------------------------------------->
        <div v-else class="modal-body">                              
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    isOpen: Boolean,
    padraoObsOk:String,
    title: String,
    largura: String,
    alturaMax: { type: String, default: '20vh'}, // tipagem com valor defalt
    mensagens: { type: Array, default: []}       // tipagem com valor defalt
  });
  
  const emit = defineEmits(['close']);

  const close = () => {
    emit('close');
  };
</script>

<style scoped>
@import '@/assets/main.css';

.modal {
  display: none;
  overflow-y: auto;
}

.modal.d-block {
  display: block;
  background-color: rgba(116, 114, 114, 0.5); /* cinza semi-transparente */
}

.modal-dialog {
  margin-top: 20px;
  margin-bottom: 20px;
  max-width: v-bind('props.largura');
}

.modal-content {
  max-height: v-bind('props.alturaMax');
  display: flex;
  flex-direction: column;
}

.modal-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0; /* Importante para o flexbox funcionar corretamente */
  padding: 6px;
}



.modal-title {
  text-align: center;
  flex: 1; /* Ocupa todo o espaço disponível */
}

.close {
  margin-left: auto; /* Empurra o botão para a direita */
}

.modal-header{
  padding: 3px;
  background-color: #A3CDA8;
}

.btn-outline-light{
  padding: 1px 12px;
  font-size: 28px;
  font-weight: bold;
  border-color: #A3CDA8;
  color: #445a47;
}

.btn-outline-light:hover {
  background-color: #445a47 !important; 
  color: #ffffff;
}

/*--------------------------------[Msgs]--------------------------------*/
.msgErro{ng-bottom: 5px;
    font-weight: bold;
    color: brown;
    padding-left: 10PX;
}

.erroTitulo {
  color: brown;
  font-style: italic;
  font-weight: bold;
  font-size: 20px;
  margin-left: 50%;
}

.msgTopBotton{
  padding-top: 10px;
  padding-bottom: 30px;
}

.sucessoTitulo {
  color: rgb(25, 146, 79);
  font-style: italic;
  font-weight: bold;
  font-size: 20px;
  margin-left: 50%;
}
.msgSucesso{ng-bottom: 5px;
    font-weight: bold;
    padding-left: 10px;
    color: rgb(25, 146, 79);
}

</style>