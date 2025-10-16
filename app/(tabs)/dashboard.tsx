import { router, useFocusEffect } from "expo-router";
import React, { useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { formatCurrency } from "../../lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Use React Query hook for dashboard data
  const { data: dashboardData, isLoading, refetch } = useDashboardData();

  // Extract data from dashboard response
  const accounts = dashboardData?.accounts || [];
  const summary = dashboardData?.summary || null;

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        {/* Financial Summary Cards */}
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Dashboard
          </Text>
          <Text className="text-gray-600 mb-6">
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
                <View className="bg-white rounded-lg p-4 flex-1 mr-3 shadow-sm border border-gray-100">
                  <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                    Account Balance
                  </Text>
                  <Text className="text-lg font-bold text-gray-900 text-center">
                    {formatCurrency(summary?.totalBalance || 0)}
                  </Text>
                </View>
                <View className="bg-white rounded-lg p-4 flex-1 ml-3 shadow-sm border border-gray-100">
                  <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                    This Month ({getCurrentMonthName()})
                  </Text>
                  <Text
                    className={`text-lg font-bold text-center ${
                      (summary?.monthlyChange || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(summary?.monthlyChange || 0) >= 0 ? "+" : ""}
                    {formatCurrency(summary?.monthlyChange || 0)}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between mb-8">
                <View className="bg-white rounded-lg p-4 flex-1 mr-3 shadow-sm border border-gray-100">
                  <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                    Income ({getCurrentMonthName()})
                  </Text>
                  <Text className="text-lg font-bold text-green-600 text-center">
                    +{formatCurrency(summary?.monthlyIncome || 0)}
                  </Text>
                </View>
                <View className="bg-white rounded-lg p-4 flex-1 ml-3 shadow-sm border border-gray-100">
                  <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                    Budget Remaining ({getCurrentMonthName()})
                  </Text>
                  <Text className="text-lg font-bold text-gray-900 text-center">
                    {formatCurrency(summary?.budgetRemaining || 0)}
                  </Text>
                </View>
              </View>

              {/* Spending Chart */}
              <View className="mb-6">
                <SpendingChart />
              </View>

              {/* Your Accounts */}
              <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Your Accounts
                </Text>
                {accounts.map((account, index) => (
                  <View
                    key={account.id}
                    className={`flex-row justify-between items-center py-3 ${
                      index < accounts.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <Text className="text-gray-700">{account.name}</Text>
                    <Text className="font-semibold text-gray-900">
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
