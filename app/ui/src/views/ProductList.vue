<template>
    <div class="view">
        <h2>Products</h2>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="product-grid">
            <div
                v-for="product in products"
                :key="product.ID"
                class="product-card"
            >
                <img :src="product.imageUrl || 'https://via.placeholder.com/150'" :alt="product.name" />
                <h3>{{ product.name }}</h3>
                <p class="desc">{{ product.description }}</p>
                <p class="price">${{ product.price }}</p>
                <p class="stock" :class="{ low: product.stock < 30 }">
                    Stock: {{ product.stock }}
                </p>
                <p class="category">{{ product.category?.name || 'Uncategorized' }}</p>
                <div class="actions">
                    <router-link :to="`/product/${product.ID}`" class="btn">View</router-link>
                    <button class="btn btn-danger" @click="remove(product.ID)">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const products = ref([]);
const loading = ref(true);
const error = ref(null);

const load = async () => {
    try {
        loading.value = true;
        const res = await api.getProducts();
        products.value = res.data.value || [];
    } catch (e) {
        error.value = 'Failed to load products: ' + e.message;
    } finally {
        loading.value = false;
    }
};

const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
        await api.deleteProduct(id);
        await load();
    } catch (e) {
        alert('Delete failed: ' + e.message);
    }
};

onMounted(load);
</script>