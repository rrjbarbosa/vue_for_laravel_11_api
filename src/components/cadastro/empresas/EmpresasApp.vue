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
        id:             string | null,
        nome_fantasia:  string | null,
        razao_social:   string | null,
        cnpj:           string | null,
        cidade:         string | null,
        bairro:         string | null,
        ativo:          number | null,
        index:          number, 
        css:            string | null,       
    }

    interface tsImputFiltros { 
        nome_fantasia:  undefined,
        razao_social:   undefined,
        cnpj:           undefined,
        cidade:         undefined,
        bairro:         undefined,        
    }  
       
    const inputFiltro = reactive<tsImputFiltros>({
        nome_fantasia: undefined, 
        razao_social:undefined,
        cnpj:undefined, 
        cidade:undefined,
        bairro:undefined,
    });

    const dados            = reactive<tsCampos[]>([]);

    const dadosPesquisados = reactive<tsCampos[]>([]);
    
    const token = codHeaderToken()

    const administrador = ref(false)

    const carregando = ref(false)

    onMounted(()=>{
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
        carregaDados()
    })

    function pesquisar(){
        gridPesquisa()
    }

    function limparPesquisa(){
        Object.assign(inputFiltro, {
            nome_fantasia:'',
            razao_social:'', 
            cnpj:'', 
            cidade:'', 
            bairro:''
        });

        gridPesquisa()
    }

    const linhaSelecionada = reactive<tsCampos>({
        id:'',
        nome_fantasia: '', 
        razao_social:'',
        cnpj: '', 
        cidade:'', 
        bairro:'',
        ativo:2,
        index:0,
        css:'',
    });

    function linhaFoco(linha: tsCampos, index:number){
        linha.index = index                                                             // Adiciona index para recarregar a grid        
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
       
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

    function linhaSelecionadaLimpar(){
        Object.assign(linhaSelecionada, {   
            id:'',
            nome_fantasia: '-', 
            razao_social:'',
            cnpj: '', 
            cidade:'', 
            bairro:'',
            ativo:2,
            index:0,
            css:''
        }
        ); 
    }
    
    async function gridPesquisa(){
        let pesquisados = dados?.filter(item => {
            return Object.entries(inputFiltro).every(([chave, valor]) => {
                if (!valor) return true; // ignora campos vazios
                return item[chave]?.toLowerCase().includes(valor.toLowerCase());
            });
        });
        dadosPesquisados.splice(0, dados.length, ...[]);                                                 //-Reseta dados
        Object.assign(dadosPesquisados, pesquisados);                                                    //-Seta dados pesquisados para grid
    }

    async function carregaDados(){
        try {
            const { data } = await axiosPlugin.get('empresas', token);
            Object.assign(dados, data.dados);
            recarregaCss(data.dados);             
            delete data.dados;
        } catch (error:any) {
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('userGridMsgErro')
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
        Object.assign(dadosPesquisados, arrayObj); 
    }

    async function desabilitaHabilita(){
        carregando.value = true
        await axiosPlugin.patch(`empresas-habitita-desabilita/${linhaSelecionada.id}`, token)
        .then(() =>{
            carregando.value = false
            dados[linhaSelecionada.index].ativo = linhaSelecionada.ativo == 1 ? 0 : 1;      //-Atualiza array de objeto dados da grid
            recarregaCss(dados)                                                             //-Recarrega a exibição da grid
            linhaSelecionadaLimpar()
            modalFechar('empresasHabilitaDesabilita')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('empresasMsgOk')
        })
        .catch(error =>{
            carregando.value = false
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('empresasMsgErro')
        })   
    }

    //********************************************************************************
    //************************************[BTNS]***************************************
    //*********************************************************************************
    function btnDesabilitarDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo == 1 ? false : true
        return trueFalse
    }
    function btnDesabilitarExibir(){
       let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo == 1 ? true : false
       return trueFalse
    }
    
    function btnHabilitarDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.id && linhaSelecionada.ativo == 0 ? false : true
        return trueFalse
    }
    function btnHabilitarExibir(){
       let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo == 0  ? true : false
       return trueFalse
    }
        
