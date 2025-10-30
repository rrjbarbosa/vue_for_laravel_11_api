<script setup lang="ts">
import { axiosPlugin } from '@/plugins/axios';
import ModalApp from '@/components/diversos/modal/ModalApp.vue';
import { modalAppCod } from '@/components/diversos/modal/modalAppCod';
import { ref } from 'vue';
import { reactive } from 'vue';
import { codHeaderToken, codUserLogado, codMsgInputsErros } from '@/codigos'
import { inject } from 'vue';
import type {tsCamposEdicao} from './tsEmpresa.types.ts'
import ImagemBuscar from '@/components/diversos/imagens/imagemBuscar.vue';

const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
const mensagensModal = reactive<string[]>([]);
const token = codHeaderToken()

const emit = defineEmits(['EmpresaEditada'])

defineExpose({
    setaDadosParaUpdate
});

const campos  = reactive<tsCamposEdicao>({
    anexo_logomarca: '',
    nome_fantasia: '',
    razao_social: '',
    cnpj: null,
    insc_estadual: null,
    insc_municipal: null,
    rua: null,
    numero: null,
    bairro: '',
    cidade: '',
    cep: null,
    uf: '',
    site: '',
    email: '',
    tel_um: null,
    tel_dois: null,
    tel_tres: null,
    historico_edicao: undefined
})    

const camposComErro = ref<string[]>([])


function setaDadosParaUpdate(dados: tsCamposEdicao){
    limpaCampos();
    Object.assign(campos, dados);
}

