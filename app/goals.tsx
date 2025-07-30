import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUserGoals, formatCurrency } from "../lib/data";
import Nav from "../components/nav";

export default function Goals() {
  const goals = getCurrentUserGoals();

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Financial Goals
          </Text>
          <Text className="text-gray-600 mb-6">
            Track your progress towards financial milestones
          </Text>

          {/* Goals Summary */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <Text className="text-sm text-gray-600 mb-1">Active Goals</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {goals.filter((goal) => goal.status === "active").length}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <Text className="text-sm text-gray-600 mb-1">Completed</Text>
              <Text className="text-2xl font-bold text-green-600">
                {goals.filter((goal) => goal.status === "completed").length}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <Text className="text-sm text-gray-600 mb-1">Total Value</Text>
              <Text className="text-xl font-bold text-gray-900">
                {formatCurrency(
                  goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
                )}
              </Text>
            </View>
          </View>

          {/* Goals List */}
          <View className="gap-4">
            {goals.map((goal) => {
              const progressPercentage = getProgressPercentage(
                goal.currentAmount,
                goal.targetAmount
              );
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const priorityColor = getPriorityColor(goal.priority);

              return (
                <View
                  key={goal.id}
                  className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm"
                >
                  {/* Goal Header */}
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="font-semibold text-gray-900 text-lg mb-1">
                        {goal.name}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {goal.category}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View
                        className={`px-2 py-1 rounded-full ${priorityColor}`}
                      >
                        <Text className="text-xs font-medium capitalize">
                          {goal.priority}
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-1 rounded-full mt-1 ${
                          goal.status === "completed"
                            ? "bg-green-100"
                            : goal.status === "active"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            goal.status === "completed"
                              ? "text-green-800"
                              : goal.status === "active"
                              ? "text-blue-800"
                              : "text-gray-800"
                          }`}
                        >
                          {goal.status === "completed"
                            ? "Completed"
                            : goal.status === "active"
                            ? "Active"
                            : "Paused"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Display */}
                  <View className="mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-gray-600">
                        {formatCurrency(goal.currentAmount)} of{" "}
                        {formatCurrency(goal.targetAmount)}
                      </Text>
                      <Text className="text-sm font-medium text-gray-900">
                        {progressPercentage.toFixed(1)}%
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-3 bg-gray-200 rounded-full">
                      <View
                        className={`h-3 rounded-full ${
                          goal.status === "completed"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </View>
                  </View>

                  {/* Goal Details */}
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm text-gray-600">Target Date</Text>
                      <Text className="text-sm font-medium text-gray-900">
                        {formatDate(goal.targetDate)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm text-gray-600">
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : daysRemaining === 0
                          ? "Due today"
                          : `${Math.abs(daysRemaining)} days overdue`}
                      </Text>
                      <Text className="text-sm font-medium text-gray-900">
                        {formatCurrency(goal.targetAmount - goal.currentAmount)}{" "}
                        remaining
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2 mt-4">
                    <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2">
                      <Text className="text-white font-medium text-center text-sm">
                        Add Progress
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-gray-100 rounded-lg py-2">
                      <Text className="text-gray-700 font-medium text-center text-sm">
                        Edit Goal
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add Goal Button */}
          <TouchableOpacity className="bg-black rounded-lg p-4 mt-6">
            <Text className="text-white font-semibold text-center text-base">
              Create New Goal
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
