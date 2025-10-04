// Email utility functions
// In a real implementation, you would use a service like SendGrid, AWS SES, or similar

const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send welcome email to new user
exports.sendWelcomeEmail = async (user, company) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@expensemanager.com',
      to: user.email,
      subject: `Welcome to ${company.name} Expense Management System`,
      html: `
        <h2>Welcome to ${company.name}!</h2>
        <p>Hello ${user.name},</p>
        <p>Your account has been created successfully. You can now access the expense management system.</p>
        <p><strong>Your Role:</strong> ${user.role}</p>
        <p><strong>Company:</strong> ${company.name}</p>
        <p>Please log in to start managing your expenses.</p>
        <br>
        <p>Best regards,<br>${company.name} Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send expense approval notification
exports.sendExpenseApprovalEmail = async (user, expense, action) => {
  try {
    const transporter = createTransporter();
    
    const subject = action === 'approved' ? 'Expense Approved' : 'Expense Rejected';
    const message = action === 'approved' 
      ? 'Your expense has been approved and will be processed for reimbursement.'
      : 'Your expense has been rejected. Please review the comments and resubmit if necessary.';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@expensemanager.com',
      to: user.email,
      subject: `${subject} - ${expense.amount} ${expense.currency}`,
      html: `
        <h2>${subject}</h2>
        <p>Hello ${user.name},</p>
        <p>${message}</p>
        <p><strong>Expense Details:</strong></p>
        <ul>
          <li>Amount: ${expense.amount} ${expense.currency}</li>
          <li>Category: ${expense.category}</li>
          <li>Description: ${expense.description}</li>
          <li>Date: ${expense.date}</li>
        </ul>
        ${expense.approvalComments ? `<p><strong>Comments:</strong> ${expense.approvalComments}</p>` : ''}
        <br>
        <p>Best regards,<br>Expense Management Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending expense approval email:', error);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@expensemanager.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Expense Management Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
