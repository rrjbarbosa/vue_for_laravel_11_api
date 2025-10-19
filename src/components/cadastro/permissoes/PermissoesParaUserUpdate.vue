<script setup lang="ts">
    import { onUpdated, reactive } from 'vue';
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
        permissoes?:{
            id:             string,
            nome:           string,
            nome_exibicao:  string,
            ativo?:          number|null,
            index?:number|null,
            css?: string|null
        },
        alturaDiv90ParaComponente: number;
    }

    const props = defineProps<tsProps>();

    const botoes        = ref<string>("0");
    const gridTabela    = ref<string>("0");
       
    const inputFiltro = reactive<tsImputFiltros>({
        nome_exibicao:''
    });

    const dados         = reactive<tsCampos[]>([{
        id:'',
        nome:  '',
        nome_exibicao:'',
        ativo:  2,
        index:  0, 
        css:    '' }]);
    
    const token = codHeaderToken()

    const administrador = ref(false)

    const carregando = ref(false)

    onMounted(()=>{
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
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
            nome_exibicao:''
        });
        gridPesquisa()
    }

    async function gridPesquisa(){
        let dadospesqusados =  props?.permissoes?.filter(item =>
        item.nome_exibicao.toLowerCase().includes(inputFiltro?.nome_exibicao?.toLowerCase() )
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
</script>
<!--=================================================================================================================-->
<template >
    <div class=" paddingZero" :style="{height: botoes, marginTop:'2px', marginBottom: '2px' }">
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
                Permissões <br> 
                <input type="text" v-model="inputFiltro.nome_exibicao" class="inputBuscaTbl">
            </div>
            <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
        </div>
        <div class=" div_tbody tamTbl " v-for="(i, index) in dados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
            <div class=" div_td t100porCento altDiv text-wrap">
                <button v-if="i.ativo" class="btn btn-outline-success btnAtivado">&#10004;</button>
                <button v-else class="btn btn-outline-danger btnInativado">&#10008;</button>
                {{i.nome_exibicao }}
            </div>
        </div>
    </div>
    
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