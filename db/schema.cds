namespace my.productapp;

using { cuid, managed } from '@sap/cds/common';

entity Products : cuid, managed {
    name        : String(100) not null;
    description : String(500);
    price       : Decimal(10,2) not null;
    stock       : Integer default 0;
    category    : Association to Categories;
    imageUrl    : String(500);
}

entity Categories : cuid {
    name        : String(50) not null;
    description : String(200);
    products    : Association to many Products on products.category = $self;
}