function limpaCampos(){
    Object.assign(campos, {
        anexo_logomarca:    '',
        nome_fantasia:      '',
        razao_social:       '',
        cnpj:               null,
        insc_estadual:      null,
        insc_municipal:     null,
        rua:                null,
        numero:             null,
        bairro:             '',
        cidade:             '',
        cep:                null,
        uf:                 '',
        site:               '',
        email:              '',
        tel_um:             null,
        tel_dois:           null,
        tel_tres:           null,
        historico_edicao:   undefined
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
            const { data } = await axiosPlugin.put(`acesso-editar`, campos, token);
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            emit('EmpresaEditada',campos)                //-Atualiza Pai AcessosApp.vue
            modalAbrir('AcessoCreateMsgOk')   
            
        }catch(error:any){
            console.log(error)
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('AcessoCreateMsgErro')
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(error.response.data.errors)
        } 
    }

    function validarCampos() {
        const CamposObrigatorios = {
            nome_fantasia:  ['Falta nome Fantasia'],
            razao_social:   ['Falta Razão Social'],
            cnpj:           ['Falta Cnpj']        
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
        
    function setaImagem($event){
        console.log($event)
    }
    
</script>
<template>
    <div class="paddingDez">   
        <div class="paddingZero div_centro">
            <button @click="salvar()"   class="btn btn-sm btn-success botao" title="Salvar" >Salvar</button>
        </div>
        <div class="row">
            <div class="col-md-2" @click="modalAbrir('empresaImagem')">
                <div style=" border: 2px solid #333; height: 185px; width: 250px;/* largura | estilo | cor */">

                </div>
            </div>
            <div class="col-md-10">
                <div class="row">
                    <div class="col-md-5">                   
                        <div class="label">NOME</div>                                    
                        <input type="text" v-model="campos.nome_fantasia" @input="limpaMsgDigitarInput('nome_fantasia')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('nome_fantasia') }">                                
                    </div>
                    <div class="col-md-7">                   
                        <div class="label">RAZÃO SOCIAL</div>                                    
                        <input type="text" v-model="campos.razao_social" @input="limpaMsgDigitarInput('razao_social')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('razao_social') }">                                
                    </div>        
                </div>
                <div class="row">
                    <div class="col-md-4">                   
                        <div class="label">CNPJ</div>                                    
                        <input type="text" v-model="campos.cnpj" @input="limpaMsgDigitarInput('cnpj')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('cnpj') }">                                
                    </div>
                    <div class="col-md-4">                   
                        <div class="label">INSCRIÇÃO ESTADUAL </div>                                    
                        <input type="text" v-model="campos.insc_estadual" @input="limpaMsgDigitarInput('insc_estadual')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('insc_estadual') }">                                
                    </div>
                    <div class="col-md-4">                   
                        <div class="label">INSCRIÇÃO MUNICIPAL</div>                                    
                        <input type="text" v-model="campos.insc_municipal" @input="limpaMsgDigitarInput('insc_municipal')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('insc_municipal') }">                                
                    </div>        
                </div>
                <div class="row">
                    <div class="col-md-10">                   
                        <div class="label">RUA</div>                                    
                        <input type="text" v-model="campos.rua" @input="limpaMsgDigitarInput('rua')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('rua') }">                                
                    </div>
                    <div class="col-md-2">                   
                        <div class="label">NÚMERO</div>                                    
                        <input type="text" v-model="campos.numero" @input="limpaMsgDigitarInput('numero')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('numero') }">                                
                    </div>        
                </div>
                <div class="row">
                    <div class="col-md-5">                   
                        <div class="label">BAIRRO</div>                                    
                        <input type="text" v-model="campos.bairro" @input="limpaMsgDigitarInput('bairro')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('bairro') }">                                
                    </div>
                    <div class="col-md-4">                   
                        <div class="label">CIDADE</div>                                    
                        <input type="text" v-model="campos.cidade" @input="limpaMsgDigitarInput('cidade')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('cidade') }">                                
                    </div>
                    <div class="col-md-1">                   
                        <div class="label">UF</div>                                    
                        <input type="text" v-model="campos.uf" @input="limpaMsgDigitarInput('uf')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('uf') }">                                
                    </div>
                    <div class="col-md-2">                   
                        <div class="label">CEP</div>                                    
                        <input type="text" v-model="campos.cep" @input="limpaMsgDigitarInput('cep')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('cep') }">                                
                    </div>        
                </div>
            </div>     
        </div>  
        <div class="row">
            <div class="col-md-6">                   
                <div class="label">SITE</div>                                    
                <input type="text" v-model="campos.site" @input="limpaMsgDigitarInput('site')"  
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('site') }">                                
            </div>
            <div class="col-md-6">                   
                <div class="label">E-MAIL</div>                                    
                <input type="text" v-model="campos.email" @input="limpaMsgDigitarInput('email')"  
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('email') }">                                
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">                   
                <div class="label">TELEFONE 1</div>                                    
                <input type="text" v-model="campos.tel_um" @input="limpaMsgDigitarInput('tel_um')"  
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('tel_um') }">                                
            </div>
            <div class="col-md-4">                   
                <div class="label">TELEFONE 2</div>                                    
                <input type="text" v-model="campos.tel_um" @input="limpaMsgDigitarInput('tel_um')"  
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('tel_um')}">                                
            </div>
            <div class="col-md-4">                   
                <div class="label">TELEFONE 3</div>                                    
                <input type="text" v-model="campos.tel_tres" @input="limpaMsgDigitarInput('tel_tres')"  
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('tel_tres') }">                                
            </div>        
        </div>      
    </div>

    <!-- MODAL EDITAR IMAGEM ============================================================================================== -->
    <ModalApp   :isOpen="modal.empresaImagem" @close="modalFechar('empresaImagem')"  
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="..." :mensagens="mensagensModal" >    
        <button @click="salvarImagem()"   class="btn btn-sm btn-success botao" title="Salvar" >Salvar Imagem</button>
        <ImagemBuscar @imagemAnexada="setaImagem($event)" />
    </ModalApp>
    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.AcessoCreateMsgErro" @close="modalFechar('AcessoCreateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.AcessoCreateMsgOk" @close="modalFechar('AcessoCreateMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
</template>
<style scoped>
    @import '@/assets/main.css'; 
</style>