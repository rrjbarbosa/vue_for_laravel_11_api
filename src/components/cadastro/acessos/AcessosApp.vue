<script setup lang="ts">
    import { reactive } from 'vue';
    import { ref, onMounted, nextTick } from 'vue';
    import { codHeaderToken, codUserLogado } from '@/codigos'
    import ModalApp from '@/components/diversos/modal/ModalApp.vue'
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod'
    import AcessosCreate from '@/components/cadastro/acessos/AcessosCreate.vue'
    import PermissoesParaAcessos from '@/components/cadastro/permissoes/PermissoesParaAcessos.vue'
    

    const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal = reactive<string[]>([]);

    defineExpose({
        acessoAppLimparLinhaSelecionada
    });

    const emit = defineEmits(['atualizaPermissoes'])

    interface tsCampos { 
        id:     string | null,
        acesso: string | null,
        index:  number, 
        css:    string | null,       
    }

    interface tsImputFiltros { 
        acesso:  string | null,        
    }

    interface tsProps {
        dadosEdit: {
            usuario?:{
            id: string
            }
            acessos?:{
                id:     string,
                acesso: string,
            }
            permissoes?:{
                id:             string,
                nome:           string,
                nome_exibicao:  string
            }
        };
    }

    const props = defineProps<tsProps>();
       
    const inputFiltro = reactive<tsImputFiltros>({
        acesso:''
    });

    const dados         = reactive<tsCampos[]>([{
        id:     '',
        acesso: '',
        index:  0, 
        css:    '' }]);
    
    const token = codHeaderToken()

    const administrador = ref(false)

    const carregando = ref(false)

    const carregaPermissoes = ref<any>(null);

    onMounted(()=>{console.log('Montou...')
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
        Object.assign(dados, props.dadosEdit.acessos);
    })

    function pesquisar(){
        gridPesquisa()
    }

    function limparPesquisa(){
        Object.assign(inputFiltro, {
            acesso:''
        });

        gridPesquisa()
    }

    const linhaSelecionada = reactive<tsCampos>({
        id:     '',
        acesso: '',
        index:  0,
        css:    '',
    });

    function acessoAppLimparLinhaSelecionada(){
        Object.assign(linhaSelecionada, {   id:     '',
                                            acesso: '',
                                            index:  0,
                                            css:    '',
                                        }
        );
    }

    function linhaFoco(linha: tsCampos, index:number){
        linha.index = index                                                             // Adiciona index para recarregar a grid        
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
        
        let arrayObj = []
        for(let i of dados ){
            switch(true){
                case i.id == linhaSelecionada.id :   i.css =  'ativoSelect';    break;
                default: i.css =  'ativo';    break;
            }
            arrayObj.push(i);
        } 
        Object.assign(dados, arrayObj);
    }
    
    async function gridPesquisa(){
       let dadospesqusados =  props?.dadosEdit?.acessos?.filter(item =>
        item.acesso.toLowerCase().includes(inputFiltro?.acesso?.toLowerCase() )
      ) 
      dados.splice(0, dados.length, ...[]);   //-Reseta dados
      Object.assign(dados, dadospesqusados);

    }  
    
    function editarPermissoesDoAcesso(){
        carregaPermissoes.value.gridPermissoesParaAcesso(linhaSelecionada.id)
        modalAbrir('permissoesParaAcessoApp')
    }
    
    function btnEditarPermissaoAcesso(){
        if(!linhaSelecionada.id || !administrador){
            return true
        }
        return false
    }

    function novoAcesso(){
        modalAbrir('acessoAppCriar')
    }

    function acessoGerado($event: tsProps['dadosEdit']['acessos']){
        dados.push($event)
        dados.sort((a, b) => (a.acesso ?? '').localeCompare(b.acesso ?? ''));
        //modalFechar('acessoAppCriar')
    }

    function fecharAcessosCreate(){
        modalFechar('acessoAppCriar')
    }    

    
</script>
<!--=================================================================================================================-->
<template >
    <div class=" paddingZero" style="margin-top:2px; margin-bottom: 2px;">        
        <button class="btnAzul" 
            @click="novoAcesso()" 
            :disabled="!administrador">
            Novo Acesso
        </button>
        <button class="btnAzul" 
            @click="pesquisar()" 
            :disabled="!administrador">
            Pesquisar
        </button> 
        <button class="btnAmarelo" 
            @click="limparPesquisa()" 
            :disabled="!administrador">
            Limpar
        </button>
        <button class="btnVerde" 
            @click="editarPermissoesDoAcesso()" 
            :disabled="btnEditarPermissaoAcesso()">
            Editar permissões Acesso
        </button>      
    </div>
    
    <div style="overflow-y: auto; margin-left: 3px;" >
        <div class=" div_thead tamTbl">
            <div class=" div_th" style="width: 100%;">
                Acessos <br> 
                <input type="text" v-model="inputFiltro.acesso" class="inputBuscaTbl">
            </div>
            <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
        </div>
        <div class=" div_tbody tamTbl " v-for="(i, index) in dados" :key="index" :class="{ativoSelect:i.id==linhaSelecionada.id}">
            <div class=" div_td altDiv text-wrap" style="width: 100%;" @click="linhaFoco(i, index)">
                {{i.acesso }}
            </div>
        </div>
    </div>

    <!-- MODAL CRIAR ACESSO ================================================================================================= -->
    <ModalApp   :isOpen="modal.acessoAppCriar" @close="modalFechar('acessoAppCriar')"  
                :largura="'90%'" :alturaMax="'95%'" :padraoObsOk="'padrao'" title="" :mensagens="mensagensModal" >
        <AcessosCreate @acessoCriado="acessoGerado($event)" @fecharAcessosCreate="fecharAcessosCreate()" />
    </ModalApp>
    <!-- MODAL EDITAR PERMISSOES DO ACSSO =================================================================================== -->
    <ModalApp   :isOpen="modal.permissoesParaAcessoApp" @close="modalFechar('permissoesParaAcessoApp')"  
                :largura="'90%'" :alturaMax="'95%'" :padraoObsOk="'padrao'" title="" :mensagens="mensagensModal" >  
        <span class="tituloAcesso paddingZero" >{{linhaSelecionada.acesso}}</span>          
        <PermissoesParaAcessos :acessor_id="linhaSelecionada.id" ref="carregaPermissoes"/>
    </ModalApp>
    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.acessosAppMsgErro" @close="modalFechar('acessosAppMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.acessoAppMsgOk" @close="modalFechar('acessoAppMsgOk')" 
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

    .tituloAcesso{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 25px;
        font-size: 20px;
        font-weight: bold;
        color: #275f2d;
    }
    
</style>