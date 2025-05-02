# E-Commerce Admin System Class Diagram

```mermaid
classDiagram
    %% Backend Models
    class User {
        +String email
        +String password
        +String name
        +String role
        +Date createdAt
        +Date updatedAt
        +comparePassword(candidatePassword)
    }

    class Product {
        +String name
        +String description
        +Number price
        +String[] images
        +ObjectId storeOwner
        +String category
        +Number stock
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
        +isImageUnique(imagePath, productId)
    }

    class Order {
        +String customerName
        +String customerEmail
        +Object[] products
        +Number totalAmount
        +String status
        +Object shippingAddress
        +Date createdAt
    }

    %% Frontend Components
    class Login {
        +String email
        +String password
        +Boolean loading
        +handleSubmit()
        +handleChange()
    }

    class Register {
        +String name
        +String email
        +String password
        +String confirmPassword
        +Boolean loading
        +handleSubmit()
        +handleChange()
    }

    class ProductList {
        +Product[] products
        +Number page
        +Number totalPages
        +Boolean loading
        +fetchProducts()
        +handleEdit(product)
        +handleDelete(productId)
        +handleAddProduct()
        +getImageUrl(imagePath)
    }

    class ProductForm {
        +Product product
        +Function onSave
        +Function onCancel
        +String name
        +String description
        +Number price
        +String category
        +Number stock
        +File[] images
        +handleSubmit()
        +handleChange()
        +handleImageChange()
    }

    class Dashboard {
        +Object stats
        +Boolean loading
        +fetchDashboardData()
    }

    class BulkUpload {
        +File file
        +Boolean loading
        +handleFileChange()
        +handleUpload()
    }

    class Navbar {
        +Boolean isAuthenticated
        +String userName
        +handleLogout()
    }

    class PrivateRoute {
        +Boolean isAuthenticated
        +Component children
        +render()
    }

    %% Relationships
    User "1" -- "many" Product : creates
    Product "many" -- "many" Order : included in
    User "1" -- "many" Order : places

    %% Frontend Component Relationships
    Login -- User : authenticates
    Register -- User : creates
    ProductList -- Product : displays
    ProductForm -- Product : creates/updates
    Dashboard -- Product : displays stats
    BulkUpload -- Product : creates many
    Navbar -- User : displays info
    PrivateRoute -- User : checks auth
```

## Description

This class diagram represents the structure of the E-Commerce Admin System, including both backend models and frontend components.

### Backend Models
- **User**: Represents system users with authentication capabilities
- **Product**: Represents products in the system with various attributes
- **Order**: Represents customer orders with product references

### Frontend Components
- **Login/Register**: Authentication components
- **ProductList/ProductForm**: Product management components
- **Dashboard**: Overview of system statistics
- **BulkUpload**: Mass product creation component
- **Navbar**: Navigation component
- **PrivateRoute**: Authentication protection component

### Relationships
- Users create Products (one-to-many)
- Products are included in Orders (many-to-many)
- Users place Orders (one-to-many)
- Frontend components interact with backend models through API calls 