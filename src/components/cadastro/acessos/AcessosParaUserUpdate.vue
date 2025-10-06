<script setup lang="ts">
    import { reactive } from 'vue';
    import { Ref, ref, onMounted, nextTick } from 'vue';
    import { codHeaderToken, codUserLogado } from '@/codigos'
    import { axiosPlugin } from '@/plugins/axios'
    import ModalApp from '@/components/diversos/modal/ModalApp.vue'
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod'
    import AcessosApp from '@/components/cadastro/acessos/AcessosApp.vue'

    const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal = reactive<string[]>([]);

    defineExpose({
        recarregaCss
    });

    const emit = defineEmits(['atualizaPermissoes'])

    interface tsCampos { 
        id:     string | null,
        acesso: string | null,
        ativo:  number | null,
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
                ativo:  number
            }
            permissoes?:{
                id:             string,
                nome:           string,
                nome_exibicao:  string,
                ativo:          number
            }
        }
        
    }

    const props = defineProps<tsProps>();
      
    const inputFiltro = reactive<tsImputFiltros>({
        acesso:''
    });

    const dados         = reactive<tsCampos[]>([{
        id:     '',
        acesso: '',
        ativo:  2,
        index:  0, 
        css:    '' }]);
    
    const token = codHeaderToken()

    const administrador = ref(false)

    const carregando = ref(false)

    const carregaModeloAcesso = ref<any>(null)

    onMounted(()=>{
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
        recarregaCss(props.dadosEdit.acessos)
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
        ativo:  0,
        index:  0,
        css:    '',
    });

    function linhaFoco(linha: tsCampos, index:number){
        linha.index = index                                                             // Adiciona index para recarregar a grid        
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
        dados[index].ativo = dados[index].ativo == 0 ? 1 : 0 

        let arrayObj = []
        for(let i of dados ){
            switch(true){
                case i.ativo == 1 && i.id == linhaSelecionada.id :   i.css =  'ativoSelect';    break;
                case i.ativo == 0 && i.id == linhaSelecionada.id :   i.css =  'inativoSelect';  break;
                case i.ativo == 1  :                                 i.css =  'ativo';          break;
                case i.ativo == 0  :                                 i.css =  'inativo';        break;            
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

    function recarregaCss(dadosCss: any){                
        let arrayObj = []
        for(let i of dadosCss ){
            switch(true){
                case i.ativo == 1: i.css = 'ativo'; break;
                default:                 i.css = 'inativo';        
            }
            arrayObj.push(i);
        } 
        Object.assign(dados, arrayObj);
    }

    function apenasInputsPreenchidos(obj: Record<string, any>) {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) =>
                value !== '' && value !== null && value !== undefined
            )
        );
    }

    async function salvar(){
        carregando.value = true
        const idsAtivos = dados.filter(item => item.ativo === 1).map(item => item.id);
        await axiosPlugin.patch(`acesso-user-em-user-update-salvar/${props.dadosEdit.usuario?.id}`,{acessos:idsAtivos} , token)
        .then(({data}) =>{
            carregando.value = false
            //dados.splice(0, dados.length)                                               //Limpa array objeto em reactive            
            //recarregaCss(data.dados)                                                    //-Recarrega a exibição da grid
            props.dadosEdit.permissoes = data.permissoes
            emit('atualizaPermissoes')
            modalFechar('acessosParaUserUpdateEditar')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('acessosParaUserUpdateMsgOk')
        })
        .catch(error =>{
            carregando.value = false
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('acessosParaUserUpdateMsgErro')
        })   
    }
    function modelosDaAcessos(){
        carregaModeloAcesso.value.acessoAppLimparLinhaSelecionada()
        modalAbrir('modelosParaUserUpdateEditar')
    }
</script>
<!--=================================================================================================================-->
<template >
    <div class=" paddingZero" style="margin-top:2px; margin-bottom: 2px;">
        <button class="btnVerde" 
            @click="modalAbrir('acessosParaUserUpdateEditar')"
            :disabled="!administrador">
            Salvar
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
        <button class="btnCinza" 
            @click="modelosDaAcessos()"
            :disabled="!administrador">
            Editar Acessos
        </button>     
    </div>
    <div style="overflow-y: auto; margin-left: 3px;" >
        <div class=" div_thead tamTbl">
            <div class=" div_th t400">
                Acessos <br> 
                <input type="text" v-model="inputFiltro.acesso" class="inputBuscaTbl">
            </div>
            <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
        </div>
        <div class=" div_tbody tamTbl " v-for="(i, index) in dados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                <div class=" div_td t400 altDiv text-wrap" @click="linhaFoco(i, index)">
                    <button v-if="i.ativo" class="btn btn-outline-success btnAtivado">&#10004;</button>
                    <button v-else class="btn btn-outline-danger btnInativado">&#10008;</button>
                    {{i.acesso }}
                </div>
        </div>
    </div>
    
    <!-- MODAL HABILITA DESABILITA ACESSOS ================================================================================== -->
    <ModalApp   :isOpen="modal.acessosParaUserUpdateEditar" @close="modalFechar('acessosParaUserUpdateEditar')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Edição de Acessos" :mensagens="mensagensModal" >    
        
        <div class="row " style="padding-bottom: 50px;">
            <div v-if="carregando">
                <div class="col-md-12 div_centro"><div class="carregando"></div></div>
                <div class="col-md-12 div_centro">Aguarde</div>
            </div>
            <div v-else>
                <div class="col-md-12 div_centro"> 
                    Salvar Confirma?
                </div>
                <div class="col-md-12 div_centro" style="padding-top: 10px;">
                    <button class="btnVerde" @click="salvar()" :disabled="!administrador">
                        Sim 
                    </button>
                </div>
            </div>      
        </div>
        
    </ModalApp>
    <!-- MODAL MODELOS DE ACESSO============================================================================================= -->
    <ModalApp   :isOpen="modal.modelosParaUserUpdateEditar" @close="modalFechar('modelosParaUserUpdateEditar')"  
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Modelos de Acessos" :mensagens="mensagensModal" >    
        <AcessosApp :dadosEdit="dadosEdit" ref="carregaModeloAcesso"/>
    </ModalApp>    

    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.acessosParaUserUpdateMsgErro" @close="modalFechar('acessosParaUserUpdateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.acessosParaUserUpdateMsgOk" @close="modalFechar('acessosParaUserUpdateMsgOk')" 
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
    
</style>