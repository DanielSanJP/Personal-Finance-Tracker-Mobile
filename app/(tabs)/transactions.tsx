import { useFocusEffect, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../../components/nav";
import { TransactionsListSkeleton } from "../../components/loading-states";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { formatCurrency } from "../../lib/utils";
import { useAuth } from "../../hooks/queries/useAuth";
import {
  useTransactions,
  useTransactionFilterOptions,
} from "../../hooks/queries/useTransactions";
import type { Transaction } from "../../lib/types";
import {
  exportTransactionsToCSV,
  exportTransactionsToPDF,
} from "../../lib/export";

export default function Transactions() {
  const router = useRouter();
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
  const scrollViewRef = useRef<ScrollView>(null);

  // Helper function to format transaction type for display
  const formatTransactionType = (type: string) => {
    switch (type) {
      case "income":
        return "Income";
      case "expense":
        return "Expense";
      case "transfer":
        return "Transfer";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

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

  // Helper function to check if date is within period
  const isDateInPeriod = (dateString: string, period: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (period) {
      case "This Month":
        return (
          date.getFullYear() === currentYear && date.getMonth() === currentMonth
        );
      case "Last Month":
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear =
          currentMonth === 0 ? currentYear - 1 : currentYear;
        return (
          date.getFullYear() === lastMonthYear && date.getMonth() === lastMonth
        );
      case "Last 3 Months":
        const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const threeMonthsAgo = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 3,
          1
        );
        const transactionDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );
        return transactionDate >= threeMonthsAgo;
      case "This Year":
        return date.getFullYear() === currentYear;
      case "All Time":
        return true;
      default:
        return true;
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAmountColor = (type: string) => {
    if (type === "income") return "text-green-600";
    return "text-red-600";
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
                      onPress={() => router.push("/addtransaction")}
                      className="min-w-[140px] p-6"
                    >
                      Add Transaction
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() => setEditTransactionsOpen(true)}
                      className="min-w-[140px] p-6"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() =>
                        exportTransactionsToCSV(filteredTransactions)
                      }
                      className="min-w-[140px] p-6"
                    >
                      Export to CSV
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() =>
                        exportTransactionsToPDF(filteredTransactions)
                      }
                      className="min-w-[140px] p-6"
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
                  <View className="space-y-4">
                    {/* First row of filters */}
                    <View className="flex-row space-x-4 gap-4">
                      <View className="flex-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              <Text>{selectedCategory}</Text>
                              <Text className="ml-2">▼</Text>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel>
                              <Text>Filter by Category</Text>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {categories.map((category) => (
                              <DropdownMenuItem
                                key={category}
                                onPress={() => setSelectedCategory(category)}
                              >
                                <Text>{category}</Text>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </View>

                      <View className="flex-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              <Text>{selectedPeriod}</Text>
                              <Text className="ml-2">▼</Text>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48" align="end">
                            <DropdownMenuLabel>
                              <Text>Filter by Time Period</Text>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {periods.map((period) => (
                              <DropdownMenuItem
                                key={period}
                                onPress={() => setSelectedPeriod(period)}
                              >
                                <Text>{period}</Text>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </View>
                    </View>

                    {/* Second row of filters */}
                    <View className="flex-row space-x-4 gap-4 py-2">
                      <View className="flex-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              <Text>{selectedMerchant}</Text>
                              <Text className="ml-2">▼</Text>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel>
                              <Text>Filter by Merchant</Text>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {merchants.map((merchant) => (
                              <DropdownMenuItem
                                key={merchant}
                                onPress={() => setSelectedMerchant(merchant)}
                              >
                                <Text>{merchant}</Text>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </View>

                      <View className="flex-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              <Text>{selectedType}</Text>
                              <Text className="ml-2">▼</Text>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48" align="end">
                            <DropdownMenuLabel>
                              <Text>Filter by Type</Text>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {types.map((type) => (
                              <DropdownMenuItem
                                key={type}
                                onPress={() => setSelectedType(type)}
                              >
                                <Text>{type}</Text>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </View>
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
                <Dialog
                  open={detailModalOpen}
                  onOpenChange={setDetailModalOpen}
                >
                  <DialogContent onClose={() => setDetailModalOpen(false)}>
                    <DialogHeader>
                      <DialogTitle>Transaction Details</DialogTitle>
                      <DialogDescription>
                        Complete information about this transaction.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                      <View className="space-y-4">
                        <View className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">
                            Description
                          </Label>
                          <Text className="text-base font-semibold">
                            {selectedTransaction.description}
                          </Text>
                        </View>

                        <View className="flex-row space-x-4">
                          <View className="flex-1 space-y-2">
                            <Label className="text-sm font-medium text-gray-600">
                              Amount
                            </Label>
                            <Text
                              className={`text-xl font-bold ${getAmountColor(
                                selectedTransaction.type
                              )}`}
                            >
                              {selectedTransaction.type === "income"
                                ? "+"
                                : "-"}
                              {formatCurrency(
                                Math.abs(selectedTransaction.amount)
                              )}
                            </Text>
                          </View>
                          <View className="flex-1 space-y-2">
                            <Label className="text-sm font-medium text-gray-600">
                              Type
                            </Label>
                            <Text className="text-base capitalize">
                              {selectedTransaction.type}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row space-x-4">
                          <View className="flex-1 space-y-2">
                            <Label className="text-sm font-medium text-gray-600">
                              Category
                            </Label>
                            <Text className="text-base">
                              {selectedTransaction.category}
                            </Text>
                          </View>
                          <View className="flex-1 space-y-2">
                            <Label className="text-sm font-medium text-gray-600">
                              Status
                            </Label>
                            <Text className="text-base capitalize">
                              {selectedTransaction.status}
                            </Text>
                          </View>
                        </View>

                        <View className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">
                            Merchant
                          </Label>
                          <Text className="text-base">
                            {selectedTransaction.merchant}
                          </Text>
                        </View>

                        <View className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">
                            Date
                          </Label>
                          <Text className="text-base">
                            {formatFullDate(selectedTransaction.date)}
                          </Text>
                        </View>

                        <View className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">
                            Transaction ID
                          </Label>
                          <Text className="text-sm text-gray-500 font-mono">
                            {selectedTransaction.id}
                          </Text>
                        </View>
                      </View>
                    )}
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onPress={() => setDetailModalOpen(false)}
                        className="w-full"
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Edit Single Transaction Modal */}
                <Dialog
                  open={editSingleTransactionOpen}
                  onOpenChange={setEditSingleTransactionOpen}
                >
                  <DialogContent
                    className="max-w-[425px]"
                    onClose={() => setEditSingleTransactionOpen(false)}
                  >
                    <DialogHeader>
                      <DialogTitle>Edit Transaction</DialogTitle>
                      <DialogDescription>
                        Update the details of this transaction.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                      <View className="space-y-4 py-4">
                        <View className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            defaultValue={selectedTransaction.description}
                            className="w-full"
                          />
                        </View>

                        <View className="flex-row space-x-4">
                          <View className="flex-1 space-y-2">
                            <Label>Amount</Label>
                            <Input
                              defaultValue={Math.abs(
                                selectedTransaction.amount
                              ).toString()}
                              className="w-full"
                            />
                          </View>
                          <View className="flex-1 space-y-2">
                            <Label>Type</Label>
                            <Select
                              value={selectedTransaction.type}
                              onValueChange={() => {}}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                              </SelectContent>
                            </Select>
                          </View>
                        </View>

                        <View className="flex-row space-x-4">
                          <View className="flex-1 space-y-2">
                            <Label>Category</Label>
                            <Input
                              defaultValue={selectedTransaction.category}
                              className="w-full"
                            />
                          </View>
                          <View className="flex-1 space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={selectedTransaction.status}
                              onValueChange={() => {}}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </View>
                        </View>

                        <View className="space-y-2">
                          <Label>Merchant</Label>
                          <Input
                            defaultValue={selectedTransaction.merchant}
                            className="w-full"
                          />
                        </View>

                        <View className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            defaultValue={selectedTransaction.date}
                            className="w-full"
                          />
                        </View>
                      </View>
                    )}
                    <DialogFooter className="gap-2 flex-row">
                      <Button
                        variant="outline"
                        onPress={() => setEditSingleTransactionOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1">Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Edit All Transactions Modal */}
                <Dialog
                  open={editTransactionsOpen}
                  onOpenChange={setEditTransactionsOpen}
                >
                  <DialogContent
                    className="max-w-[600px]"
                    onClose={() => setEditTransactionsOpen(false)}
                  >
                    <DialogHeader>
                      <DialogTitle>Edit All Transactions</DialogTitle>
                      <DialogDescription>
                        Modify your existing transactions and their details.
                      </DialogDescription>
                    </DialogHeader>

                    <View className="space-y-6 py-4">
                      {filteredTransactions.map((transaction, index) => (
                        <View
                          key={transaction.id}
                          className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4"
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="text-base font-medium">
                              {transaction.description}
                            </Text>
                            <Text className="text-sm text-gray-500">
                              {formatDate(transaction.date)}
                            </Text>
                          </View>
                          <View className="flex-row space-x-2">
                            <View className="flex-1 space-y-2">
                              <Label>Description</Label>
                              <Input
                                defaultValue={transaction.description}
                                className="w-full"
                              />
                            </View>
                            <View className="flex-1 space-y-2">
                              <Label>Amount</Label>
                              <Input
                                defaultValue={Math.abs(
                                  transaction.amount
                                ).toString()}
                                className="w-full"
                              />
                            </View>
                          </View>
                          <View className="flex-row space-x-2">
                            <View className="flex-1 space-y-2">
                              <Label>Category</Label>
                              <Input
                                defaultValue={transaction.category}
                                className="w-full"
                              />
                            </View>
                            <View className="flex-1 space-y-2">
                              <Label>Merchant</Label>
                              <Input
                                defaultValue={transaction.merchant}
                                className="w-full"
                              />
                            </View>
                          </View>
                          <Text className="text-sm text-gray-600">
                            Type: {transaction.type} | Status:
                            {transaction.status}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <DialogFooter className="gap-2 flex-row border-t border-gray-200 pt-4 mt-4">
                      <Button
                        variant="outline"
                        onPress={() => setEditTransactionsOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1">Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
