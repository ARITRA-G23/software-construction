# E-commerce Product Uploader

A web application for store owners to manage their products with bulk upload capabilities.

## Features

- User authentication (login/register)
- Product management (CRUD operations)
- Bulk product upload via CSV or Excel
- Image upload with validation
- Search functionality
- Pagination
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-product-uploader
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
PORT=5000
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Products
- GET /api/products - Get all products (paginated)
- GET /api/products/search - Search products
- POST /api/products - Create a new product
- PUT /api/products/:id - Update a product
- DELETE /api/products/:id - Delete a product
- POST /api/products/bulk-upload/csv - Bulk upload via CSV
- POST /api/products/bulk-upload/excel - Bulk upload via Excel

## CSV/Excel Format

The bulk upload files should contain the following columns:
- name (required)
- description (required)
- price (required, numeric)
- category (required)
- stock (required, numeric)

## Security Features

- JWT-based authentication
- Password hashing
- Image validation
- Duplicate image detection
- Input validation
- Protected routes

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - Formik & Yup
  - Axios
  - React Router
  - React Toastify

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT
  - Multer
  - CSV-Parse
  - XLSX 