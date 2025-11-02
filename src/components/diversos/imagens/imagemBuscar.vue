<template>
  <div class="p-4 ">    
    <input type="file" accept="image/*" @change="imagemSelcionada" />                                                   <!-- Input para selecionar a imagem -->
    <div v-if="imagemBase64" class="mt-4">                                                                          <!-- Exibe a imagem convertida em base64 -->
      <img :src="imagemBase64" alt="Imagem selecionada" 
        class="object-cover rounded-xl shadow" 
        :style="{ height: props.altura , width: props.largura  }"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'                               // importa a função `ref` da API reativa do Vue

interface tsProps {
  largura:String|null,
  altura: String|null
}  

const props = defineProps<tsProps>();

const emit = defineEmits(['imagemAnexada'])

defineExpose({
  limparIng
});

const imagemBase64 = ref<string | null>(null)           // cria uma ref reativa chamada `imagemBase64` que pode ser string ou null; inicialmente null

function imagemSelcionada(event: Event) {               // Função chamada quando o usuário seleciona um arquivo, declara a função `imagemSelcionada` que recebe um Event (ex.: change do input file)
  const target = event.target as HTMLInputElement       // faz um type cast: informa ao TypeScript que event.target é um HTMLInputElement
  const file = target.files?.[0]                        // pega o primeiro arquivo selecionado (ou undefined se não houver arquivos)
  if (!file) return                                     // se não houver arquivo, encerra a função (proteção contra null/undefined)

  const reader = new FileReader()                       // cria um novo FileReader — API do browser para ler arquivos locais
  reader.onload = e => {                                // atribui um callback que será chamado quando a leitura terminar com sucesso
    const base64Result = e.target?.result as string
    imagemBase64.value = base64Result                   // dentro do callback: define o valor da ref com o resultado da leitura (data URL / base64)  
    emit('imagemAnexada',{imgParaUpload:file,           //-Envia imagem para componente Pai
                          imgBase64:imagemBase64.value, 
                          imgNome:gerarNomeImg()
                        })                              
  }
  reader.readAsDataURL(file)                            // inicia a leitura do arquivo como Data URL (gera uma string base64 com o tipo MIME)

  
}

function limparIng(){
  imagemBase64.value = ''
}

function gerarNomeImg() {
  return 'xxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
</script>

<style scoped>
img {
  transition: transform 0.2s ease;
}
img:hover {
  transform: scale(1.05);
}
</style>