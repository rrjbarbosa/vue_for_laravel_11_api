<script setup lang="ts">
    import { reactive } from 'vue';
    import { ref, onMounted, nextTick } from 'vue';
    import { codHeaderToken, codUserLogado } from '@/codigos'
    import { axiosPlugin } from '@/plugins/axios'
    import ModalApp from '@/components/diversos/modal/ModalApp.vue'
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod'
    import ModulosApp from '@/components/cadastro/modulos/ModulosApp.vue'
    import { inject } from 'vue'

    const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal = reactive<string[]>([]);

    defineExpose({
        gridPermissoesParaAcesso
    });

    const emit = defineEmits([''])

    interface tsCampos { 
        id:             string | null,
        nome:           string | null,
        nome_exibicao:  string|null,
        ativo:          number | null,
        index:          number, 
        css:            string | null,       
    }

    interface tsImputFiltros { 
        nome_exibicao:  string | null,        
    }

    interface tsProps {
        acessor_id:string|null;
    }

    const props = defineProps<tsProps>();
       
    const inputFiltro = reactive<tsImputFiltros>({
        nome_exibicao:null
    });

    const dados         = reactive<tsCampos[]>([{
        id:    '',
        nome:  '',
        nome_exibicao:'',
        ativo:  2,
        index:  0, 
        css:    '' }]);

    const dadosPesquisados = reactive<tsCampos[]>([{
        id: '',
        nome:  '',
        nome_exibicao:'',
        ativo:  2,
        index:  0, 
        css:    '' }]);
        
    const token = codHeaderToken()

    const administrador = ref(false)

    const carregando = ref(false)

    const carregaModulos = ref<any>(null);

    onMounted(()=>{
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
    })

    function pesquisar(){
        gridPesquisa()
    }

    function limparPesquisa(){
        Object.assign(inputFiltro, {
            nome_exibicao:null
        });
        Object.assign(dadosPesquisados, dados);  
    }

    async function gridPesquisa(){
        let pesquisados =  dados?.filter(item => item?.nome_exibicao?.toLowerCase().includes(inputFiltro?.nome_exibicao?.toLowerCase() )) 
        dadosPesquisados.splice(0, dados.length, ...[]);   //-Reseta dados
        Object.assign(dadosPesquisados, pesquisados);
    }

    function recarregaCss(dadosCss: any){                
        let arrayObj = []
        for(let i of dadosCss ){
            switch(true){
                case i.ativo == 1: i.css = 'ativo'; break;
                default:           i.css = 'inativo';        
            }
            arrayObj.push(i);
        } 
        Object.assign(dados, arrayObj);
    }

    async function gridPermissoesParaAcesso(acessor_id){
        try {
            dados.splice(0, dados.length, ...[]);                           //-Reseta dados
            dadosPesquisados.splice(0, dadosPesquisados.length, ...[]);     //-Reseta dados   
            
            const { data } = await axiosPlugin.post('permissao-por-acesso', {acessor_id:acessor_id }, token);
            recarregaCss(data.permissoes);                      //-Seta permssões
            Object.assign(dadosPesquisados, dados);             //-Seta dadosPesquisados com css estilizado
            carregaModulos.value.setaDados(data.modulos)
            delete data.permissoes;
        } catch (error:any) {
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('permissoesParaAcessosMsgErro')
        }
    }

    function linhaFoco(linha: tsCampos, index:number){
        linha.index = index                                                             // Adiciona index para recarregar a grid        
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
        dadosPesquisados[index].ativo = dadosPesquisados[index].ativo == 0 ? 1 : 0 

        let arrayObj = []
        for(let i of dados ){
            switch(true){
                case i.ativo == 1 && i.id == linhaSelecionada.id :     i.css =  'ativoSelect';    break;
                case i.ativo == 0 && i.id == linhaSelecionada.id :   i.css =  'inativoSelect';  break;
                case i.ativo == 1  :                                   i.css =  'ativo';          break;
                case i.ativo == 0  :                                 i.css =  'inativo';        break;            
            }
            arrayObj.push(i);
        } 
        dadosPesquisados.splice(0, dadosPesquisados.length, ...[]);     //-Reseta dados
        Object.assign(dadosPesquisados, arrayObj);
    }

    const linhaSelecionada = reactive<tsCampos>({
        id:'',
        nome:'',
        nome_exibicao: '', 
        ativo:2,
        index:0,
        css:'',
    });

    const chamarUserUpdateEdit = inject<() => void>('chamarUserUpdateEdit')

    async function salvar(){
        carregando.value = true
        const idsAtivos = dadosPesquisados.filter(item => item.ativo === 1).map(item => item.id);
        await axiosPlugin.patch(`permissao-por-acesso-salvar/${props?.acessor_id}`,{permissoes:idsAtivos} , token)
        .then(({data}) =>{
            carregando.value = false
            modalFechar('permissoesParaAcessosConfirmaSalvar')
            chamarUserUpdateEdit?.()
        })
        .catch(error =>{
            let erros           = error.response.data.errors ? error.response.data.errors : {"msgsAuthorize":["Erro Inesperado"],"inputs":[{}]}
            carregando.value    = false
            Object.assign(mensagensModal, modalMsgErro(erros));
            modalFechar('permissoesParaAcessosConfirmaSalvar')
            modalAbrir('permissoesParaAcessosMsgErro')
        })   
    }
