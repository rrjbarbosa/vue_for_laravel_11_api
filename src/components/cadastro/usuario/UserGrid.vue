<script setup lang="ts">
    import PaginarApp from '@/components/diversos/paginacao/PaginarApp.vue';
    import type { tsInputFiltro } from './tsInputFiltro.types';
    import type { tsdados } from '@/components/cadastro/usuario/tsdados.types';
    import type { tsPaginarApp } from '@/components/diversos/paginacao/tsPaginarApp.types';
    import { reactive } from 'vue';
    import { ref, onMounted } from 'vue';
    import { codHeaderToken, codUserLogado, codMsgInputsErros } from '@/codigos'
    import { axiosPlugin } from '@/plugins/axios'
    import { useRouter } from 'vue-router'
    import ModalApp from '@/components/diversos/modal/ModalApp.vue'
    import { modalAppCod } from '@/components/diversos/modal/modalAppCod'

    const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
    const mensagensModal = reactive<string[]>([]);

    interface Campos { 
        name:               string | null
        email:              string | null
        email_envio_msg:    string | null,
        senha:              string | null,
        confirmarSenha:     string | null,
    }

    const router = useRouter()
       
    const inputFiltro = reactive<tsInputFiltro>({
        admin:false, 
        ativo:'', 
        name:'', 
        email:''
    });

    const dados         = reactive<tsdados[]>([]);
    
    const camposComErro = ref<string[]>([])

    const camposEdicao  = reactive<Campos>({
        name:'',
        email:'',
        email_envio_msg:'',
        senha:'',
        confirmarSenha:''

    })

    const token = codHeaderToken()

    const paginacao =  reactive<tsPaginarApp>({
        page:1, 
        ultima:0,
        qtdPorPagina:10 , 
        qtdTotal:0, 
        paginacaoPaginas:[],
        acao:'GRID'
    })

    const administrador = ref(false)

    onMounted(()=>{
        gridPesquisaPaginacao()
        administrador.value = codUserLogado()['admin'] == 1 ? true : false
    })

    function limpaCampos(){
        Object.assign(camposEdicao, {
            name: '',
            email: '',
            email_envio_msg: '',
            senha:'',
            confirmarSenha:''
        });
    }

    function pesquisar(){
        paginacao.page = 1
        gridPesquisaPaginacao()
    }

    function limparPesquisa(){
        Object.assign(inputFiltro, {
            admin:false, 
            ativo:'', 
            name:'', 
            email:''
        });

        Object.assign(paginacao, {
            page:1, 
            ultima:0,
            qtdPorPagina:10 , 
            qtdTotal:0, 
            paginacaoPaginas:[],
            acao:'GRID'
        });

        gridPesquisaPaginacao()
    }

    function gridPaginacao($event: tsPaginarApp){
        paginacao.page         = $event.page
        paginacao.qtdPorPagina = $event.qtdPorPagina
        paginacao.qtdTotal     = $event.qtdTotal
        gridPesquisaPaginacao()                
    }

    const linhaSelecionada = reactive<tsdados>({
        id:'',
        ativo: '', 
        admin: '', 
        name:'', 
        email:'',
        email_envio_msg:'',
        css:'',
        index:''
    });

    function linhaFoco(linha: tsdados, index:number){
        linha.index = index                                                             // Adiciona index para recarregar a grid        
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
       
        let arrayObj = []
        for(let i of dados ){
            switch(true){
                case i.ativo == 1 && i.id == linhaSelecionada.id :     i.css =  'ativoSelect';    break;
                case i.ativo == 0 && i.id == linhaSelecionada.id :     i.css =  'inativoSelect';  break;
                case i.ativo == 1  :                                   i.css =  'ativo';          break;
                case i.ativo == 0  :                                   i.css =  'inativo';        break;            
            }
            arrayObj.push(i);
        } 
        Object.assign(dados, arrayObj);
    }
    
    async function gridPesquisaPaginacao(){
        let camposPesquisados  =  {...paginacao, ...apenasInputsPreenchidos(inputFiltro)}
       
        try {
            const { data } = await axiosPlugin.post('users-grid-pesquisa', camposPesquisados, token);

            recarregaCss(data.users.data);
            delete data.users.data;

            paginacao.paginacaoPaginas = [];
            paginacao.page             = data.users.current_page;
            paginacao.ultima           = data.users.last_page;
            paginacao.qtdPorPagina     = data.users.per_page;
            paginacao.qtdTotal         = data.users.total;
            paginacao.paginacaoPaginas = data.paginar;

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
                default:           i.css = 'inativo';        
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

    const abreFechaModalCriar = () => {
        limpaCampos()    
        modalAbrir('userUpdateEdicaoUser') 
    }

    function limpaMsgDigitarInput(campo: String){
        camposComErro.value = camposComErro.value.filter(item => item !== campo);
    } 

    async function desabilitaHabilita(){
        try{
            const { data } = await axiosPlugin.patch(`users-habilita-desabilita/${linhaSelecionada.id}`, {ativo:linhaSelecionada.ativo}, token);
            dados[linhaSelecionada.index].ativo = linhaSelecionada.ativo == 1 ? 0 : 1;    //-Atualiza array de objeto dados da grid
            recarregaCss(dados)                                                           //-Recarrega a exibição da grid
            linhaSelecionadaLimpar()
            modalFechar('userGridHibilitaDsabilita')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('userUpdateMsgOk')
        }catch(error:any){
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('userGridMsgErro')
        }         
    }

    async function admim(){
         try{
            const { data } = await axiosPlugin.patch(`users-admin/${linhaSelecionada.id}`, {admin:linhaSelecionada.admin}, token);
            dados[linhaSelecionada.index].admin = linhaSelecionada.admin == 1 ? 0 : 1;    //-Atualiza array de objeto dados da grid
            recarregaCss(dados)                                                           //-Recarrega a exibição da grid
            linhaSelecionadaLimpar()
            modalFechar('userGridAdmin')
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('userUpdateMsgOk')
        }catch(error:any){
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('userGridMsgErro')
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
            index:''}
        ); 
    }

    async function salvar(){
        let erros = validarCampos()
        if(erros>0){
            return
        }

        try{
            const { data } = await axiosPlugin.post(`users-create`, camposEdicao, token);
            Object.assign(mensagensModal, ['Salvo com Sucesso']);
            modalAbrir('userUpdateMsgOk')
            limpaCampos()
            dados.push(data.dados)
            dados.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
            recarregaCss(dados)
        }catch(error:any){
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(error.response.data.errors)
            Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
            modalAbrir('userGridMsgErro')
        } 
    }

    function validarCampos() {
        const CamposObrigatorios = {
            name:               ['Falta Nome'], 
            email:              ['Falta E-mal'], 
            email_envio_msg:    ['Falta o E-mail de Envio para mensagens'],
            senha:              ['A Senha é Obrigatório'],
            confirmarSenha:     ['Falta confirmar Senha']
        }        
        Object.keys(CamposObrigatorios).forEach((key) => {                          // Percorre todas as chaves (keys) do objeto CamposObrigatorios
            const campo = key as keyof typeof camposEdicao                          // Faz um *type assertion* dizendo ao TypeScript que a chave é garantidamente uma das chaves de camposEdicao
            if (camposEdicao[campo]) {                                              //-Verifica se o campo está preenchido
                delete CamposObrigatorios[campo]                                    //-Retira o erro se o campo estivar preenchido
            }
        })
        if(camposEdicao.senha != camposEdicao.confirmarSenha){                      //-Adiciona uma validação personalizada
            CamposObrigatorios.senha = ['As senhas não são iguais']     
        }
        let qtdErros = Object.keys(CamposObrigatorios).length                       //-Qtd índices do Objeto de campos com erro
        if(qtdErros>=1){  
            camposComErro.value =  []
            camposComErro.value = codMsgInputsErros(CamposObrigatorios)                                                          //-Exibe os erros na Modal
            Object.assign(mensagensModal, modalMsgErro(CamposObrigatorios));
            modalAbrir('userGridMsgErro')
        }
        return qtdErros
    }

    //********************************************************************************
    //************************************[BTNS]***************************************
    //*********************************************************************************

    function btnCriar(){
        let trueFalse = codUserLogado()['admin'] == 1 ? false : true
        return trueFalse
    }
    function btnEditar(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.id ? false : true
        return trueFalse
    }
    function btnHabilitarDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.id && !linhaSelecionada.ativo? false : true
        return trueFalse
    }
    function btnHabilitarExibir(){
       let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo? true : false
       return trueFalse
    }
    function btnDesabilitarDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo? false : true
        return trueFalse
    }
    function btnDesabilitarExibir(){
       let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.ativo? true : false
       return trueFalse
    }
    function btnTransformaAdminDisabled(){
        let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.id && linhaSelecionada.admin == 0? false : true
        return trueFalse
    }
    function btnTransformaAdminExibir(){
       let trueFalse = codUserLogado()['admin'] == 1  && linhaSelecionada.admin == 0? true : false
       return trueFalse
    }
     function btnRetiraAcessoAdminDisabled(){
        let trueFalse = codUserLogado()['admin'] != 1 ? true : false
        return trueFalse
    }
    function btnRetiraAcessoAdminExibir(){
       let trueFalse = codUserLogado()['admin'] == 1 && linhaSelecionada.id  && linhaSelecionada.admin == 1? true : false
       return trueFalse
    }      
    
    //********************************************************************************
    //************************************[EDIÇÃO]************************************
    //********************************************************************************
    function editar(linha: tsdados) {
        // Redireciona para a rota de edição com o ID como parâmetro
        router.push({ name: 'user-update', params: { id: linha.id } })
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
                    @click="abreFechaModalCriar" 
                    :disabled="btnCriar()">
                    Criar
                </button>
                <button class="btnVerde" 
                    @click="editar(linhaSelecionada)" 
                    :disabled="btnEditar()">
                    Editar 
                </button>
                <button class="btnVermelho" 
                    v-if="btnDesabilitarExibir()" 
                    @click="modalAbrir('userGridHibilitaDsabilita')" 
                    :disabled="btnDesabilitarDisabled()">
                    Desabilitar
                </button> 
                <button class="btnAzul" 
                    v-if="!btnHabilitarExibir()"
                    @click="modalAbrir('userGridHibilitaDsabilita')"
                    :disabled="btnHabilitarDisabled()">
                    Habilitar
                </button>
                <button class="btnAmarelo" 
                    @click="pesquisar()" 
                    :disabled="!administrador">
                    Pesquisar
                </button> 
                <button class="btnAmarelo" 
                    @click="limparPesquisa()" 
                    :disabled="!administrador">
                    Limpar Pesquisa
                </button> 
                <button class="btnAzul" 
                    @click="modalAbrir('userGridAdmin')"    
                    v-if="btnTransformaAdminExibir()" 
                    :disabled="btnTransformaAdminDisabled()">
                    Transformar em Admin
                </button>
                <button class="btnVermelho" 
                    @click="modalAbrir('userGridAdmin')" 
                    v-if="btnRetiraAcessoAdminExibir()" 
                    :disabled="btnRetiraAcessoAdminDisabled()">
                    Retirar acesso Admin 
                </button>
            </div>
        </div>
    </div>
    <div style="height: 80%; overflow-y: auto; margin-left: 3px;" >
        <div class=" div_thead tamTbl">
            <div class=" div_th t100">
                Admin <br> 
                <input type="checkbox" v-model="inputFiltro.admin" class="inputBuscaTbl">
            </div>
            <div class=" div_th t200">
                Nome <br>
                 <input type="text" v-model="inputFiltro.name" class="inputBuscaTbl">
            </div>
            <div class=" div_th t400">
                Email  <br> 
                <input type="text" v-model="inputFiltro.email"  class="inputBuscaTbl">
            </div>
            <input type="text" style="opacity: 0; position: absolute; left: -9999px;"> <!-- input de sacrifício para receber o email salgo do google, senão é preenchido automaticamente no input da pesquisa-->
        </div>
        <div class=" div_tbody tamTbl " v-for="(i, index) in dados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                <div class=" div_td t100 text-wrap centro" @click="linhaFoco(i, index)">
                    <span v-if="i.admin == 1" class="s_admin">&#10004;</span> 
                    <span v-else class="n_admin">&#10008;</span>
                </div>
                <div class=" div_td t200 text-wrap" @click="linhaFoco(i, index)">
                    {{i.name }}
                </div>
                <div class=" div_td t400 text-wrap" @click="linhaFoco(i, index)">
                    {{i.email}}
                </div>
        </div>
    </div>
    <div style="height: 10%; margin-left: 3px;">
        <div class="paginacao paddingZero"> 
                <PaginarApp :propsPaginacao="paginacao" 
                            @paginacao="gridPaginacao($event)"/>
            </div>
    </div>
    <!-- MODAL CRIAR USER =================================================================================================== -->
    <ModalApp   :isOpen="modal.userUpdateEdicaoUser" @close="modalFechar('userUpdateEdicaoUser')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Edição de Usuário" :mensagens="mensagensModal" >
        <div class="paddingDez">   
            <div class="paddingZero div_centro">
                <button @click="salvar()"   class="btn btn-sm btn-success botao" title="Salvar" >Salvar</button>
            </div>             
                           
            <div class="label">Nome</div>                                    
            <input type="text" v-model="camposEdicao.name" @input="limpaMsgDigitarInput('name')"  
                class="form-control inputCss" 
                :class="{ erroInputBorda: camposComErro.includes('name') }"
                placeholder="Digite o Nome">                                
            
            <div class="label">Email</div>                               
            <input type="text" v-model="camposEdicao.email" @input="limpaMsgDigitarInput('email')"  
                class="form-control inputCss" 
                :class="{ erroInputBorda: camposComErro.includes('email') }"
                placeholder="Digite o Email">                                
            
            <div class="label">Email para envio de menssagens</div>
            <input type="text" v-model="camposEdicao.email_envio_msg" @input="limpaMsgDigitarInput('email_envio_msg')"  
                class="form-control inputCss" 
                :class="{ erroInputBorda: camposComErro.includes('email_envio_msg') }"
                placeholder="Digite o Email para envio de menssagens">   

            <div class="label">Senha</div>
            <input type="password" v-model="camposEdicao.senha" @input="limpaMsgDigitarInput('senha')"  
                class="form-control"
                :class="{ erroInputBorda: camposComErro.includes('senha') }"
                placeholder="Digite a Senha" autocomplete="off">
            
            <div class="label">Confirmar Senha</div>
            <input type="password" v-model="camposEdicao.confirmarSenha" @input="limpaMsgDigitarInput('confirmarSenha')"  
                class="form-control"
                :class="{ erroInputBorda: camposComErro.includes('confirmarSenha') }" 
                placeholder="Confirme a Senha" autocomplete="off">
                            

        </div> 
    </ModalApp>
    
    <!-- MODAL HABILITA DESABILITA USER ===================================================================================== -->
    <ModalApp   :isOpen="modal.userGridHibilitaDsabilita" @close="modalFechar('userGridHibilitaDsabilita')"  
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

    <!-- MODAL ADMIN ======================================================================================================== -->
    
    <ModalApp   :isOpen="modal.userGridAdmin" @close="modalFechar('userGridAdmin')"  
                :largura="'80%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Edição de Usuário" :mensagens="mensagensModal" >    
        <div class="row " style="padding-bottom: 50px;">
            <div class="col-md-12 div_centro">
                {{ !linhaSelecionada.admin  ? "Transformar em Admin, Confirma?" : "Retirar acesso de Admin, Confirma?" }}
            </div>
            <div class="col-md-12 div_centro" style="padding-top: 10px;">
                <button class="btnVerde" @click="admim()" :disabled="!administrador">
                    Salvar 
                </button>
            </div>            
        </div>
    </ModalApp>    
    

    <!-- MODAIS MSG ERRO / SUCESSO=========================================================================================== -->
    <ModalApp   :isOpen="modal.userGridMsgErro" @close="modalFechar('userGridMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <ModalApp   :isOpen="modal.userUpdateMsgOk" @close="modalFechar('userUpdateMsgOk')" 
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
        min-width: 1000px;
    }
    .aguarde{
        background-color: rgb(243, 146, 20);
    }
    .s_admin{
        color:green;
        font-weight: bold;
        font-size: 15px;
    }
    .n_admin{
        color: rgb(128, 126, 126);
        font-weight: bold;
        font-size: 15px;
    }


    .t100{
        width: 10%;
    }

    .t200{
        width: 30%;
    }

    .t400{
        width: 60%;
    }

    .centro{
        text-align: center;
    }
    .erroInputBorda {border: 2px solid red;}
    
</style>