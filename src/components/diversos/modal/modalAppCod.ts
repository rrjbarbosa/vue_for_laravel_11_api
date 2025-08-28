import { ref } from 'vue';

export const modalAppCod = () => {
    const modal = ref<Record<string, boolean>>({});
    const modaMsg = ref<Record<string, string[]>>({});
    
    const modalAbrir = (modalName: string) => {
        modal.value[modalName] = true;
    };
    
    const modalFechar = (modalName: string) => {
        modal.value[modalName] = false;
    };

    const modalMsgErro = (objetoArray: Object) => {
        let mensagensErro = objetoArray.msgsAuthorize ? objetoArray.msgsAuthorize : []  //- Seta msg do authorize se existir, ou seta array vazio para msg do rules 
        for(let errors of Object.keys(objetoArray)){
            if(errors != 'inputs' && errors != 'msgsAuthorize'){
            for(let i of Object.values(objetoArray[errors])){ 
                mensagensErro.push(i)                                                     //- Seta todas msg de erro dos inputs
            }      
            }
        }
        modaMsg.value = mensagensErro;
        return mensagensErro;
    }
    
    return {
        modal,
        modaMsg,
        modalAbrir,
        modalFechar,
        modalMsgErro
    };
};