import { useFocusEffect } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
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
import {
  getCurrentUserBudgetsWithRealTimeSpending,
  createBudgetSimple,
  updateBudget,
  deleteBudget,
} from "../../lib/data";
import { useAuth } from "../../lib/auth-context";
import type { Budget } from "../../lib/types";
import { useToast } from "../../components/ui/sonner";

export default function Budgets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [editBudgetsOpen, setEditBudgetsOpen] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState<{ [key: string]: string }>(
    {}
  );
  const scrollViewRef = useRef<ScrollView>(null);

  // Load budgets when component mounts or user changes
  useEffect(() => {
    const loadBudgets = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const budgetsData = await getCurrentUserBudgetsWithRealTimeSpending();
        setBudgets(budgetsData);
      } catch (error) {
        console.error("Error loading budgets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBudgets();
  }, [user]);

  // Scroll to top and refresh data when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });

      // Refresh budgets data when tab is focused
      if (user) {
        const loadBudgets = async () => {
          try {
            const budgetsData =
              await getCurrentUserBudgetsWithRealTimeSpending();
            setBudgets(budgetsData);
          } catch (error) {
            console.error("Error loading budgets:", error);
          }
        };

        loadBudgets();
      }
    }, [user])
  );

  // Add Budget form state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState("");

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
    if (!user) {
      toast({
        message: "You must be logged in to create a budget",
        type: "error",
      });
      return;
    }

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
      const result = await createBudgetSimple({
        category: selectedCategory,
        budgetAmount: amount,
        period: budgetPeriod as "monthly" | "weekly" | "yearly",
      });

      if (result.success) {
        toast({
          message: "Budget created successfully!",
          type: "success",
        });

        // Refresh budgets data
        const budgetsData = await getCurrentUserBudgetsWithRealTimeSpending();
        setBudgets(budgetsData);

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
          const existingBudget = budgets.find(
            (b) => b.category === selectedCategory
          );
          if (existingBudget) {
            // You could add visual feedback here, like scrolling to the existing budget
            console.log(
              `Found existing budget for ${selectedCategory}:`,
              existingBudget
            );
          }
        } else {
          toast({
            message:
              result.error || "Failed to create budget. Please try again.",
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error creating budget:", error);
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
      if (!editedAmount) {
        toast({
          message: "Please enter a budget amount",
          type: "error",
        });
        return;
      }

      const amount = parseFloat(editedAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          message: "Please enter a valid budget amount",
          type: "error",
        });
        return;
      }

      const result = await updateBudget(budgetId, {
        budgetAmount: amount,
      });

      if (result) {
        toast({
          message: "Budget updated successfully",
          type: "success",
        });

        // Refresh budgets data
        const budgetsData = await getCurrentUserBudgetsWithRealTimeSpending();
        setBudgets(budgetsData);

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
    } catch (error) {
      console.error("Error updating budget:", error);
      toast({
        message: "Failed to update budget. Please try again.",
        type: "error",
      });
    }
  };

  // Individual budget delete function
  const handleDeleteBudget = async (budgetId: string, category: string) => {
    try {
      const result = await deleteBudget(budgetId);

      if (result) {
        toast({
          message: `Budget for ${category} deleted successfully`,
          type: "success",
        });

        // Refresh budgets data
        const budgetsData = await getCurrentUserBudgetsWithRealTimeSpending();
        setBudgets(budgetsData);

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
    } catch (error) {
      console.error("Error deleting budget:", error);
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

          {loading && (
            <View className="space-y-6">
              <BudgetListSkeleton />
              <BudgetListSkeleton />
              <BudgetListSkeleton />
            </View>
          )}

          {!loading && (
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
                  {/* Action Buttons */}
                  <View className="pt-8">
                    <View className="flex-row flex-wrap gap-4 justify-center">
                      <Button
                        variant="default"
                        className="min-w-[130px]"
                        onPress={() => setAddBudgetOpen(true)}
                      >
                        Add Budget
                      </Button>
                      <Button
                        variant="outline"
                        className="min-w-[130px]"
                        onPress={() => setEditBudgetsOpen(true)}
                      >
                        Edit Budgets
                      </Button>
                      <Button variant="outline" className="min-w-[130px]">
                        Export Data
                      </Button>
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
                                  editedBudgets[budget.id] ||
                                  budget.budgetAmount.toString()
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
