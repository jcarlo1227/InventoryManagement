const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Create Neon serverless connection or use mock for demo
let sql;
let isDemoMode = false;

if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'your_neon_database_url_here') {
  sql = neon(process.env.DATABASE_URL);
} else {
  console.log('⚠️  Running in DEMO MODE - No database connection configured');
  console.log('ℹ️  To connect to a real database, set DATABASE_URL in your .env file');
  isDemoMode = true;
  
  // Mock data for demo
  let mockInventory = [
    {
      id: 1,
      item_code: 'ITM001',
      product_name: 'Wireless Earphone',
      unit_of_measure: 'PCS',
      buy_price: 250.00,
      sell_price: 350.00,
      location: 'Philippines',
      category_id: 'CAT001',
      status: 'active',
      warehouse_id: 'WH001',
      total_quantity: 15,
      min_quantity: 5,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: 2,
      item_code: 'ITM002',
      product_name: 'USB Cable',
      unit_of_measure: 'PCS',
      buy_price: 50.00,
      sell_price: 75.00,
      location: 'Philippines',
      category_id: 'CAT002',
      status: 'inactive',
      warehouse_id: 'WH002',
      total_quantity: 8,
      min_quantity: 10,
      created_at: new Date('2024-01-14'),
      updated_at: new Date('2024-01-14')
    }
  ];
  
  let mockNotifications = [
    {
      id: 1,
      title: 'Low Stock Alert',
      message: 'USB Cable quantity is below minimum threshold (8 remaining)',
      type: 'warning',
      is_read: false,
      user_id: 1,
      created_at: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
    },
    {
      id: 2,
      title: 'Welcome!',
      message: 'Welcome to Fox Control Hub! This is running in demo mode.',
      type: 'info',
      is_read: false,
      user_id: 1,
      created_at: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    }
  ];
  
  let mockMessages = [
    {
      id: 1,
      sender_name: 'System Admin',
      message_text: 'Demo mode is active. Connect a real database to persist data.',
      is_read: false,
      user_id: 1,
      created_at: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    }
  ];
  
  let nextId = 3;
}

