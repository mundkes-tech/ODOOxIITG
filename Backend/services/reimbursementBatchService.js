/**
 * Reimbursement Batch Service
 * Handles scheduled reimbursement batches and payment data formatting
 */

const ReimbursementBatch = require('../models/ReimbursementBatch');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class ReimbursementBatchService {
  constructor() {
    this.supportedFormats = ['csv', 'ach', 'xml', 'json'];
    this.batchProcessingInterval = 300000; // 5 minutes
  }

  // Create a new reimbursement batch
  async createBatch(companyId, userId, batchData) {
    try {
      const { name, description, scheduledDate, expenseIds, format = 'csv' } = batchData;

      // Validate expenses
      const expenses = await Expense.find({
        _id: { $in: expenseIds },
        company: companyId,
        status: 'approved'
      });

      if (expenses.length === 0) {
        throw new Error('No approved expenses found for batch creation');
      }

      // Calculate total amount
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Create batch
      const batch = new ReimbursementBatch({
        company: companyId,
        name,
        description,
        scheduledDate: new Date(scheduledDate),
        expenses: expenseIds,
        totalAmount,
        currency: expenses[0]?.currency || 'USD',
        paymentData: { format },
        createdBy: userId
      });

      await batch.save();

      // Update expense statuses
      await Expense.updateMany(
        { _id: { $in: expenseIds } },
        { status: 'ready_for_payment', batchId: batch._id }
      );

      logger.info(`Reimbursement batch created: ${batch.batchNumber}`);
      return { success: true, batch };
    } catch (error) {
      logger.error('Create reimbursement batch failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate payment data file
  async generatePaymentData(batchId, format = 'csv') {
    try {
      const batch = await ReimbursementBatch.findById(batchId)
        .populate('expenses')
        .populate('company');

      if (!batch) {
        throw new Error('Batch not found');
      }

      let paymentData;
      let fileName;

      switch (format.toLowerCase()) {
        case 'csv':
          paymentData = this.generateCSVFormat(batch);
          fileName = `batch_${batch.batchNumber}_${Date.now()}.csv`;
          break;
        case 'ach':
          paymentData = this.generateACHFormat(batch);
          fileName = `batch_${batch.batchNumber}_${Date.now()}.ach`;
          break;
        case 'xml':
          paymentData = this.generateXMLFormat(batch);
          fileName = `batch_${batch.batchNumber}_${Date.now()}.xml`;
          break;
        case 'json':
          paymentData = this.generateJSONFormat(batch);
          fileName = `batch_${batch.batchNumber}_${Date.now()}.json`;
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Save file
      const filePath = path.join(process.cwd(), 'uploads', 'batches', fileName);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, paymentData);

      // Update batch with file info
      batch.paymentData = {
        format,
        filePath,
        fileName,
        fileSize: Buffer.byteLength(paymentData),
        checksum: this.calculateChecksum(paymentData)
      };
      batch.status = 'ready';
      await batch.save();

      logger.info(`Payment data generated for batch: ${batch.batchNumber}`);
      return { success: true, batch, filePath };
    } catch (error) {
      logger.error('Generate payment data failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate CSV format
  generateCSVFormat(batch) {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Bank Account',
      'Routing Number',
      'Amount',
      'Currency',
      'Description',
      'Expense ID',
      'Date'
    ];

    const rows = batch.expenses.map(expense => [
      expense.user?.employeeId || expense.user?._id,
      expense.user?.name || 'Unknown',
      expense.user?.bankAccount || '',
      expense.user?.routingNumber || '',
      expense.amount.toFixed(2),
      expense.currency || 'USD',
      expense.description,
      expense._id,
      expense.date.toISOString().split('T')[0]
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Generate ACH format
  generateACHFormat(batch) {
    const achHeader = '101 000000000 000000000 000000000 000000000 000000000 000000000 000000000 000000000 000000000';
    const achEntries = batch.expenses.map(expense => {
      const amount = Math.round(expense.amount * 100); // Convert to cents
      return `6 22 ${expense.user?.routingNumber || '000000000'} ${expense.user?.bankAccount || '000000000000000'} ${amount} ${expense.user?.employeeId || expense.user?._id} ${expense.description}`;
    }).join('\n');

    return `${achHeader}\n${achEntries}`;
  }

  // Generate XML format
  generateXMLFormat(batch) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ReimbursementBatch>
  <BatchInfo>
    <BatchNumber>${batch.batchNumber}</BatchNumber>
    <Company>${batch.company?.name}</Company>
    <TotalAmount>${batch.totalAmount}</TotalAmount>
    <Currency>${batch.currency}</Currency>
    <ExpenseCount>${batch.expenses.length}</ExpenseCount>
  </BatchInfo>
  <Expenses>
    ${batch.expenses.map(expense => `
    <Expense>
      <ID>${expense._id}</ID>
      <EmployeeID>${expense.user?.employeeId || expense.user?._id}</EmployeeID>
      <EmployeeName>${expense.user?.name || 'Unknown'}</EmployeeName>
      <Amount>${expense.amount}</Amount>
      <Currency>${expense.currency || 'USD'}</Currency>
      <Description>${expense.description}</Description>
      <Date>${expense.date.toISOString()}</Date>
    </Expense>`).join('')}
  </Expenses>
</ReimbursementBatch>`;

    return xml;
  }

  // Generate JSON format
  generateJSONFormat(batch) {
    return JSON.stringify({
      batchInfo: {
        batchNumber: batch.batchNumber,
        company: batch.company?.name,
        totalAmount: batch.totalAmount,
        currency: batch.currency,
        expenseCount: batch.expenses.length,
        generatedAt: new Date().toISOString()
      },
      expenses: batch.expenses.map(expense => ({
        id: expense._id,
        employeeId: expense.user?.employeeId || expense.user?._id,
        employeeName: expense.user?.name || 'Unknown',
        amount: expense.amount,
        currency: expense.currency || 'USD',
        description: expense.description,
        date: expense.date.toISOString()
      }))
    }, null, 2);
  }

  // Calculate file checksum
  calculateChecksum(data) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(data).digest('hex');
  }

  // Get batches for company
  async getBatches(companyId, filters = {}) {
    try {
      const query = { company: companyId };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.dateRange) {
        query.scheduledDate = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      const batches = await ReimbursementBatch.find(query)
        .populate('expenses')
        .populate('createdBy', 'name email')
        .sort({ scheduledDate: -1 })
        .limit(filters.limit || 50);

      return { success: true, batches };
    } catch (error) {
      logger.error('Get batches failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Process scheduled batches
  async processScheduledBatches() {
    try {
      const now = new Date();
      const batches = await ReimbursementBatch.find({
        status: 'ready',
        scheduledDate: { $lte: now }
      }).populate('expenses');

      for (const batch of batches) {
        await this.processBatch(batch);
      }

      logger.info(`Processed ${batches.length} scheduled batches`);
    } catch (error) {
      logger.error('Process scheduled batches failed:', error);
    }
  }

  // Process individual batch
  async processBatch(batch) {
    try {
      batch.status = 'processing';
      await batch.save();

      // Generate payment data
      const result = await this.generatePaymentData(batch._id, batch.paymentData.format);
      
      if (result.success) {
        batch.status = 'completed';
        batch.processedDate = new Date();
        
        // Update expense statuses
        await Expense.updateMany(
          { _id: { $in: batch.expenses } },
          { status: 'paid', paidAt: new Date() }
        );
      } else {
        batch.status = 'failed';
        batch.metadata.errorLog.push({
          message: result.error,
          timestamp: new Date(),
          severity: 'high'
        });
      }

      await batch.save();
      logger.info(`Batch ${batch.batchNumber} processed with status: ${batch.status}`);
    } catch (error) {
      logger.error(`Process batch ${batch.batchNumber} failed:`, error);
      batch.status = 'failed';
      batch.metadata.errorLog.push({
        message: error.message,
        timestamp: new Date(),
        severity: 'critical'
      });
      await batch.save();
    }
  }
}

module.exports = new ReimbursementBatchService();
