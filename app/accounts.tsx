import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddAccountModal, TransferModal } from "../components/accounts";
import { EditAccountModal } from "../components/edit-account-modal";
import { AccountsListSkeleton } from "../components/loading-states";
import Nav from "../components/nav";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../components/ui/sonner";
import { useAccounts } from "../hooks/queries/useAccounts";
import { useAuth } from "../hooks/queries/useAuth";
import type { Account } from "../lib/types";
import { formatCurrency } from "../lib/utils";

export default function Accounts() {
  const router = useRouter();
  const { user, isLoading: loading } = useAuth();
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    refetch,
  } = useAccounts();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const toast = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Scroll to top and refresh data when the page is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      refetch();
    }, [refetch])
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
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAccount(null);
  };

  const handleAccountUpdated = () => {
    // Data will be automatically refreshed by React Query after mutation
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
          {/* Header with title */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-4">
              My Accounts
            </Text>
            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Button
                variant="default"
                onPress={handleAddAccount}
                className="flex-1"
              >
                Add Account
              </Button>
              <Button
                variant="outline"
                onPress={() => setIsTransferModalOpen(true)}
                className="flex-1"
              >
                Transfer Funds
              </Button>
            </View>
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
                <Pressable
                  key={account.id}
                  className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                  onPress={() => handleEditAccount(account)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View className="bg-white flex flex-col rounded-xl border border-gray-200 shadow-sm">
                    <View className="px-6 pt-6 pb-4">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-lg font-semibold text-gray-900 flex-1">
                          {account.name}
                        </Text>
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
                    </View>
                    <View className="px-6 pb-6">
                      <View className="space-y-2 gap-2">
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
                          <Text className="text-xs text-gray-400">
                            Tap to edit
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Account Modal */}
      <EditAccountModal
        account={editingAccount}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onAccountUpdated={handleAccountUpdated}
      />

      {/* Add Account Modal */}
      <AddAccountModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onClose={handleCloseAddModal}
      />

      {/* Transfer Funds Modal */}
      <TransferModal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        onSuccess={() => {
          toast.toast({
            message: "Transfer completed successfully",
            type: "success",
          });
        }}
      />
    </SafeAreaView>
  );
}
