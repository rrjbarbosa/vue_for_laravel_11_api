<script setup lang="ts">
    import { axiosPlugin } from '@/plugins/axios';
    import ModalApp from '@/components/diversos/modal/ModalApp.vue';
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod';
    import { ref } from 'vue';
    import { reactive } from 'vue';
    import { codHeaderTokenImgComImpus, codUserLogado, codMsgInputsErros } from '@/codigos'
    import { inject } from 'vue';
    import type {tsCamposEdicao} from './tsEmpresa.types.ts'
    import ImagemBuscar from '@/components/diversos/imagens/imagemBuscar.vue';

    const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal = reactive<string[]>([]);
    const tokenParaImgComInputs = codHeaderTokenImgComImpus()

    const emit = defineEmits(['EmpresaEditada'])

    defineExpose({
        setaDadosParaUpdate
    });

    const campos  = reactive<tsCamposEdicao>({
        id:'',
        imgParaUpload:   '',
        imgBase64:       '',
        imgNome:         '',
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
            id:                 '',
            imgParaUpload:      '',
            imgBase64:          '',
            imgNome:            '',
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
            const { data } = await axiosPlugin.post(`empresa-update`, campos, tokenParaImgComInputs);
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            emit('EmpresaEditada',campos)                //-Atualiza Pai AcessosApp.vue
            modalAbrir('EmpresaUpdateMsgOk')   
            
        }catch(error:any){
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('EmpresaUpdateMsgErro')
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
            modalAbrir('EmpresaUpdateMsgErro')
        }
        return qtdErros
    }
        
    function setaImagem($event){
        let dados = {...campos, 
            imgParaUpload:$event.imgParaUpload, 
            imgBase64:$event.imgBase64,
            imgNome:$event.imgNome,}

        Object.assign(campos, dados)    
        modalFechar('empresaImagem')
        console.log(campos)
    }
    
</script>
<template>
    <div class="paddingDez">   
        <div class="paddingZero div_centro">
            <button @click="salvar()"   class="btn btn-sm btn-success botao" title="Salvar" >Salvar</button>
        </div>
        <div class="row paddingZero">
            <div class="col-md-2 paddingZero" @click="modalAbrir('empresaImagem')"> 
                <img 
                    v-if="campos.imgBase64"
                    :src="campos.imgBase64"
                    class="paddingZero"
                    style="border: 2px solid #333; height: 185px; width: 250px;"
                />
                <img 
                    v-else
                    src="@/assets/faltaImagem.png"
                    style="border: 2px solid #333; height: 185px; width: 250px;"
                />                
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
            </div>     {{ JSON.stringify(campos) }}   
        </div>      
    </div>

    <!-- MODAL EDITAR IMAGEM ============================================================================================== -->
    <ModalApp   :isOpen="modal.empresaImagem" @close="modalFechar('empresaImagem')"  
                :largura="'90%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="..." :mensagens="mensagensModal" >    
        <div class="divCentro">
        </div>
        <ImagemBuscar :altura="'180px'" :largura="'240px'" @imagemAnexada="setaImagem($event)" />
    </ModalApp>
    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.EmpresaUpdateMsgErro" @close="modalFechar('EmpresaUpdateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.EmpresaUpdateMsgOk" @close="modalFechar('EmpresaUpdateMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
</template>
<style scoped>
    @import '@/assets/main.css'; 
</style>