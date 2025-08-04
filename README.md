# Fox Control Hub - Inventory Management System

## Overview

Fox Control Hub is a comprehensive inventory management system with database connectivity and real-time features. This project has been updated to remove static data and integrate with a database backend.

## Recent Updates

### ✅ Static Data Removal & Database Integration

The inventory system has been completely refactored to use dynamic data from a database instead of static JavaScript arrays.

#### Changes Made:

1. **Database Schema & Connection**
   - Added comprehensive database schema for inventory, categories, warehouses, notifications, and messages
   - Implemented Neon PostgreSQL serverless connection with fallback demo mode
   - Created database initialization with sample data

2. **API Endpoints**
   - `GET/POST/PUT/DELETE /api/inventory` - Full CRUD operations for inventory items
   - `GET/POST /api/notifications` - Notification management
   - `GET/POST /api/messages` - Message management  
   - `GET /api/categories` - Category data
   - `GET /api/warehouses` - Warehouse data
   - `PUT /api/notifications/mark-read` - Mark notifications as read

3. **Frontend Updates**
   - Removed all static data from inventory table, notifications, and messages
   - Updated JavaScript to use API calls instead of local arrays
   - Added dynamic rendering for notifications and messages
   - Implemented proper error handling and user feedback

4. **Demo Mode**
   - Created fallback demo mode that works without database connection
   - Includes sample inventory items, notifications, and messages
   - Perfect for testing and development

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   
   The system works in two modes:
   
   **Demo Mode (Default):**
   - No database setup required
   - Uses in-memory mock data
   - Perfect for testing and development
   
   **Production Mode:**
   - Set up a Neon PostgreSQL database
   - Add your database URL to `.env` file:
     ```
     DATABASE_URL=your_neon_database_url_here
     ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Open your browser to `http://localhost:3000`
   - Demo credentials:
     - Username: `admin`, Password: `admin`
     - Username: `user`, Password: `user`

## Features

### Inventory Management
- ✅ **Dynamic Data Loading** - All inventory data loaded from database/API
- ✅ **Real-time CRUD Operations** - Add, edit, delete inventory items
- ✅ **Search & Filtering** - By name, code, category, warehouse, status
- ✅ **Bulk Operations** - Select and delete multiple items
- ✅ **Category & Warehouse Management** - Dynamic dropdowns

### Notifications & Messages
- ✅ **Dynamic Notifications** - Real-time notification system
- ✅ **Unread Badges** - Visual indicators for unread items
- ✅ **Mark as Read** - Bulk mark notifications as read
- ✅ **Auto-generated Notifications** - System creates notifications for inventory changes

### Technical Features
- ✅ **Database Abstraction** - Works with real database or demo mode
- ✅ **API-First Design** - RESTful API for all operations
- ✅ **Error Handling** - Comprehensive error handling and user feedback
- ✅ **Session Management** - Secure user authentication

## Database Schema

### Tables Created:
- `users` - User authentication and roles
- `inventory` - Main inventory items with full details
- `categories` - Product categories
- `warehouses` - Warehouse locations
- `notifications` - System notifications
- `messages` - User messages

### Sample Data Included:
- 2 demo inventory items (Wireless Earphone, USB Cable)
- 3 categories (Electronics, Accessories, Components)
- 2 warehouses (Main & Secondary)
- Welcome notifications and system messages

## File Structure

```
├── server.js              # Main server with API endpoints
├── database.js             # Real database connection (Neon PostgreSQL)
├── database-demo.js        # Demo mode with mock data
├── Inventory.html          # Main inventory interface (updated)
├── inventory.html          # Redirect to main inventory
├── loginpage.html          # Authentication page
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
└── README.md              # This documentation
```

## API Documentation

### Inventory Endpoints
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get specific item
- `POST /api/inventory` - Create new item
- `PUT /api/inventory/:id` - Update existing item
- `DELETE /api/inventory/:id` - Delete specific item
- `DELETE /api/inventory` - Bulk delete items

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/mark-read` - Mark all as read

### Reference Data
- `GET /api/categories` - Get all categories
- `GET /api/warehouses` - Get all warehouses

## Development

The system is designed to be developer-friendly:

1. **Demo Mode**: Works immediately without any database setup
2. **Hot Reload**: Use `npm run dev` for development with nodemon
3. **Database Migration**: Automatic table creation when connecting to real database
4. **Error Handling**: Comprehensive error logging and user feedback

## Production Deployment

For production use:

1. Set up a Neon PostgreSQL database
2. Update the `DATABASE_URL` in your `.env` file
3. The system will automatically:
   - Create required tables
   - Set up sample data
   - Create admin user (admin/admin)

## Support

This system provides a solid foundation for inventory management with:
- Real-time updates
- Database persistence
- User authentication  
- Responsive design
- Comprehensive error handling

The demo mode makes it easy to test and develop without requiring database setup, while the production mode provides full database functionality for real-world use.