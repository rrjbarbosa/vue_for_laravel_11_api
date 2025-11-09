<script setup lang="ts">
    import { axiosPlugin } from '@/plugins/axios';
    import ModalApp from '@/components/diversos/modal/ModalApp.vue';
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod';
    import { computed, ref } from 'vue';
    import { reactive } from 'vue';
    import { codHeaderTokenImgComImpus, codUserLogado, codMsgInputsErros, codDataHora, codCnpjCpf, codCelularFixo, codCep } from '@/codigos'
    import type {tsCamposEdicao} from './tsTipagem.types.ts'
    import ImagemBuscar from '@/components/diversos/imagens/imagemBuscar.vue';
    import { vMaska } from "maska/vue"
        
    const { modal, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal        = reactive<string[]>([]);
    const tokenParaImgComInputs = codHeaderTokenImgComImpus()
    const cnpjCpfSemMascara     = ref('')                                                           //-Obrigatório antes do defineExpose
    const emit                  = defineEmits(['EmpresaEditada'])

    const cepSemMascara = ref('')                                    //-valor sem formatação Obrigatório antes do defineExpose
    const telUmSemMascara = ref('')                                    //-valor sem formatação Obrigatório antes do defineExpose
    const telDoisSemMascara = ref('')                                    //-valor sem formatação Obrigatório antes do defineExpose
    const telTresSemMascara = ref('')                                    //-valor sem formatação Obrigatório antes do defineExpose

    defineExpose({
        setaDadosParaUpdate, 
        cnpjCpfSemMascara,
        cepSemMascara,
        telUmSemMascara,
        telDoisSemMascara,
        telTresSemMascara
    });

    const formataCpfCnpj = computed(() => {
        return campos.cnpjOuCpf === 'cnpj' 
            ? '##.###.###/####-##' 
            : '###.###.###-##'
    })

    const historicoArray = computed(() => {                                     // computed seguro para o histórico — evita usar JSON.parse diretamente no template
        if (!campos.historico_edicao) return [];
        return JSON.parse(campos.historico_edicao) 
    })
    
    const campos  = reactive<tsCamposEdicao>({
        id:'',
        imgParaUpload:   '',
        imgBase64:       '',
        imgNome:         '',
        nome_fantasia: '',
        razao_social: '',
        cnpjOuCpf:      '',
        cnpjCpf: null,
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
    const refLimparImg  = ref<any>(null);

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
            cnpjOuCpf:          null,
            cnpjCpf:            null,
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

    function limpaMsgDigitarInput(campo: string){
        camposComErro.value = camposComErro.value.filter(item => item !== campo);
    }    
        
    async function salvar(){
        let erros = validarCampos()
        if(erros>0){
            return
        }

        try{ 
            let dados = {   ...campos, 
                            cnpjCpf:  cnpjCpfSemMascara.value,
                            tel_um:   telUmSemMascara.value,
                            tel_dois: telDoisSemMascara.value,
                            tel_tres: telTresSemMascara.value,
                            cep:      cepSemMascara.value                                          
                        }
            const { data } = await axiosPlugin.post(`empresa-update`, dados, tokenParaImgComInputs);
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            emit('EmpresaEditada',dados)                //-Atualiza Pai AcessosApp.vue
            modalAbrir('EmpresaUpdateMsgOk')   
            
        }catch(error:any){
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('EmpresaUpdateMsgErro')
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(error.response.data.errors)
        } 
    }

    function validarCampos() {
        const CamposObrigatorios: Partial<Record<keyof tsCamposEdicao, string[]>> = {
            nome_fantasia:  ['Falta nome Fantasia'],
            razao_social:   ['Falta Razão Social'],
            cnpjCpf:        ['Falta CNPJ / CPF']        
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
            modalAbrir('EmpresaUpdateMsgErro')
        }
        return qtdErros
    }
        
    function setaImagem($event: { imgParaUpload: any; imgBase64: any; imgNome: any; }){
        let dados = {...campos, 
            imgParaUpload:$event.imgParaUpload, 
            imgBase64:$event.imgBase64,
            imgNome:$event.imgNome,}

        Object.assign(campos, dados)    
        modalFechar('empresaImagem')
    }

    function limparImagemNoComponente(){
        refLimparImg.value.limparIng()
    }
</script>
<template>
    <div class="paddingDez">   
        <div class="paddingZero div_centro">
            <button @click="salvar()"   class="btn btn-sm btn-success botao" title="Salvar" >Salvar</button>
        </div>
        <div class="row paddingZero">
            <div class="col-md-2 paddingZero" @click="modalAbrir('empresaImagem'), limparImagemNoComponente()"> 
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
                        <div class="label">NOME FANTASIA</div>                                    
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
                    <div class="col-md-3">                   
                        <div class="label">CNPJ ou CPF</div>  
                        <select v-model="campos.cnpjOuCpf" class="form-control inputCss">
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                        </select>                                  
                    </div>
                    <div class="col-md-3">                   
                        <div class="label">CNPJ / CPF</div>  
                        <input type="text" v-model="campos.cnpjCpf" @input="limpaMsgDigitarInput('cnpjCpf')"  
                            class="form-control inputCss"  
                            v-maska:cnpjCpfSemMascara.unmasked="formataCpfCnpj"
                            :class="{ erroInputBorda: camposComErro.includes('cnpjCpf') }">                         
                    </div>
                    <div class="col-md-3">                   
                        <div class="label">INSCRIÇÃO ESTADUAL </div>                                    
                        <input type="text" v-model="campos.insc_estadual" @input="limpaMsgDigitarInput('insc_estadual')"  
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('insc_estadual') }">                                
                    </div>
                    <div class="col-md-3">                   
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
                        <input type="text" v-model="campos.uf" @input=" limpaMsgDigitarInput('uf')"  
                            v-maska="{ mask: 'AA', tokens: { A: { pattern: /[A-Za-z]/, transform: v => v.toUpperCase() } } }"
                            class="form-control inputCss" 
                            :class="{ erroInputBorda: camposComErro.includes('uf') }">                                
                    </div>
                    <div class="col-md-2">                   
                        <div class="label">CEP</div>                                 
                        <input type="text" v-model="campos.cep" @input="limpaMsgDigitarInput('cep')"  
                            v-maska:cepSemMascara.unmasked="'##.###-###'"
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
                    v-maska:telUmSemMascara.unmasked="{ mask: ['(##) ####-####', '(##) #####-####'] }"
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('tel_um') }">                                
            </div>
            <div class="col-md-4">                   
                <div class="label">TELEFONE 2</div>                                    
                <input type="text" v-model="campos.tel_dois" @input="limpaMsgDigitarInput('tel_dois')"  
                    v-maska:telDoisSemMascara.unmasked="{ mask: ['(##) ####-####', '(##) #####-####'] }"
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('tel_dois')}">                                
            </div>
            <div class="col-md-4">                   
                <div class="label">TELEFONE 3</div>                                    
                <input type="text" v-model="campos.tel_tres" @input="limpaMsgDigitarInput('tel_tres')"  
                    v-maska:telTresSemMascara.unmasked="{ mask: ['(##) ####-####', '(##) #####-####'] }"
                    
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErro.includes('tel_tres') }">                         
            </div> 
        </div>   
         <div class="row ">
            <div class="col-md-12 divCentro tituloHistorico">
                HITÓRICO DE EDIÇÃO
            </div>
            <div style="height: 300px; overflow-y: auto; padding:0" >
                <div class=" div_thead tamTbl">
                    <div class=" div_th t300">
                        Nome Fantasia <br> 
                    </div>
                    <div class=" div_th t500">
                        Razão Social <br> 
                    </div>
                    <div class=" div_th t100">
                        Tipo Doc <br>
                    </div>
                    <div class=" div_th t200">
                        Cnpj / Cpf <br>
                    </div>
                    <div class=" div_th t150">
                        Insc.Estadual <br>
                    </div>
                    <div class=" div_th t150">
                        Insc.Municipal <br>
                    </div>
                    <div class=" div_th t600">
                        Rua <br>
                    </div>
                    <div class=" div_th t100">
                        Número <br>
                    </div>
                    <div class=" div_th t300">
                        Bairro <br>
                    </div>
                    <div class=" div_th t300">
                        Cidade  <br> 
                    </div>
                    <div class=" div_th t100">
                        Cep  <br> 
                    </div>
                    <div class=" div_th t50">
                        UF <br>
                    </div>
                    <div class=" div_th t400">
                        Site <br>
                    </div>
                    <div class=" div_th t400">
                        E-Mail <br>
                    </div>
                    <div class=" div_th t150">
                        Tel.Um <br>
                    </div>
                    <div class=" div_th t150">
                        Tel.Dois <br>
                    </div>
                    <div class=" div_th t150">
                        Tel.Tres <br>
                    </div>
                    <div class=" div_th t200">
                        Data Hora <br>
                    </div>
                    <div class=" div_th t200">
                        Editado Por <br>
                    </div>
                </div>
                <div class=" div_tbody tamTbl " v-for="(i, index) in historicoArray" :key="index">
                    <div class=" div_td t300 text-wrap" >
                        {{i.nome_fantasia  }}
                    </div>
                    <div class=" div_td t500 text-wrap" >
                        {{i.razao_social }}
                    </div>
                    <div class=" div_td t100 text-wrap" >
                        {{ i.cnpjOuCpf }}
                    </div>
                    <div class=" div_td t200 text-wrap" >
                        {{codCnpjCpf(i.cnpjCpf) }}
                    </div>
                    <div class=" div_td t150 text-wrap" >
                        {{i.insc_estadual }}
                    </div>
                    <div class=" div_td t150 text-wrap" >
                        {{i.insc_municipal }}
                    </div>
                    <div class=" div_td t600 text-wrap" >
                        {{i.rua }}
                    </div>
                    <div class=" div_td t100 text-wrap" >
                        {{i.numero }}
                    </div>
                    <div class=" div_td t300 text-wrap" >
                        {{i.bairro }}
                    </div>
                    <div class=" div_td t300 text-wrap" >
                        {{i.cidade }}
                    </div>
                    <div class=" div_td t100 text-wrap" >
                        {{codCep(i.cep) }}
                    </div>
                    <div class=" div_td t50 text-wrap" >
                        {{i.uf }}
                    </div>
                    <div class=" div_td t400 text-wrap" >
                        {{i.site }}
                    </div>
                    <div class=" div_td t400 text-wrap" >
                        {{i.email }}
                    </div>
                    <div class=" div_td t150 text-wrap" >
                        {{codCelularFixo(i.tel_um) }}
                    </div>
                    <div class=" div_td t150 text-wrap" >
                        {{codCelularFixo(i.tel_dois) }}
                    </div>
                    <div class=" div_td t150 text-wrap" >
                        {{codCelularFixo(i.tel_tres) }}
                    </div>
                    <div class=" div_td t200 text-wrap" >
                        {{  codDataHora(i.data_hora) }}
                    </div>
                    <div class=" div_td t200 text-wrap" >
                        {{i.usuario }}
                    </div>
                </div>
            </div>
         </div>   
    </div>

    <!-- MODAL EDITAR IMAGEM ============================================================================================== -->
    <ModalApp   :isOpen="modal.empresaImagem" @close="modalFechar('empresaImagem')"  
                :largura="'90%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="..." :mensagens="mensagensModal" >    
        <div class="divCentro">
        </div>
        <ImagemBuscar :altura="'180px'" :largura="'240px'" ref="refLimparImg" @imagemAnexada="setaImagem($event)" />
    </ModalApp>
    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.EmpresaUpdateMsgErro" @close="modalFechar('EmpresaUpdateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.EmpresaUpdateMsgOk" @close="modalFechar('EmpresaUpdateMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
</template>
<style scoped>
    @import '@/assets/main.css'; 
    .tamTbl{
        min-width: 4500px;
    }
    .tituloHistorico{
        background-color: #406344; 
        color: #ffffff; 
        margin-top: 5px;
    }
</style>