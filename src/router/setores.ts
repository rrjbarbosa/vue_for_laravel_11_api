export default [
    { 
        path: '/setores', 
        name: 'setores',  
        component: () => import('@/components/cadastro/setores/SetoresApp.vue'),
        meta: { obrigaAutenticar: true }                                                //-meta campos para rotas protegidas
    }, 
];
