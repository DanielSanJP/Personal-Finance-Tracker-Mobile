import { useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../../components/nav";
import { BudgetListSkeleton } from "../../components/loading-states";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CategorySelect } from "../../components/category-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../hooks/queries/useAuth";
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "../../hooks/queries/useBudgets";
import { useToast } from "../../components/ui/sonner";

export default function Budgets() {
  useAuth();
  const { toast } = useToast();
  const { data: budgets = [], isLoading, refetch } = useBudgets();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [editBudgetsOpen, setEditBudgetsOpen] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState<{ [key: string]: string }>(
    {}
  );
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top and refresh data when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      refetch();
    }, [refetch])
  );

  // Add Budget form state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState("");

  // Helper function to calculate period dates
  const calculatePeriodDates = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "weekly":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1); // Jan 1
        endDate = new Date(now.getFullYear(), 11, 31); // Dec 31
        break;
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Reset form function
  const resetAddBudgetForm = () => {
    setSelectedCategory("");
    setBudgetAmount("");
    setBudgetPeriod("");
  };

  // Handle modal close with form reset
  const handleAddBudgetClose = () => {
    setAddBudgetOpen(false);
    resetAddBudgetForm();
  };

  // Handle create budget
  const handleCreateBudget = async () => {
    if (!selectedCategory || !budgetAmount || !budgetPeriod) {
      toast({
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        message: "Please enter a valid budget amount",
        type: "error",
      });
      return;
    }

    try {
      const { startDate, endDate } = calculatePeriodDates(budgetPeriod);
      const result = await createBudgetMutation.mutateAsync({
        category: selectedCategory,
        budgetAmount: amount,
        period: budgetPeriod,
        startDate,
        endDate,
      });

      if (result.success) {
        toast({
          message: "Budget created successfully!",
          type: "success",
        });

        // Close modal and reset form
        handleAddBudgetClose();
      } else {
        // Handle specific budget exists error
        if (result.errorType === "BUDGET_EXISTS") {
          toast({
            message:
              result.error ||
              `A budget for ${selectedCategory} already exists. Only one budget per category is allowed.`,
            type: "error",
          });

          // Optionally, highlight the existing budget in the list
          // Budget already exists - user was notified via toast
        } else {
          toast({
            message:
              result.error || "Failed to create budget. Please try again.",
            type: "error",
          });
        }
      }
    } catch {
      toast({
        message: "Failed to create budget. Please try again.",
        type: "error",
      });
    }
  };

  // Individual budget save function
  const handleSaveBudget = async (budgetId: string) => {
    try {
      const editedAmount = editedBudgets[budgetId];

      // Allow the field to be empty during typing, but validate on save
      if (!editedAmount || editedAmount.trim() === "") {
        toast({
          message: "Please enter a budget amount",
          type: "error",
        });
        return;
      }

      const amount = parseFloat(editedAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          message: "Please enter a valid budget amount greater than 0",
          type: "error",
        });
        return;
      }

      const result = await updateBudgetMutation.mutateAsync({
        id: budgetId,
        budgetData: { budgetAmount: amount },
      });

      if (result) {
        toast({
          message: "Budget updated successfully",
          type: "success",
        });

        // Clear the edited value
        setEditedBudgets((prev) => {
          const newState = { ...prev };
          delete newState[budgetId];
          return newState;
        });
      } else {
        toast({
          message: "Failed to update budget",
          type: "error",
        });
      }
    } catch {
      toast({
        message: "Failed to update budget. Please try again.",
        type: "error",
      });
    }
  };

  // Individual budget delete function
  const handleDeleteBudget = async (budgetId: string, category: string) => {
    try {
      const result = await deleteBudgetMutation.mutateAsync(budgetId);

      if (result) {
        toast({
          message: `Budget for ${category} deleted successfully`,
          type: "success",
        });

        // Clear any edited value for this budget
        setEditedBudgets((prev) => {
          const newState = { ...prev };
          delete newState[budgetId];
          return newState;
        });
      } else {
        toast({
          message: "Failed to delete budget",
          type: "error",
        });
      }
    } catch {
      toast({
        message: "Failed to delete budget. Please try again.",
        type: "error",
      });
    }
  };

  // Using standardized categories from constants

  // Period options with display labels and database values
  const periodOptions = [
    { label: "Monthly", value: "monthly" },
    { label: "Weekly", value: "weekly" },
    { label: "Yearly", value: "yearly" },
  ];

  // Helper function to get display label for period
  const getPeriodLabel = (value: string) => {
    return (
      periodOptions.find((option) => option.value === value)?.label || value
    );
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 100) return { status: "over", color: "red" };
    if (percentage >= 100) return { status: "full", color: "red" };
    if (percentage > 80) return { status: "warning", color: "orange" };
    return { status: "good", color: "gray" };
  };

  const getProgressWidth = (spent: number, budget: number) => {
    const percentage = Math.min((spent / budget) * 100, 100);
    return percentage;
  };

  // Calculate totals
  const totalBudget = budgets.reduce(
    (sum, budget) => sum + budget.budgetAmount,
    0
  );
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spentAmount,
    0
  );
  const totalRemaining = totalBudget - totalSpent;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Budgets</Text>
          <Text className="text-gray-600 mb-6">Monthly Budget Overview</Text>

          {isLoading && (
            <View className="space-y-6">
              <BudgetListSkeleton />
              <BudgetListSkeleton />
              <BudgetListSkeleton />
            </View>
          )}

          {!isLoading && (
            <>
              {/* Over Budget Alert */}
              {budgets.some(
                (budget) => budget.spentAmount > budget.budgetAmount
              ) && (
                <Card className="mb-6 bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center">
                      <Text className="text-red-800 font-medium">
                        ⚠️ You have categories that are over budget this month.
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <View className="flex-row flex-wrap gap-4 justify-center">
                    <Button
                      variant="default"
                      className="min-w-[130px] p-6"
                      onPress={() => setAddBudgetOpen(true)}
                    >
                      Add Budget
                    </Button>
                    <Button
                      variant="outline"
                      className="min-w-[130px] p-6"
                      onPress={() => setEditBudgetsOpen(true)}
                    >
                      Edit Budgets
                    </Button>
                    <Button variant="outline" className="min-w-[130px] p-6">
                      Export Data
                    </Button>
                  </View>
                </CardContent>
              </Card>

              {/* Budget Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-center">
                    Budget Categories
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-8 p-6">
                  {budgets.map((budget, index) => {
                    const budgetStatus = getBudgetStatus(
                      budget.spentAmount,
                      budget.budgetAmount
                    );
                    const progressWidth = getProgressWidth(
                      budget.spentAmount,
                      budget.budgetAmount
                    );
                    const overBudget = budget.spentAmount > budget.budgetAmount;

                    return (
                      <View key={budget.id}>
                        <View className="space-y-3 py-4">
                          <Text className="text-base font-medium text-gray-900">
                            {budget.category}
                          </Text>

                          <Text className="text-sm text-gray-600 py-2">
                            ${budget.spentAmount.toFixed(2)} / $
                            {budget.budgetAmount.toFixed(2)}
                          </Text>

                          {/* Progress Bar */}
                          <View className="w-full bg-gray-200 rounded-full h-2">
                            <View
                              className={`h-2 rounded-full ${
                                budgetStatus.status === "over" ||
                                budgetStatus.status === "full"
                                  ? "bg-red-500"
                                  : budgetStatus.status === "warning"
                                  ? "bg-orange-500"
                                  : "bg-gray-900"
                              }`}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </View>

                          {overBudget && (
                            <Text className="text-sm text-red-600 font-medium py-2">
                              Over budget by $
                              {(
                                budget.spentAmount - budget.budgetAmount
                              ).toFixed(2)}
                            </Text>
                          )}
                        </View>

                        {index < budgets.length - 1 && (
                          <View className="mt-8 border-b border-gray-200" />
                        )}
                      </View>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Budget Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Budget Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <View className="flex-row justify-between mb-6 gap-2">
                    <View className="items-center flex-1">
                      <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                        Total Budget
                      </Text>
                      <View className="bg-gray-100 px-2 py-1 rounded-full min-w-[80px]">
                        <Text className="text-sm font-bold text-gray-900 text-center">
                          ${totalBudget.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                        Total Spent
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full min-w-[80px] ${
                          totalSpent > totalBudget
                            ? "bg-red-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold text-center ${
                            totalSpent > totalBudget
                              ? "text-red-800"
                              : "text-gray-900"
                          }`}
                        >
                          ${totalSpent.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                        Remaining
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full min-w-[80px] ${
                          totalRemaining < 0 ? "bg-red-100" : "bg-green-100"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold text-center ${
                            totalRemaining < 0
                              ? "text-red-800"
                              : "text-green-800"
                          }`}
                        >
                          ${totalRemaining.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Overall Progress Bar */}
                  <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm font-medium text-gray-900">
                        Overall Budget Progress
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {((totalSpent / totalBudget) * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View className="w-full bg-gray-200 rounded-full h-3">
                      <View
                        className={`h-3 rounded-full ${
                          totalSpent > totalBudget
                            ? "bg-red-500"
                            : (totalSpent / totalBudget) * 100 > 80
                            ? "bg-orange-500"
                            : "bg-gray-900"
                        }`}
                        style={{
                          width: `${Math.min(
                            (totalSpent / totalBudget) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </View>
                  </View>

                  {/* Add Budget Modal */}
                  <Dialog
                    open={addBudgetOpen}
                    onOpenChange={(open) => {
                      if (!open) handleAddBudgetClose();
                      else setAddBudgetOpen(true);
                    }}
                  >
                    <DialogContent onClose={handleAddBudgetClose}>
                      <DialogHeader>
                        <DialogTitle>Add New Budget</DialogTitle>
                        <DialogDescription>
                          Create a new budget category with your desired
                          spending limit.
                        </DialogDescription>
                      </DialogHeader>

                      <View className="space-y-4 pb-4">
                        <CategorySelect
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                          type="expense"
                          required
                          className="w-full"
                          existingCategories={budgets.map((b) => b.category)}
                        />

                        <View className="space-y-2 py-2">
                          <Label>Budget Amount</Label>
                          <Input
                            placeholder="Enter budget amount"
                            value={budgetAmount}
                            onChangeText={setBudgetAmount}
                            keyboardType="decimal-pad"
                            returnKeyType="done"
                            blurOnSubmit={true}
                            className="w-full"
                          />
                        </View>

                        <View className="space-y-2 py-2">
                          <Label>Budget Period</Label>
                          <Select
                            value={budgetPeriod}
                            onValueChange={setBudgetPeriod}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder="Select period"
                                displayValue={
                                  budgetPeriod
                                    ? getPeriodLabel(budgetPeriod)
                                    : undefined
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {periodOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </View>
                      </View>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onPress={handleAddBudgetClose}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                        <Button
                          className="w-full mt-2"
                          onPress={handleCreateBudget}
                        >
                          Create Budget
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Budgets Modal */}
                  <Dialog
                    open={editBudgetsOpen}
                    onOpenChange={setEditBudgetsOpen}
                  >
                    <DialogContent onClose={() => setEditBudgetsOpen(false)}>
                      <DialogHeader>
                        <DialogTitle>Edit Budget Categories</DialogTitle>
                        <DialogDescription>
                          Modify your existing budget amounts and categories.
                        </DialogDescription>
                      </DialogHeader>

                      <View className="space-y-6">
                        {budgets.map((budget, index) => (
                          <View
                            key={budget.id}
                            className={`space-y-3 p-4 border border-gray-200 rounded-lg bg-white ${
                              index > 0 ? "mt-4" : ""
                            }`}
                          >
                            <View className="flex-row items-center justify-between">
                              <Text className="text-base font-medium">
                                {budget.category}
                              </Text>
                            </View>

                            <View className="space-y-2 py-2">
                              <Label>Budget Amount</Label>
                              <Input
                                value={
                                  budget.id in editedBudgets
                                    ? editedBudgets[budget.id]
                                    : budget.budgetAmount.toString()
                                }
                                onChangeText={(text) =>
                                  setEditedBudgets((prev) => ({
                                    ...prev,
                                    [budget.id]: text,
                                  }))
                                }
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                                blurOnSubmit={true}
                                className="w-full"
                              />
                            </View>

                            <Text className="text-sm text-gray-600 py-2">
                              Current spending: ${budget.spentAmount.toFixed(2)}
                            </Text>

                            {/* Individual Save and Delete buttons */}
                            <View className="flex-row gap-4 pt-2">
                              <Button
                                onPress={() => handleSaveBudget(budget.id)}
                                className="min-w-[130px]"
                                size="sm"
                              >
                                Save
                              </Button>
                              <Button
                                variant="destructive"
                                onPress={() =>
                                  handleDeleteBudget(budget.id, budget.category)
                                }
                                className="min-w-[130px]"
                                size="sm"
                              >
                                Delete
                              </Button>
                            </View>
                          </View>
                        ))}
                      </View>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onPress={() => setEditBudgetsOpen(false)}
                          className="w-full"
                        >
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
