<script setup lang="ts">
    import { reactive } from 'vue';
    import { ref, onMounted } from 'vue';
    import { codHeaderToken, codUserLogado } from '@/codigos'
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
        cnpj:           string | null,
        cidade:         string | null,
        bairro:         string | null,
        ativo:          number | null,
        index:          number, 
        css:            string | null,       
    }

    interface tsImputFiltros { 
        ativo:          number | null,
        nome_fantasia:  string | null,
        cnpj:           string | null,
        cidade:         string | null,
        bairro:         string | null,        
    }

    interface tsProps {
        user_id: string;
    }

    const props = defineProps<tsProps>();
       
    const inputFiltro = reactive<tsImputFiltros>({
        ativo:'',
        nome_fantasia:'', 
        cnpj:'', 
        cidade:'', 
        bairro:''
    });

    const dados         = reactive<tsCampos[]>([]);
    
    const token = codHeaderToken()

    const administrador = ref(false)

    onMounted(()=>{
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
    })

    function pesquisar(){
        gridPesquisa()
    }

    function limparPesquisa(){
        Object.assign(inputFiltro, {
            ativo:"",
            nome_fantasia:'', 
            cnpj:'', 
            cidade:'', 
            bairro:''
        });

        gridPesquisa()
    }

    const linhaSelecionada = reactive<tsCampos>({
        id:'',
        nome_fantasia: '', 
        cnpj: '', 
        cidade:'', 
        bairro:'',
        ativo:0,
        index:0,
        css:'',
    });

    function linhaFoco(linha: tsCampos, index:number){
        linha.index = index                                                             // Adiciona index para recarregar a grid        
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
       
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
        let camposPesquisados  =  {...apenasInputsPreenchidos(inputFiltro)}
       
        try {
            const { data } = await axiosPlugin.post('empresas-em-user-update-grid', camposPesquisados, token);
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
                case i.ativo == 'ativo': i.css = 'ativo'; break;
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

    async function desabilitaHabilita(){
        try{
            let backDados = {id:linhaSelecionada.id, ativo:linhaSelecionada.ativo, user_id:props.user_id}
            const { data } = await axiosPlugin.patch(`empresas-em-user-update-habitita-desabilita/${linhaSelecionada.id}`, backDados, token);
            dados[linhaSelecionada.index].ativo = linhaSelecionada.ativo == 1 ? 0 : 1;      //-Atualiza array de objeto dados da grid
            recarregaCss(dados)                                                                                 //-Recarrega a exibição da grid
            linhaSelecionadaLimpar()
            modalFechar('empresasParaUserUpdateHabilitaDesabilita')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('empresasParaUserUpdateMsgOk')
        }catch(error:any){
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('empresasParaUserUpdateMsgErro')
        }         
    }

    function linhaSelecionadaLimpar(){
        Object.assign(linhaSelecionada, {   
            id:'',
            ativo: '', 
            admin: '', 
            name:'', 
            email:'',
            email_envio_msg:'',
            css:'',
            index:0}
        ); 
    }

    //********************************************************************************
    //************************************[BTNS]***************************************
    //*********************************************************************************
    function btnDesabilitarDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo==1? false : true
        return trueFalse
    }
    function btnDesabilitarExibir(){
       let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo==1? true : false
       return trueFalse
    }
    
    function btnHabilitarDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.id && linhaSelecionada.ativo==0? false : true
        return trueFalse
    }
    function btnHabilitarExibir(){
       let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo==1? true : false
       return trueFalse
    }
        
</script>
<!--=================================================================================================================-->
<template >
    <div class=" paddingZero" style="margin-top:2px;">
        <button class="btnVermelho" 
            v-if="btnDesabilitarExibir()" 
            @click="modalAbrir('empresasParaUserUpdateHabilitaDesabilita')" 
            :disabled="btnDesabilitarDisabled()">
            Desabilitar
        </button> 
        <button class="btnAzul" 
            v-if="!btnHabilitarExibir()"
            @click="modalAbrir('empresasParaUserUpdateHabilitaDesabilita')"
            :disabled="btnHabilitarDisabled()">
            Habilitar
        </button>
        <button class="btnVerde" 
            @click="pesquisar()" 
            :disabled="!administrador">
            Pesquisar
        </button> 
        <button class="btnAmarelo" 
            @click="limparPesquisa()" 
            :disabled="!administrador">
            Limpar Pesquisa
        </button> 
        
    </div>
    
    <div style="overflow-y: auto; margin-left: 3px;" >
        <div class=" div_thead tamTbl">
            <div class=" div_th t50">
                 <br>
                <select name="status" v-model="inputFiltro.ativo" class="inputBuscaTbl">
                    <option value=""></option>
                    <option value="1" class="ok">&#10004;</option>
                    <option value="0" class="obs">&#10008;</option>
                </select>
            </div>
            <div class=" div_th t400">
                Empresa <br> 
                <input type="text" v-model="inputFiltro.nome_fantasia" class="inputBuscaTbl">
            </div>
            <div class=" div_th t200">
                Cnpj <br>
                 <input type="text" v-model="inputFiltro.cnpj" class="inputBuscaTbl">
            </div>
            <div class=" div_th t200">
                Cidade  <br> 
                <input type="text" v-model="inputFiltro.cidade"  class="inputBuscaTbl">
            </div>
            <div class=" div_th t200">
                Bairro  <br> 
                <input type="text" v-model="inputFiltro.bairro"  class="inputBuscaTbl">
            </div>
            <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
        </div>
        <div class=" div_tbody tamTbl " v-for="(i, index) in dados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                <div class=" div_td t50 text-wrap" @click="linhaFoco(i, index)">
                    <span v-if="i.ativo == 1" class="ok">&#10004;</span> 
                    <span v-else class="obs">&#10008;</span>
                </div>
                <div class=" div_td t400 text-wrap" @click="linhaFoco(i, index)">
                    {{i.nome_fantasia }}
                </div>
                <div class=" div_td t200 text-wrap" @click="linhaFoco(i, index)">
                    {{i.cnpj}}
                </div>
                <div class=" div_td t200 text-wrap" @click="linhaFoco(i, index)">
                    {{i.cidade}}
                </div>
                <div class=" div_td t200 text-wrap" @click="linhaFoco(i, index)">
                    {{i.bairro}}
                </div>
        </div>
    </div>
    
    <!-- MODAL HABILITA DESABILITA USER ===================================================================================== -->
    <ModalApp   :isOpen="modal.empresasParaUserUpdateHabilitaDesabilita" @close="modalFechar('empresasParaUserUpdateHabilitaDesabilita')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Edição de Usuário" :mensagens="mensagensModal" >    
        <div class="row " style="padding-bottom: 50px;">
            <div class="col-md-12 div_centro"> 
                {{ btnHabilitarExibir() ? "Desabilitar Confirma?" : "Habilitar Confirma?" }}
            </div>
            <div class="col-md-12 div_centro" style="padding-top: 10px;">
                <button class="btnVerde" @click="desabilitaHabilita()" :disabled="!administrador">
                    Salvar 
                </button>
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
    .containerApp{
        height: 600px;
    }
    .containerApp div{
        width: 100%;
        height: 600px;
    }

    .tamTbl{
        min-width: 1100px;
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

    .t400{
        width: '400px';
    }

    .centro{
        text-align: center;
    }
    .erroInputBorda {border: 2px solid red;}
    
</style>