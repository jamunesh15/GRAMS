require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const phoneAuthRoutes = require('./routes/phoneAuthRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const transparencyRoutes = require('./routes/transparencyRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const escalationRoutes = require('./routes/escalationRoutes');
const engineerRoutes = require('./routes/engineerRoutes');
const wardMapRoutes = require('./routes/wardMapRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

// Import services
const { autoEscalateGrievances, updateDaysOpen } = require('./utils/escalationService');

// Initialize Firebase Admin (if configured)
try {
  require('./config/firebase');
} catch (error) {
  console.warn('⚠️  Firebase not configured. Phone auth will be unavailable.');
}

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://grams-oc3p-frontend.vercel.app',
    "https://main.d3ry7pqpwswyf4.amplifyapp.com",
    'https://grams-lyart.vercel.app',
    "https://main.d3ry7pqpwswyf4.amplifyapp.com"
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/phone-auth', phoneAuthRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transparency', transparencyRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/resource-request', require('./routes/resourceRequestRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/engineers', engineerRoutes);
app.use('/api/ward-map', wardMapRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);


// Auto-escalation scheduler - runs every hour
setInterval(async () => {
  try {
    console.log('🔄 Running auto-escalation check...');
    await updateDaysOpen();
    await autoEscalateGrievances();
  } catch (error) {
    console.error('❌ Auto-escalation failed:', error);
  }
}, 60 * 60 * 1000); // Every 1 hour

// Run once on startup
setTimeout(async () => {
  try {
    console.log('🚀 Running initial escalation check...');
    await updateDaysOpen();
    await autoEscalateGrievances();
  } catch (error) {
    console.error('❌ Initial escalation check failed:', error);
  }
}, 5000); // 5 seconds after startup

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
