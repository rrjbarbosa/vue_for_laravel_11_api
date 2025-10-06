<script lang="ts" setup>
import { onMounted, ref, reactive, onUpdated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { axiosPlugin } from '@/plugins/axios'
import { codHeaderToken, codMsgInputsErros, codLimparObjetoReativo } from '@/codigos'
import type {tsCamposEdicao, tsEdicaoSenha, tsDadosEdit} from './tsUserUpdate.ts'
import EmpresasParaUserUpdate from '@/components/cadastro/empresas/EmpresasParaUserUpdate.vue'
import SetoresParaUserUpdate from '@/components/cadastro/setores/SetoresParaUserUpdate.vue' 
import PermissoesParaUserUpdate from '@/components/cadastro/permissoes/PermissoesParaUserUpdate.vue' 
import AcessosParaUserUpdate from '@/components/cadastro/acessos/AcessosParaUserUpdate.vue' 
import { provide } from 'vue'

import ModalApp from '@/components/diversos/modal/ModalApp.vue'
import { modalAppCod } from '@/components/diversos/modal/modalAppCod.ts' 

const route                     = useRoute()       // retorna informações da rota atual (como parâmetros, query, nome da rota etc.).
const router                    = useRouter()      // retorna o roteador que permite navegação programática (como router.push(...), router.replace(...), etc.).
const id                        = route.params.id as string
const user                      = JSON.parse(sessionStorage.getItem('usuario_app') || 'null')
const refAlturaDiv90            = ref<any>(null);
const alturaDivUsuarioEmpresa   = ref<string>("0");
const alturaDivSetor            = ref<string>("0");
const alturaDentroNoventa       = ref<string>("0");
const token                     = codHeaderToken()
const admin                     = 0
const { modal, modaMsg, modalAbrir, modalFechar, modalMsgErro } = modalAppCod();
const mensagensModal            = reactive<string[]>([]);
const carregaEmpresas           = ref<InstanceType<typeof EmpresasParaUserUpdate> | null>(null);
const recarregaPermissoes       = ref<InstanceType<typeof PermissoesParaUserUpdate> | null>(null);
const dadosEdit                 = reactive<tsDadosEdit>({});    
const userUpdateRecarregar      = ref<string>("nao");

onMounted(() => {
    edit()
    alturaDentroNoventa.value       = (refAlturaDiv90.value?.offsetHeight-38)+'px' || '0px';
    alturaDivUsuarioEmpresa.value   = ((refAlturaDiv90.value?.offsetHeight /2)-10)+'px' || '0px';
    alturaDivSetor.value            =  (refAlturaDiv90.value?.offsetHeight - 40)+'px';
})

provide('chamarUserUpdateEdit', userUpdateRecarregarEdit)

function userUpdateRecarregarEdit(){
    userUpdateRecarregar.value = 'sim'
    modalAbrir('userUpdateRecarregar');
    edit()
}

async function edit(){    
    try{
        const { data } = await axiosPlugin.put('users-edit', {id:id}, token);
        Object.assign(dadosEdit, resetaCampos);                                         //-Reseta dadosEdit
        Object.assign(camposVisao, resetaCamposVisao);                                  //-Reseta dadosEdit
        
        Object.assign(camposVisao, data.usuario);                                       //-Seta Users na Visão
        Object.assign(dadosEdit, data);                                                 //-Seta dados para Edição
        
        if(carregaEmpresas.value){ carregaEmpresas.value.recarregaCss(data.empresas)}
        userUpdateRecarregar.value == 'sim' ? userUpdateRecarregar.value = 'nao' : null
    }catch(error){
        Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
        modalAbrir('userUpdateMsgErro')
    }        
}

function retornaGrid(){    
    router.push('/user-grid')
}

//==============================================================[Visão Users]=========================================================
const camposVisao = reactive<tsCamposEdicao>({
  name: '',
  email: '',
  email_envio_msg: ''
})
const resetaCamposVisao = {
    name: '',
    email: '',
    email_envio_msg: ''
                    };
//==============================================================[Edição Users]========================================================
const camposComErro             = ref<string[]>([])

const camposEdicao = reactive<tsCamposEdicao>({
  name:             '',
  email:            '',
  email_envio_msg:  ''
})

const resetaCampos = {
    id:                 '',
    name:               '',
    email:              '',
    email_envio_msg:    ''
};

function edicaoUserAbreModal(){
    for (const i of Object.keys(camposEdicao) as (keyof tsCamposEdicao)[]) {
        camposEdicao[i]  = camposVisao[i]
    }        
    camposComErro.value = []
    modalAbrir('userUpdateEdicaoUser')
}

async function salvar(){
    let erros = validarCampos()
    if(erros>0){ return }

    try{
        const { data } = await axiosPlugin.patch(`users-update/${id}`, camposEdicao, token);
        Object.assign(mensagensModal, ['Salvo com Sucesso']);
        modalAbrir('userUpdateMsgOk')
        
        for (const i of Object.keys(camposEdicao) as (keyof tsCamposEdicao)[]) {
            camposVisao[i]  = camposEdicao[i]
        }
        
    }catch(error:any){
        Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
        modalAbrir('userUpdateMsgErro') 
        camposComErro.value =  []
        camposComErro.value = codMsgInputsErros(error.response.data.errors)
    } 
}

function validarCampos() {
    Object.keys(mensagensModal).forEach(key => delete mensagensModal[key]);     // limpa mensagens anteriores
    
    const CamposObrigatorios = {
            name: ['Falta Nome'], 
            email: ['Falta E-mal'], 
            email_envio_msg: ['Falta o E-mail de Envio para mensagens']
        }
    
    Object.keys(CamposObrigatorios).forEach((key) => {                          // Percorre todas as chaves (keys) do objeto CamposObrigatorios
        const campo = key as keyof typeof camposEdicao                          // Faz um *type assertion* dizendo ao TypeScript que a chave é garantidamente uma das chaves de camposEdicao
        if (camposEdicao[campo].length > 0) {                                   //-Verifica se o campo está preenchido
            delete CamposObrigatorios[campo]                                    //-Retira o erro se o campo estivar preenchido
        }
    })
        
    let qtdErros = Object.keys(CamposObrigatorios).length                       //-Qtd índices do Objeto de campos com erro
    if(qtdErros>=1){                                                            //-Exibe os erros na Modal
        camposComErro.value = codMsgInputsErros(CamposObrigatorios)
        Object.assign(mensagensModal, modalMsgErro(CamposObrigatorios));
        modalAbrir('userUpdateMsgErro')
    }
    return qtdErros
}

function limpaMsgDigitarInput(campo: String){
    camposComErro.value = camposComErro.value.filter(item => item !== campo);
}    



//==============================================================[Edição Users Sehas]========================================================
const camposEdicaoSenha = reactive<tsEdicaoSenha>({
  senha:'',
  confirmarSenha:'',
  id:''
})

const camposComErroSenha             = ref<string[]>([])

function edicaoSenhaAbreModal(){
    Object.assign(camposEdicaoSenha, codLimparObjetoReativo(camposEdicaoSenha));    //-Limpa todos os campos Senha
    modalAbrir('userUpdateEditarSenha')    
    camposComErroSenha.value = []    
}
async function salvarSenha(){
    let erros = validarCamposSenha()
    if(erros>0){ return }

    try{
        camposEdicaoSenha.id = id
        const { data } = await axiosPlugin.patch(`users-update-senha/${id}`, camposEdicaoSenha, token);
        Object.assign(mensagensModal, ['Salvo com Sucesso']);
        modalAbrir('userUpdateMsgOk')
    }catch(error:any){
        Object.assign(mensagensModal, modalMsgErro(error.response.data.errors));
        modalAbrir('userUpdateMsgErro') 
        camposComErroSenha.value =  []
        camposComErroSenha.value = codMsgInputsErros(error.response.data.errors)
    }
}
function validarCamposSenha() {
    Object.keys(mensagensModal).forEach(key => delete mensagensModal[key]);     // limpa mensagens anteriores
    
    let CamposObrigatorios = {
        senha: ['Falta Senha'], 
        confirmarSenha: ['Falta Confirmar Senha'], 
    }
    
    Object.keys(CamposObrigatorios).forEach((key) => {                          // Percorre todas as chaves (keys) do objeto CamposObrigatorios
        const campo = key as keyof typeof camposEdicaoSenha                     // Faz um *type assertion* dizendo ao TypeScript que a chave é garantidamente uma das chaves de camposEdicao
        if (camposEdicaoSenha[campo].length > 0) {                              //-Verifica se o campo está preenchido
            delete CamposObrigatorios[campo]                                    //-Retira o erro se o campo estivar preenchido
        }
    })

    if(camposEdicaoSenha.senha != camposEdicaoSenha.confirmarSenha){
        CamposObrigatorios.senha = ['As senhas não são iguais']
    }
        
    let qtdErros = Object.keys(CamposObrigatorios).length                       //-Qtd índices do Objeto de campos com erro
    if(qtdErros>=1){                                                            //-Exibe os erros na Modal
        camposComErroSenha.value = codMsgInputsErros(CamposObrigatorios);       // atualiza mensagens    
        Object.assign(mensagensModal, modalMsgErro(CamposObrigatorios));
        modalAbrir('userUpdateMsgErro');
    }     
    return qtdErros
}

function limpaMsgDigitarInputSenha(campo: String){
    camposComErroSenha.value = camposComErroSenha.value.filter(item => item !== campo);
}

function carregaPermissoes(){
    recarregaPermissoes.value?.recarregaCss(dadosEdit.permissoes)
}

//==========================================================================================================================================  
</script>

<template >  
    <div style="height: 10%; margin-left: 3px;">
        <div class="navegacao paddingZero "> 
            <div style="text-align: left;">
                <span class="pdZeroLargComp "><button @click="retornaGrid()" class="btn btn-sm btn-outline-success botao">Usuários</button></span>
                <button  class="btn btn-sm btn-outline-dark botao" >Atualizando {{  camposVisao.name }}</button>
            </div>
        </div>
    </div> 
    <div style="height: 90%; margin-left: 3px;" ref="refAlturaDiv90">        
        <div class="row ">
            <div class="col-md-4 paddingZero">
                <div class="row paddingZero">
                    <div class=" col-md-12  borda paddingZero" :style="{ height: alturaDivUsuarioEmpresa }"  style="margin-top:6px">
                        <div class="blocoVerdeEscuro">USUÁRIO</div>
                        <div class="paddingTreis">
                            <div class="paddingZero" style="margin-top:6px">
                                <button @click="edicaoUserAbreModal()"   class="btn btn-sm btn-success botao" :disabled="user.admin==0">Editar Usuário</button> 
                                <button @click="edicaoSenhaAbreModal()" class="btn btn-sm btn-warning botao" :disabled="user.admin==0"><strong>Editar Senha</strong></button>
                            </div>
                            <div class=" paddingZero label">Nome</div> 
                            <div class=" paddingZero inputCss">{{ camposVisao.name }}</div>
                            <div class=" paddingZero label">Email</div>
                            <div class=" paddingZero inputCss">{{ camposVisao.email }}</div>
                            <div class=" paddingZero label">Email para envio de menssagens</div>
                            <div class=" paddingZero inputCss">{{ camposVisao.email_envio_msg }}</div>
                        </div>                        
                    </div>
                    <div class=" col-md-12 borda paddingZero" :style="{ height: alturaDivUsuarioEmpresa }" style="margin-top:8px; ">
                        <div class="blocoVerdeEscuro">EMPRESAS DO USUÁRIO</div> 
                        <div class="paddingTreis">
                            <EmpresasParaUserUpdate :user_id="id" ref="carregaEmpresas"/>
                        </div>
                    </div>
                </div>    
            </div>
            <div class="col-md-2 paddingZero" style="margin-top:6px; padding-left: 3px;">
                <div class="paddingZero borda" >
                    <div class="paddingZero blocoVerdeEscuro">SETORES</div> 
                    <div class="paddingZero" :style="{ height: alturaDivSetor }">
                        <SetoresParaUserUpdate v-if="Object.keys(dadosEdit).length" :dadosEdit="dadosEdit"/>
                    </div>
                </div>   
            </div>
            <div class="col-md-3 paddingZero" style="margin-top:6px; padding-left: 3px;">
                <div class="paddingZero borda" >
                    <div class="paddingZero blocoVerdeEscuro">PERMISSÕES</div> 
                    <div class="paddingZero" :style="{ height: alturaDivSetor }">
                        <PermissoesParaUserUpdate v-if="Object.keys(dadosEdit).length" :dadosEdit="dadosEdit" ref="recarregaPermissoes" />
                    </div>
                </div>   
            </div>
            <div class="col-md-3 paddingZero" style="margin-top:6px; padding-left: 3px; padding-right: 3px;">
                <div class="paddingZero borda" >
                    <div class="paddingZero blocoVerdeEscuro">ACESSOS</div> 
                    <div class="paddingZero" :style="{ height: alturaDivSetor }">
                        <AcessosParaUserUpdate v-if="Object.keys(dadosEdit).length" :dadosEdit="dadosEdit" @atualizaPermissoes="carregaPermissoes()"/>
                    </div>
                </div>   
            </div>
        </div>            
    </div>  
     
  <!-- MODAL EDITAR USER =================================================================================================== -->
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
        </div> 
    </ModalApp>
    <!-- MODAL EDITAR SENHA ==================================================================================================== -->
    <ModalApp   :isOpen="modal.userUpdateEditarSenha" @close="modalFechar('userUpdateEditarSenha')" 
                :largura="'50%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Edição de senha" :mensagens="mensagensModal">    
        <div class="paddingDez">   
            <div class="paddingZero div_centro">
                <button @click="salvarSenha()"   class="btn btn-sm btn-success botao"  >Salvar</button>
            </div>             
            <form >               
                <div class="label">Senha</div>                                    
                <input type="password" v-model="camposEdicaoSenha.senha" @input="limpaMsgDigitarInputSenha('senha')"  
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErroSenha.includes('senha') }"
                    placeholder="Digite a Senha"
                    autocomplete="off">                                
                
                <div class="label">Confirme a Senha</div>                               
                <input type="password" v-model="camposEdicaoSenha.confirmarSenha" @input="limpaMsgDigitarInputSenha('confirmarSenha')"  
                    class="form-control inputCss" 
                    :class="{ erroInputBorda: camposComErroSenha.includes('confirmarSenha') }"
                    placeholder="Confirme a Senha"
                    autocomplete="off">                                         
            </form>    
        </div>
    </ModalApp>
    <!-- MODAL RECARREGA USER UPDATE, APÓS SALVAR PermissoesParaAcessos ====================================================== -->
    <ModalApp   :isOpen="modal.userUpdateRecarregar" @close="userUpdateRecarregar = 'nao', modalFechar('userUpdateRecarregar') " 
                :largura="'50%'" :alturaMax="'50%'" :padraoObsOk="'padrao'" title="Ok" :mensagens="mensagensModal">    
        <div v-if="userUpdateRecarregar == 'sim'">
            <div class="col-md-12 div_centro">
                <div class="paddingDez">Aguarde Recarregando...</div>
                <div class="carregando"></div>
            </div>
        </div>
        <div v-else>
            <div class="paddingDez div_centro">Salvo com Sucesso</div>
        </div>    
    </ModalApp>    
    <!-- MODAL MSG ERRO ====================================================================================================== -->
    <ModalApp   :isOpen="modal.userUpdateMsgErro" @close="modalFechar('userUpdateMsgErro')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'obs'" title="" :mensagens="mensagensModal"/>

    <!-- MODAL MSG SUCESSO =================================================================================================== -->
    <ModalApp   :isOpen="modal.userUpdateMsgOk" @close="modalFechar('userUpdateMsgOk')" 
                :largura="'95%'" :alturaMax="'50%'" :padraoObsOk="'ok'" title="" :mensagens="mensagensModal"/>
    
</template>

<style scoped>
@import '@/assets/main.css'; 
.erroTitulo {
  color: brown;
  font-style: italic;
  font-weight: bold;
  font-size: 20px;
  margin-left: 50%;
}

.erroInputBorda {
  border: 2px solid red;
}
    padding-left: 15px;
    paddi
.msgErro{ng-bottom: 5px;
    font-weight: bold;
}
.blocoVerdeEscuro{background-color: #3d6d42; color: #ffffff; text-align: center;}
</style>