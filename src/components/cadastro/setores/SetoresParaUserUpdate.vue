<script setup lang="ts">
    import { reactive } from 'vue';
    import { ref, onMounted, nextTick } from 'vue';
    import { codHeaderToken, codUserLogado} from '@/codigos'
    import { axiosPlugin } from '@/plugins/axios'
    import ModalApp from '@/components/diversos/modal/ModalApp.vue'
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod'

    const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal = reactive<string[]>([]);

    defineExpose({
        recarregaCss
    });

    interface tsCampos { 
        id:     string | null,
        setor:  string | null,
        ativo:  number | null,
        index:  number, 
        css:    string | null,       
    }

    interface tsImputFiltros { 
        setor:  string | null,        
    }

    interface tsProps {
        dadosEdit: {
            usuario?:{
            id: string
            }
            setores?:{
                id: string,
                setor: string,
                ativo: number
            }
        },
        alturaDiv90ParaComponente: number;
    }

    const props = defineProps<tsProps>();

    const botoes        = ref<string>("0");
    const gridTabela    = ref<string>("0");
       
    const inputFiltro = reactive<tsImputFiltros>({
        setor:''
    });

    const dados         = reactive<tsCampos[]>([{
        id:     '',
        setor:  '',
        ativo:  2,
        index:  0, 
        css:    '' }]);
    
    const token = codHeaderToken()

    const administrador = ref(false)

    const carregando = ref(false)

    onMounted(()=>{
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
        recarregaCss(props.dadosEdit.setores)
        setTimeout(()=>{calculaAltura()},100)
    })

    function calculaAltura(){
        botoes.value        = ((props.alturaDiv90ParaComponente /100)*4)+'px'
        gridTabela.value    = ((props.alturaDiv90ParaComponente /100)*90)+'px'
    }

    function pesquisar(){
        gridPesquisa()
    }

    function limparPesquisa(){
        Object.assign(inputFiltro, {
            setor:''
        });

        gridPesquisa()
    }

    const linhaSelecionada = reactive<tsCampos>({
        id:'',
        setor: '', 
        ativo:0,
        index:0,
        css:'',
    });

    function linhaFoco(linha: tsCampos, index:number){
        linha.index = index                                                             // Adiciona index para recarregar a grid        
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
        dados[index].ativo = dados[index].ativo == 0 ? 1 : 0 

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
        Object.assign(dados, arrayObj);
    }
    
    async function gridPesquisa(){
        let camposPesquisados       =  {...apenasInputsPreenchidos(inputFiltro)}
        camposPesquisados.user_id   = props.dadosEdit.usuario?.id
        try {
            const { data } = await axiosPlugin.post('setor-user-em-user-update-grid', camposPesquisados, token);
            dados.splice(0, dados.length, ...[]);   //-Reseta dados
            recarregaCss(data.dados);
            delete data.dados;

        } catch (error:any) {
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('empresasParaUserUpdateMsgErro')
        }
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
        //const ids = Object.values(dados).map(item => item.id);
        const idsAtivos = dados.filter(item => item.ativo === 1).map(item => item.id);
        await axiosPlugin.patch(`setor-user-em-user-update-salvar/${props.dadosEdit.usuario?.id}`,{setores:idsAtivos} , token)
        .then(({data}) =>{
            carregando.value = false
            dados.splice(0, dados.length)                                               //Limpa array objeto em reactive            
            recarregaCss(data.dados)                                                    //-Recarrega a exibição da grid
            modalFechar('setoresParaUserUpdateEditar')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('empresasParaUserUpdateMsgOk')
        })
        .catch(error =>{
            carregando.value = false
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('empresasParaUserUpdateMsgErro')
        })   
    }
</script>
<!--=================================================================================================================-->
<template >
    <div class=" paddingZero" :style="{height: botoes, marginTop:'2px', marginBottom: '2px' }">
        <button class="btnVerde" 
            @click="modalAbrir('setoresParaUserUpdateEditar')"
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
    </div>

    <div :style="{overflowY:'auto', height:gridTabela, marginTop:'2px', marginBottom:'2px' }">
        <div class=" div_thead tamTbl">
            <div class=" div_th t100porCento">
                Setor <br> 
                <input type="text" v-model="inputFiltro.setor" class="inputBuscaTbl">
            </div>
            <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
        </div>
        <div class=" div_tbody tamTbl " v-for="(i, index) in dados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
            <div class=" div_td t100porCento altDiv text-wrap" @click="linhaFoco(i, index)">
                <button v-if="i.ativo" class="btn btn-outline-success btnAtivado">&#10004;</button>
                <button v-else class="btn btn-outline-danger btnInativado">&#10008;</button>
                {{i.setor }}
            </div>
        </div>
    </div>
    
    <!-- MODAL HABILITA DESABILITA USER ===================================================================================== -->
    <ModalApp   :isOpen="modal.setoresParaUserUpdateEditar" @close="modalFechar('setoresParaUserUpdateEditar')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Edição de Setores" :mensagens="mensagensModal" >    
        
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

    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.empresasParaUserUpdateMsgErro" @close="modalFechar('empresasParaUserUpdateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.empresasParaUserUpdateMsgOk" @close="modalFechar('empresasParaUserUpdateMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
    
</template>

<!--=================================================================================================================-->
<style scoped>
    @import '@/assets/main.css';
    .tamTbl{
        min-width: 350px;
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
    .altDiv{
        height: 30px;
    }
    .t100porCento{
        width: 100%;
    }
    
</style>