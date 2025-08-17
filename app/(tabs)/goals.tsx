import { useFocusEffect } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../../components/nav";
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
import { formatCurrency, getCurrentUserGoals } from "../../lib/data";
import { useAuth } from "../../lib/auth-context";
import type { Goal } from "../../lib/types";

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  // Comment out loading states for now
  // const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load goals when component mounts or user changes
  useEffect(() => {
    const loadGoals = async () => {
      if (!user) return;

      try {
        // setLoading(true); // Loading states disabled for now
        const goalsData = await getCurrentUserGoals();
        setGoals(goalsData);
      } catch (error) {
        console.error("Error loading goals:", error);
      } finally {
        // setLoading(false); // Loading states disabled for now
      }
    };

    loadGoals();
  }, [user]);

  // Scroll to top when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, [])
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
                const goalAchieved = goal.currentAmount >= goal.targetAmount;

                return (
                  <View key={goal.id}>
                    <View className="space-y-4 py-4">
                      <Text className="text-base font-medium">{goal.name}</Text>

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

              {/* Action Buttons */}
              <View className="pt-4">
                <View className="flex-row flex-wrap gap-4 justify-center">
                  <Button
                    variant="default"
                    className="min-w-[130px]"
                    onPress={() => setAddGoalOpen(true)}
                  >
                    Add New Goal
                  </Button>
                  <Button
                    variant="outline"
                    className="min-w-[130px]"
                    onPress={() => setEditGoalsOpen(true)}
                  >
                    Edit Goals
                  </Button>
                  <Button
                    variant="outline"
                    className="min-w-[130px]"
                    onPress={() => setContributionOpen(true)}
                  >
                    Make Contribution
                  </Button>
                </View>
              </View>

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
                      Create a new savings goal with your target amount and
                      timeline.
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
                      />
                    </View>

                    <View className="space-y-2 py-2">
                      <Label>Priority Level</Label>
                      <Select
                        value={priorityLevel}
                        onValueChange={setPriorityLevel}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
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
                    <Button className="w-full mt-2">Create Goal</Button>
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
                          <Input defaultValue={goal.name} className="w-full" />
                        </View>

                        <View className="space-y-2">
                          <Label>Target Amount</Label>
                          <Input
                            defaultValue={goal.targetAmount.toString()}
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
                              goal.targetDate
                                ? new Date(goal.targetDate)
                                : new Date()
                            }
                            onDateChange={(date) => {
                              // You can add state management here when implementing save functionality
                            }}
                            placeholder="Select target date"
                            className="w-full"
                          />
                        </View>

                        <Text className="text-sm text-gray-600">
                          Current amount: {formatCurrency(goal.currentAmount)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onPress={handleEditGoalsClose}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                    <Button className="w-full mt-2">Save Changes</Button>
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
                      <Select
                        value={selectedGoal}
                        onValueChange={setSelectedGoal}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {goals.map((goal) => (
                            <SelectItem key={goal.id} value={goal.name}>
                              {goal.name} ({formatCurrency(goal.currentAmount)}{" "}
                              / {formatCurrency(goal.targetAmount)})
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
                      <Select
                        value={sourceAccount}
                        onValueChange={setSourceAccount}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Checking Account">
                            Checking Account
                          </SelectItem>
                          <SelectItem value="Savings Account">
                            Savings Account
                          </SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <Button className="w-full mt-2">Add Contribution</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
