const Expense = require('../models/Expense');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get analytics data for dashboard
// @route   GET /api/analytics/dashboard
// @access  Admin / Manager
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    
    // Get expense statistics
    const totalExpenses = await Expense.countDocuments({ companyId });
    const pendingExpenses = await Expense.countDocuments({ companyId, status: 'pending' });
    const approvedExpenses = await Expense.countDocuments({ companyId, status: 'approved' });
    const rejectedExpenses = await Expense.countDocuments({ companyId, status: 'rejected' });
    
    // Get total amount by status
    const totalAmount = await Expense.aggregate([
      { $match: { companyId: companyId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingAmount = await Expense.aggregate([
      { $match: { companyId: companyId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const approvedAmount = await Expense.aggregate([
      { $match: { companyId: companyId, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: { companyId: companyId } },
      { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    
    // Get expenses by month (last 12 months)
    const expensesByMonth = await Expense.aggregate([
      { $match: { companyId: companyId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    // Get top spenders
    const topSpenders = await Expense.aggregate([
      { $match: { companyId: companyId } },
      {
        $group: {
          _id: '$submittedBy',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          total: 1,
          count: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalExpenses,
          pendingExpenses,
          approvedExpenses,
          rejectedExpenses,
          totalAmount: totalAmount[0]?.total || 0,
          pendingAmount: pendingAmount[0]?.total || 0,
          approvedAmount: approvedAmount[0]?.total || 0
        },
        expensesByCategory,
        expensesByMonth,
        topSpenders
      }
    });
  } catch (error) {
    next(error);
  }
};
