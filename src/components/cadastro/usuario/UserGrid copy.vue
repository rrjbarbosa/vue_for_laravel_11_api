<script setup lang="ts">
    import PaginarApp from '@/components/diversos/paginacao/PaginarApp.vue';
    import type { tsInputFiltro } from './tsInputFiltro.types';
    import type { tsdados } from '@/components/cadastro/usuario/tsdados.types';
    import type { tsPaginarApp } from '@/components/diversos/paginacao/tsPaginarApp.types';
    import { reactive } from 'vue';
    import { ref, onMounted } from 'vue';
    import { codHeaderToken } from '@/codigos'
    import { axiosPlugin } from '@/plugins/axios'
    import { useRouter } from 'vue-router'
    
    
    onMounted(()=>{
        gridPesquisaPaginacao()
    })

    const router = useRouter()
    
    
    const inputFiltro = reactive<tsInputFiltro>({
        admin:false, 
        ativo:'', 
        name:'', 
        email:''
    });

    const dados = ref<tsdados[]>([]);

    const token = codHeaderToken()

    const paginacao =  reactive<tsPaginarApp>({
        page:1, 
        ultima:0,
        qtdPorPagina:10 , 
        qtdTotal:0, 
        paginacaoPaginas:[],
        acao:'GRID'
    })

    function gridPaginacao($event: tsPaginarApp){console.log($event)
        paginacao.page         = $event.page
        paginacao.qtdPorPagina = $event.qtdPorPagina
        paginacao.qtdTotal     = $event.qtdTotal
        gridPesquisaPaginacao()                
    }

    const linhaSelecionada = reactive<tsdados>({
        id:'',
        ativo: 1, 
        admin: 1, 
        name:'', 
        email:'',
        email_envio_msg:'',
        css:''
    });
    const ocultaBtn = false;
    const  ocultaBtnMsg = '';

    function linhaFoco(linha: tsdados){
        Object.assign(linhaSelecionada, linha);                                         // Object.assign para atualizar linha selecionada       
       
        let arrayObj = []
        for(let i of dados.value ){
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

        } catch (error) {
            console.error('Erro na requisição:', error);
            // opcional: tratar erro visualmente para o usuário
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
        dados.value  = arrayObj
    }

    function apenasInputsPreenchidos(obj: Record<string, any>) {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) =>
                value !== '' && value !== null && value !== undefined
            )
        );
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
<template class="containerApp">
    <div>
        <div class="navegacao paddingZero "> 
            <div  class="paddingZero" style="text-align: left;">     
                <button  class="btn btn-sm btn-outline-dark botao" >Usuários Lista</button>
            </div>
            <div class=" paddingZero" style="margin-top:2px;">
                <button class="btnVerde"    @click="criar()"                                                                  :disabled="ocultaBtn" >Criar</button>
                <button class="btnVerde"    @click="editar(linhaSelecionada)"               v-if="linhaSelecionada.ativo == 1 && !ocultaBtn"  :disabled="ocultaBtn" >Editar</button> 
                <button class="btnVerde"    @click="habilitaDesabilita()"   v-if="linhaSelecionada.ativo == 1 && !ocultaBtn"  :disabled="ocultaBtn" >Desabilitar</button> 
                <button class="btnAmarelo"  @click="habilitaDesabilita()"   v-if="linhaSelecionada.ativo == 0 && !ocultaBtn"  :disabled="ocultaBtn" >Habilitar</button> 
                <button class="btnVermelho" @click="admim()"                v-if="linhaSelecionada.ativo == 1 && linhaSelecionada.admin == 0 && !ocultaBtn">Transformar em Admin </button>
                <button class="btnAmarelo"  @click="admim()"                v-if="linhaSelecionada.ativo == 1 && linhaSelecionada.admin == 1 && !ocultaBtn">Retirar acesso Admin </button>
                <button class="btnAzul"                                     v-if="linhaSelecionada && ocultaBtn"> <div class="loader"></div>{{ocultaBtnMsg}}</button> 
            </div>
        </div>
        <div class="container-fluid">
            <div class="div_scroll ">
                <div class=" div_thead tamTbl">
                    <div class=" div_th t100" >Admin  <br> <input type="checkbox" v-model="inputFiltro.admin"     @change="gridPesquisaPaginacao()"  class="inputBuscaTbl"></div>
                    <div class=" div_th t200" >Nome   <br> <input type="text" v-model="inputFiltro.name"     @input="gridPesquisaPaginacao()"  class="inputBuscaTbl"></div>
                    <div class=" div_th t400" >Email  <br> <input type="text" v-model="inputFiltro.email"    @input="gridPesquisaPaginacao()"  class="inputBuscaTbl"></div>
                </div>
                <div class=" div_tbody tamTbl" v-for="(i, index) in dados" :key="index" :class="{ativo:i.css=='ativo', inativo:i.css=='inativo', ativoSelect:i.css=='ativoSelect', inativoSelect: i.css=='inativoSelect' }">
                    <div class=" div_td t100 text-wrap " style="text-align: center;"   @click="linhaFoco(i)"><span v-if="i.admin == 1" class="s_admin">&#10004;</span> <span v-else class="n_admin">&#10008;</span></div>
                    <div class=" div_td t200 text-wrap"                               @click="linhaFoco(i)">{{i.name}}</div>
                    <div class=" div_td t400 text-wrap"                               @click="linhaFoco(i)">{{i.email}}</div>
                </div>
            </div>
        </div>
        <div class="paginacao paddingZero"> 
            <PaginarApp :propsPaginacao="paginacao" 
                        @paginacao="gridPaginacao($event)"/>
        </div>
    </div>
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
        min-width: 700px;
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

    
</style>