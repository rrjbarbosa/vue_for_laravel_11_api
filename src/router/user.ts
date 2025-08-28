export default [
    { 
        path: '/user-grid', 
        name: 'user-grid',  
        component: () => import('@/components/cadastro/usuario/UserGrid.vue'),
        meta: { requiresAuth: true } // Adicione meta campos para rotas protegidas
    }, 
    {
        path: "/user-update/:id",
        name: "user-update",
        component: () => import('@/components/cadastro/usuario/UserUpdate.vue'),
        meta: { requiresAuth: true } // Adicione meta campos para rotas protegidas
    },
];
