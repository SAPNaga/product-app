import axios from 'axios';

const api = axios.create({
    baseURL: '/product',
    headers: { 'Content-Type': 'application/json' }
});

export default {
    // Products
    getProducts: () => api.get('/Products?$expand=category'),
    getProduct: (id) => api.get(`/Products(${id})?$expand=category`),
    createProduct: (data) => api.post('/Products', data),
    updateProduct: (id, data) => api.patch(`/Products(${id})`, data),
    deleteProduct: (id) => api.delete(`/Products(${id})`),

    // Categories
    getCategories: () => api.get('/Categories'),

    // Custom actions
    restock: (productId, quantity) =>
        api.post('/restock', { productId, quantity }),
    getLowStock: (threshold) =>
        api.get(`/getLowStockProducts(threshold=${threshold})`)
};