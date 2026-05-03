# Product App

A full-stack product management application built on **SAP Cloud Application Programming Model (CAP)** with a **Vue 3** frontend, **SAP HANA** persistence, and **XSUAA** authentication. Deployable to **SAP BTP Cloud Foundry** via MTA.

## Features

- 📦 **Product catalog** — manage products with categories, pricing, stock, and images
- 🗂️ **Category management** — organize products into categories with one-to-many associations
- 🔄 **Custom actions** — restock products with built-in validation
- 📉 **Low-stock queries** — fetch products below a configurable threshold
- 🔐 **Role-based access** — `ProductAdmin` and `ProductViewer` roles via XSUAA
- 🌐 **Vue 3 UI** — Vite-powered frontend served through the SAP Approuter
- ☁️ **Cloud-ready** — full MTA descriptor for deployment to SAP BTP Cloud Foundry

## Architecture

```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐     ┌──────────┐
│  Vue 3 UI   │────▶│  SAP Approuter │────▶│ CAP Service  │────▶│ HANA HDI │
│  (Vite)     │     │  (XSUAA auth)  │     │  (Node.js)   │     │  / SQLite│
└─────────────┘     └────────────────┘     └──────────────┘     └──────────┘
                            │
                            ▼
                      ┌──────────────┐
                      │  XSUAA OAuth │
                      │  (BTP)       │
                      └──────────────┘
```

- **UI** (`app/ui/`) — Vue 3 SPA bundled with Vite
- **Approuter** (`app/router/`) — handles auth, routing, and serves the UI
- **CAP Service** (`srv/`) — exposes the `ProductService` OData API
- **Database Layer** (`db/`) — schema definitions and seed data
- **Security** (`xs-security.json`) — XSUAA scopes, roles, and role collections

## Project structure

```
product-app/
├── app/
│   ├── router/              # SAP Approuter (auth + UI host)
│   │   ├── package.json
│   │   └── xs-app.json
│   └── ui/                  # Vue 3 frontend
│       ├── src/
│       ├── index.html
│       ├── manifest.json
│       ├── package.json
│       └── vite.config.js
├── db/
│   ├── data/                # CSV seed data
│   │   ├── my.productapp-Products.csv
│   │   └── my.productapp-Categories.csv
│   ├── schema.cds           # Domain model
│   └── undeploy.json
├── srv/
│   ├── product-service.cds  # Service definition
│   └── product-service.js   # Service handlers (validation, custom actions)
├── build-ui.sh              # UI build + bundle script for deployment
├── mta.yaml                 # Multi-target application descriptor
├── xs-security.json         # XSUAA configuration
└── package.json             # CAP project manifest
```

## Data model

**Products** — core entity with full audit fields (via `managed`) and UUID keys (via `cuid`):

| Field | Type | Notes |
|-------|------|-------|
| ID | UUID | Primary key |
| name | String(100) | Required |
| description | String(500) | |
| price | Decimal(10,2) | Required, validated ≥ 0 |
| stock | Integer | Defaults to 0, validated ≥ 0 |
| category | Association → Categories | |
| imageUrl | String(500) | |

**Categories** — used to group products:

| Field | Type | Notes |
|-------|------|-------|
| ID | UUID | Primary key |
| name | String(50) | Required |
| description | String(200) | |
| products | Association → Products | One-to-many backref |

## Service API

Exposed at **`/product`**:

### Standard CRUD

- `GET /product/Products` — list products
- `GET /product/Products(<id>)` — get one
- `POST /product/Products` — create (validates price/stock ≥ 0)
- `PATCH /product/Products(<id>)` — update (validates price ≥ 0)
- `DELETE /product/Products(<id>)`
- Same operations for `/product/Categories`

### Custom action — restock

```http
POST /product/restock
Content-Type: application/json

{
  "productId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "quantity": 10
}
```

Returns: `"Product restocked. New stock level: 35"`

### Custom function — low-stock query

```http
GET /product/getLowStockProducts(threshold=20)
```

Returns an array of products with `stock < threshold`.

## Prerequisites

- **Node.js** 18 or newer
- **npm** (bundled with Node.js)
- **SAP CDS CLI** — `npm i -g @sap/cds-dk`
- For deployment:
  - **Cloud Foundry CLI** with the **MultiApps plugin** — `cf install-plugin multiapps`
  - **MBT (MTA build tool)** — `npm i -g mbt`
  - SAP BTP subaccount with entitlements for HANA Cloud, XSUAA, and HTML5 Application Repository

## Local development

### 1. Install dependencies

```bash
npm install
cd app/ui && npm install && cd ../..
cd app/router && npm install && cd ../..
```

### 2. Run the CAP service with SQLite

```bash
npx cds watch
```

