import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUserTransactions, formatCurrency } from "../lib/data";
import Nav from "../components/nav";

export default function Transactions() {
  const transactions = getCurrentUserTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Income",
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Transactions
          </Text>
          <Text className="text-gray-600 mb-6">
            Track your spending and income
          </Text>

          {/* Search Bar */}
          <View className="mb-4">
            <TextInput
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base"
              placeholder="Search transactions..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <View className="flex-row gap-2 px-1">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === category
                      ? "bg-black border-black"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Transaction List */}
          <View className="gap-3">
            {filteredTransactions.map((transaction) => (
              <View
                key={transaction.id}
                className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-4">
                    <Text className="font-semibold text-gray-900 text-base">
                      {transaction.description}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {transaction.merchant}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`font-bold text-lg ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View
                    className={`px-2 py-1 rounded-full ${
                      transaction.type === "income"
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        transaction.type === "income"
                          ? "text-green-800"
                          : "text-gray-800"
                      }`}
                    >
                      {transaction.category}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {transaction.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* No results message */}
          {filteredTransactions.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-gray-500 text-lg">
                No transactions found
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filter criteria
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
