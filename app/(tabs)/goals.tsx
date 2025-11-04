import { useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccountRequiredModal } from "../../components/account-required-modal";
import {
  AddGoalModal,
  ContributionModal,
  EditGoalsModal,
  formatTargetDate,
  getAccountIdFromDisplayValue,
  getGoalIdFromDisplayValue,
  getProgressWidth,
} from "../../components/goals";
import { GoalsListSkeleton } from "../../components/loading-states";
import Nav from "../../components/nav";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useToast } from "../../components/ui/sonner";
import { useAccounts } from "../../hooks/queries/useAccounts";
import { useAuth } from "../../hooks/queries/useAuth";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useMakeGoalContribution,
  useUpdateGoal,
} from "../../hooks/queries/useGoals";
import { useAccountCheck } from "../../hooks/useAccountCheck";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import {
  getCurrencyValidationError,
  parseCurrencyInput,
} from "../../lib/currency-utils";
import type { Goal } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";

export default function Goals() {
  useAuth();
  const { currency, showCents, compactView } = useUserPreferences();
  const { toast } = useToast();
  const { hasAccounts } = useAccountCheck();
  const { data: goals = [], isLoading, refetch: refetchGoals } = useGoals();
  const { data: accounts = [], refetch: refetchAccounts } = useAccounts();
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const makeContributionMutation = useMakeGoalContribution();

  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top and refresh data when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      refetchGoals();
      refetchAccounts();
    }, [refetchGoals, refetchAccounts])
  );

  // Modal state
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [editGoalsOpen, setEditGoalsOpen] = useState(false);
  const [contributionOpen, setContributionOpen] = useState(false);

  // Add Goal form state
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(new Date());
  const [priorityLevel, setPriorityLevel] = useState("");

  // Contribution form state
  const [selectedGoal, setSelectedGoal] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [sourceAccount, setSourceAccount] = useState("");
  const [contributionDate, setContributionDate] = useState<Date | undefined>(
    new Date()
  );
  const [editedGoals, setEditedGoals] = useState<{
    [key: string]: { name?: string; targetAmount?: string; targetDate?: Date };
  }>({});
  const [goalsToDelete, setGoalsToDelete] = useState<string[]>([]);

  // Reset form functions
  const resetAddGoalForm = () => {
    setGoalName("");
    setTargetAmount("");
    setCurrentAmount("");
    setTargetDate(new Date());
    setPriorityLevel("");
  };

  const resetContributionForm = () => {
    setSelectedGoal("");
    setContributionAmount("");
    setSourceAccount("");
    setContributionDate(new Date());
  };

  // Handle creating a new goal
  const handleCreateGoal = async () => {
    try {
      const missingFields: string[] = [];

      if (!goalName.trim()) missingFields.push("Goal Name");
      if (!targetAmount) missingFields.push("Target Amount");

      if (missingFields.length > 0) {
        const fieldList = missingFields.join(", ");
        toast({
          message: `Missing Required Field${
            missingFields.length > 1 ? "s" : ""
          }: Please fill in ${fieldList}`,
          type: "error",
        });
        return;
      }

      const targetValidationError = getCurrencyValidationError(targetAmount);
      if (targetValidationError) {
        // Show native alert for better visibility
        Alert.alert("Invalid Target Amount", targetValidationError, [
          { text: "OK", style: "default" },
        ]);

        // Also show toast
        toast({
          message: `Invalid Target Amount: ${targetValidationError}`,
          type: "error",
        });
        return;
      }

      const targetAmountNum = parseCurrencyInput(targetAmount);

      let currentAmountNum = 0;
      if (currentAmount) {
        const currentValidationError =
          getCurrencyValidationError(currentAmount);
        if (currentValidationError) {
          // Show native alert for better visibility
          Alert.alert("Invalid Current Amount", currentValidationError, [
            { text: "OK", style: "default" },
          ]);

          // Also show toast
          toast({
            message: `Invalid Current Amount: ${currentValidationError}`,
            type: "error",
          });
          return;
        }
        currentAmountNum = parseCurrencyInput(currentAmount);
      }

      // Validate target date is not in the past (today or future is OK)
      if (targetDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(targetDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          toast({
            message: "Target date cannot be in the past",
            type: "error",
          });
          return;
        }
      }

      await createGoalMutation.mutateAsync({
        name: goalName.trim(),
        targetAmount: targetAmountNum,
        currentAmount: currentAmountNum,
        targetDate: targetDate
          ? targetDate.toISOString().split("T")[0]
          : undefined,
        priority: priorityLevel || "medium",
        status: "active",
      });

      // Reset form
      resetAddGoalForm();
      setAddGoalOpen(false);

      toast({
        message: "Goal created successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("=== Error creating goal ===", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create goal";
      console.log("Error message:", errorMessage);
      toast({
        message: errorMessage,
        type: "error",
      });
    }
  };

  // Handle contribution submission
  const handleContributionSubmit = async () => {
    // Check for accounts first
    if (!hasAccounts) {
      toast({
        message: "Please create an account first to make goal contributions",
        type: "error",
      });
      return;
    }

    const missingFields: string[] = [];

    if (!selectedGoal) missingFields.push("Goal");
    if (!contributionAmount) missingFields.push("Amount");
    if (!sourceAccount) missingFields.push("Source Account");

    if (missingFields.length > 0) {
      const fieldList = missingFields.join(", ");
      toast({
        message: `Missing Required Field${
          missingFields.length > 1 ? "s" : ""
        }: Please fill in ${fieldList}`,
        type: "error",
      });
      return;
    }

    const validationError = getCurrencyValidationError(contributionAmount);
    if (validationError) {
      // Show native alert for better visibility
      Alert.alert("Invalid Amount", validationError, [
        { text: "OK", style: "default" },
      ]);

      // Also show toast
      toast({
        message: `Invalid Amount: ${validationError}`,
        type: "error",
      });
      return;
    }

    const amount = parseCurrencyInput(contributionAmount);

    try {
      const goalId = getGoalIdFromDisplayValue(selectedGoal, goals);
      const accountId = getAccountIdFromDisplayValue(sourceAccount, accounts);

      await makeContributionMutation.mutateAsync({
        goalId: goalId,
        accountId: accountId,
        amount: amount,
        date: contributionDate || new Date(),
      });

      // Reset form and reload data
      resetContributionForm();
      setContributionOpen(false);

      toast({
        message: "Contribution made successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("🚨 Error making contribution:", err);
      console.log("🚨 Error type:", typeof err);
      console.log("🚨 Error instanceof Error:", err instanceof Error);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to make contribution. Please try again.";

      console.log("🚨 Showing alert with message:", errorMessage);

      // Show native alert for better visibility
      Alert.alert("Contribution Failed", errorMessage, [
        { text: "OK", style: "default" },
      ]);

      // Also show toast
      toast({
        message: errorMessage,
        type: "error",
      });
    }
  };

  // Handle modal close with form reset
  const handleAddGoalClose = () => {
    setAddGoalOpen(false);
    resetAddGoalForm();
  };

  const handleEditGoalsClose = () => {
    setEditGoalsOpen(false);
  };

  const handleContributionClose = () => {
    setContributionOpen(false);
    resetContributionForm();
  };

  // Save all changes function
  const handleSaveAllChanges = async () => {
    try {
      let hasErrors = false;

      // Validate all edited goals
      for (const editedGoal of Object.values(editedGoals)) {
        if (editedGoal.targetAmount !== undefined) {
          const validationError = getCurrencyValidationError(
            editedGoal.targetAmount
          );
          if (validationError) {
            // Show native alert for better visibility
            Alert.alert("Invalid Target Amount", validationError, [
              { text: "OK", style: "default" },
            ]);

            // Also show toast
            toast({
              message: `Invalid Target Amount: ${validationError}`,
              type: "error",
            });
            hasErrors = true;
            break;
          }
        }
        if (editedGoal.name !== undefined && editedGoal.name.trim() === "") {
          toast({
            message: "Goal names cannot be empty",
            type: "error",
          });
          hasErrors = true;
          break;
        }
      }

      if (hasErrors) return;

      // Update all edited goals
      for (const [goalId, editedGoal] of Object.entries(editedGoals)) {
        const updates: Partial<Goal> = {};

        if (editedGoal.name !== undefined) {
          updates.name = editedGoal.name;
        }

        if (editedGoal.targetAmount !== undefined) {
          const amount = parseCurrencyInput(editedGoal.targetAmount);
          updates.targetAmount = amount;
        }

        if (editedGoal.targetDate !== undefined) {
          updates.targetDate = editedGoal.targetDate
            .toISOString()
            .split("T")[0];
        }

        await updateGoalMutation.mutateAsync({
          goalId,
          goalData: updates,
        });
      }

      // Delete all marked goals
      for (const goalId of goalsToDelete) {
        await deleteGoalMutation.mutateAsync(goalId);
      }

      // Show success message
      const updateCount = Object.keys(editedGoals).length;
      const deleteCount = goalsToDelete.length;
      let message = "";

      if (updateCount > 0 && deleteCount > 0) {
        message = `${updateCount} goal(s) updated and ${deleteCount} deleted successfully`;
      } else if (updateCount > 0) {
        message = `${updateCount} goal(s) updated successfully`;
      } else if (deleteCount > 0) {
        message = `${deleteCount} goal(s) deleted successfully`;
      } else {
        message = "No changes made";
      }

      toast({
        message,
        type: "success",
      });

      // Clear state and close modal
      setEditedGoals({});
      setGoalsToDelete([]);
      setEditGoalsOpen(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        message: "Failed to save changes. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
            Financial Goals
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
            {goals.length} active goals
          </Text>

          {isLoading && (
            <View className="space-y-6">
              <GoalsListSkeleton />
              <GoalsListSkeleton />
              <GoalsListSkeleton />
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
                      onPress={() => setAddGoalOpen(true)}
                    >
                      Add Goal
                    </Button>
                    <Button
                      variant="outline"
                      className="min-w-[120px] p-6"
                      onPress={() => setEditGoalsOpen(true)}
                    >
                      Edit Goals
                    </Button>
                    <Button
                      variant="outline"
                      className="min-w-[120px] p-6"
                      onPress={() => {
                        if (!hasAccounts) {
                          toast({
                            message:
                              "Please create an account first to make goal contributions",
                            type: "error",
                          });
                          return;
                        }
                        setContributionOpen(true);
                      }}
                    >
                      Make Contribution
                    </Button>
                  </View>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-center">
                    Savings Goals
                  </CardTitle>
                </CardHeader>

                <CardContent
                  className={compactView ? "space-y-4 p-2" : "space-y-8 p-4"}
                >
                  {goals.map((goal, index) => {
                    const progressWidth = getProgressWidth(
                      goal.currentAmount,
                      goal.targetAmount
                    );
                    const goalAchieved =
                      goal.currentAmount >= goal.targetAmount;

                    return (
                      <View key={goal.id}>
                        <View
                          className={
                            compactView ? "space-y-2 py-2" : "space-y-4 py-4"
                          }
                        >
                          <Text
                            className={`font-medium text-foreground-light dark:text-foreground-dark ${
                              compactView ? "text-sm" : "text-base"
                            }`}
                          >
                            {goal.name}
                          </Text>

                          <Text
                            className={`text-muted-foreground-light dark:text-muted-foreground-dark ${
                              compactView ? "text-sm py-1" : "text-base py-2"
                            }`}
                          >
                            {formatCurrency(
                              goal.currentAmount,
                              currency,
                              showCents
                            )}{" "}
                            /{" "}
                            {formatCurrency(
                              goal.targetAmount,
                              currency,
                              showCents
                            )}
                          </Text>

                          <View
                            className={`w-full bg-muted-light dark:bg-muted-dark rounded-full overflow-hidden ${
                              compactView ? "h-1.5" : "h-2"
                            }`}
                          >
                            <View
                              className={`rounded-full ${
                                compactView ? "h-1.5" : "h-2"
                              } ${
                                goalAchieved
                                  ? "bg-green-500"
                                  : "bg-primary-light dark:bg-primary-dark"
                              }`}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </View>

                          <Text
                            className={`text-muted-foreground-light dark:text-muted-foreground-dark ${
                              compactView ? "text-xs py-1" : "text-sm py-2"
                            }`}
                          >
                            Target: {formatTargetDate(goal.targetDate)}
                          </Text>

                          {goalAchieved && (
                            <Text
                              className={`text-green-600 dark:text-green-400 font-medium ${
                                compactView ? "text-xs py-1" : "text-sm py-2"
                              }`}
                            >
                              🎉 Goal achieved!
                            </Text>
                          )}
                        </View>

                        {index < goals.length - 1 && (
                          <View className="mt-2 border-b border-border-light dark:border-border-dark" />
                        )}
                      </View>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <AddGoalModal
        open={addGoalOpen}
        onOpenChange={(open) => {
          if (!open) handleAddGoalClose();
          else setAddGoalOpen(true);
        }}
        goalName={goalName}
        setGoalName={setGoalName}
        targetAmount={targetAmount}
        setTargetAmount={setTargetAmount}
        currentAmount={currentAmount}
        setCurrentAmount={setCurrentAmount}
        targetDate={targetDate}
        setTargetDate={setTargetDate}
        priorityLevel={priorityLevel}
        setPriorityLevel={setPriorityLevel}
        onSubmit={handleCreateGoal}
        onClose={handleAddGoalClose}
      />

      {/* Edit Goals Modal */}
      <EditGoalsModal
        open={editGoalsOpen}
        onOpenChange={(open) => {
          if (!open) handleEditGoalsClose();
          else setEditGoalsOpen(true);
        }}
        goals={goals}
        editedGoals={editedGoals}
        setEditedGoals={setEditedGoals}
        goalsToDelete={goalsToDelete}
        setGoalsToDelete={setGoalsToDelete}
        onSaveAll={handleSaveAllChanges}
        onClose={() => {
          setEditGoalsOpen(false);
          setEditedGoals({});
          setGoalsToDelete([]);
        }}
      />

      {/* Make Contribution Modal */}
      <ContributionModal
        open={contributionOpen}
        onOpenChange={(open) => {
          if (!open) handleContributionClose();
          else setContributionOpen(true);
        }}
        goals={goals}
        accounts={accounts}
        selectedGoal={selectedGoal}
        setSelectedGoal={setSelectedGoal}
        contributionAmount={contributionAmount}
        setContributionAmount={setContributionAmount}
        sourceAccount={sourceAccount}
        setSourceAccount={setSourceAccount}
        contributionDate={contributionDate}
        setContributionDate={setContributionDate}
        onSubmit={handleContributionSubmit}
        onClose={handleContributionClose}
      />

      {/* Account Required Modal - Shows when user has no accounts */}
      <AccountRequiredModal visible={!isLoading && !hasAccounts} />
    </SafeAreaView>
  );
}
