/**
 * Fast Loading Components using Skeleton for React Native
 *
 * Optimized for speed and performance:
 * - Minimal DOM elements
 * - No custom animations
 * - Lightweight rendering
 *
 * Usage Examples:
 *
 * // For budget pages
 * {loading ? <BudgetListSkeleton /> : <BudgetList />}
 *
 * // For goals pages
 * {loading ? <GoalsListSkeleton /> : <GoalsList />}
 *
 * // For dashboard
 * {loading ? <DashboardSkeleton /> : <Dashboard />}
 *
 * // For accounts pages
 * {loading ? <AccountsListSkeleton /> : <AccountsList />}
 *
 * // For transactions pages
 * {loading ? <TransactionsListSkeleton /> : <TransactionsList />}
 *
 * // For add/edit forms (NEW - FAST)
 * {loading ? <FormSkeleton /> : <Form />}
 *
 * // For simple loading states
 * {loading ? <SimpleLoading /> : <Content />}
 *
 * // For quick inline loading
 * {loading ? <QuickLoading /> : <Text />}
 *
 * // For page-level loading
 * {loading ? <PageLoading /> : <Page />}
 */

import React from "react";
import { View, Text } from "react-native";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";

// General page loading component (optimized)
export function PageLoading() {
  return (
    <View className="flex items-center justify-center py-6">
      <Text className="text-gray-500">Loading...</Text>
    </View>
  );
}

// Budget list loading skeleton
export function BudgetListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

// Goals list loading skeleton
export function GoalsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

// Fast Dashboard loading skeleton (ultra-lightweight)
export function DashboardSkeleton() {
  return (
    <View className="space-y-6">
      {/* Stats Cards */}
      <View className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </View>

      {/* Chart */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </View>
  );
}

// Accounts loading skeleton
export function AccountsListSkeleton() {
  return (
    <View className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <View className="flex-row justify-between items-start">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </View>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </View>
  );
}

// Transactions loading skeleton
export function TransactionsListSkeleton() {
  return (
    <View className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </View>
              <Skeleton className="h-6 w-20" />
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}

// Simple loading component for small areas
export function SimpleLoading({ className }: { className?: string }) {
  return (
    <View className={className}>
      <Text className="text-gray-500 text-center">Loading...</Text>
    </View>
  );
}

// Form loading skeleton for add pages (faster, lighter)
export function FormSkeleton() {
  return (
    <View className="space-y-6">
      <View className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </View>
      <View className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </View>
      <View className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </View>
      <Skeleton className="h-10 w-32" />
    </View>
  );
}

// Quick loading for small components (ultra-fast)
export function QuickLoading() {
  return <Skeleton className="h-4 w-20" />;
}

// Instant loading for immediate display (minimal DOM)
export function InstantSkeleton() {
  return <Skeleton className="h-6 w-32" />;
}
