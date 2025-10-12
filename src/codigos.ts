// src/utils/codigos.ts
//------------------------------------------------------------------------------------------------------------------------
export function codUserLogado() {
  const userString = sessionStorage.getItem('usuario_app');
  let user;

  try {
    user = JSON.parse(userString || '');
  } catch {
    user = null;
  }

  if (!user) {
    user = {
      token: '',
      usuario: {
        name: '',
        nome_fantasia: ''
      }
    };
  }

  return user;
}
//------------------------------------------------------------------------------------------------------------------------
export function codHeaderToken() {
  const user = codUserLogado();
  return {
    headers: {
      Authorization: 'Bearer ' + user.token
    }
  };
}
//------------------------------------------------------------------------------------------------------------------------
export function codMsgErrors(objetoArray: Object){                                //- objetoArray é um Objeto onde cada chave é um array 
  let mensagensErro = objetoArray.msgsAuthorize ? objetoArray.msgsAuthorize : []  //- Seta msg do authorize se existir, ou seta array vazio para msg do rules 
  for(let errors of Object.keys(objetoArray)){
    if(errors != 'inputs' && errors != 'msgsAuthorize'){
      for(let i of Object.values(objetoArray[errors])){ 
        mensagensErro.push(i)                                                     //- Seta todas msg de erro dos inputs
      }      
    }
  }  
  return mensagensErro
}
//------------------------------------------------------------------------------------------------------------------------
export function codMsgInputsErros(objetoArray: Object){
  let campos = []
  for(let errors of Object.keys(objetoArray)){
    if(errors != 'mensagens' && errors != 'inputs'){  
      campos.push(errors)
    }else if(errors == 'inputs'){ 
      for(let inputNome of Object.keys(objetoArray.inputs[0])){
        campos.push(inputNome)
      }
    }
  }
  return campos
}
//------------------------------------------------------------------------------------------------------------------------
export function codLimparObjetoReativo(obj: any) {          // Exporta a função para que possa ser utilizada em outros módulos
  for (const key in obj) {                                  // Inicia um loop for...in que percorre todas as propriedades enumeráveis do objeto
    if (Object.prototype.hasOwnProperty.call(obj, key)) {   // Verifica se a propriedade pertence diretamente ao objeto (não é herdada)
      obj[key] = '';                                        // Atribui um valor vazio ('') para a propriedade atual do objeto... Mantendo a reatividade pois estamos modificando o valor, não a estrutura
    }
  }  
}

//------------------------------------------------------------------------------------------------------------------------
export function codAlturaGridEmModal() {
  const largura = window.innerWidth;
  let altura = 0

  if (largura <= 767) {                                                   //---Acesso por CELULAR
    altura = (document.documentElement.scrollHeight / 100) * 45;
  } else if (largura <= 991) {                                            //---Acesso por TABLET
    altura = (document.documentElement.scrollHeight / 100) * 60;
  } else {                                                                //----Acesso por DESKTOP
    altura = (document.documentElement.scrollHeight / 100) * 70;
  }

  return altura + 'px';
}

