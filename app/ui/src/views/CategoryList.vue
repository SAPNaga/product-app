<template>
    <div class="view">
        <h2>Categories</h2>
        <div v-if="loading" class="loading">Loading...</div>
        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in categories" :key="c.ID">
                    <td>{{ c.name }}</td>
                    <td>{{ c.description }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const categories = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await api.getCategories();
        categories.value = res.data.value || [];
    } finally {
        loading.value = false;
    }
});
</script>