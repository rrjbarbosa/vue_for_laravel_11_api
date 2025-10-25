<script setup lang="ts">
import { axiosPlugin } from '@/plugins/axios';
import ModalApp from '@/components/diversos/modal/ModalApp.vue';
import { modalAppCod } from '@/components/diversos/modal/modalAppCod';
import { ref } from 'vue';
import { reactive } from 'vue';
import { codHeaderToken, codUserLogado, codMsgInputsErros } from '@/codigos'
import { inject } from 'vue';

const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
const mensagensModal = reactive<string[]>([]);
const token = codHeaderToken()

const emit = defineEmits(['acessoCriado', 'fecharAcessosCreate'])

interface Campos { 
    acesso: string | null    
}

const campos  = reactive<Campos>({
    acesso:''
})    

const camposComErro = ref<string[]>([])

const acessosParaUserUpdateNovo = inject<(acesso: Campos) => void>('acessosParaUserUpdateNovo')


function limpaCampos(){
    Object.assign(campos, {
        acesso: ''
    });
}

function limpaMsgDigitarInput(campo: String){
    camposComErro.value = camposComErro.value.filter(item => item !== campo);
}

async function salvar(){
        let erros = validarCampos()
        if(erros>0){
            return
        }

        try{
            const { data } = await axiosPlugin.post(`acesso-criar`, campos, token);
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('AcessoCreateMsgOk')
            limpaCampos() 
            emit('acessoCriado',data.acesso)
            acessosParaUserUpdateNovo?.({...data.acesso, ativo:0})
        }catch(error:any){
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('AcessoCreateMsgErro')
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(error.response.data.errors)
        } 
    }

    function validarCampos() {
        const CamposObrigatorios = {
            acesso: ['Falta Acesso']
        }        
        Object.keys(CamposObrigatorios).forEach((key) => {                      // Percorre todas as chaves (keys) do objeto CamposObrigatorios
            const campo = key as keyof typeof campos                            // Faz um *type assertion* dizendo ao TypeScript que a chave é garantidamente uma das chaves de campos
            if (campos[campo]) {                                                //-Verifica se o campo está preenchido
                delete CamposObrigatorios[campo]                                //-Retira o erro se o campo estivar preenchido
            }
        })
        let qtdErros = Object.keys(CamposObrigatorios).length                   //-Qtd índices do Objeto de campos com erro
        if(qtdErros>=1){  
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(CamposObrigatorios)                                                          //-Exibe os erros na Modal
            Object.assign(mensagensModal, modalMsgErro(CamposObrigatorios));
            modalAbrir('AcessoCreateMsgErro')
        }
        return qtdErros
    } 
    
    function fecharAcessosCreate(){
        emit('fecharAcessosCreate')
    }

</script>
<template>
    <div class="paddingDez">   
        <div class="paddingZero div_centro">
            <button @click="salvar()"   class="btn btn-sm btn-success botao" title="Salvar" >Salvar</button>
        </div>                   
        <div class="label">Nome</div>                                    
        <input type="text" v-model="campos.acesso" @input="limpaMsgDigitarInput('acesso')"  
            class="form-control inputCss" 
            :class="{ erroInputBorda: camposComErro.includes('acesso') }"
            placeholder="Digite o Nome do Acesso">                                
    </div>

    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.AcessoCreateMsgErro" @close="modalFechar('AcessoCreateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.AcessoCreateMsgOk" @close="modalFechar('AcessoCreateMsgOk'), fecharAcessosCreate()" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
</template>
<style scoped>
    @import '@/assets/main.css'; 
</style>