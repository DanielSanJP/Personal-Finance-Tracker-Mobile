import React from "react";
import { View } from "react-native";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface ContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: Goal[];
  accounts: Account[];
  selectedGoal: string;
  setSelectedGoal: (goal: string) => void;
  contributionAmount: string;
  setContributionAmount: (amount: string) => void;
  sourceAccount: string;
  setSourceAccount: (account: string) => void;
  contributionDate: Date | undefined;
  setContributionDate: (date: Date | undefined) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ContributionModal({
  open,
  onOpenChange,
  goals,
  accounts,
  selectedGoal,
  setSelectedGoal,
  contributionAmount,
  setContributionAmount,
  sourceAccount,
  setSourceAccount,
  contributionDate,
  setContributionDate,
  onSubmit,
  onClose,
}: ContributionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
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

          <View className="py-2">
            <DateTimePicker
              date={contributionDate}
              onDateTimeChange={setContributionDate}
              placeholder="Select date"
              showLabel={true}
              required={true}
            />
          </View>
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={onClose} className="w-full">
            Cancel
          </Button>
          <Button className="w-full mt-2" onPress={onSubmit}>
            Add Contribution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
