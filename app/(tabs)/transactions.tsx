import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionsListSkeleton } from "../../components/loading-states";
import Nav from "../../components/nav";
import {
  EditSingleTransactionModal,
  EditTransactionsModal,
  formatDate,
  formatTransactionType,
  getAmountColor,
  isDateInPeriod,
  TransactionActionMenu,
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
  useDeleteTransaction,
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
  const deleteTransactionMutation = useDeleteTransaction();

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [selectedParty, setSelectedParty] = useState("All Parties");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState<"amount" | "name" | "date" | "none">(
    "none"
  );
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editTransactionsOpen, setEditTransactionsOpen] = useState(false);
  const [editSingleTransactionOpen, setEditSingleTransactionOpen] =
    useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
    ...Array.from(
      new Set(
        transactions
          .map((t) => t.category)
          .filter((c): c is string => Boolean(c))
      )
    ),
  ];

  const periods = filterOptions?.periods || [
    "This Month",
    "Last Month",
    "Last 3 Months",
    "This Year",
    "All Time",
  ];

  // Format types from backend (they come as lowercase: "expense", "income", "transfer")
  // Backend already includes "All Types" as first element
  const types = filterOptions?.types
    ? filterOptions.types.map((t) =>
        t === "All Types" ? t : formatTransactionType(t)
      )
    : [
        "All Types",
        ...Array.from(
          new Set(transactions.map((t) => formatTransactionType(t.type)))
        ),
      ];

  // Filter transactions FIRST (without party filter) - MEMOIZED for performance
  const preFilteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Category filter
      if (
        selectedCategory !== "All Categories" &&
        transaction.category !== selectedCategory
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
  }, [transactions, selectedCategory, selectedType, selectedPeriod]);

  // Calculate party spending/earnings from pre-filtered transactions - MEMOIZED
  const parties = useMemo(() => {
    const partyAmounts = new Map<string, { amount: number; type: string }>();

    preFilteredTransactions.forEach((t) => {
      const transactionParties = [t.from_party, t.to_party].filter(Boolean);
      transactionParties.forEach((party) => {
        if (party) {
          const current = partyAmounts.get(party) || { amount: 0, type: "" };
          // For expenses, to_party gets negative (money out)
          // For income, from_party gets positive (money in)
          // For transfers, track separately with special symbol
          if (t.type === "expense" && party === t.to_party) {
            partyAmounts.set(party, {
              amount: current.amount + Number(t.amount), // Store as positive, will negate in display
              type: "expense",
            });
          } else if (t.type === "income" && party === t.from_party) {
            partyAmounts.set(party, {
              amount: current.amount + Number(t.amount),
              type: "income",
            });
          } else if (t.type === "transfer" && party === t.to_party) {
            partyAmounts.set(party, {
              amount: current.amount + Number(t.amount),
              type: "transfer",
            });
          }
        }
      });
    });

    // Sort parties based on user selection (only for amount/name, date doesn't apply to parties)
    const sortedPartyEntries = Array.from(partyAmounts.entries()).sort(
      (a, b) => {
        if (sortBy === "amount") {
          const comparison = b[1].amount - a[1].amount;
          return sortDirection === "desc" ? comparison : -comparison;
        } else {
          // Trim whitespace for proper alphabetical sorting
          const nameA = a[0].trim().toLowerCase();
          const nameB = b[0].trim().toLowerCase();
          const comparison = nameA.localeCompare(nameB);
          return sortDirection === "desc" ? comparison : -comparison;
        }
      }
    );

    // Format party list with amounts
    const parties = [
      "All Parties",
      ...sortedPartyEntries.map(([party, { amount, type }]) => {
        // Use absolute value to avoid doubling minus signs
        const formattedAmount = formatCurrency(Math.abs(amount));
        // Use different symbols based on transaction type
        let displayAmount = "";
        if (type === "expense") {
          displayAmount = `-${formattedAmount}`; // Expenses are money out
        } else if (type === "income") {
          displayAmount = `+${formattedAmount}`; // Income is money in
        } else if (type === "transfer") {
          displayAmount = `→${formattedAmount}`; // Transfers use arrow symbol
        }
        return `${party} (${displayAmount})`;
      }),
    ];

    return parties;
  }, [preFilteredTransactions, sortBy, sortDirection]);

  // Apply party filter and sort transactions - MEMOIZED for performance
  const filteredTransactions = useMemo(() => {
    const filteredTransactionsBase = preFilteredTransactions.filter(
      (transaction) => {
        // Party filter (check both from_party and to_party)
        if (selectedParty !== "All Parties") {
          // Extract party name from formatted string like "BP (-$100.00)"
          const partyName = selectedParty.includes(" (")
            ? selectedParty.substring(0, selectedParty.indexOf(" ("))
            : selectedParty;
          return (
            transaction.from_party === partyName ||
            transaction.to_party === partyName
          );
        }
        return true;
      }
    );

    if (sortBy === "none") {
      return filteredTransactionsBase;
    }

    // Create a copy before sorting to avoid mutating original array
    return [...filteredTransactionsBase].sort((a, b) => {
      // Sort transactions based on user selection
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        const comparison = dateB - dateA; // Default newest first
        return sortDirection === "desc" ? comparison : -comparison;
      } else if (sortBy === "amount") {
        const comparison =
          Math.abs(Number(b.amount)) - Math.abs(Number(a.amount));
        return sortDirection === "desc" ? comparison : -comparison;
      } else {
        // Sort by party name
        const partyA = (a.to_party || a.from_party || "").trim().toLowerCase();
        const partyB = (b.to_party || b.from_party || "").trim().toLowerCase();
        const comparison = partyA.localeCompare(partyB);
        return sortDirection === "desc" ? comparison : -comparison;
      }
    });
  }, [preFilteredTransactions, selectedParty, sortBy, sortDirection]);

  // Pagination calculations - MEMOIZED for performance
  const {
    totalTransactions,
    totalPages,
    startIndex,
    endIndex,
    paginatedTransactions,
  } = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const totalPages = Math.ceil(totalTransactions / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      endIndex
    );

    return {
      totalTransactions,
      totalPages,
      startIndex,
      endIndex,
      paginatedTransactions,
    };
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedPeriod,
    selectedParty,
    selectedType,
    sortBy,
    sortDirection,
  ]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleTransactionClick = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handleDeleteTransaction = useCallback(
    (transaction: Transaction) => {
      Alert.alert(
        "Delete Transaction",
        `Are you sure you want to delete this ${
          transaction.type
        } of ${formatCurrency(transaction.amount)}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteTransactionMutation.mutateAsync(transaction.id);
                Alert.alert("Success", "Transaction deleted successfully");
              } catch (error) {
                console.error("Error deleting transaction:", error);
                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "Failed to delete transaction"
                );
              }
            },
          },
        ]
      );
    },
    [deleteTransactionMutation]
  );

  // Helper function to get the relevant party to display
  const getDisplayParty = useCallback((transaction: Transaction): string => {
    if (transaction.type === "expense") {
      return transaction.to_party || "N/A"; // Show merchant
    } else if (transaction.type === "income") {
      return transaction.from_party || "N/A"; // Show income source
    } else if (transaction.type === "transfer") {
      return `To: ${transaction.to_party || "N/A"}`; // Show destination
    }
    return "N/A";
  }, []);

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
                      onPress={() => router.push("/addtransaction")}
                      className="min-w-[120px] p-6"
                    >
                      Add Expense
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

              {/* Transaction Summary */}
              <Card className="mb-6">
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
                        label="Party"
                        value={selectedParty}
                        onValueChange={setSelectedParty}
                        options={parties.map((party) => ({
                          label: party,
                          value: party,
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

                    {/* Sort Control */}
                    <View className="pt-2 pb-4">
                      <NativePicker
                        label="Sort By"
                        value={`${sortBy}-${sortDirection}`}
                        onValueChange={(value) => {
                          const [newSortBy, newSortDirection] = value.split(
                            "-"
                          ) as [
                            "amount" | "name" | "date" | "none",
                            "desc" | "asc"
                          ];
                          setSortBy(newSortBy);
                          setSortDirection(newSortDirection);
                        }}
                        options={[
                          { label: "Sort By", value: "none-desc" },
                          { label: "Newest-Oldest", value: "date-desc" },
                          { label: "Oldest-Newest", value: "date-asc" },
                          { label: "A-Z", value: "name-desc" },
                          { label: "Z-A", value: "name-asc" },
                          { label: "High-Low", value: "amount-desc" },
                          { label: "Low-High", value: "amount-asc" },
                        ]}
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
                          setSelectedParty("All Parties");
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
                        {paginatedTransactions.length ? (
                          paginatedTransactions.map((transaction) => (
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
                                    {getDisplayParty(transaction)}
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
                                <TransactionActionMenu
                                  transaction={transaction}
                                  onView={() =>
                                    handleTransactionClick(transaction)
                                  }
                                  onEdit={() => {
                                    setSelectedTransaction(transaction);
                                    setEditSingleTransactionOpen(true);
                                  }}
                                  onDelete={() =>
                                    handleDeleteTransaction(transaction)
                                  }
                                />
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

                  {/* Pagination Controls */}
                  {totalTransactions > 0 && (
                    <View className="mt-6 space-y-4">
                      {/* Transaction Counter */}
                      <View className="items-center">
                        <Text className="text-sm text-gray-600">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, totalTransactions)} of{" "}
                          {totalTransactions} transactions
                        </Text>
                      </View>

                      {/* Pagination Buttons */}
                      {totalPages > 1 && (
                        <View className="flex-row justify-center items-center gap-4">
                          {/* Previous Button */}
                          <Pressable
                            onPress={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="w-12 h-12 border border-gray-300 rounded-lg items-center justify-center bg-white"
                          >
                            <Feather
                              name="chevron-left"
                              size={24}
                              color="#374151"
                            />
                          </Pressable>

                          {/* Page Indicator */}
                          <View className="px-3">
                            <Text className="text-sm font-medium text-gray-700">
                              {currentPage} / {totalPages}
                            </Text>
                          </View>

                          {/* Next Button */}
                          <Pressable
                            onPress={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="w-12 h-12 border border-gray-300 rounded-lg items-center justify-center bg-white"
                          >
                            <Feather
                              name="chevron-right"
                              size={24}
                              color="#374151"
                            />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
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
                />

                {/* Edit All Transactions Modal */}
                <EditTransactionsModal
                  open={editTransactionsOpen}
                  onOpenChange={setEditTransactionsOpen}
                  transactions={filteredTransactions}
                  onClose={() => setEditTransactionsOpen(false)}
                  onSave={() => {
                    refetch();
                  }}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