The service starts at `http://localhost:4004`. Open it in a browser to see the service index — Products and Categories endpoints will be served against an in-memory SQLite database with the seed data from `db/data/`.

### 3. Run the Vue UI

In another terminal:

```bash
cd app/ui
npm run dev
```

Vite serves the UI on `http://localhost:5173` (default). Configure the proxy in `vite.config.js` if needed to forward `/product/*` to `http://localhost:4004`.

## Sample data

Four products are seeded across three categories on each `cds watch` start:

- **Laptop Pro** (Electronics) — $1,499.99, stock 25
- **Wireless Mouse** (Electronics) — $29.99, stock 100
- **Clean Code** (Books) — $39.99, stock 50
- **T-Shirt** (Clothing) — $19.99, stock 200

## Build for deployment

The `build-ui.sh` script builds the Vue UI and packages it for the HTML5 Application Repository:

```bash
chmod +x build-ui.sh
./build-ui.sh
```

It produces:
- `app/router/resources/` — UI files served by the approuter
- `resources/productui.zip` — packaged UI for the HTML5 host

## Deploy to SAP BTP Cloud Foundry

### 1. Build the MTA archive

```bash
mbt build
```

This generates `mta_archives/product-app_1.0.0.mtar`.

### 2. Log in to Cloud Foundry

```bash
cf login -a https://api.cf.<region>.hana.ondemand.com
```

### 3. Deploy

```bash
cf deploy mta_archives/product-app_1.0.0.mtar
```

This provisions:
- **product-app-db** — HANA HDI container
- **product-app-uaa** — XSUAA service instance
- **product-app-html5-runtime** + **product-app-html5-host** — HTML5 repo services
- **product-app-srv** — the CAP service (Node.js buildpack, 256 MB)
- **product-app-approuter** — the approuter
- **product-app-ui-deployer** — uploads the UI to the HTML5 host

### 4. Assign roles

In the BTP cockpit:

1. Navigate to your subaccount → **Security → Role Collections**
2. Find **ProductAppAdmin**
3. Add your user

The role collection grants `ProductAdmin` scope, defined in `xs-security.json`.

## Security model

Two scopes defined in `xs-security.json`:

| Scope | Role Template | Role Collection | Description |
|-------|--------------|-----------------|-------------|
| `Admin` | `ProductAdmin` | `ProductAppAdmin` | Full control over products |
| `Viewer` | `ProductViewer` | _(create your own)_ | Read-only access |

OAuth tokens are valid for 12 hours (`token-validity: 43200`).

## Service handlers

The `srv/product-service.js` file implements:

- **`before CREATE` / `before UPDATE` on Products** — validates that price and stock are non-negative
- **`on restock`** — atomically increments stock for a given product, with quantity validation
- **`on getLowStockProducts`** — runs a parameterized SELECT against the threshold
- **`after READ` on Products** — logs the count returned (useful for observability)

## Tech stack

- [SAP CAP](https://cap.cloud.sap/) `^9` — service framework
- [@cap-js/hana](https://www.npmjs.com/package/@cap-js/hana) `^2` — HANA driver
- [@cap-js/sqlite](https://www.npmjs.com/package/@cap-js/sqlite) `^2` — local SQLite for dev
- [@sap/xssec](https://www.npmjs.com/package/@sap/xssec) `^4.13.0` — XSUAA security middleware
- [@sap/approuter](https://www.npmjs.com/package/@sap/approuter) `^21.0.0` — UI host + auth gateway
- [Vue 3](https://vuejs.org/) `^3.4.0` + [Vue Router](https://router.vuejs.org/) `^4.2.5`
- [Vite](https://vitejs.dev/) `^5.0.0` — frontend bundler
- [Axios](https://axios-http.com/) `^1.6.0` — HTTP client

## Troubleshooting

**`cds watch` fails with "Cannot find module"**
Run `npm install` in the project root. Make sure you're using Node 18+.

**UI shows 404 on API calls during local dev**
Configure a proxy in `app/ui/vite.config.js` to forward `/product/*` to `http://localhost:4004`.

**Deployment fails on `product-app-db-deployer`**
The HANA HDI container quota in your subaccount may be exhausted. Free up an instance or request more entitlements.

**403 Forbidden on the deployed app**
Your user is missing the `ProductAppAdmin` role collection. Assign it in the BTP cockpit and log in again to refresh the token.

## Learn more

- [SAP CAP documentation](https://cap.cloud.sap/)
- [Deploying to Cloud Foundry](https://cap.cloud.sap/docs/guides/deployment/to-cf)
- [XSUAA & Authentication](https://cap.cloud.sap/docs/node.js/authentication)

## License

MIT — adapt freely for your own projects.
