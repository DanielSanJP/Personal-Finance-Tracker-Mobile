import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";

import { PieChart } from "../components/pie-chart";
import { BarChart } from "../components/bar-chart";

const Reports = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8 space-y-8 gap-8">
          <PieChart />
          <BarChart />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Reports;
