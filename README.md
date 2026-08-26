# Warehouse Fulfilment Storage Management System

**Open the live website:** [Warehouse Fulfilment Storage Management System](https://ghostwhite-dry-type--lprakash1708.replit.app)

A simple and professional warehouse management system created as a college-level Java mini project. The system helps a small fulfilment team view stock, manage products, manage storage locations, and find records quickly.

## Project Overview

This project demonstrates the basics of:

- Java classes and objects
- Java Collections using `ArrayList`
- Create, Read, Update, and Delete operations
- Searching by ID, name, and category
- A responsive HTML, CSS, and JavaScript-style web interface
- Storage capacity and available-space calculations
- Local data persistence without a database

The website includes realistic demo data and is designed to be easy to explain during a college project demonstration.

## Main Features

### Dashboard

The dashboard provides a quick warehouse summary:

- Products in catalogue
- Units on hand
- Storage used
- Products that need attention
- Storage capacity overview
- Low-stock and out-of-stock products

### Product Management

Products contain:

- Product ID
- Product Name
- Category
- Quantity
- Storage Location
- Status

Available operations:

- Add product
- View product details
- Edit product
- Delete product
- Automatically display stock status

### Storage Management

Storage locations contain:

- Storage ID
- Location
- Capacity
- Occupied Space
- Available Space
- Status

Available operations:

- Add storage location
- View storage details
- Update storage location
- Delete storage location
- Automatically calculate available space

### Search

Products can be searched by:

- Product ID
- Product Name
- Category

### Data Storage

The website stores demo changes in the browser using `localStorage`, so it works without a database. The Java example stores products and storage locations using `ArrayList`.

## Java Backend Example

The Java source files are in `artifacts/warehouse-fulfillment/java-backend/src/`.

### Java Classes

- `Product.java` — product model with product fields, getters, setters, and display output
- `Storage.java` — storage model with capacity and available-space calculation
- `WarehouseService.java` — product and storage CRUD/search methods using `ArrayList`
- `Main.java` — simple console example showing how the service works

### Java CRUD Methods

`WarehouseService` includes separate methods for:

- `addProduct()`
- `getProducts()`
- `searchProduct()`
- `updateProduct()`
- `deleteProduct()`
- `addStorage()`
- `getStorageLocations()`
- `searchStorage()`
- `updateStorage()`
- `deleteStorage()`

## Run the Java Example

From the `java-backend` directory:

```bash
javac -d out src/*.java
java -cp out Main
```

## Run the Website Locally

Install the project dependencies and start the frontend:

```bash
pnpm install
pnpm --filter @workspace/warehouse-fulfillment run dev
```

## Technology Used

- Frontend: HTML, CSS, JavaScript-style React interface
- Backend example: Java
- Collections: Java `ArrayList`
- Data persistence for the web demo: Browser `localStorage`
- Database: Not required for the basic version

## Project Purpose

The main purpose of this project is to demonstrate a clear understanding of Java programming fundamentals, including classes, objects, collections, and CRUD operations, together with a simple warehouse management interface.