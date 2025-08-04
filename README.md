# Fox Control Hub - Inventory Management System

A comprehensive inventory management system with user authentication, real-time data management, and a modern web interface.

## Features

### ✅ Completed Features
- **User Authentication**: Secure login/logout with session management
- **Database Integration**: PostgreSQL database with Neon serverless
- **Inventory Management**: 
  - Create, read, update, delete inventory items
  - Search and filter functionality
  - Category and warehouse management
  - Real-time data updates
- **Modern UI**: Bootstrap-based responsive interface
- **API Endpoints**: RESTful API for all inventory operations

### 📋 Database Schema
- **Users**: Authentication and user management
- **Inventory**: Complete inventory item tracking
- **Categories**: Product categorization
- **Warehouses**: Location management

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- A Neon PostgreSQL database account

### 1. Clone and Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Copy your connection string
3. Update the `.env` file with your database URL:

```env
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
SESSION_SECRET=your-secret-key-here
PORT=3000
```

### 3. Start the Server
```bash
npm start
```

The server will:
- Automatically create all required database tables
- Insert default categories and warehouses
- Create a default admin user (username: admin, password: admin)
- Start on http://localhost:3000

## Usage

### 1. Login
- Navigate to http://localhost:3000
- Use the default credentials:
  - **Username**: admin
  - **Password**: admin

### 2. Inventory Management
- **Add Items**: Click "Insert" to add new inventory items
- **Edit Items**: Select an item and click "Update" or click the edit icon
- **Delete Items**: Select items and click "Delete" or click the trash icon
- **Search**: Use the search bar to find items by name or code
- **Filter**: Filter by category, status, or warehouse

### 3. Features
- **Real-time Updates**: All changes are immediately reflected in the database
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: User-friendly error messages and validation
- **Bulk Operations**: Select multiple items for bulk deletion

## API Endpoints

### Authentication
- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /api/user` - Get current user info

### Inventory
- `GET /api/inventory` - Get all items (with optional filters)
- `GET /api/inventory/:id` - Get specific item
- `POST /api/inventory` - Create new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `DELETE /api/inventory` - Delete multiple items
- `PATCH /api/inventory/:id/quantity` - Update item quantity

### Reference Data
- `GET /api/categories` - Get all categories
- `GET /api/warehouses` - Get all warehouses
- `GET /api/inventory/stats` - Get inventory statistics

## File Structure

```
├── server.js              # Main server file
├── database.js            # Database connection and user auth
├── inventory.js           # Inventory database operations
├── Inventory.html         # Main inventory management interface
├── loginpage.html         # Login page
├── package.json           # Dependencies
├── .env                   # Environment variables
└── README.md             # This file
```

## Database Tables

### `inventory`
- `id` - Primary key
- `item_code` - Unique item identifier
- `product_name` - Product name
- `unit_of_measure` - Unit (PCS, KG, L, M)
- `buy_price` - Purchase price
- `sell_price` - Selling price
- `location` - Item location
- `category_id` - Reference to categories
- `status` - active/inactive
- `warehouse_id` - Reference to warehouses
- `total_quantity` - Stock quantity
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### `categories`
- `id` - Primary key
- `category_id` - Unique category identifier
- `category_name` - Category name
- `description` - Category description

### `warehouses`
- `id` - Primary key
- `warehouse_id` - Unique warehouse identifier
- `warehouse_name` - Warehouse name
- `location` - Warehouse location
- `capacity` - Storage capacity

## Security Features

- **Session-based Authentication**: Secure user sessions
- **Password Hashing**: bcrypt password encryption
- **Protected Routes**: All API endpoints require authentication
- **Input Validation**: Form validation and sanitization
- **SQL Injection Protection**: Parameterized queries

## Development

### Development Mode
```bash
npm run dev
```

This will start the server with nodemon for automatic restarts during development.

### Environment Variables
- `DATABASE_URL`: Neon PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `PORT`: Server port (default: 3000)

## Deployment

1. Set up a Neon PostgreSQL database
2. Configure environment variables on your hosting platform
3. Deploy the application
4. The database tables will be created automatically on first startup

## Support

For issues or questions about the inventory management system, please check the code comments and API documentation in the source files.

## License

MIT License