</script>
<!--=================================================================================================================-->
<template >    
        <div style="height: 10%; margin-left: 3px;">
            <div class="navegacao paddingZero "> 
                <div  class="paddingZero" style="text-align: left;">     
                    <button  class="btn btn-sm btn-outline-dark botao" >Usuários Lista</button>
                </div>
                <div class=" paddingZero" style="margin-top:2px;">
                    <button class="btnVermelho" 
                        v-if="btnDesabilitarExibir()" 
                        @click="modalAbrir('empresasHabilitaDesabilita')" 
                        :disabled="btnDesabilitarDisabled()">
                        Desabilitar
                    </button>
                    <button class="btnVerde" 
                        v-if="btnHabilitarExibir()"
                        @click="modalAbrir('empresasHabilitaDesabilita')"
                        :disabled="btnHabilitarDisabled()">
                        Habilitar
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
            </div>
        </div>         
        
        <div style="height: 90%; overflow-y: auto; margin-left: 3px;" >
            <div class=" div_thead tamTbl">
                <div class=" div_th t300">
                    Nome Fantasia <br> 
                    <input type="text" v-model="inputFiltro.nome_fantasia" class="inputBuscaTbl">
                </div>
                <div class=" div_th t500">
                    Razão Social <br> 
                    <input type="text" v-model="inputFiltro.razao_social" class="inputBuscaTbl">
                </div>
                <div class=" div_th t200">
                    Cnpj <br>
                    <input type="text" v-model="inputFiltro.cnpj" class="inputBuscaTbl">
                </div>
                <div class=" div_th t300">
                    Cidade  <br> 
                    <input type="text" v-model="inputFiltro.cidade"  class="inputBuscaTbl">
                </div>
                <div class=" div_th t250">
                    Bairro  <br> 
                    <input type="text" v-model="inputFiltro.bairro"  class="inputBuscaTbl">
                </div>
                <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
            </div>
            <div class=" div_tbody tamTbl " v-for="(i, index) in dadosPesquisados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                <div class=" div_td t300 text-wrap" @click="linhaFoco(i, index)">
                    {{i.nome_fantasia }}
                </div>
                <div class=" div_td t500 text-wrap" @click="linhaFoco(i, index)">
                    {{i.razao_social }}
                </div>
                <div class=" div_td t200 text-wrap" @click="linhaFoco(i, index)">
                    {{i.cnpj}}
                </div>
                <div class=" div_td t300 text-wrap" @click="linhaFoco(i, index)">
                    {{i.cidade}}
                </div>
                <div class=" div_td t250 text-wrap" @click="linhaFoco(i, index)">
                    {{i.bairro}}
                </div>
            </div>
        </div>

    <!-- MODAL HABILITA DESABILITA USER ===================================================================================== -->
    <ModalApp   :isOpen="modal.empresasHabilitaDesabilita" @close="modalFechar('empresasHabilitaDesabilita')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" :title="linhaSelecionada.nome_fantasia ?? ''" :mensagens="mensagensModal" >    
        
        <div class="row " style="padding-bottom: 50px;">
            <div v-if="carregando">
                <div class="col-md-12 div_centro"><div class="carregando"></div></div>
                <div class="col-md-12 div_centro">Aguarde</div>
            </div>
            <div v-else>
                <div class="col-md-12 div_centro"> 
                    <div class="desabilitar" v-if="linhaSelecionada.ativo == 1">Desabilitar Confirma?</div>
                    <div v-else>Habilitar Confirma?</div>
                </div>
                <div class="col-md-12 div_centro" style="padding-top: 10px;">
                    <button class="btnVerde" @click="desabilitaHabilita()" :disabled="!administrador">
                        Salvar 
                    </button>
                </div>
            </div>      
        </div>
        
    </ModalApp>    

    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.empresasMsgErro" @close="modalFechar('empresasMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.empresasMsgOk" @close="modalFechar('empresasMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
    
</template>

<!--=================================================================================================================-->
<style scoped>
    @import '@/assets/main.css';
    .containerApp{
        height: 600px;
    }
    .containerApp div{
        width: 100%;
        height: 600px;
    }

    .tamTbl{
        min-width: 1550px;
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


    .t50{
        width: '50px';
    }

    .t100{
        width: '100px';
    }

    .t200{
        width: '200px';
    }
    .t250{
        width: '250px';
    }
    .t300{
        width: '300px';
    }
    .t400{
        width: '400px';
    }
    .t500{
        width: '500px';
    }

    .centro{
        text-align: center;
    }
    .t100porCento{
        width: 100%;
    }
    .desabilitar{
        color: #ff0000;
        font-weight: bold;
        font-size: 23px;
    }
    .habilitar{
        color: #087c42;
        font-weight: bold;
        font-size: 23px;
    }
</style>