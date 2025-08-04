require('dotenv').config();

// Demo data
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
    created_at: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: 2,
    title: 'Welcome!',
    message: 'Welcome to Fox Control Hub! This is running in demo mode.',
    type: 'info',
    is_read: false,
    user_id: 1,
    created_at: new Date(Date.now() - 60 * 60 * 1000)
  }
];

let mockMessages = [
  {
    id: 1,
    sender_name: 'System Admin',
    message_text: 'Demo mode is active. Connect a real database to persist data.',
    is_read: false,
    user_id: 1,
    created_at: new Date(Date.now() - 5 * 60 * 1000)
  }
];

let mockCategories = [
  { id: 'CAT001', name: 'Electronics', description: 'Electronic devices and components' },
  { id: 'CAT002', name: 'Accessories', description: 'Various accessories and peripherals' },
  { id: 'CAT003', name: 'Components', description: 'Hardware components and parts' }
];

let mockWarehouses = [
  { id: 'WH001', name: 'Main Warehouse', location: 'Manila, Philippines' },
  { id: 'WH002', name: 'Secondary Warehouse', location: 'Cebu, Philippines' }
];

let nextId = 3;

// Mock database functions
const testConnection = async () => {
  console.log('✅ Demo mode initialized with mock data');
};

const initializeDatabase = async () => {
  console.log('✅ Demo database initialized');
  console.log('📝 Demo login credentials:');
  console.log('   Username: admin, Password: admin');
  console.log('   Username: user, Password: user');
};

const authenticateUser = async (username, password) => {
  if ((username === 'admin' && password === 'admin') || 
      (username === 'user' && password === 'user')) {
    return {
      id: 1,
      username: username,
      role: username === 'admin' ? 'admin' : 'user'
    };
  }
  return null;
};

const getAllInventory = async () => {
  return mockInventory;
};

const getInventoryById = async (id) => {
  return mockInventory.find(item => item.id == id) || null;
};

const createInventoryItem = async (itemData) => {
  const newItem = {
    id: nextId++,
    item_code: itemData.item_code,
    product_name: itemData.product_name,
    unit_of_measure: itemData.unit_of_measure,
    buy_price: itemData.buy_price,
    sell_price: itemData.sell_price,
    location: itemData.location,
    category_id: itemData.category_id,
    status: itemData.status,
    warehouse_id: itemData.warehouse_id,
    total_quantity: itemData.total_quantity,
    min_quantity: itemData.min_quantity || 0,
    created_at: new Date(),
    updated_at: new Date()
  };
  mockInventory.push(newItem);
  return newItem;
};

const updateInventoryItem = async (id, itemData) => {
  const index = mockInventory.findIndex(item => item.id == id);
  if (index === -1) return null;
  
  mockInventory[index] = {
    ...mockInventory[index],
    ...itemData,
    updated_at: new Date()
  };
  return mockInventory[index];
};

const deleteInventoryItem = async (id) => {
  const index = mockInventory.findIndex(item => item.id == id);
  if (index === -1) return false;
  
  mockInventory.splice(index, 1);
  return true;
};

const getNotifications = async (userId = null) => {
  return mockNotifications;
};

const createNotification = async (title, message, type = 'info', userId = null) => {
  const notification = {
    id: mockNotifications.length + 1,
    title,
    message,
    type,
    is_read: false,
    user_id: userId,
    created_at: new Date()
  };
  mockNotifications.unshift(notification);
  return notification;
};

const getMessages = async (userId = null) => {
  return mockMessages;
};

const createMessage = async (senderName, messageText, userId = null) => {
  const message = {
    id: mockMessages.length + 1,
    sender_name: senderName,
    message_text: messageText,
    is_read: false,
    user_id: userId,
    created_at: new Date()
  };
  mockMessages.unshift(message);
  return message;
};

const getCategories = async () => {
  return mockCategories;
};

const getWarehouses = async () => {
  return mockWarehouses;
};

// Mock SQL object for compatibility
const sql = {
  query: async (query) => {
    console.log('Demo mode: SQL query intercepted:', query);
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