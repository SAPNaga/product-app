<template>
    <div class="app">
        <header class="header">
            <div class="container">
                <h1>📦 Product Manager</h1>
                <nav>
                    <router-link to="/">Products</router-link>
                    <router-link to="/add">Add Product</router-link>
                    <router-link to="/categories">Categories</router-link>
                </nav>
            </div>
        </header>
        <main class="container">
            <router-view />
        </main>
        <footer class="footer">
            <p>Powered by SAP BTP · HANA Cloud · CAP · Vue.js</p>
        </footer>
    </div>
</template>

<script setup>
// Root component
</script>