<script setup lang="ts">
    import { reactive } from 'vue';
    import { ref, onMounted, nextTick } from 'vue';
    import { codHeaderToken, codUserLogado} from '@/codigos'
    import { axiosPlugin } from '@/plugins/axios'
    import ModalApp from '@/components/diversos/modal/ModalApp.vue'
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod'
    import SetorUpdate from './SetorUpdate.vue';
    
    const { modal,  modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal = reactive<string[]>([]);

    defineExpose({
        recarregaCss
    });

    const carregaUpdate = ref<any>(null)

    interface tsCampos { 
        id:     string | null,
        ativo:  number,
        setor:  string | null,
        index:  number, 
        css:    string | null,       
    }

    interface tsImputFiltros { 
        setor:   undefined,
    }  
       
    const inputFiltro = reactive<tsImputFiltros>({
        setor: undefined, 
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
            setor:''            
        });

        gridPesquisa()
    }

    const linhaSelecionada = reactive<tsCampos>({
        id:'',
        setor: '', 
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
            ativo: '2', 
            setor:'',
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
        carregando.value = true;
        modalAbrir('setoresCarregando');

        try {
            const { data } = await axiosPlugin.get('setores', token); 
            carregando.value = false;
            modalFechar('setoresCarregando');
            Object.assign(dados, data?.dados ?? []);
            recarregaCss(data?.dados ?? []);   
            delete data.dados;         
        } catch (error:any) {
            carregando.value = false;
            modalFechar('setoresCarregando');
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('setoresMsgErro');
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
        await axiosPlugin.patch(`setor-habitita-desabilita/${linhaSelecionada.id}`, token)
        .then(() =>{
            carregando.value = false
            dados[linhaSelecionada.index].ativo = linhaSelecionada.ativo == 1 ? 0 : 1;      //-Atualiza array de objeto dados da grid
            recarregaCss(dados)                                                             //-Recarrega a exibição da grid
            linhaSelecionadaLimpar()
            modalFechar('setoresHabilitaDesabilita')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('setoresMsgOk')
        })
        .catch(error =>{
            carregando.value = false
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalFechar('setoresHabilitaDesabilita')
            if(error.response.data.errors.msgsAuthorize.includes('*** USUÁRIOS VINCULADOS A ESSE SETOR ***')){
                modalFechar('setoresHabilitaDesabilita')
                modalAbrir('setorDesabilitarRemoverVinculoComTodosUsuarios')
            }            
        })   
    }

    async function desabilitarRemoverVinculoComTodosUsuarios(){
        carregando.value = true
        await axiosPlugin.patch(`setor-desabilita-remover-vinculo-usuarios/${linhaSelecionada.id}`, token)
        .then(() =>{
            carregando.value = false
            dados[linhaSelecionada.index].ativo = 0;                                      //-Atualiza array de objeto dados da grid
            recarregaCss(dados)                                                             //-Recarrega a exibição da grid
            modalFechar('setorDesabilitarRemoverVinculoComTodosUsuarios')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('setoresMsgOk')
        })
        .catch(error =>{
            carregando.value = false
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalFechar('setorDesabilitarRemoverVinculoComTodosUsuarios')
            modalAbrir('setoresMsgErro')
        })
    }

    async function editar(){
        try{ 
            modalAbrir('setoresCarregando') 
            const { data } = await axiosPlugin.get(`setor-edit/${linhaSelecionada.id}`, token);
                modalFechar('setoresCarregando')
                carregaUpdate.value.setaDadosParaUpdate(data.setores)    
                modalAbrir('setorEditar')       
        }catch(error:any){
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('setoresMsgErro')
        } 
    }

    function UpdateRealizado($event: tsCampos){
        const item = dadosPesquisados.find(i => i.id === $event.id)    //find(...) percorre o array procurando um item que tenha o mesmo id do $event.id.
        Object.assign(item, $event)                         //Atualiza o item encontrado, Mas de forma genérica e dinâmica — qualquer campo existente em $event substitui o valor em item.
    }

    //********************************************************************************
    //************************************[BTNS]***************************************
    //*********************************************************************************
    function btnEditarDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.id != '' ? false : true
        return trueFalse
    }
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
                    <button class="btnVerde" 
                        @click="editar()" 
                        :disabled="btnEditarDisabled()">
                        Editar
                    </button>
                    <button class="btnVermelho" 
                        v-if="btnDesabilitarExibir()" 
                        @click="modalAbrir('setoresHabilitaDesabilita')" 
                        :disabled="btnDesabilitarDisabled()">
                        Desabilitar
                    </button>
                    <button class="btnVerde" 
                        v-if="btnHabilitarExibir()"
                        @click="modalAbrir('setoresHabilitaDesabilita')"
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
                <div class=" div_th vw-100" >
                    Setor <br> 
                    <input type="text" v-model="inputFiltro.setor" class="inputBuscaTbl">
                </div>
                <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
            </div>
            <div class=" div_tbody tamTbl " v-for="(i, index) in dadosPesquisados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                <div class=" div_td vw-100 text-wrap" @click="linhaFoco(i, index)">
                    {{i.setor }}
                </div>                
            </div>
        </div>

    
    <!-- MODAL AGUARDE ===================================================================================================== -->
    <ModalApp   :isOpen="modal.setoresCarregando" @close="modalFechar('setoresCarregando')"  
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="..." :mensagens="mensagensModal" >    
        <div class="col-md-12 div_centro"><div class="carregando"></div></div>
        <div class="col-md-12 div_centro">Aguarde</div>
    </ModalApp>
    <!-- MODAL EDITAR SETOR ============================================================================================== -->
    <ModalApp   :isOpen="modal.setorEditar" @close="modalFechar('setorEditar')"  
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="..." :mensagens="mensagensModal" >    
        <SetorUpdate ref="carregaUpdate" @setorEditado="(UpdateRealizado($event))"/>
    </ModalApp>    
    <!-- MODAL HABILITA DESABILITA USER ===================================================================================== -->
    <ModalApp   :isOpen="modal.setoresHabilitaDesabilita" @close="modalFechar('setoresHabilitaDesabilita')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" :title="linhaSelecionada.setor ?? ''" :mensagens="mensagensModal" >    
        
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
    <!-- MODAL DESABILITA E RETIRA O SETOR VINCULADO A TODOS USUÁRIOS======================================================== -->
    <ModalApp   :isOpen="modal.setorDesabilitarRemoverVinculoComTodosUsuarios" @close="modalFechar('setorDesabilitarRemoverVinculoComTodosUsuarios')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" :title="linhaSelecionada.setor ?? ''" :mensagens="mensagensModal" >    
        
        <div class="row " style="padding-bottom: 50px;">
            <div v-if="carregando">
                <div class="col-md-12 div_centro"><div class="carregando"></div></div>
                <div class="col-md-12 div_centro">Aguarde</div>
            </div>
            <div v-else>
                <div class="col-md-12 div_centro msgErro"> 
                    <div>O setor será removido de todos usuários... Desabilitar Confirma?</div>
                </div>
                <div class="col-md-12 div_centro" style="padding-top: 10px;">
                    <button class="btnVerde" @click="desabilitarRemoverVinculoComTodosUsuarios()" :disabled="!administrador">
                        Salvar 
                    </button>
                </div>
                <div class="msgTopBotton">                           
                    <div v-for="(msg, index) in mensagensModal.filter(Boolean)" :key="index" >   <!-- filter(Boolean) Remove null, undefined, "", 0, false e NaN (todos valores falsy): -->
                        <div class="msgErro">
                            <span style="color: brown; font-size: 20px;">&#8277;</span>{{'  ' + msg}}
                        </div>    
                    </div>
                </div>
            </div>      
        </div>
        
    </ModalApp>
    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.setoresMsgErro" @close="modalFechar('setoresMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.setoresMsgOk" @close="modalFechar('setoresMsgOk')" 
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
        min-width: 1650px;
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
    .msgErro{ng-bottom: 5px;
        font-weight: bold;
        color: brown;
        padding-left: 10PX;
    }
</style>