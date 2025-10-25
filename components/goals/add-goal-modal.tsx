import React from "react";
import { View } from "react-native";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select-mobile";
import { getPriorityLabel, priorityOptions } from "./goal-utils";

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  setGoalName: (name: string) => void;
  targetAmount: string;
  setTargetAmount: (amount: string) => void;
  currentAmount: string;
  setCurrentAmount: (amount: string) => void;
  targetDate: Date | undefined;
  setTargetDate: (date: Date | undefined) => void;
  priorityLevel: string;
  setPriorityLevel: (priority: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function AddGoalModal({
  open,
  onOpenChange,
  goalName,
  setGoalName,
  targetAmount,
  setTargetAmount,
  currentAmount,
  setCurrentAmount,
  targetDate,
  setTargetDate,
  priorityLevel,
  setPriorityLevel,
  onSubmit,
  onClose,
}: AddGoalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
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
            <DateTimePicker
              date={targetDate}
              onDateTimeChange={setTargetDate}
              placeholder="Select target date"
              className="w-full"
              minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
              showLabel={true}
              required={true}
            />
          </View>

          <View className="space-y-2 py-2">
            <Label>Priority Level</Label>
            <Select value={priorityLevel} onValueChange={setPriorityLevel}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder="Select priority"
                  displayValue={
                    priorityLevel ? getPriorityLabel(priorityLevel) : undefined
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
          <Button variant="outline" onPress={onClose} className="w-full">
            Cancel
          </Button>
          <Button className="w-full mt-2" onPress={onSubmit}>
            Create Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
