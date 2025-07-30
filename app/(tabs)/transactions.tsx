import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUserTransactions, formatCurrency } from "../../lib/data";
import Nav from "../../components/nav";

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
            {transactions.length} transactions
          </Text>

          {/* Search and Filter */}
          <View className="bg-white border-b border-gray-200 px-6 py-4">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
              placeholder="Search transactions..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className={`px-4 py-2 rounded-full mr-3 ${
                      selectedCategory === category
                        ? "bg-blue-500"
                        : "bg-gray-200"
                    }`}
                    onPress={() => setSelectedCategory(category)}
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
          </View>

          {/* Transactions List */}
          <ScrollView className="flex-1">
            <View className="px-6 py-4">
              {filteredTransactions.map((transaction) => (
                <View
                  key={transaction.id}
                  className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        {transaction.description}
                      </Text>
                      <Text className="text-sm text-gray-600 mb-1">
                        {transaction.merchant}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-lg font-bold ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full mt-1 ${
                          transaction.type === "income"
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            transaction.type === "income"
                              ? "text-green-800"
                              : "text-gray-700"
                          }`}
                        >
                          {transaction.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Add Transaction Button */}
          <View className="absolute bottom-6 right-6">
            <TouchableOpacity className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
              <Text className="text-white text-2xl font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
