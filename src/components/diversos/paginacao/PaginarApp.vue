<template>
                
            <div class="row ">
                <span class="centralizar col-md-4">                    
                    <div ><!--QTD REGISTROS PARA EXIBIÇÃO ------------------------------->
                        <button type="button" class="btn btn-secondary bot" data-bs-toggle="dropdown" aria-expanded="false">
                            {{propsPaginacao.qtdPorPagina + ' - Linhas'}} 
                        </button>
                        <ul class="dropdown-menu pagina">
                            <li><a class="dropdown-item" v-on:click.prevent="loadPage(1, 10)"  href="#">10</a></li>
                            <li><a class="dropdown-item" v-on:click.prevent="loadPage(1, 20)"  href="#">20</a></li>
                            <li><a class="dropdown-item" v-on:click.prevent="loadPage(1, 30)"  href="#">30</a></li>
                            <li><a class="dropdown-item" v-on:click.prevent="loadPage(1, 50)"  href="#">50</a></li>
                            <li><a class="dropdown-item" v-on:click.prevent="loadPage(1, 100)" href="#">100</a></li>
                        </ul>
                    </div>                    
                </span>
                <span class="centralizar col-md-4 ">  <!--PAGINAÇÃO ------------------------------------------------->                    
                    <nav>                    
                        <ul class="pagination justify-content-center">
                            <li v-if="propsPaginacao.page > 1" class="page-item"><a v-on:click.prevent="loadPage(1, propsPaginacao.qtdPorPagina)" class="page-link">&laquo;</a></li>
                            <li v-if="propsPaginacao.page > 1">
                                <a v-on:click.prevent="loadPage(propsPaginacao.page - 1, propsPaginacao.qtdPorPagina)" class="page-link"><span>&lsaquo;</span></a>
                            </li>
                            <li v-if="propsPaginacao.page == 2">
                                <a v-on:click.prevent="loadPage(1, propsPaginacao.qtdPorPagina)" class="page-link ">1</a>
                            </li>
                            <li v-for="(page, index) in propsPaginacao.paginacaoPaginas" :key="index" v-bind:class="[ page == propsPaginacao.page ? 'page-item active' : '']">    
                                <a v-on:click.prevent="loadPage(page, propsPaginacao.qtdPorPagina)" class="page-link ">{{ page }}</a>
                            </li>
                            <li v-if="propsPaginacao.page < propsPaginacao.ultima">
                                <a v-on:click.prevent="loadPage(propsPaginacao.page + 1, propsPaginacao.qtdPorPagina)" class="page-link"><span>&rsaquo;</span></a>
                            </li>
                            <li class="page-item"><a v-on:click.prevent="loadPage(propsPaginacao.ultima, propsPaginacao.qtdPorPagina)" class="page-link">&raquo;</a></li>
                        </ul>                        
                    </nav>                    
                </span>
                <span class="centralizar col-md-4 "> <!--Número de Páginas------------------------------------------>
                    <button type="button" class="btn btn-secondary bot" >{{propsPaginacao.page}} / {{propsPaginacao.ultima}} -Pág.</button>
                </span>
            </div> 
       
</template>

<script setup lang="ts">
    import type { tsPaginarApp } from './tsPaginarApp.types';
    
    const props = defineProps<{
        propsPaginacao: tsPaginarApp
    }>()

    const emit = defineEmits(['paginacao'])

    const qtdPorPagina = 10;

    function loadPage(pagina: number, qtdPorPagina: number){
        qtdPorPagina = qtdPorPagina
        emit('paginacao',{page:pagina, qtdPorPagina:qtdPorPagina})
    }
   
    
</script>
<style  scoped>
.row {                      /* Atenção o .row por padrão margin-right margin-left -e -15px isso interfere em deixar container-fluid com padding 0px  */
    display: flex;
    flex-wrap: wrap;
    margin-right: 0px;      
    margin-left: 0px;
}
.btn-sm {
    padding: 0.00rem .15rem;
    font-size: .800rem;
    line-height: 1.5;
    border-radius: .2rem;
}

.page-link {
    position: relative;
    display: block;
    padding: 0.2rem 0.4rem;
    margin-left: -1px;
    line-height: 1.25;
    color: #ffffff;
    background-color: #57865e;
    border: 1px solid #57865e;
    font-size: 12px;
}

.bot{
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 1px;
    padding-bottom: 1px;
    font-size: 12px;
    background-color: #57865e;
    color: #fff;
}

.page-item.active .page-link {
    z-index: 3;
    color: #fff;
    background-color: #2c3e50;
    border-color: #ffffff;
}

.paginacao {
    color: #ffffff;
    background-color: #2c3e50;
    padding: 0.1rem 0.1rem ;
    font-size: 12px;
    line-height: 1.5;
    border-radius: .2rem;
    border-color: #2c3e50;
}

.pagina {
    color: #ffffff;
    background-color: #2c3e50;
    padding: 0.05rem 0.05rem ;
    font-size: 12px;
    line-height: 1.5;
    border-radius: .2rem;
}

option {
  height:1px;
  margin:1px;
  line-height:1px;
  padding:1px 1px 1px 1px;
}

.centralizar {
    text-align: center;
    padding-right: 2px;
    padding-left: 2px;
    padding-top: 2px;
    padding-bottom: 2px;
    font-size: 12px;
}

dl, ol, ul {
    margin-top: 0;
    margin-bottom: 0px;
}

.col-md-4{
    position: relative;
    width: 33%;
}

.dropdown-item {    
        display: block;
        width: 100%;
        padding: 0rem 0.8rem;
        clear: both;
        font-weight: 400;
        color: #fff;
        text-align: inherit;
        white-space: nowrap;
        background-color:  #2c3e50;
        border: 0;
    }

</style>

