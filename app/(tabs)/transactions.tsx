import { useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionsListSkeleton } from "../../components/loading-states";
import Nav from "../../components/nav";
import {
  AddTransactionModal,
  EditSingleTransactionModal,
  EditTransactionsModal,
  formatDate,
  formatTransactionType,
  getAmountColor,
  isDateInPeriod,
  TransactionDetailModal,
} from "../../components/transactions";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { NativePicker } from "../../components/ui/native-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAuth } from "../../hooks/queries/useAuth";
import {
  useTransactionFilterOptions,
  useTransactions,
} from "../../hooks/queries/useTransactions";
import {
  exportTransactionsToCSV,
  exportTransactionsToPDF,
} from "../../lib/export";
import type { Transaction } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";

export default function Transactions() {
  useAuth(); // Keep auth context active

  // Use React Query hooks for transactions and filter options
  const { data: transactions = [], isLoading, refetch } = useTransactions();
  const { data: filterOptions } = useTransactionFilterOptions();

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [selectedMerchant, setSelectedMerchant] = useState("All Merchants");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editTransactionsOpen, setEditTransactionsOpen] = useState(false);
  const [editSingleTransactionOpen, setEditSingleTransactionOpen] =
    useState(false);
  const [addTransactionModalOpen, setAddTransactionModalOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top and refresh data when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      // Refetch transactions when tab is focused
      refetch();
    }, [refetch])
  );

  // Get filter options from React Query or compute from transactions
  const categories = filterOptions?.categories || [
    "All Categories",
    ...Array.from(new Set(transactions.map((t) => t.category))),
  ];

  const periods = filterOptions?.periods || [
    "This Month",
    "Last Month",
    "Last 3 Months",
    "This Year",
    "All Time",
  ];

  const merchants = filterOptions?.merchants || [
    "All Merchants",
    ...Array.from(new Set(transactions.map((t) => t.merchant).filter(Boolean))),
  ];

  const types = filterOptions?.types || [
    "All Types",
    ...Array.from(
      new Set(transactions.map((t) => formatTransactionType(t.type)))
    ),
  ];

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter((transaction) => {
    // Category filter
    if (
      selectedCategory !== "All Categories" &&
      transaction.category !== selectedCategory
    ) {
      return false;
    }

    // Merchant filter
    if (
      selectedMerchant !== "All Merchants" &&
      transaction.merchant !== selectedMerchant
    ) {
      return false;
    }

    // Type filter
    if (
      selectedType !== "All Types" &&
      formatTransactionType(transaction.type) !== selectedType
    ) {
      return false;
    }

    // Period filter
    return isDateInPeriod(transaction.date, selectedPeriod);
  });

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Transactions
          </Text>
          <Text className="text-gray-600 mb-6">
            {filteredTransactions.length} transactions
          </Text>

          {isLoading && (
            <View className="space-y-4">
              <TransactionsListSkeleton />
            </View>
          )}

          {!isLoading && (
            <>
              {/* Quick Actions */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <View className="flex-row flex-wrap gap-2 justify-center">
                    <Button
                      variant="default"
                      onPress={() => setAddTransactionModalOpen(true)}
                      className="min-w-[120px] p-6"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() => setEditTransactionsOpen(true)}
                      className="min-w-[120px] p-6"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() =>
                        exportTransactionsToCSV(filteredTransactions)
                      }
                      className="min-w-[120px] p-6"
                    >
                      Export to CSV
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() =>
                        exportTransactionsToPDF(filteredTransactions)
                      }
                      className="min-w-[120px] p-6"
                    >
                      Export to PDF
                    </Button>
                  </View>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-center">
                    Transaction History
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  {/* Filter Controls */}
                  <View className="space-y-4 px-2">
                    {/* First row of filters */}
                    <View className="flex-row space-x-4 gap-4">
                      <NativePicker
                        label="Category"
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        options={categories.map((cat) => ({
                          label: cat,
                          value: cat,
                        }))}
                        className="flex-1"
                      />

                      <NativePicker
                        label="Period"
                        value={selectedPeriod}
                        onValueChange={setSelectedPeriod}
                        options={periods.map((period) => ({
                          label: period,
                          value: period,
                        }))}
                        className="flex-1"
                      />
                    </View>

                    {/* Second row of filters */}
                    <View className="flex-row space-x-4 gap-4 py-2">
                      <NativePicker
                        label="Merchant"
                        value={selectedMerchant}
                        onValueChange={setSelectedMerchant}
                        options={merchants.map((merchant) => ({
                          label: merchant,
                          value: merchant,
                        }))}
                        className="flex-1"
                      />

                      <NativePicker
                        label="Type"
                        value={selectedType}
                        onValueChange={setSelectedType}
                        options={types.map((type) => ({
                          label: type,
                          value: type,
                        }))}
                        className="flex-1"
                      />
                    </View>

                    {/* Clear Filters Button */}
                    <View className="flex justify-center pt-2 pb-4">
                      <Button
                        variant="outline"
                        className="w-auto"
                        onPress={() => {
                          setSelectedCategory("All Categories");
                          setSelectedPeriod("This Month");
                          setSelectedMerchant("All Merchants");
                          setSelectedType("All Types");
                        }}
                      >
                        <Text>Clear All Filters</Text>
                      </Button>
                    </View>
                  </View>
                  {/* Transaction List */}
                  <View className="rounded-md border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="text-left"
                            style={{ width: 140, minWidth: 140, maxWidth: 140 }}
                          >
                            Description
                          </TableHead>
                          <TableHead
                            className="text-left"
                            style={{ width: 100, minWidth: 100, maxWidth: 100 }}
                          >
                            Category
                          </TableHead>
                          <TableHead
                            className="text-left"
                            style={{ width: 80, minWidth: 80, maxWidth: 80 }}
                          >
                            Date
                          </TableHead>
                          <TableHead
                            className="text-right"
                            style={{ width: 110, minWidth: 110, maxWidth: 110 }}
                          >
                            Amount
                          </TableHead>
                          <TableHead
                            className="text-center"
                            style={{ width: 50, minWidth: 50, maxWidth: 50 }}
                          >
                            <Text></Text>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length ? (
                          filteredTransactions.map((transaction) => (
                            <TableRow
                              key={transaction.id}
                              className="cursor-pointer"
                              onPress={() =>
                                handleTransactionClick(transaction)
                              }
                            >
                              <TableCell
                                className="font-medium"
                                style={{
                                  width: 140,
                                  minWidth: 140,
                                  maxWidth: 140,
                                }}
                              >
                                <View>
                                  <Text
                                    className="font-semibold text-gray-900 text-sm"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                  >
                                    {transaction.description}
                                  </Text>
                                  <Text
                                    className="text-xs text-gray-500"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                  >
                                    {transaction.merchant}
                                  </Text>
                                </View>
                              </TableCell>
                              <TableCell
                                style={{
                                  width: 120,
                                  minWidth: 120,
                                  maxWidth: 120,
                                }}
                              >
                                <Text
                                  className="text-sm"
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                >
                                  {transaction.category}
                                </Text>
                              </TableCell>
                              <TableCell
                                style={{
                                  width: 80,
                                  minWidth: 80,
                                  maxWidth: 80,
                                }}
                              >
                                <Text className="text-sm">
                                  {formatDate(transaction.date)}
                                </Text>
                              </TableCell>
                              <TableCell
                                className="text-right"
                                style={{
                                  width: 110,
                                  minWidth: 110,
                                  maxWidth: 110,
                                }}
                              >
                                <Text
                                  className={`font-bold text-sm ${getAmountColor(
                                    transaction.type
                                  )}`}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {transaction.type === "income" ? "+" : "-"}
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </Text>
                              </TableCell>
                              <TableCell
                                style={{
                                  width: 50,
                                  minWidth: 50,
                                  maxWidth: 50,
                                }}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Pressable className="h-8 w-8 p-0 items-center justify-center">
                                      <Text className="text-gray-600">⋯</Text>
                                    </Pressable>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      <Text>Actions</Text>
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onPress={() =>
                                        handleTransactionClick(transaction)
                                      }
                                    >
                                      <Text>View details</Text>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onPress={() => {
                                        setSelectedTransaction(transaction);
                                        setEditSingleTransactionOpen(true);
                                      }}
                                    >
                                      <Text>Edit transaction</Text>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <Text className="text-red-600">
                                        Delete transaction
                                      </Text>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              className="h-24 text-center"
                              style={{
                                width: 480,
                                minWidth: 480,
                                maxWidth: 480,
                              }}
                            >
                              <Text className="text-gray-500">
                                No transactions found.
                              </Text>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </View>
                </CardContent>
              </Card>

              {/* Transaction Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <View className="flex-row flex-wrap justify-center gap-4">
                    <View className="items-center flex-1 min-w-[120px]">
                      <Text className="text-sm text-gray-600 font-medium mb-2">
                        Total Income
                      </Text>
                      <Badge
                        variant="default"
                        className="text-base font-bold px-4 py-2 bg-green-600"
                      >
                        <Text>
                          +
                          {formatCurrency(
                            filteredTransactions
                              .filter((t) => t.type === "income")
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </Text>
                      </Badge>
                    </View>

                    <View className="items-center flex-1 min-w-[120px]">
                      <Text className="text-sm text-gray-600 font-medium mb-2">
                        Total Expenses
                      </Text>
                      <Badge
                        variant="destructive"
                        className="text-base font-bold px-4 py-2"
                      >
                        <Text>
                          {formatCurrency(
                            filteredTransactions
                              .filter((t) => t.type === "expense")
                              .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                          )}
                        </Text>
                      </Badge>
                    </View>

                    <View className="items-center flex-1 min-w-[120px]">
                      <Text className="text-sm text-gray-600 font-medium mb-2">
                        Net Total
                      </Text>
                      <Badge
                        variant={
                          filteredTransactions.reduce(
                            (sum, t) => sum + t.amount,
                            0
                          ) >= 0
                            ? "default"
                            : "destructive"
                        }
                        className={`text-base font-bold px-4 py-2 ${
                          filteredTransactions.reduce(
                            (sum, t) => sum + t.amount,
                            0
                          ) >= 0
                            ? "bg-green-600"
                            : ""
                        }`}
                      >
                        <Text>
                          {formatCurrency(
                            filteredTransactions.reduce(
                              (sum, t) => sum + t.amount,
                              0
                            )
                          )}
                        </Text>
                      </Badge>
                    </View>
                  </View>
                </CardContent>
              </Card>

              {/* Modals */}
              <View>
                {/* Transaction Detail Modal */}
                <TransactionDetailModal
                  open={detailModalOpen}
                  onOpenChange={setDetailModalOpen}
                  transaction={selectedTransaction}
                  onClose={() => setDetailModalOpen(false)}
                />

                {/* Edit Single Transaction Modal */}
                <EditSingleTransactionModal
                  open={editSingleTransactionOpen}
                  onOpenChange={setEditSingleTransactionOpen}
                  transaction={selectedTransaction}
                  onClose={() => setEditSingleTransactionOpen(false)}
                  onSave={() => {
                    // TODO: Implement save logic
                  }}
                />

                {/* Edit All Transactions Modal */}
                <EditTransactionsModal
                  open={editTransactionsOpen}
                  onOpenChange={setEditTransactionsOpen}
                  transactions={filteredTransactions}
                  onClose={() => setEditTransactionsOpen(false)}
                  onSave={() => {
                    // TODO: Implement save logic
                  }}
                />

                {/* Add Transaction Modal */}
                <AddTransactionModal
                  open={addTransactionModalOpen}
                  onOpenChange={setAddTransactionModalOpen}
                  onClose={() => setAddTransactionModalOpen(false)}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
