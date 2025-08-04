const express = require('express');
const session = require('express-session');
const path = require('path');
// Use demo database by default, switch to real database if DATABASE_URL is properly configured
const databaseModule = (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'your_neon_database_url_here') 
  ? './database' 
  : './database-demo';

const { 
  initializeDatabase, 
  authenticateUser, 
  sql,
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
} = require(databaseModule);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fox-control-hub-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect('/login.html');
  }
};

// Routes

// Root route - redirect to login if not authenticated, otherwise to inventory
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    res.redirect('/inventory.html');
  } else {
    res.redirect('/login.html');
  }
});

// Login page
app.get('/login.html', (req, res) => {
  if (req.session && req.session.user) {
    res.redirect('/inventory.html');
  } else {
    res.sendFile(path.join(__dirname, 'loginpage.html'));
  }
});

// Login POST route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await authenticateUser(username, password);
    
    if (user) {
      req.session.user = user;
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Protected routes - require authentication
app.get('/inventory.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Inventory.html'));
});

app.get('/barcode.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Barcode.html'));
});

app.get('/materialshipments.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'MaterialShipments.html'));
});

app.get('/ordershipments.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'OrderShipments.html'));
});

app.get('/reports.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Reports.html'));
});

app.get('/stocktracking.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'StockTracking.html'));
});

app.get('/warehouselayandopti.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'WarehouseLayAndOpti.html'));
});

// API route to get current user info
app.get('/api/user', requireAuth, (req, res) => {
  res.json({
    username: req.session.user.username,
    role: req.session.user.role
  });
});

// API route to check database connection status
app.get('/api/db-status', async (req, res) => {
  try {
    const result = await sql`SELECT current_database(), version()`;
    
    res.json({
      connected: true,
      database: result[0].current_database,
      host: 'Neon PostgreSQL Serverless',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    res.json({
      connected: false,
      error: 'Connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ============= INVENTORY API ENDPOINTS =============

// Get all inventory items
app.get('/api/inventory', requireAuth, async (req, res) => {
  try {
    const inventory = await getAllInventory();
    res.json({ success: true, data: inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
});

// Get single inventory item
app.get('/api/inventory/:id', requireAuth, async (req, res) => {
  try {
    const item = await getInventoryById(req.params.id);
    if (item) {
      res.json({ success: true, data: item });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch item' });
  }
});

// Create new inventory item
app.post('/api/inventory', requireAuth, async (req, res) => {
  try {
    const itemData = {
      item_code: req.body.itemCode,
      product_name: req.body.productName,
      unit_of_measure: req.body.unitOfMeasure,
      buy_price: parseFloat(req.body.buyPrice),
      sell_price: req.body.sellPrice ? parseFloat(req.body.sellPrice) : null,
      location: req.body.location,
      category_id: req.body.categoryId || null,
      status: req.body.status || 'active',
      warehouse_id: req.body.warehouseId || null,
      total_quantity: parseInt(req.body.totalQuantity) || 0,
      min_quantity: parseInt(req.body.minQuantity) || 0
    };

    const newItem = await createInventoryItem(itemData);
    if (newItem) {
      // Create notification for new item
      await createNotification(
        'New Item Added',
        `${itemData.product_name} has been added to inventory`,
        'info',
        req.session.user.id
      );
      
      res.status(201).json({ success: true, data: newItem });
    } else {
      res.status(400).json({ success: false, message: 'Failed to create item' });
    }
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to create item' });
  }
});

// Update inventory item
app.put('/api/inventory/:id', requireAuth, async (req, res) => {
  try {
    const itemData = {
      item_code: req.body.itemCode,
      product_name: req.body.productName,
      unit_of_measure: req.body.unitOfMeasure,
      buy_price: parseFloat(req.body.buyPrice),
      sell_price: req.body.sellPrice ? parseFloat(req.body.sellPrice) : null,
      location: req.body.location,
      category_id: req.body.categoryId || null,
      status: req.body.status || 'active',
      warehouse_id: req.body.warehouseId || null,
      total_quantity: parseInt(req.body.totalQuantity) || 0
    };

    const updatedItem = await updateInventoryItem(req.params.id, itemData);
    if (updatedItem) {
      // Create notification for item update
      await createNotification(
        'Item Updated',
        `${itemData.product_name} details have been updated`,
        'info',
        req.session.user.id
      );
      
      res.json({ success: true, data: updatedItem });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to update item' });
  }
});

// Delete inventory item
app.delete('/api/inventory/:id', requireAuth, async (req, res) => {
  try {
    const success = await deleteInventoryItem(req.params.id);
    if (success) {
      // Create notification for item deletion
      await createNotification(
        'Item Deleted',
        `Inventory item has been removed`,
        'warning',
        req.session.user.id
      );
      
      res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

// Delete multiple inventory items
app.delete('/api/inventory', requireAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Invalid item IDs' });
    }

    let deletedCount = 0;
    for (const id of ids) {
      const success = await deleteInventoryItem(id);
      if (success) deletedCount++;
    }

    if (deletedCount > 0) {
      // Create notification for bulk deletion
      await createNotification(
        'Items Deleted',
        `${deletedCount} inventory items have been removed`,
        'warning',
        req.session.user.id
      );
    }

    res.json({ 
      success: true, 
      message: `${deletedCount} items deleted successfully`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error deleting inventory items:', error);
    res.status(500).json({ success: false, message: 'Failed to delete items' });
  }
});

// ============= NOTIFICATIONS API ENDPOINTS =============

// Get notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await getNotifications(req.session.user.id);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Create notification
app.post('/api/notifications', requireAuth, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notification = await createNotification(title, message, type, req.session.user.id);
    if (notification) {
      res.status(201).json({ success: true, data: notification });
    } else {
      res.status(400).json({ success: false, message: 'Failed to create notification' });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Mark notifications as read
app.put('/api/notifications/mark-read', requireAuth, async (req, res) => {
  try {
    if (databaseModule.includes('demo')) {
      // Demo mode - just mark all notifications as read in memory
      const notifications = await getNotifications(req.session.user.id);
      notifications.forEach(n => n.is_read = true);
    } else {
      await sql`UPDATE notifications SET is_read = TRUE WHERE user_id = ${req.session.user.id} OR user_id IS NULL`;
    }
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
  }
});

// ============= MESSAGES API ENDPOINTS =============

// Get messages
app.get('/api/messages', requireAuth, async (req, res) => {
  try {
    const messages = await getMessages(req.session.user.id);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Create message
app.post('/api/messages', requireAuth, async (req, res) => {
  try {
    const { senderName, messageText } = req.body;
    const message = await createMessage(senderName, messageText, req.session.user.id);
    if (message) {
      res.status(201).json({ success: true, data: message });
    } else {
      res.status(400).json({ success: false, message: 'Failed to create message' });
    }
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ success: false, message: 'Failed to create message' });
  }
});

// ============= CATEGORIES AND WAREHOUSES API ENDPOINTS =============

// Get categories
app.get('/api/categories', requireAuth, async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get warehouses
app.get('/api/warehouses', requireAuth, async (req, res) => {
  try {
    const warehouses = await getWarehouses();
    res.json({ success: true, data: warehouses });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses' });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Fox Control Hub server running on http://localhost:${PORT}`);
      console.log(`📝 Default login credentials:`);
      console.log(`   Username: admin`);
      console.log(`   Password: admin`);
      console.log(`🗄️ Database: Connected to Neon PostgreSQL`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();