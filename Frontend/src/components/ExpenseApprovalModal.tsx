import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, MessageSquare, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Expense } from "@/services/api";
import { formatCurrency } from "@/utils/currency";

interface ExpenseApprovalModalProps {
  expense: Expense;
  onClose: () => void;
  onApprove: (id: string, comment?: string, percentage?: number) => void;
  onReject: (id: string, comment?: string) => void;
}

const ExpenseApprovalModal = ({ expense, onClose, onApprove, onReject }: ExpenseApprovalModalProps) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [approvalPercentage, setApprovalPercentage] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;

    console.log('🔍 ExpenseApprovalModal - Submitting approval');
    console.log('🔍 Expense ID:', expense.id);
    console.log('🔍 Action:', action);
    console.log('🔍 Comment:', comment);
    console.log('🔍 Percentage:', approvalPercentage);
    console.log('🔍 Full expense object:', expense);

    setIsSubmitting(true);
    try {
      if (action === 'approve') {
        await onApprove(expense.id, comment, approvalPercentage);
      } else {
        await onReject(expense.id, comment);
      }
      onClose();
    } catch (error) {
      console.error('❌ ExpenseApprovalModal error:', error);
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      travel: 'bg-blue-100 text-blue-800',
      meals: 'bg-orange-100 text-orange-800',
      accommodation: 'bg-purple-100 text-purple-800',
      supplies: 'bg-green-100 text-green-800',
      equipment: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 glass-card border-b p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Expense Approval</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and approve or reject this expense
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Expense Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                    <Badge className={getStatusColor(expense.status)}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <Badge className={getCategoryColor(expense.category)}>
                    {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-lg">{expense.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="text-lg">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Submitted By</Label>
                    <p className="text-lg">{expense.submittedBy?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-lg">{expense.submittedBy?.email || 'Unknown'}</p>
                  </div>
                </div>

                {expense.receiptUrl && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Receipt</Label>
                    <div className="mt-2">
                      <img 
                        src={expense.receiptUrl} 
                        alt="Receipt" 
                        className="max-w-xs rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {expense.approvalComments && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Previous Comments</Label>
                    <p className="text-sm bg-muted p-3 rounded-lg mt-1">{expense.approvalComments}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Actions */}
            {expense.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Approval Decision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Action Selection */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setAction('approve')}
                      variant={action === 'approve' ? 'default' : 'outline'}
                      className={`flex-1 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setAction('reject')}
                      variant={action === 'reject' ? 'default' : 'outline'}
                      className={`flex-1 ${action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  {/* Approval Percentage (only for approve) */}
                  {action === 'approve' && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Approval Percentage
                      </Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={approvalPercentage}
                          onChange={(e) => setApprovalPercentage(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${approvalPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Approved amount: {formatCurrency(expense.amount * (approvalPercentage / 100), expense.currency)}
                      </p>
                    </div>
                  )}

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="comment">
                      {action === 'approve' ? 'Approval Comments' : 'Rejection Reason'}
                    </Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        action === 'approve' 
                          ? 'Add any comments about this approval...' 
                          : 'Please provide a reason for rejection...'
                      }
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !action || (action === 'reject' && !comment.trim())}
                      className={`flex-1 ${
                        action === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {action === 'approve' ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Approve Expense
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Reject Expense
                            </>
                          )}
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpenseApprovalModal;
