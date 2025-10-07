import { useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Goal } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";

export default function Goals() {
  useAuth();
  const { toast } = useToast();
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
      if (!goalName.trim() || !targetAmount) {
        toast({
          message: "Please fill in the goal name and target amount",
          type: "error",
        });
        return;
      }

      const targetAmountNum = parseFloat(targetAmount);
      if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
        toast({
          message: "Please enter a valid target amount",
          type: "error",
        });
        return;
      }

      let currentAmountNum = 0;
      if (currentAmount) {
        currentAmountNum = parseFloat(currentAmount);
        if (isNaN(currentAmountNum) || currentAmountNum < 0) {
          toast({
            message: "Please enter a valid current amount",
            type: "error",
          });
          return;
        }
      }

      // Validate target date is in the future
      if (targetDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(targetDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
          toast({
            message: "Target date must be in the future",
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
      console.error("Error creating goal:", err);
      toast({
        message: "Failed to create goal",
        type: "error",
      });
    }
  };

  // Handle contribution submission
  const handleContributionSubmit = async () => {
    if (!selectedGoal || !contributionAmount || !sourceAccount) {
      toast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        message: "Please enter a valid amount",
        type: "error",
      });
      return;
    }

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
      console.error("Error making contribution:", err);
      toast({
        message: "Failed to make contribution. Please try again.",
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

  // Individual goal save function
  const handleSaveGoal = async (goalId: string) => {
    try {
      const editedGoal = editedGoals[goalId];
      if (!editedGoal) {
        toast({
          message: "No changes to save",
          type: "info",
        });
        return;
      }

      const updates: Partial<Goal> = {};

      if (editedGoal.name !== undefined) {
        updates.name = editedGoal.name;
      }

      if (editedGoal.targetAmount !== undefined) {
        const amount = parseFloat(editedGoal.targetAmount);
        if (isNaN(amount) || amount <= 0) {
          toast({
            message: "Please enter a valid target amount",
            type: "error",
          });
          return;
        }
        updates.targetAmount = amount;
      }

      if (editedGoal.targetDate !== undefined) {
        updates.targetDate = editedGoal.targetDate.toISOString().split("T")[0];
      }

      const result = await updateGoalMutation.mutateAsync({
        goalId,
        goalData: updates,
      });

      if (result) {
        toast({
          message: "Goal updated successfully",
          type: "success",
        });

        // Clear the edited value
        setEditedGoals((prev) => {
          const newState = { ...prev };
          delete newState[goalId];
          return newState;
        });
      } else {
        toast({
          message: "Failed to update goal",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        message: "Failed to update goal. Please try again.",
        type: "error",
      });
    }
  };

  // Individual goal delete function
  const handleDeleteGoal = async (goalId: string, goalName: string) => {
    try {
      const result = await deleteGoalMutation.mutateAsync(goalId);

      if (result) {
        toast({
          message: `Goal "${goalName}" deleted successfully`,
          type: "success",
        });

        // Clear any edited value for this goal
        setEditedGoals((prev) => {
          const newState = { ...prev };
          delete newState[goalId];
          return newState;
        });
      } else {
        toast({
          message: "Failed to delete goal",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        message: "Failed to delete goal. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Financial Goals
          </Text>
          <Text className="text-gray-600 mb-6">
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
                      onPress={() => setContributionOpen(true)}
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

                <CardContent className="space-y-8 p-4">
                  {goals.map((goal, index) => {
                    const progressWidth = getProgressWidth(
                      goal.currentAmount,
                      goal.targetAmount
                    );
                    const goalAchieved =
                      goal.currentAmount >= goal.targetAmount;

                    return (
                      <View key={goal.id}>
                        <View className="space-y-4 py-4">
                          <Text className="text-base font-medium">
                            {goal.name}
                          </Text>

                          <Text className="text-base text-gray-600 py-2">
                            {formatCurrency(goal.currentAmount)} /{" "}
                            {formatCurrency(goal.targetAmount)}
                          </Text>

                          <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden ">
                            <View
                              className={`h-2 rounded-full ${
                                goalAchieved ? "bg-green-500" : "bg-gray-900"
                              }`}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </View>

                          <Text className="text-sm text-gray-600 py-2">
                            Target: {formatTargetDate(goal.targetDate)}
                          </Text>

                          {goalAchieved && (
                            <Text className="text-sm text-green-600 font-medium py-2">
                              🎉 Goal achieved!
                            </Text>
                          )}
                        </View>

                        {index < goals.length - 1 && (
                          <View className="mt-2 border-b border-gray-200" />
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
        onSaveGoal={handleSaveGoal}
        onDeleteGoal={handleDeleteGoal}
        onClose={handleEditGoalsClose}
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
    </SafeAreaView>
  );
}
