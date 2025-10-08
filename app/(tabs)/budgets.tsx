import { router, useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddBudgetModal } from "../../components/budgets/add-budget-modal";
import {
  calculatePeriodDates,
  getBudgetStatus,
  getProgressWidth,
} from "../../components/budgets/budget-utils";
import { EditBudgetsModal } from "../../components/budgets/edit-budgets-modal";
import { BudgetListSkeleton } from "../../components/loading-states";
import Nav from "../../components/nav";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useToast } from "../../components/ui/sonner";
import { useAuth } from "../../hooks/queries/useAuth";
import {
  useBudgets,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from "../../hooks/queries/useBudgets";

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
                  <View className="flex-row flex-wrap gap-2 justify-center">
                    <Button
                      variant="default"
                      className="min-w-[120px] p-6"
                      onPress={() => setAddBudgetOpen(true)}
                    >
                      Add Budget
                    </Button>
                    <Button
                      variant="outline"
                      className="min-w-[120px] p-6"
                      onPress={() => setEditBudgetsOpen(true)}
                    >
                      Edit Budgets
                    </Button>
                    <Button
                      variant="outline"
                      className="min-w-[120px] p-6"
                      onPress={() => router.push("/reports")}
                    >
                      View Reports
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
                  <AddBudgetModal
                    open={addBudgetOpen}
                    onOpenChange={(open) => {
                      if (!open) handleAddBudgetClose();
                      else setAddBudgetOpen(true);
                    }}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    budgetAmount={budgetAmount}
                    setBudgetAmount={setBudgetAmount}
                    budgetPeriod={budgetPeriod}
                    setBudgetPeriod={setBudgetPeriod}
                    existingCategories={budgets.map((b) => b.category)}
                    onSubmit={handleCreateBudget}
                    onClose={handleAddBudgetClose}
                  />

                  {/* Edit Budgets Modal */}
                  <EditBudgetsModal
                    open={editBudgetsOpen}
                    onOpenChange={setEditBudgetsOpen}
                    budgets={budgets}
                    editedBudgets={editedBudgets}
                    setEditedBudgets={setEditedBudgets}
                    onSaveBudget={handleSaveBudget}
                    onDeleteBudget={handleDeleteBudget}
                    onClose={() => setEditBudgetsOpen(false)}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
