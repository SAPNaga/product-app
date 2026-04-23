using { my.productapp as db } from '../db/schema';

service ProductService @(path: '/product') {

    entity Products as projection on db.Products;

    entity Categories as projection on db.Categories;

    // Custom action to restock a product
    action restock(productId: UUID, quantity: Integer) returns String;

    // Custom function to get low stock products
    function getLowStockProducts(threshold: Integer) returns array of Products;
}