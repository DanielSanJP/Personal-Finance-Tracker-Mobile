import React from "react";
import { Text, View } from "react-native";
import type { Goal } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
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
  onSaveGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string, goalName: string) => void;
  onClose: () => void;
}

export function EditGoalsModal({
  open,
  onOpenChange,
  goals,
  editedGoals,
  setEditedGoals,
  onSaveGoal,
  onDeleteGoal,
  onClose,
}: EditGoalsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
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
                  onPress={() => onSaveGoal(goal.id)}
                  className="min-w-[130px]"
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onPress={() => onDeleteGoal(goal.id, goal.name)}
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
          <Button variant="outline" onPress={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
