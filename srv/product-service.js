const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Products } = this.entities;

    // Before creating a product, validate price and stock
    this.before('CREATE', 'Products', (req) => {
        if (req.data.price && req.data.price < 0) {
            req.error(400, 'Price cannot be negative');
        }
        if (req.data.stock && req.data.stock < 0) {
            req.error(400, 'Stock cannot be negative');
        }
    });

    // Before updating a product
    this.before('UPDATE', 'Products', (req) => {
        if (req.data.price !== undefined && req.data.price < 0) {
            req.error(400, 'Price cannot be negative');
        }
    });

    // Custom action: restock
    this.on('restock', async (req) => {
        const { productId, quantity } = req.data;
        if (quantity <= 0) {
            req.error(400, 'Quantity must be positive');
        }
        const product = await SELECT.one.from(Products).where({ ID: productId });
        if (!product) {
            req.error(404, `Product ${productId} not found`);
        }
        const newStock = (product.stock || 0) + quantity;
        await UPDATE(Products).set({ stock: newStock }).where({ ID: productId });
        return `Product restocked. New stock level: ${newStock}`;
    });

    // Custom function: low stock query
    this.on('getLowStockProducts', async (req) => {
        const { threshold } = req.data;
        return await SELECT.from(Products).where({ stock: { '<': threshold } });
    });

    // After reading products, log count
    this.after('READ', 'Products', (products) => {
        console.log(`Returned ${Array.isArray(products) ? products.length : 1} product(s)`);
    });
});