# StockSense

StockSense is a modular Inventory Management System designed to digitize and streamline stock operations for small and medium-sized businesses.

It replaces manual registers, Excel sheets, and scattered inventory tracking with a centralized, real-time system.

## Features

### Authentication & Roles

* Secure Login & Registration
* JWT-based authentication
* Role-based access control
* Inventory Manager/Owner
* Warehouse Staff
* Role-specific dashboards and permissions

### Dashboard

* Total Stock
* Low Stock
* Out of Stock
* Pending Receipts
* Pending Deliveries
* Monthly Sales
* Monthly Profit
* Monthly Growth
* Recent Operations
* Smart inventory alerts

### Product Management

* Add, edit and delete products
* SKU management
* Product categories
* Unit of measurement
* Purchase and selling price
* Current stock
* Reorder level
* Product-wise sales history

### Inventory Operations

* Receipts – Record incoming stock
* Delivery Orders – Manage outgoing stock
* Internal Transfers – Move stock between locations
* Stock Adjustments – Correct physical stock differences
* Stock Ledger – Maintain complete stock movement history

### Sales & Profit Analytics

* Monthly sales tracking
* Month-to-month growth
* Product-wise sales history
* Best-selling products
* Slow-moving products
* Product-wise profit
* Monthly profit analysis

### Customer Orders

* Create customer orders
* New order notifications
* Order status tracking
* Pending, Confirmed, Ready, Delivered and Cancelled states

### Smart Features

* Low-stock alerts
* Smart reorder suggestions
* Dead-stock detection
* Sales-based stock prediction

### Warehouse Management

* Multiple warehouses
* Location-wise stock
* Warehouse transfers
* Stock visibility by location

## User Roles

### Inventory Manager / Owner

Has full access to:

* Dashboard
* Products
* Inventory operations
* Sales and profit analytics
* Customer orders
* Warehouses
* Smart inventory features

### Warehouse Staff

Can access only operational features such as:

* Receiving stock
* Picking and packing
* Internal transfers
* Stock counting
* Assigned warehouse information

Unauthorized features are hidden from the UI and protected through backend authorization.

## Inventory Flow

Supplier
   ↓
Receipt
   ↓
Stock
   ↓
Internal Transfer
   ↓
Warehouse / Location
   ↓
Customer Order
   ↓
Delivery
   ↓
Stock Ledger

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Authentication

* JWT

## Project Structure

StockSense/
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── ...
│
└── README.md

## Getting Started

### 1. Clone the repository

git clone <your-repository-url>
cd StockSense

### 2. Install Frontend

cd frontend
npm install
npm run dev

### 3. Install Backend

cd backend
npm install
npm start

### 4. Environment Variables

Create a .env file in the backend:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

## Core Concept

StockSense focuses on maintaining an accurate stock lifecycle.

For example:

Receive 100 Chairs
        ↓
Stock = 100

Transfer 20 Chairs
        ↓
Total Stock = 100
Location changes

Deliver 10 Chairs
        ↓
Stock = 90

Adjust -2 Damaged Chairs
        ↓
Stock = 88

Every operation is recorded in the Stock Ledger.

## Future Scope

* Barcode / QR code scanning
* Supplier management
* Purchase orders
* Advanced demand forecasting
* Mobile application
* AI-powered inventory recommendations
* Automated purchase order generation

## Objective

The goal of StockSense is to provide businesses with a simple, centralized and intelligent inventory platform that improves stock visibility, reduces manual work and helps managers make data-driven inventory decisions.
