<template>
    <div class="view" v-if="product">
        <h2>{{ product.name }}</h2>
        <div class="detail-card">
            <img :src="product.imageUrl || 'https://via.placeholder.com/300'" />
            <p><strong>Description:</strong> {{ product.description }}</p>
            <p><strong>Price:</strong> ${{ product.price }}</p>
            <p><strong>Stock:</strong> {{ product.stock }}</p>
            <p><strong>Category:</strong> {{ product.category?.name }}</p>
            <div class="restock">
                <input v-model.number="qty" type="number" min="1" placeholder="Qty to add" />
                <button class="btn btn-primary" @click="restock">Restock</button>
            </div>
            <router-link to="/" class="btn">Back</router-link>
        </div>
    </div>
    <div v-else class="loading">Loading...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const product = ref(null);
const qty = ref(10);

const load = async () => {
    try {
        const res = await api.getProduct(route.params.id);
        product.value = res.data;
    } catch (e) {
        console.error('Failed to load product', e);
    }
};

const restock = async () => {
    if (!qty.value || qty.value <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    try {
        await api.restock(route.params.id, qty.value);
        await load();
        alert('Restocked successfully!');
    } catch (e) {
        alert('Failed: ' + (e.response?.data?.error?.message || e.message));
    }
};

onMounted(load);
</script>