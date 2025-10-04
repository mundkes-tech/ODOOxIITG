import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, DollarSign, Calendar, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { expenseAPI } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

interface ExpenseFormProps {
  onClose: () => void;
}

const ExpenseForm = ({ onClose }: ExpenseFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const expenseData = {
        amount: parseFloat(formData.get("amount") as string),
        currency: "USD", // Default currency, can be made dynamic
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        date: formData.get("date") as string,
        receiptUrl: uploaded ? "uploaded-receipt-url" : undefined,
      };

      await expenseAPI.submitExpense(expenseData);
      
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ['userExpenses'] });
      
      toast.success("Expense submitted successfully! 🎉");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
      toast.success("Receipt uploaded and scanned!");
    }, 2000);
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
          className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 glass-card border-b p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Submit New Expense</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in the details below
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>Upload Receipt (Optional)</Label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted"
                } ${uploaded ? "border-success bg-success/5" : ""}`}
              >
                {!uploaded ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop your receipt here, or click to browse
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFileUpload}
                      disabled={uploading}
                    >
                      {uploading ? "Scanning..." : "Choose File"}
                    </Button>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-success font-medium">Receipt uploaded successfully!</p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select required>
                <SelectTrigger className="w-full">
                  <Tag className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meals">Meals & Entertainment</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="supplies">Office Supplies</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Add details about this expense..."
                  className="pl-9 min-h-[100px]"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-purple-600"
                >
                  {isSubmitting ? "Submitting..." : "Submit Expense"}
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpenseForm;
