import { useFocusEffect } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../../components/nav";
import { GoalsListSkeleton } from "../../components/loading-states";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DatePicker } from "../../components/ui/date-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  formatCurrency,
  getCurrentUserGoals,
  getCurrentUserAccounts,
  makeGoalContribution,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../../lib/data";
import { useAuth } from "../../lib/auth-context";
import { useToast } from "../../components/ui/sonner";
import type { Goal, Account } from "../../lib/types";

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  // Loading state for goals
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load goals when component mounts or user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [goalsData, accountsData] = await Promise.all([
          getCurrentUserGoals(),
          getCurrentUserAccounts(),
        ]);
        setGoals(goalsData);
        setAccounts(accountsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Scroll to top and refresh data when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });

      // Refresh data when tab is focused
      if (user) {
        const loadData = async () => {
          try {
            const [goalsData, accountsData] = await Promise.all([
              getCurrentUserGoals(),
              getCurrentUserAccounts(),
            ]);
            setGoals(goalsData);
            setAccounts(accountsData);
          } catch (error) {
            console.error("Error loading data:", error);
          }
        };

        loadData();
      }
    }, [user])
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

  // Helper functions to extract IDs from display values
  const getGoalIdFromDisplayValue = (displayValue: string) => {
    const goal = goals.find(
      (g) =>
        `${g.name} (${formatCurrency(g.currentAmount)} / ${formatCurrency(
          g.targetAmount
        )})` === displayValue
    );
    return goal?.id || "";
  };

  const getAccountIdFromDisplayValue = (displayValue: string) => {
    const account = accounts.find(
      (acc) => `${acc.name} (${formatCurrency(acc.balance)})` === displayValue
    );
    return account?.id || "";
  };

  // Priority options with display labels and database values
  const priorityOptions = [
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];

  // Helper function to get display label for priority
  const getPriorityLabel = (value: string) => {
    return (
      priorityOptions.find((option) => option.value === value)?.label || value
    );
  };

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
    console.log("handleCreateGoal called");
    console.log("Form data:", {
      goalName,
      targetAmount,
      currentAmount,
      targetDate,
      priorityLevel,
    });

    try {
      if (!goalName.trim() || !targetAmount) {
        console.log("Validation failed: missing name or target amount");
        toast({
          message: "Please fill in the goal name and target amount",
          type: "error",
        });
        return;
      }

      console.log("Name and target amount validation passed");

      const targetAmountNum = parseFloat(targetAmount);
      if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
        console.log("Validation failed: invalid target amount");
        toast({
          message: "Please enter a valid target amount",
          type: "error",
        });
        return;
      }

      console.log("Target amount validation passed");

      let currentAmountNum = 0;
      if (currentAmount) {
        currentAmountNum = parseFloat(currentAmount);
        if (isNaN(currentAmountNum) || currentAmountNum < 0) {
          console.log("Validation failed: invalid current amount");
          toast({
            message: "Please enter a valid current amount",
            type: "error",
          });
          return;
        }
      }

      console.log("Current amount validation passed");

      // Validate target date is in the future
      if (targetDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(targetDate);
        selectedDate.setHours(0, 0, 0, 0);

        console.log("Date validation:", {
          today,
          selectedDate,
          isInFuture: selectedDate > today,
        });

        if (selectedDate <= today) {
          console.log("Validation failed: target date not in future");
          toast({
            message: "Target date must be in the future",
            type: "error",
          });
          return;
        }
      }

      console.log("Date validation passed");

      if (!user) {
        console.log("Validation failed: no user");
        toast({
          message: "You must be logged in to create a goal",
          type: "error",
        });
        return;
      }

      console.log("User validation passed, user:", user.id);

      console.log("Creating goal with data:", {
        userId: user.id,
        name: goalName.trim(),
        targetAmount: targetAmountNum,
        currentAmount: currentAmountNum,
        targetDate: targetDate
          ? targetDate.toISOString().split("T")[0]
          : undefined,
        priority: priorityLevel || "medium",
        status: "active",
      });

      const result = await createGoal({
        userId: user.id,
        name: goalName.trim(),
        targetAmount: targetAmountNum,
        currentAmount: currentAmountNum,
        targetDate: targetDate
          ? targetDate.toISOString().split("T")[0]
          : undefined,
        priority: priorityLevel || "medium",
        status: "active",
      });

      console.log("Goal creation result:", result);

      // Reset form
      resetAddGoalForm();
      setAddGoalOpen(false);

      // Reload goals
      const goalsData = await getCurrentUserGoals();
      setGoals(goalsData);

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
      const goalId = getGoalIdFromDisplayValue(selectedGoal);
      const accountId = getAccountIdFromDisplayValue(sourceAccount);

      await makeGoalContribution({
        goalId: goalId,
        accountId: accountId,
        amount: amount,
        date: contributionDate || new Date(),
      });

      // Reset form and reload data
      resetContributionForm();
      setContributionOpen(false);

      // Reload data
      const [goalsData, accountsData] = await Promise.all([
        getCurrentUserGoals(),
        getCurrentUserAccounts(),
      ]);
      setGoals(goalsData);
      setAccounts(accountsData);

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

      const result = await updateGoal(goalId, updates);

      if (result) {
        toast({
          message: "Goal updated successfully",
          type: "success",
        });

        // Refresh goals data
        const goalsData = await getCurrentUserGoals();
        setGoals(goalsData);

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
      const result = await deleteGoal(goalId);

      if (result) {
        toast({
          message: `Goal "${goalName}" deleted successfully`,
          type: "success",
        });

        // Refresh goals data
        const goalsData = await getCurrentUserGoals();
        setGoals(goalsData);

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

  // Progress calculation function
  const getProgressWidth = (current: number, target: number) => {
    if (current === 0 || target === 0) return 0;
    const percentage = Math.min((current / target) * 100, 100);
    return percentage;
  };

  // Format date consistently with the date picker
  const formatTargetDate = (dateString?: string): string => {
    if (!dateString) return "No target date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

          {loading && (
            <View className="space-y-6">
              <GoalsListSkeleton />
              <GoalsListSkeleton />
              <GoalsListSkeleton />
            </View>
          )}

          {!loading && (
            <>
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
                      onPress={() => setAddGoalOpen(true)}
                    >
                      Add New Goal
                    </Button>
                    <Button
                      variant="outline"
                      className="min-w-[130px] p-6"
                      onPress={() => setEditGoalsOpen(true)}
                    >
                      Edit Goals
                    </Button>
                    <Button
                      variant="outline"
                      className="min-w-[130px] p-6"
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
      <Dialog
        open={addGoalOpen}
        onOpenChange={(open) => {
          if (!open) handleAddGoalClose();
          else setAddGoalOpen(true);
        }}
      >
        <DialogContent onClose={handleAddGoalClose}>
          <DialogHeader>
            <DialogTitle>Add New Savings Goal</DialogTitle>
            <DialogDescription>
              Create a new savings goal with your target amount and timeline.
            </DialogDescription>
          </DialogHeader>

          <View className="space-y-4 pb-4">
            <View className="space-y-2 py-2">
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={goalName}
                onChangeText={setGoalName}
                className="w-full"
              />
            </View>

            <View className="space-y-2 py-2">
              <Label>Target Amount</Label>
              <Input
                placeholder="Enter target amount"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
                returnKeyType="done"
                blurOnSubmit={true}
                className="w-full"
              />
            </View>

            <View className="space-y-2 py-2">
              <Label>Current Amount (Optional)</Label>
              <Input
                placeholder="Enter current savings amount"
                value={currentAmount}
                onChangeText={setCurrentAmount}
                keyboardType="decimal-pad"
                returnKeyType="done"
                blurOnSubmit={true}
                className="w-full"
              />
            </View>

            <View className="space-y-2 py-2">
              <Label>Target Date</Label>
              <DatePicker
                date={targetDate}
                onDateChange={setTargetDate}
                placeholder="Select target date"
                className="w-full"
                minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
              />
            </View>

            <View className="space-y-2 py-2">
              <Label>Priority Level</Label>
              <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder="Select priority"
                    displayValue={
                      priorityLevel
                        ? getPriorityLabel(priorityLevel)
                        : undefined
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
              onPress={handleAddGoalClose}
              className="w-full"
            >
              Cancel
            </Button>
            <Button className="w-full mt-2" onPress={handleCreateGoal}>
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goals Modal */}
      <Dialog
        open={editGoalsOpen}
        onOpenChange={(open) => {
          if (!open) handleEditGoalsClose();
          else setEditGoalsOpen(true);
        }}
      >
        <DialogContent onClose={handleEditGoalsClose}>
          <DialogHeader>
            <DialogTitle>Edit Goals</DialogTitle>
            <DialogDescription>
              Modify your existing goals and their details.
            </DialogDescription>
          </DialogHeader>

          <View className="space-y-6">
            {goals.map((goal, index) => (
              <View
                key={goal.id}
                className={`space-y-3 p-4 border border-gray-200 rounded-lg bg-white ${
                  index > 0 ? "mt-4" : ""
                }`}
              >
                <View className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input
                    value={editedGoals[goal.id]?.name ?? goal.name}
                    onChangeText={(text) =>
                      setEditedGoals((prev) => ({
                        ...prev,
                        [goal.id]: { ...prev[goal.id], name: text },
                      }))
                    }
                    className="w-full"
                  />
                </View>

                <View className="space-y-2">
                  <Label>Target Amount</Label>
                  <Input
                    value={
                      editedGoals[goal.id]?.targetAmount ??
                      goal.targetAmount.toString()
                    }
                    onChangeText={(text) =>
                      setEditedGoals((prev) => ({
                        ...prev,
                        [goal.id]: { ...prev[goal.id], targetAmount: text },
                      }))
                    }
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    className="w-full"
                  />
                </View>

                <View className="space-y-2">
                  <Label>Target Date</Label>
                  <DatePicker
                    date={
                      editedGoals[goal.id]?.targetDate ??
                      (goal.targetDate ? new Date(goal.targetDate) : new Date())
                    }
                    onDateChange={(date) => {
                      setEditedGoals((prev) => ({
                        ...prev,
                        [goal.id]: { ...prev[goal.id], targetDate: date },
                      }));
                    }}
                    placeholder="Select target date"
                    className="w-full"
                  />
                </View>

                <Text className="text-sm text-gray-600">
                  Current amount: {formatCurrency(goal.currentAmount)}
                </Text>

                {/* Individual Save and Delete buttons */}
                <View className="flex-row gap-4 pt-2">
                  <Button
                    onPress={() => handleSaveGoal(goal.id)}
                    className="min-w-[130px]"
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="destructive"
                    onPress={() => handleDeleteGoal(goal.id, goal.name)}
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
              onPress={handleEditGoalsClose}
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Make Contribution Modal */}
      <Dialog
        open={contributionOpen}
        onOpenChange={(open) => {
          if (!open) handleContributionClose();
          else setContributionOpen(true);
        }}
      >
        <DialogContent onClose={handleContributionClose}>
          <DialogHeader>
            <DialogTitle>Make Contribution</DialogTitle>
            <DialogDescription>
              Add money to one of your savings goals.
            </DialogDescription>
          </DialogHeader>

          <View className="space-y-4">
            <View className="space-y-2">
              <Label>Select Goal</Label>
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((goal) => (
                    <SelectItem
                      key={goal.id}
                      value={`${goal.name} (${formatCurrency(
                        goal.currentAmount
                      )} / ${formatCurrency(goal.targetAmount)})`}
                    >
                      {goal.name} ({formatCurrency(goal.currentAmount)} /{" "}
                      {formatCurrency(goal.targetAmount)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>

            <View className="space-y-2">
              <Label>Contribution Amount</Label>
              <Input
                placeholder="Enter amount to contribute"
                value={contributionAmount}
                onChangeText={setContributionAmount}
                keyboardType="decimal-pad"
                returnKeyType="done"
                blurOnSubmit={true}
                className="w-full"
              />
            </View>

            <View className="space-y-2">
              <Label>Source Account</Label>
              <Select value={sourceAccount} onValueChange={setSourceAccount}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={`${account.name} (${formatCurrency(
                        account.balance
                      )})`}
                    >
                      {account.name} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>

            <View className="space-y-2">
              <Label>Contribution Date</Label>
              <DatePicker
                date={contributionDate}
                onDateChange={setContributionDate}
                placeholder="Select contribution date"
                className="w-full"
              />
            </View>
          </View>

          <DialogFooter>
            <Button
              variant="outline"
              onPress={handleContributionClose}
              className="w-full"
            >
              Cancel
            </Button>
            <Button className="w-full mt-2" onPress={handleContributionSubmit}>
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
