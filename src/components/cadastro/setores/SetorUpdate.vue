<script setup lang="ts">
    import { axiosPlugin } from '@/plugins/axios';
    import ModalApp from '@/components/diversos/modal/ModalApp.vue';
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod';
    import { computed, ref } from 'vue';
    import { reactive } from 'vue';
    import { codMsgInputsErros, codDataHora, codHeaderToken } from '@/codigos'
    import type {tsCamposEdicao} from './tsTipagem.types.ts'
            
    const { modal, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal    = reactive<string[]>([]);
    const token             = codHeaderToken()                                                   //-Obrigatório antes do defineExpose
    const emit              = defineEmits(['setorEditado'])

    
    defineExpose({
        setaDadosParaUpdate
    });

    const historicoArray = ref<Array<any>>([]);
    
    
    const campos  = reactive<tsCamposEdicao>({
        id:'',
        setor:   '',
        historico_edicao: undefined
    })    

    const camposComErro = ref<string[]>([])

    function setaDadosParaUpdate(dados: tsCamposEdicao){
        limpaCampos();
        Object.assign(campos, dados);
        historicoArray.value = JSON.parse(dados.historico_edicao || '[]');
    }

    function limpaCampos(){
        Object.assign(campos, {
            id:                 '',
            setor:              '',
            historico_edicao:   undefined
        });
    }

    function limpaMsgDigitarInput(campo: string){
        camposComErro.value = camposComErro.value.filter(item => item !== campo);
    }    
        
    async function salvar(){
        let erros = validarCampos()
        if(erros>0){
            return
        }

        try{ 
            let dados = campos 
            const { data } = await axiosPlugin.post(`setor-update`, dados, token);
            Object.assign(mensagensModal, ['Salvo com Sucesso']);            
            console.log(data.historico_edicao)
            historicoArray.value = data.historico_edicao ;
            emit('setorEditado',dados)                //-Atualiza Pai SetoresApp.vue 
            modalAbrir('setorUpdateMsgOk')
        }catch(error:any){
           Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('setorUpdateMsgErro')
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(error.response.data.errors)
        } 
    }

    function validarCampos() {
        const CamposObrigatorios: Partial<Record<keyof tsCamposEdicao, string[]>> = {
            setor:  ['Falta o Setor']        
        }        
        Object.keys(CamposObrigatorios).forEach((key) => {                      // Percorre todas as chaves (keys) do objeto CamposObrigatorios
            const campo = key as keyof tsCamposEdicao                           // Faz um *type assertion* dizendo ao TypeScript que a chave é garantidamente uma das chaves de tsCamposEdicao
            if (campos[campo]) {                                                //-Verifica se o campo está preenchido
                delete CamposObrigatorios[campo]                                //-Retira o erro se o campo estivar preenchido
            }
        })
        let qtdErros = Object.keys(CamposObrigatorios).length                   //-Qtd índices do Objeto de campos com erro
        if(qtdErros>=1){  
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(CamposObrigatorios)                                                          //-Exibe os erros na Modal
            Object.assign(mensagensModal, modalMsgErro(CamposObrigatorios));
            modalAbrir('setorUpdateMsgErro')
        }
        return qtdErros
    }    
</script>
<template>
    <div class="paddingDez">   
        <div class="paddingZero div_centro">
            <button @click="salvar()"   class="btn btn-sm btn-success botao" title="Salvar" >Salvar</button>
        </div>{{ campos.historico_edicao }}
        <div class="row paddingZero">
            <div class="col-md-12">
                        <div class="label">Setor</div>                                    
                        <input type="text" v-model="campos.setor" @input="limpaMsgDigitarInput('setor')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('setor') }">                                
            </div>     
        </div>  
        <div class="row ">
            <div class="col-md-12 divCentro tituloHistorico">
                HITÓRICO DE EDIÇÃO
            </div>
            <div style="height: 300px; overflow-y: auto; padding:0" >
                <div class=" div_thead">
                    <div class=" div_th col-4">
                        Setor <br> 
                    </div>
                    <div class=" div_th col-4">
                        Data Hora <br>
                    </div>
                    <div class=" div_th col-4">
                        Editado Por <br>
                    </div>
                </div>
                <div class=" div_tbody" v-for="(i, index) in historicoArray" :key="index">
                    <div class=" div_td col-4 text-wrap" >
                        {{i.setor  }}
                    </div>
                    <div class=" div_td col-4 text-wrap" >
                        {{ codDataHora(i.data_hora) }}
                    </div>
                    <div class=" div_td col-4 text-wrap" >
                        {{i.usuario }}
                    </div>
                </div>
            </div>
         </div>   
    </div>

    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.setorUpdateMsgErro" @close="modalFechar('setorUpdateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.setorUpdateMsgOk" @close="modalFechar('setorUpdateMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
</template>
<style scoped>
    @import '@/assets/main.css'; 
    .tituloHistorico{
        background-color: #406344; 
        color: #ffffff; 
        margin-top: 5px;
    }
</style>