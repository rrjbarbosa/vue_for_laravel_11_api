<script setup lang="ts">
import { useRouter } from 'vue-router'
import { axiosPlugin } from '@/plugins/axios'
import { onMounted } from 'vue'


const router = useRouter()

async function users(){
  
    try {
      const dados = {
        acao: 'GRID'
      }
        const {data} = await axiosPlugin.post('/client-grid', dados)
        console.log(data.dados.data)
        
      } catch (error) {
        console.error(error)
      }
  
}

onMounted(()=>{
  //Faz um reload apenas uma vez para que variável usuarioLogado seja preenchida com true o false se existir um usuário logado
  if (!sessionStorage.getItem('reloaded')) {
  sessionStorage.setItem('reloaded', 'true');
  location.reload();
}
})

</script>

<template>




<div class="imagem-container">
  <img src="@/assets/MDC_Vai_dar_certo.png" alt="Imagem grande">
</div>




  <!--button @click="users()" class="btn btn-primary">Teste Chamada Rota Autenticada</button-->
 
</template>

<style scoped>

.imagem-container {
  height: 100%;
}

.imagem-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>