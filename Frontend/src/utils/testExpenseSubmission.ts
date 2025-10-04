// Test expense submission
import { expenseAPI } from '../services/api';

export const testExpenseSubmission = async () => {
  console.log('🧪 Testing expense submission...');
  
  try {
    const testExpenseData = {
      amount: 25.50,
      currency: 'USD',
      category: 'meals',
      description: 'Test expense for debugging',
      date: new Date().toISOString().split('T')[0], // Today's date
      receiptUrl: undefined
    };
    
    console.log('📤 Submitting test expense:', testExpenseData);
    
    const response = await expenseAPI.submitExpense(testExpenseData);
    
    console.log('📥 Expense submission response:', response);
    console.log('✅ Expense submitted successfully!');
    
    return response;
  } catch (error) {
    console.error('❌ Expense submission failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

// Export for use in browser console
(window as any).testExpenseSubmission = testExpenseSubmission;
