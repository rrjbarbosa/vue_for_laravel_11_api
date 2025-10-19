export type tsEdicaoSenha = {
  senha: string;
  confirmarSenha: string;
  id:string
}   

export type tsCamposEdicao = {
  name:  string;
  email:  string;
  email_envio_msg: string;
}

export type tsDadosEdit = {
  usuario?:{
    id: string
    name:  string;
    email:  string;
    email_envio_msg: string;
  },
  empresas?:{
    id: string,
    nome_fantasia: string,
    cnpj: number,
    cidade: string,
    bairro: string,
    ativo: number
  },
  setores?:{
    id: string,
    setor: string,
    ativo: number
  },
  permissoes?:{
    id: string,
    nome: string,
    nome_exibicao: string
  },
  acessos?:{
    id:string,
    acesso: string
  },
  recarregaUserUpdate?:string
}