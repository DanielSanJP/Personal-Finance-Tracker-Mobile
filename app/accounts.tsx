import { useFocusEffect, useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { AccountsListSkeleton } from "../components/loading-states";
import { getCurrentUserAccounts, formatCurrency } from "../lib/data";
import { useAuth } from "../lib/auth-context";
import type { Account } from "../lib/types";

export default function Accounts() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Load accounts when component mounts or user changes
  useEffect(() => {
    const loadAccounts = async () => {
      if (!user) return;

      try {
        setAccountsLoading(true);
        const accountsData = await getCurrentUserAccounts();
        setAccounts(accountsData);
      } catch (error) {
        console.error("Error loading accounts:", error);
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, [user]);

  // Scroll to top when the page is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, [])
  );

  // Get account type color (matching Next.js exactly)
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "checking":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "savings":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "credit":
        return { bg: "bg-red-100", text: "text-red-800" };
      case "investment":
        return { bg: "bg-purple-100", text: "text-purple-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };

  const handleAddAccount = () => {
    router.push("/addaccount");
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Nav />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="max-w-7xl mx-auto px-6 py-8">
          {/* Header with title and add button */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-3xl font-bold text-gray-900">
              My Accounts
            </Text>
            <Button variant="default" onPress={handleAddAccount}>
              Add Account
            </Button>
          </View>

          {/* Content */}
          {accountsLoading ? (
            <AccountsListSkeleton />
          ) : accounts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Text className="text-lg font-medium text-gray-900 mb-2">
                  No accounts found
                </Text>
                <Text className="text-gray-500 mb-4">
                  Get started by adding your first account.
                </Text>
                <Button onPress={handleAddAccount}>
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Accounts Grid - using flexWrap for responsive grid */
            <View className="flex-row flex-wrap gap-6">
              {accounts.map((account) => (
                <View
                  key={account.id}
                  className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <View className="flex-row justify-between items-start">
                        <CardTitle className="text-lg font-semibold flex-1">
                          {account.name}
                        </CardTitle>
                        <View
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                            getAccountTypeColor(account.type).bg
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              getAccountTypeColor(account.type).text
                            }`}
                          >
                            {account.type.charAt(0).toUpperCase() +
                              account.type.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <View className="space-y-2">
                        <Text className="text-2xl font-bold text-gray-900">
                          {formatCurrency(account.balance)}
                        </Text>
                        {account.accountNumber && (
                          <Text className="text-sm text-gray-500">
                            Account: {account.accountNumber}
                          </Text>
                        )}
                        <View className="flex-row justify-between items-center pt-3">
                          <View
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                              account.isActive ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                account.isActive
                                  ? "text-green-800"
                                  : "text-gray-800"
                              }`}
                            >
                              {account.isActive ? "Active" : "Inactive"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
