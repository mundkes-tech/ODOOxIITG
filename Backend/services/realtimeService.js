/**
 * Real-time Service
 * Handles WebSocket connections and real-time data streaming
 */

const { Server } = require('socket.io');
const logger = require('../utils/logger');
const integrationService = require('./integrationService');

class RealtimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.companyRooms = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupEventHandlers();
    logger.info('Real-time service initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      // Join company room
      socket.on('join-company', (data) => {
        const { companyId, userId, role } = data;
        socket.join(`company-${companyId}`);
        socket.join(`user-${userId}`);
        
        this.connectedUsers.set(socket.id, { userId, companyId, role });
        this.addToCompanyRoom(companyId, socket.id);
        
        logger.info(`User ${userId} joined company ${companyId}`);
        
        // Send initial data
        this.sendInitialData(socket, companyId, userId, role);
      });

      // Handle expense updates
      socket.on('expense-updated', (data) => {
        this.broadcastExpenseUpdate(data);
      });

      // Handle approval updates
      socket.on('approval-updated', (data) => {
        this.broadcastApprovalUpdate(data);
      });

      // Handle integration sync requests
      socket.on('request-sync', (data) => {
        this.handleSyncRequest(socket, data);
      });

      // Handle real-time notifications
      socket.on('notification-sent', (data) => {
        this.broadcastNotification(data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  addToCompanyRoom(companyId, socketId) {
    if (!this.companyRooms.has(companyId)) {
      this.companyRooms.set(companyId, new Set());
    }
    this.companyRooms.get(companyId).add(socketId);
  }

  removeFromCompanyRoom(companyId, socketId) {
    if (this.companyRooms.has(companyId)) {
      this.companyRooms.get(companyId).delete(socketId);
      if (this.companyRooms.get(companyId).size === 0) {
        this.companyRooms.delete(companyId);
      }
    }
  }

  async sendInitialData(socket, companyId, userId, role) {
    try {
      // Send user-specific data
      const userData = await this.getUserInitialData(userId, role);
      socket.emit('initial-data', userData);

      // Send company-wide data
      const companyData = await this.getCompanyInitialData(companyId);
      socket.emit('company-data', companyData);

      // Send integration status
      const integrationStatus = await this.getIntegrationStatus(companyId);
      socket.emit('integration-status', integrationStatus);

    } catch (error) {
      logger.error('Error sending initial data:', error);
      socket.emit('error', { message: 'Failed to load initial data' });
    }
  }

  async getUserInitialData(userId, role) {
    const data = {
      notifications: [],
      pendingTasks: [],
      recentActivity: []
    };

    // Get notifications
    const Notification = require('../models/Notification');
    data.notifications = await Notification.find({ user: userId, read: false })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get role-specific data
    if (role === 'employee') {
      const Expense = require('../models/Expense');
      data.pendingTasks = await Expense.find({ 
        user: userId, 
        status: { $in: ['draft', 'pending'] } 
      }).sort({ createdAt: -1 }).limit(5);
    } else if (role === 'manager') {
      const Expense = require('../models/Expense');
      data.pendingTasks = await Expense.find({ 
        status: 'pending_approval',
        approver: userId
      }).sort({ createdAt: -1 }).limit(10);
    }

    return data;
  }

  async getCompanyInitialData(companyId) {
    const data = {
      stats: {},
      recentExpenses: [],
      integrationStatus: {}
    };

    // Get company statistics
    const Expense = require('../models/Expense');
    const stats = await Expense.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    data.stats = stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount };
      return acc;
    }, {});

    // Get recent expenses
    data.recentExpenses = await Expense.find({ company: companyId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    return data;
  }

  async getIntegrationStatus(companyId) {
    return {
      corporateCard: {
        connected: !!process.env.CORPORATE_CARD_API_KEY,
        lastSync: new Date(),
        pendingMatches: 0
      },
      accounting: {
        connected: !!process.env.ACCOUNTING_API_KEY,
        glAccountsCount: 0,
        mappingsCount: 0
      },
      travel: {
        connected: !!process.env.TRAVEL_API_KEY,
        activeBookings: 0
      }
    };
  }

  broadcastExpenseUpdate(data) {
    const { companyId, expense, action } = data;
    
    this.io.to(`company-${companyId}`).emit('expense-updated', {
      expense,
      action,
      timestamp: new Date()
    });

    // Send specific update to expense owner
    if (expense.user) {
      this.io.to(`user-${expense.user}`).emit('my-expense-updated', {
        expense,
        action,
        timestamp: new Date()
      });
    }
  }

  broadcastApprovalUpdate(data) {
    const { companyId, expense, approver, action } = data;
    
    this.io.to(`company-${companyId}`).emit('approval-updated', {
      expense,
      approver,
      action,
      timestamp: new Date()
    });

    // Send specific update to expense owner
    if (expense.user) {
      this.io.to(`user-${expense.user}`).emit('my-expense-approved', {
        expense,
        approver,
        action,
        timestamp: new Date()
      });
    }
  }

  async handleSyncRequest(socket, data) {
    const { companyId, integrationType } = data;
    
    try {
      let result;
      
      switch (integrationType) {
        case 'corporate-card':
          result = await integrationService.syncCorporateCardTransactions(companyId);
          break;
        case 'accounting':
          result = await integrationService.syncGLAccounts(companyId);
          break;
        case 'travel':
          result = await integrationService.fetchTravelBookings(companyId, data.userId, data.dateRange);
          break;
        default:
          throw new Error('Unknown integration type');
      }

      socket.emit('sync-complete', {
        integrationType,
        result,
        timestamp: new Date()
      });

      // Broadcast to company room
      this.io.to(`company-${companyId}`).emit('integration-synced', {
        integrationType,
        result,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Sync request failed:', error);
      socket.emit('sync-error', {
        integrationType,
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  broadcastNotification(data) {
    const { companyId, userId, notification } = data;
    
    if (userId) {
      // Send to specific user
      this.io.to(`user-${userId}`).emit('notification', {
        notification,
        timestamp: new Date()
      });
    } else {
      // Broadcast to company
      this.io.to(`company-${companyId}`).emit('notification', {
        notification,
        timestamp: new Date()
      });
    }
  }

  handleDisconnection(socket) {
    const userData = this.connectedUsers.get(socket.id);
    
    if (userData) {
      this.removeFromCompanyRoom(userData.companyId, socket.id);
      this.connectedUsers.delete(socket.id);
      logger.info(`User ${userData.userId} disconnected from company ${userData.companyId}`);
    }
  }

  // Public methods for broadcasting from other services
  broadcastToCompany(companyId, event, data) {
    this.io.to(`company-${companyId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  broadcastToUser(userId, event, data) {
    this.io.to(`user-${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  broadcastToRole(companyId, role, event, data) {
    const roomUsers = this.companyRooms.get(companyId);
    if (roomUsers) {
      roomUsers.forEach(socketId => {
        const userData = this.connectedUsers.get(socketId);
        if (userData && userData.role === role) {
          this.io.to(socketId).emit(event, {
            ...data,
            timestamp: new Date()
          });
        }
      });
    }
  }

  getConnectedUsersCount(companyId) {
    return this.companyRooms.get(companyId)?.size || 0;
  }

  getTotalConnectedUsers() {
    return this.connectedUsers.size;
  }
}

module.exports = new RealtimeService();