// Test database connection
const testConnection = async () => {
  if (isDemoMode) {
    console.log('✅ Demo mode initialized with mock data');
    return;
  }
  
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Connected to Neon database successfully');
    console.log(`Database version: ${result[0].version}`);
    
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create warehouses table
    await sql`
      CREATE TABLE IF NOT EXISTS warehouses (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create inventory table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        item_code VARCHAR(20) UNIQUE NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        unit_of_measure VARCHAR(10) NOT NULL,
        buy_price DECIMAL(10,2) NOT NULL,
        sell_price DECIMAL(10,2),
        location VARCHAR(255),
        category_id VARCHAR(10) REFERENCES categories(id),
        status VARCHAR(20) DEFAULT 'active',
        warehouse_id VARCHAR(10) REFERENCES warehouses(id),
        total_quantity INTEGER DEFAULT 0,
        min_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_name VARCHAR(100) NOT NULL,
        message_text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ All tables created/verified');
  } catch (err) {
    console.error('❌ Database connection error:', err);
  }
};

// Initialize database with sample data
const initializeDatabase = async () => {
  try {
    await testConnection();
    
    // Check if admin user exists, if not create it
    const adminCheck = await sql`SELECT * FROM users WHERE username = 'admin'`;
    
    if (adminCheck.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      await sql`
        INSERT INTO users (username, password, role) 
        VALUES ('admin', ${hashedPassword}, 'admin')
      `;
      
      console.log('✅ Default admin user created (username: admin, password: admin)');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Insert sample categories if they don't exist
    const categoriesCheck = await sql`SELECT COUNT(*) as count FROM categories`;
    if (categoriesCheck[0].count == 0) {
      await sql`
        INSERT INTO categories (id, name, description) VALUES
        ('CAT001', 'Electronics', 'Electronic devices and components'),
        ('CAT002', 'Accessories', 'Various accessories and peripherals'),
        ('CAT003', 'Components', 'Hardware components and parts')
      `;
      console.log('✅ Sample categories inserted');
    }
    
    // Insert sample warehouses if they don't exist
    const warehousesCheck = await sql`SELECT COUNT(*) as count FROM warehouses`;
    if (warehousesCheck[0].count == 0) {
      await sql`
        INSERT INTO warehouses (id, name, location) VALUES
        ('WH001', 'Main Warehouse', 'Manila, Philippines'),
        ('WH002', 'Secondary Warehouse', 'Cebu, Philippines')
      `;
      console.log('✅ Sample warehouses inserted');
    }
    
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
};

// User authentication functions
const authenticateUser = async (username, password) => {
  if (isDemoMode) {
    // Demo mode - accept admin/admin or any user/user
    if ((username === 'admin' && password === 'admin') || 
        (username === 'user' && password === 'user')) {
      return {
        id: 1,
        username: username,
        role: username === 'admin' ? 'admin' : 'user'
      };
    }
    return null;
  }
  
  try {
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (isValidPassword) {
      return {
        id: user.id,
        username: user.username,
        role: user.role
      };
    }
    
    return null;
  } catch (err) {
    console.error('Authentication error:', err);
    return null;
  }
};

// Inventory CRUD operations
const getAllInventory = async () => {
  if (isDemoMode) {
    return mockInventory;
  }
  
  try {
    const result = await sql`
      SELECT i.*, c.name as category_name, w.name as warehouse_name 
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      ORDER BY i.updated_at DESC
    `;
    return result;
  } catch (err) {
    console.error('Error fetching inventory:', err);
    return [];
  }
};

const getInventoryById = async (id) => {
  try {
    const result = await sql`SELECT * FROM inventory WHERE id = ${id}`;
    return result[0] || null;
  } catch (err) {
    console.error('Error fetching inventory item:', err);
    return null;
  }
};

const createInventoryItem = async (itemData) => {
  try {
    const result = await sql`
      INSERT INTO inventory (
        item_code, product_name, unit_of_measure, buy_price, sell_price,
        location, category_id, status, warehouse_id, total_quantity, min_quantity
      ) VALUES (
        ${itemData.item_code}, ${itemData.product_name}, ${itemData.unit_of_measure},
        ${itemData.buy_price}, ${itemData.sell_price}, ${itemData.location},
        ${itemData.category_id}, ${itemData.status}, ${itemData.warehouse_id},
        ${itemData.total_quantity}, ${itemData.min_quantity || 0}
      ) RETURNING *
    `;
    return result[0];
  } catch (err) {
    console.error('Error creating inventory item:', err);
    return null;
  }
};

const updateInventoryItem = async (id, itemData) => {
  try {
    const result = await sql`
      UPDATE inventory SET
        item_code = ${itemData.item_code},
        product_name = ${itemData.product_name},
        unit_of_measure = ${itemData.unit_of_measure},
        buy_price = ${itemData.buy_price},
        sell_price = ${itemData.sell_price},
        location = ${itemData.location},
        category_id = ${itemData.category_id},
        status = ${itemData.status},
        warehouse_id = ${itemData.warehouse_id},
        total_quantity = ${itemData.total_quantity},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  } catch (err) {
    console.error('Error updating inventory item:', err);
    return null;
  }
};

const deleteInventoryItem = async (id) => {
  try {
    const result = await sql`DELETE FROM inventory WHERE id = ${id} RETURNING id`;
    return result.length > 0;
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    return false;
  }
};

// Notification functions
const getNotifications = async (userId = null) => {
  try {
    const result = await sql`
      SELECT * FROM notifications 
      WHERE (user_id = ${userId} OR user_id IS NULL)
      ORDER BY created_at DESC
      LIMIT 10
    `;
    return result;
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
};

const createNotification = async (title, message, type = 'info', userId = null) => {
  try {
    const result = await sql`
      INSERT INTO notifications (title, message, type, user_id)
      VALUES (${title}, ${message}, ${type}, ${userId})
      RETURNING *
    `;
    return result[0];
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// Message functions
const getMessages = async (userId = null) => {
  try {
    const result = await sql`
      SELECT * FROM messages 
      WHERE (user_id = ${userId} OR user_id IS NULL)
      ORDER BY created_at DESC
      LIMIT 10
    `;
    return result;
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
};

const createMessage = async (senderName, messageText, userId = null) => {
  try {
    const result = await sql`
      INSERT INTO messages (sender_name, message_text, user_id)
      VALUES (${senderName}, ${messageText}, ${userId})
      RETURNING *
    `;
    return result[0];
  } catch (err) {
    console.error('Error creating message:', err);
    return null;
  }
};

// Get categories and warehouses
const getCategories = async () => {
  try {
    const result = await sql`SELECT * FROM categories ORDER BY name`;
    return result;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};

const getWarehouses = async () => {
  try {
    const result = await sql`SELECT * FROM warehouses ORDER BY name`;
    return result;
  } catch (err) {
    console.error('Error fetching warehouses:', err);
    return [];
  }
};

module.exports = {
  sql,
  testConnection,
  initializeDatabase,
  authenticateUser,
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getNotifications,
  createNotification,
  getMessages,
  createMessage,
  getCategories,
  getWarehouses
};