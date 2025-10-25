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
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { formatCurrency } from "../../lib/utils";

export default function Budgets() {
  useAuth();
  const { currency, showCents, compactView } = useUserPreferences();
  const { toast } = useToast();
  const { data: budgets = [], isLoading, refetch } = useBudgets();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget({ silent: true });
  const deleteBudgetMutation = useDeleteBudget({ silent: true });

  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [editBudgetsOpen, setEditBudgetsOpen] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState<{ [key: string]: string }>(
    {}
  );
  const [budgetsToDelete, setBudgetsToDelete] = useState<string[]>([]);
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

  // Save all changes function
  const handleSaveAllChanges = async () => {
    try {
      let hasErrors = false;

      // Validate all edited budgets
      for (const editedAmount of Object.values(editedBudgets)) {
        if (!editedAmount || editedAmount.trim() === "") {
          toast({
            message: "Please enter a budget amount for all fields",
            type: "error",
          });
          hasErrors = true;
          break;
        }

        const amount = parseFloat(editedAmount);
        if (isNaN(amount) || amount <= 0) {
          toast({
            message: "Please enter valid budget amounts greater than 0",
            type: "error",
          });
          hasErrors = true;
          break;
        }
      }

      if (hasErrors) return;

      // Update all edited budgets
      for (const [budgetId, editedAmount] of Object.entries(editedBudgets)) {
        const amount = parseFloat(editedAmount);
        await updateBudgetMutation.mutateAsync({
          id: budgetId,
          budgetData: { budgetAmount: amount },
        });
      }

      // Delete all marked budgets
      for (const budgetId of budgetsToDelete) {
        await deleteBudgetMutation.mutateAsync(budgetId);
      }

      // Show success message
      const updateCount = Object.keys(editedBudgets).length;
      const deleteCount = budgetsToDelete.length;
      let message = "";

      if (updateCount > 0 && deleteCount > 0) {
        message = `${updateCount} budget(s) updated and ${deleteCount} deleted successfully`;
      } else if (updateCount > 0) {
        message = `${updateCount} budget(s) updated successfully`;
      } else if (deleteCount > 0) {
        message = `${deleteCount} budget(s) deleted successfully`;
      } else {
        message = "No changes made";
      }

      toast({
        message,
        type: "success",
      });

      // Clear state and close modal
      setEditedBudgets({});
      setBudgetsToDelete([]);
      setEditBudgetsOpen(false);
    } catch {
      toast({
        message: "Failed to save changes. Please try again.",
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
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
            Budgets
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
            Monthly Budget Overview
          </Text>

          {isLoading && (
            <View className="space-y-6">
              <BudgetListSkeleton />
              <BudgetListSkeleton />
              <BudgetListSkeleton />
            </View>
          )}

          {!isLoading && (
            <>
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

                <CardContent
                  className={compactView ? "space-y-4 p-3" : "space-y-8 p-6"}
                >
                  {/* Over Budget Alert */}
                  {budgets.some(
                    (budget) => budget.spentAmount > budget.budgetAmount
                  ) && (
                    <View
                      className={`bg-red-50 border border-red-200 rounded-lg ${
                        compactView ? "mb-3 p-3" : "mb-6 p-4"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <Text
                          className={`text-red-800 font-medium ${
                            compactView ? "text-sm" : "text-base"
                          }`}
                        >
                          ⚠️ You have categories that are over budget this
                          month.
                        </Text>
                      </View>
                    </View>
                  )}

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
                        <View
                          className={
                            compactView ? "space-y-2 py-2" : "space-y-3 py-4"
                          }
                        >
                          <Text
                            className={`font-medium text-foreground-light dark:text-foreground-dark ${
                              compactView ? "text-sm" : "text-base"
                            }`}
                          >
                            {budget.category}
                          </Text>

                          <Text
                            className={`text-muted-foreground-light dark:text-muted-foreground-dark ${
                              compactView ? "text-xs py-1" : "text-sm py-2"
                            }`}
                          >
                            {formatCurrency(
                              budget.spentAmount,
                              currency,
                              showCents
                            )}{" "}
                            /{" "}
                            {formatCurrency(
                              budget.budgetAmount,
                              currency,
                              showCents
                            )}
                          </Text>

                          {/* Progress Bar */}
                          <View
                            className={`w-full bg-muted-light dark:bg-muted-dark rounded-full ${
                              compactView ? "h-1.5" : "h-2"
                            }`}
                          >
                            <View
                              className={`rounded-full ${
                                compactView ? "h-1.5" : "h-2"
                              } ${
                                budgetStatus.status === "over" ||
                                budgetStatus.status === "full"
                                  ? "bg-red-500"
                                  : budgetStatus.status === "warning"
                                  ? "bg-orange-500"
                                  : "bg-primary-light dark:bg-primary-dark"
                              }`}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </View>

                          {overBudget && (
                            <Text
                              className={`text-red-600 dark:text-red-400 font-medium ${
                                compactView ? "text-xs py-1" : "text-sm py-2"
                              }`}
                            >
                              Over budget by{" "}
                              {formatCurrency(
                                budget.spentAmount - budget.budgetAmount,
                                currency,
                                showCents
                              )}
                            </Text>
                          )}
                        </View>

                        {index < budgets.length - 1 && (
                          <View
                            className={
                              compactView
                                ? "mt-4 border-b border-border-light dark:border-border-dark"
                                : "mt-8 border-b border-border-light dark:border-border-dark"
                            }
                          />
                        )}
                      </View>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Budget Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                    Budget Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <View className="flex-row justify-between mb-6 gap-2">
                    <View className="items-center flex-1">
                      <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark font-medium mb-1 text-center">
                        Total Budget
                      </Text>
                      <View className="bg-muted-light dark:bg-muted-dark px-2 py-1 rounded-full min-w-[80px]">
                        <Text className="text-sm font-bold text-foreground-light dark:text-foreground-dark text-center">
                          ${totalBudget.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark font-medium mb-1 text-center">
                        Total Spent
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full min-w-[80px] ${
                          totalSpent > totalBudget
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-muted-light dark:bg-muted-dark"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold text-center ${
                            totalSpent > totalBudget
                              ? "text-red-800 dark:text-red-400"
                              : "text-foreground-light dark:text-foreground-dark"
                          }`}
                        >
                          ${totalSpent.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark font-medium mb-1 text-center">
                        Remaining
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full min-w-[80px] ${
                          totalRemaining < 0
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-green-100 dark:bg-green-900/30"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold text-center ${
                            totalRemaining < 0
                              ? "text-red-800 dark:text-red-400"
                              : "text-green-800 dark:text-green-400"
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
                      <Text className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                        Overall Budget Progress
                      </Text>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        {((totalSpent / totalBudget) * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View className="w-full bg-muted-light dark:bg-muted-dark rounded-full h-3">
                      <View
                        className={`h-3 rounded-full ${
                          totalSpent > totalBudget
                            ? "bg-red-500"
                            : (totalSpent / totalBudget) * 100 > 80
                            ? "bg-orange-500"
                            : "bg-gray-900 dark:bg-gray-100"
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
                    budgetsToDelete={budgetsToDelete}
                    setBudgetsToDelete={setBudgetsToDelete}
                    onSaveAll={handleSaveAllChanges}
                    onClose={() => {
                      setEditBudgetsOpen(false);
                      setEditedBudgets({});
                      setBudgetsToDelete([]);
                    }}
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
