export default [
    { 
        path: '/empresas', 
        name: 'empresas',  
        component: () => import('@/components/cadastro/empresas/EmpresasApp.vue'),
        meta: { obrigaAutenticar: true }                                                //-meta campos para rotas protegidas
    }, 
];
