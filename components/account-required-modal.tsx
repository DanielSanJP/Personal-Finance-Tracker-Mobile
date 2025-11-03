import { router, usePathname } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface AccountRequiredModalProps {
  visible: boolean;
}

export function AccountRequiredModal({ visible }: AccountRequiredModalProps) {
  const pathname = usePathname();

  // Don't show modal on accounts page or auth pages
  const shouldShow =
    visible &&
    pathname !== "/accounts" &&
    pathname !== "/login" &&
    pathname !== "/register";

  return (
    <Dialog open={shouldShow} onOpenChange={() => {}}>
      <DialogContent onClose={() => {}} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Welcome to Personal Finance Tracker! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Let&apos;s get you started on your financial journey
          </DialogDescription>
        </DialogHeader>

        <View className="py-4">
          <View className="bg-muted-light dark:bg-muted-dark p-4 rounded-lg mb-4">
            <Text className="text-foreground-light dark:text-foreground-dark text-center font-medium mb-2">
              📊 Track Your Finances
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center text-sm">
              Monitor income, expenses, and reach your financial goals
            </Text>
          </View>

          <View className="bg-primary-light/10 dark:bg-primary-dark/10 p-4 rounded-lg border-2 border-primary-light dark:border-primary-dark">
            <Text className="text-foreground-light dark:text-foreground-dark text-center font-semibold mb-2">
              🏦 Create Your First Account
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center text-sm">
              You need at least one account to start tracking transactions,
              budgets, and goals.
            </Text>
          </View>
        </View>

        <DialogFooter>
          <View className="w-full">
            <Button
              variant="default"
              onPress={() => router.push("/accounts")}
              className="w-full"
            >
              Create Your First Account
            </Button>
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
