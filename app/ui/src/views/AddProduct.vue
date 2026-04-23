<template>
    <div class="view">
        <h2>Add Product</h2>
        <div class="form-card">
            <div class="form-group">
                <label>Name *</label>
                <input v-model="form.name" type="text" required />
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea v-model="form.description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Price *</label>
                <input v-model.number="form.price" type="number" step="0.01" required />
            </div>
            <div class="form-group">
                <label>Stock</label>
                <input v-model.number="form.stock" type="number" />
            </div>
            <div class="form-group">
                <label>Category</label>
                <select v-model="form.category_ID">
                    <option value="">-- Select --</option>
                    <option v-for="c in categories" :key="c.ID" :value="c.ID">{{ c.name }}</option>
                </select>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input v-model="form.imageUrl" type="url" />
            </div>
            <div class="actions">
                <button class="btn btn-primary" :disabled="saving" @click="save">
                    {{ saving ? 'Saving...' : 'Save Product' }}
                </button>
                <router-link to="/" class="btn">Cancel</router-link>
            </div>
            <div v-if="message" :class="['msg', messageType]">{{ message }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const categories = ref([]);
const saving = ref(false);
const message = ref('');
const messageType = ref('');

const form = ref({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_ID: '',
    imageUrl: ''
});

onMounted(async () => {
    try {
        const res = await api.getCategories();
        categories.value = res.data.value || [];
    } catch (e) {
        console.error(e);
    }
});

const save = async () => {
    if (!form.value.name || form.value.price < 0) {
        message.value = 'Please fill required fields';
        messageType.value = 'error';
        return;
    }
    saving.value = true;
    try {
        const payload = { ...form.value };
        if (!payload.category_ID) delete payload.category_ID;
        await api.createProduct(payload);
        message.value = 'Product created!';
        messageType.value = 'success';
        setTimeout(() => router.push('/'), 1000);
    } catch (e) {
        message.value = 'Error: ' + (e.response?.data?.error?.message || e.message);
        messageType.value = 'error';
    } finally {
        saving.value = false;
    }
};
</script>