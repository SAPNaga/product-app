import { createRouter, createWebHashHistory } from 'vue-router';
import ProductList from '../views/ProductList.vue';
import AddProduct from '../views/AddProduct.vue';
import CategoryList from '../views/CategoryList.vue';
import ProductDetail from '../views/ProductDetail.vue';

const routes = [
    { path: '/', name: 'Products', component: ProductList },
    { path: '/add', name: 'AddProduct', component: AddProduct },
    { path: '/categories', name: 'Categories', component: CategoryList },
    { path: '/product/:id', name: 'ProductDetail', component: ProductDetail }
];

export default createRouter({
    history: createWebHashHistory(),
    routes
});