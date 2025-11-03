import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Goal } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";
import { Button } from "../ui/button";
import { DateTimePicker } from "../ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface EditGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: Goal[];
  editedGoals: {
    [key: string]: { name?: string; targetAmount?: string; targetDate?: Date };
  };
  setEditedGoals: React.Dispatch<
    React.SetStateAction<{
      [key: string]: {
        name?: string;
        targetAmount?: string;
        targetDate?: Date;
      };
    }>
  >;
  goalsToDelete: string[];
  setGoalsToDelete: React.Dispatch<React.SetStateAction<string[]>>;
  onSaveAll: () => void;
  onClose: () => void;
}

export function EditGoalsModal({
  open,
  onOpenChange,
  goals,
  editedGoals,
  setEditedGoals,
  goalsToDelete,
  setGoalsToDelete,
  onSaveAll,
  onClose,
}: EditGoalsModalProps) {
  const handleDeleteGoal = (goalId: string) => {
    setGoalsToDelete((prev) => [...prev, goalId]);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Goals</DialogTitle>
          <DialogDescription>
            Modify your existing goals and their details.
          </DialogDescription>
        </DialogHeader>

        <View className="space-y-4">
          {goals
            .filter((goal) => !goalsToDelete.includes(goal.id))
            .map((goal, index) => (
              <View
                key={goal.id}
                className={`space-y-3 p-4 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark ${
                  index > 0 ? "mt-2" : ""
                }`}
              >
                {/* Goal Name with Delete Icon */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-foreground-light dark:text-foreground-dark">
                    {editedGoals[goal.id]?.name ?? goal.name}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteGoal(goal.id)}
                    className="p-2"
                  >
                    <Feather name="trash-2" size={20} color="#dc2626" />
                  </Pressable>
                </View>

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
                  <Label>Current Amount</Label>
                  <Input
                    value={formatCurrency(goal.currentAmount)}
                    editable={false}
                    className="w-full bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark"
                  />
                </View>

                <View className="space-y-2">
                  <DateTimePicker
                    date={
                      editedGoals[goal.id]?.targetDate ??
                      (goal.targetDate ? new Date(goal.targetDate) : new Date())
                    }
                    onDateTimeChange={(date) => {
                      setEditedGoals((prev) => ({
                        ...prev,
                        [goal.id]: { ...prev[goal.id], targetDate: date },
                      }));
                    }}
                    placeholder="Select target date"
                    className="w-full"
                    showLabel={true}
                    required={true}
                  />
                </View>

                <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  Progress: {formatCurrency(goal.currentAmount)} of{" "}
                  {formatCurrency(goal.targetAmount)} (
                  {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%)
                </Text>
              </View>
            ))}
        </View>

        <DialogFooter className="flex-row gap-4">
          <Button variant="outline" onPress={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onPress={onSaveAll} className="flex-1">
            Save All Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
