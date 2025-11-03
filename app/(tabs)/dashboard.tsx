import { router, useFocusEffect } from "expo-router";
import React, { useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccountRequiredModal } from "../../components/account-required-modal";
import { DashboardSkeleton } from "../../components/loading-states";
import Nav from "../../components/nav";
import { SpendingChart } from "../../components/spending-chart";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuth } from "../../hooks/queries/useAuth";
import { useDashboardData } from "../../hooks/queries/useDashboard";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { formatCurrency } from "../../lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const { currency, showCents, compactView } = useUserPreferences();

  // Use React Query hook for dashboard data
  const { data: dashboardData, isLoading, refetch } = useDashboardData();

  // Extract data from dashboard response
  const accounts = dashboardData?.accounts || [];
  const summary = dashboardData?.summary || null;

  // Check if user has accounts - use actual accounts array from dashboard
  const hasAccounts = accounts.length > 0;

  // Refresh data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Get current month name
  const getCurrentMonthName = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[new Date().getMonth()];
  };

  // Scroll to top when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, [])
  );

  // Get user's display name from user metadata
  const displayName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "User";

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        {/* Financial Summary Cards */}
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
            Dashboard
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
            Welcome back, {displayName}!
          </Text>

          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Quick Actions */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <View className="flex-row flex-wrap gap-2 justify-center">
                    <Button
                      variant="default"
                      onPress={() => router.push("/addincome")}
                      className="min-w-[120px] p-6"
                    >
                      Add Income
                    </Button>
                    <Button
                      variant="default"
                      onPress={() => router.push("/addtransaction")}
                      className="min-w-[120px] p-6"
                    >
                      Add Expense
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() =>
                        router.push("/addtransaction?openScanner=true")
                      }
                      className="min-w-[120px] p-6"
                    >
                      Scan Receipt
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() => {
                        /* TODO: Implement reports view */
                      }}
                      className="min-w-[120px] p-6"
                    >
                      View Reports
                    </Button>
                  </View>
                </CardContent>
              </Card>

              <View className="flex-row justify-between mb-6">
                <View
                  className={`bg-card-light dark:bg-card-dark rounded-lg flex-1 mr-3 shadow-sm border border-border-light dark:border-border-dark ${
                    compactView ? "p-2" : "p-4"
                  }`}
                >
                  <Text
                    className={`text-muted-foreground-light dark:text-muted-foreground-dark font-medium mb-1 text-center ${
                      compactView ? "text-[10px]" : "text-xs"
                    }`}
                  >
                    Account Balance
                  </Text>
                  <Text
                    className={`font-bold text-card-foreground-light dark:text-card-foreground-dark text-center ${
                      compactView ? "text-base" : "text-lg"
                    }`}
                  >
                    {formatCurrency(
                      summary?.totalBalance || 0,
                      currency,
                      showCents
                    )}
                  </Text>
                </View>
                <View
                  className={`bg-card-light dark:bg-card-dark rounded-lg flex-1 ml-3 shadow-sm border border-border-light dark:border-border-dark ${
                    compactView ? "p-2" : "p-4"
                  }`}
                >
                  <Text
                    className={`text-muted-foreground-light dark:text-muted-foreground-dark font-medium mb-1 text-center ${
                      compactView ? "text-[10px]" : "text-xs"
                    }`}
                  >
                    This Month ({getCurrentMonthName()})
                  </Text>
                  <Text
                    className={`font-bold text-center ${
                      compactView ? "text-base" : "text-lg"
                    } ${
                      (summary?.monthlyChange || 0) >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {(summary?.monthlyChange || 0) >= 0 ? "+" : ""}
                    {formatCurrency(
                      summary?.monthlyChange || 0,
                      currency,
                      showCents
                    )}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between mb-8">
                <View
                  className={`bg-card-light dark:bg-card-dark rounded-lg flex-1 mr-3 shadow-sm border border-border-light dark:border-border-dark ${
                    compactView ? "p-2" : "p-4"
                  }`}
                >
                  <Text
                    className={`text-muted-foreground-light dark:text-muted-foreground-dark font-medium mb-1 text-center ${
                      compactView ? "text-[10px]" : "text-xs"
                    }`}
                  >
                    Income ({getCurrentMonthName()})
                  </Text>
                  <Text
                    className={`font-bold text-green-600 dark:text-green-400 text-center ${
                      compactView ? "text-base" : "text-lg"
                    }`}
                  >
                    +
                    {formatCurrency(
                      summary?.monthlyIncome || 0,
                      currency,
                      showCents
                    )}
                  </Text>
                </View>
                <View
                  className={`bg-card-light dark:bg-card-dark rounded-lg flex-1 ml-3 shadow-sm border border-border-light dark:border-border-dark ${
                    compactView ? "p-2" : "p-4"
                  }`}
                >
                  <Text
                    className={`text-muted-foreground-light dark:text-muted-foreground-dark font-medium mb-1 text-center ${
                      compactView ? "text-[10px]" : "text-xs"
                    }`}
                  >
                    Budget Remaining ({getCurrentMonthName()})
                  </Text>
                  <Text
                    className={`font-bold text-card-foreground-light dark:text-card-foreground-dark text-center ${
                      compactView ? "text-base" : "text-lg"
                    }`}
                  >
                    {formatCurrency(
                      summary?.budgetRemaining || 0,
                      currency,
                      showCents
                    )}
                  </Text>
                </View>
              </View>

              {/* Spending Chart */}
              <View className="mb-6">
                <SpendingChart />
              </View>

              {/* Your Accounts */}
              <View
                className={`bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark mb-6 ${
                  compactView ? "p-3" : "p-6"
                }`}
              >
                <Text
                  className={`font-semibold text-card-foreground-light dark:text-card-foreground-dark ${
                    compactView ? "text-base mb-2" : "text-lg mb-4"
                  }`}
                >
                  Your Accounts
                </Text>
                {accounts.map((account, index) => (
                  <View
                    key={account.id}
                    className={`flex-row justify-between items-center ${
                      compactView ? "py-2" : "py-3"
                    } ${
                      index < accounts.length - 1
                        ? "border-b border-border-light dark:border-border-dark"
                        : ""
                    }`}
                  >
                    <Text
                      className={`text-foreground-light dark:text-foreground-dark ${
                        compactView ? "text-sm" : "text-base"
                      }`}
                    >
                      {account.name}
                    </Text>
                    <Text
                      className={`font-semibold text-card-foreground-light dark:text-card-foreground-dark ${
                        compactView ? "text-sm" : "text-base"
                      }`}
                    >
                      {formatCurrency(account.balance, currency, showCents)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Account Required Modal - Shows when user has no accounts */}
      <AccountRequiredModal visible={!isLoading && !hasAccounts} />
    </SafeAreaView>
  );
}
