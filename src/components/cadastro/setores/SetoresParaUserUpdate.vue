<script setup lang="ts">
    import { reactive } from 'vue';
    import { ref, onMounted, nextTick } from 'vue';
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
        };
    }

    const props = defineProps<tsProps>();
       
    const inputFiltro = reactive<tsImputFiltros>({
        setor:''
    });

    const dados         = reactive<tsCampos[]>([]);
    
    const token = codHeaderToken()

    const administrador = ref(false)

    const carregando = ref(false)

    onMounted(()=>{
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
        recarregaCss(props.dadosEdit.setores)
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
        let camposPesquisados       =  {...apenasInputsPreenchidos(inputFiltro)}
        camposPesquisados.user_id   = props.dadosEdit.usuario?.id
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
        let backDados = {id:linhaSelecionada.id, ativo:linhaSelecionada.ativo, user_id:props.dadosEdit.usuario?.id}
        await axiosPlugin.patch(`empresas-em-user-update-habitita-desabilita/${linhaSelecionada.id}`, backDados, token)
        .then(() =>{
            carregando.value = false
            dados[linhaSelecionada.index].ativo = linhaSelecionada.ativo == 1 ? 0 : 1;      //-Atualiza array de objeto dados da grid
            recarregaCss(dados)                                                             //-Recarrega a exibição da grid
            linhaSelecionadaLimpar()
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

    function linhaSelecionadaLimpar(){
        Object.assign(linhaSelecionada, {   
            id:'',
            ativo: '', 
            setor: '', 
            css:'',
            index:0}
        ); 
    }
</script>
<!--=================================================================================================================-->
<template >
    <div class=" paddingZero" style="margin-top:2px; margin-bottom: 2px;">
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
    
    <div style="overflow-y: auto; margin-left: 3px;" >
        <div class=" div_thead tamTbl">
            <div class=" div_th t50">
                <div>---</div><br>                 
            </div>
            <div class=" div_th t400">
                Setor <br> 
                <input type="text" v-model="inputFiltro.setor" class="inputBuscaTbl">
            </div>
            <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
        </div>
        <div class=" div_tbody tamTbl " v-for="(i, index) in dados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                <div class=" div_td t50 text-wrap" @click="linhaFoco(i, index)">
                     
                    <button v-if="i.ativo" class="btn btn-outline-success btnAtivado" @click="modalAbrir('setoresParaUserUpdateEditar')">&#10004;</button>
                    <button v-else class="btn btn-outline-danger btnInativado" @click="modalAbrir('setoresParaUserUpdateEditar')">&#10008;</button>    

                </div>
                <div class=" div_td t400 text-wrap" @click="linhaFoco(i, index)">
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
        padding: 0px;
    }

    .btnInativado{
        font-weight: bold;
        font-size: 12px;
        padding: 0px;
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