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
export function codHeaderTokenImgComImpus() {
  const user = codUserLogado();
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
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
export function codAlturaGridUmaColunaEmModal() {
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

//------------------------------------------------------------------------------------------------------------------------
export function codDataHora(dataHorra: string) {                    // Formato esperado: "2025-11-08 11:12:00"
  const data      = new Date(dataHorra.replace(' ', 'T'))           // cria objeto Date válido
  const dia       = String(data.getDate()).padStart(2, '0')
  const mes       = String(data.getMonth() + 1).padStart(2, '0')
  const ano       = data.getFullYear()
  const hora      = String(data.getHours()).padStart(2, '0')
  const min       = String(data.getMinutes()).padStart(2, '0')
  const formatada = `${dia}/${mes}/${ano} ${hora}:${min}`
  return formatada;
}

//------------------------------------------------------------------------------------------------------------------------
export function codCnpjCpf(cnpjCpf: string) {                                           // Formato esperado: "11111111115858"
  if (cnpjCpf == null) return ''                                                        // se nulo, devolve string vazia                      

  const str = String(cnpjCpf)                                                           // garante que é string  
  const nums = str.replace(/\D/g, '')                                                   // remove tudo que não for dígito
  
  if (nums.length === 11) {                                                             // CPF personalizado: 11 dígitos -> 000.000.000-00
    return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  if (nums.length === 14) {                                                             // CNPJ personalizado: 14 dígitos -> 00.000.000/0000-00
    return nums.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }
  
  return str                                                                            // se não for 11 ou 14 dígitos, devolve original
}

//------------------------------------------------------------------------------------------------------------------------
export function codCelularFixo(input: unknown): string {
  if (input == null) return ''                                                   // se nulo, devolve string vazia
  
  const tel = String(input).replace(/\D/g, '')                                   // remove tudo que não for dígito
  
  if (tel.length === 10) {                                                       // telefone fixo (10 dígitos)
    return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  if (tel.length === 11) {                                                       // celular (11 dígitos)
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return input as string                                                         // se não for 10 ou 11 dígitos, devolve original
}
//------------------------------------------------------------------------------------------------------------------------
export function codCep(input: unknown): string {
  if (input == null) return ''
  
  const cep = String(input).replace(/\D/g, '')            // remove tudo que não for dígito
  
  if (cep.length === 8) {                                 // formata CEP (8 dígitos)
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
  
  return input as string                                  // se não for 8 dígitos, devolve original
}

