import React, { useState } from "react";
import {
  ActionSheetIOS,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Transaction } from "../../lib/types";

interface TransactionActionMenuProps {
  transaction: Transaction;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionActionMenu({
  transaction,
  onView,
  onEdit,
  onDelete,
}: TransactionActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    if (Platform.OS === "ios") {
      // Use native iOS ActionSheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "View details",
            "Edit transaction",
            "Delete transaction",
          ],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onView();
          } else if (buttonIndex === 2) {
            onEdit();
          } else if (buttonIndex === 3) {
            onDelete();
          }
        }
      );
    } else {
      // Use custom modal for Android and web
      setIsOpen(true);
    }
  };

  return (
    <>
      <Pressable
        className="h-8 w-8 p-0 items-center justify-center"
        onPress={handlePress}
      >
        <Text className="text-gray-600 text-xl">⋯</Text>
      </Pressable>

      {/* Custom Bottom Sheet for Android/Web */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-4">
              {/* Handle bar */}
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

              {/* Title */}
              <Text className="text-lg font-semibold text-gray-900 mb-4 px-2">
                Actions
              </Text>

              {/* Transaction Info */}
              <View className="bg-gray-50 rounded-lg p-3 mb-4">
                <Text className="text-sm font-medium text-gray-900">
                  {transaction.description}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  ${Math.abs(transaction.amount).toFixed(2)} •{" "}
                  {transaction.category}
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="space-y-2">
                <TouchableOpacity
                  className="bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50"
                  onPress={() => {
                    setIsOpen(false);
                    onView();
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-medium text-gray-900 text-center">
                    View details
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50"
                  onPress={() => {
                    setIsOpen(false);
                    onEdit();
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-medium text-gray-900 text-center">
                    Edit transaction
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white border border-red-200 rounded-lg p-4 active:bg-red-50"
                  onPress={() => {
                    setIsOpen(false);
                    onDelete();
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-medium text-red-600 text-center">
                    Delete transaction
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gray-100 rounded-lg p-4 mt-2 active:bg-gray-200"
                  onPress={() => setIsOpen(false)}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-medium text-gray-700 text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Safe area padding for bottom */}
              <View className="h-8" />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