</script>
<!--=================================================================================================================-->
<template >
    <div class="row paddingZero">
        <div class="col-md-6 paddingZero">    
            <div style="overflow-y: auto; margin-left: 3px;" >
                <div class="div_centro cssPermissoes">PERMISSÕES</div>
                <div class=" div_thead tamTbl">
                    <div class=" div_th" style="width: 100%;">
                        <span class=" paddingZero" style="margin-top:2px; margin-bottom: 2px;">
                            <button class="btnVerde" 
                                :disabled="!administrador"
                                @click="modalAbrir('permissoesParaAcessosConfirmaSalvar')">                                
                                Salvar
                            </button>
                            <button class="btnAzul" 
                                @click="pesquisar()" 
                                :disabled="!administrador || !inputFiltro.nome_exibicao">
                                Pesquisar
                            </button> 
                            <button class="btnAmarelo" 
                                @click="limparPesquisa()" 
                                :disabled="!administrador || !inputFiltro.nome_exibicao">
                                Limpar
                            </button>        
                        </span> <br>
                        <input type="text" v-model="inputFiltro.nome_exibicao" class="inputBuscaTbl">
                    </div>
                    <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
                </div>
                <div class=" div_tbody tamTbl " v-for="(i, index) in dadosPesquisados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                        <div class=" div_td altDiv text-wrap" style="width: 100%;">
                            <button v-if="i.ativo" class="btn btn-outline-success btnAtivado" @click="linhaFoco(i, index)">&#10004;</button>
                            <button v-else class="btn btn-outline-danger btnInativado" @click="linhaFoco(i, index)">&#10008;</button>
                            <div class=" div_td t200 text-wrap" @click="linhaFoco(i, index)">{{i.nome_exibicao }}</div>
                        </div>
                </div>
            </div>
        </div>    
        <div class="col-md-6 paddingZero">
            <ModulosApp ref="carregaModulos"/>
        </div>
    </div>
    
    <!-- MODAL CONFIRMA SALVAR=============================================================================================== -->
    <ModalApp   :isOpen="modal.permissoesParaAcessosConfirmaSalvar" @close="modalFechar('permissoesParaAcessosConfirmaSalvar')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="" :mensagens="mensagensModal">
        <div v-if="carregando">
            <div class="col-md-12 div_centro"><div class="carregando"></div></div>
        <div class="col-md-12 div_centro">Aguarde</div>
            </div>
        <div v-else >
            <div class=" div_centro">Salvar Confirma?</div></br>
            <div class="div_centro">
                <button class="btnVerde" :disabled="!administrador" @click="salvar()">Salvar</button>            
            </div>
        </div>
    </ModalApp>

    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.permissoesParaAcessosMsgErro" @close="modalFechar('permissoesParaAcessosMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.permissoesParaAcessosMsgOk" @close="modalFechar('permissoesParaAcessosMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
    
</template>

<!--=================================================================================================================-->
<style scoped>
    @import '@/assets/main.css';
    .tamTbl{
        min-width: 450px;
    }
    .aguarde{
        background-color: rgb(243, 146, 20);
    }
    .ok{
        color:green;
        font-weight: bold;
        font-size: 15px;
    }
    .obs{
        color: #ff0000;
        font-weight: bold;
        font-size: 15px;
    }

    .btnAtivado{
        font-weight: bold;
        font-size: 12px;
        padding-left:5px;
        padding-right:5px;
        padding-top: 3px;
        padding-bottom: 3px;
    }

    .btnInativado{
        font-weight: bold;
        font-size: 12px;
        padding-left:7px;
        padding-right:7px;
        padding-top: 3px;
        padding-bottom: 3px;
    }


    .t50{
        width: 50px;
    }

    .t30{
        width: 35px;
    }

    .t100{
        width: 100px;
    }

    .t200{
        width: 200px;
    }

    .t400{
        width: 400px;
    }

    .centro{
        text-align: center;
    }
    .erroInputBorda {border: 2px solid red;}
    .altDiv{
        height: 30px;
    }

    .cssPermissoes{
        background-color: rgb(32, 87, 69);
        color: #ffffff;
    }
    
</style>