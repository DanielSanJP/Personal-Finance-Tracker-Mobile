import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Linking,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Nav from "../components/nav";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../hooks/queries/useAuth";

export default function HelpPage() {
  const router = useRouter();
  const { user, isLoading: loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleEmailSupport = () => {
    const email = "daniel.m514@outlook.com";
    const subject = "Personal Finance Tracker Support Request";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open email client");
    });
  };

  const email = "daniel.m514@outlook.com";
  const phoneNumber = "tel:022-152-8858";

  const handlePhoneSupport = () => {
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert("Error", "Unable to open phone dialer");
    });
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

      <ScrollView className="flex-1">
        <View className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Feather name="help-circle" size={24} color="#374151" />
                <CardTitle className="text-2xl font-bold">
                  Help & Support
                </CardTitle>
              </View>
              <Text className="text-gray-600 mt-2">
                Get help with your Personal Finance Tracker experience.
              </Text>
            </CardHeader>

            <CardContent className="gap-8">
              {/* FAQ Section */}
              <View className="gap-4">
                <View className="flex-row items-center gap-2">
                  <Feather name="file-text" size={20} color="#374151" />
                  <Text className="text-lg font-medium">
                    Frequently Asked Questions
                  </Text>
                </View>

                <View className="gap-4">
                  <View className="border border-gray-200 rounded-lg p-4 bg-white">
                    <Text className="font-medium mb-2">
                      How do I add a new account?
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Navigate to the Accounts page and tap &quot;Add
                      Account&quot;. Fill in your account details and tap save.
                    </Text>
                  </View>

                  <View className="border border-gray-200 rounded-lg p-4 bg-white">
                    <Text className="font-medium mb-2">
                      How do I categorize transactions?
                    </Text>
                    <Text className="text-sm text-gray-600">
                      When adding transactions, you can select from predefined
                      categories or create custom ones to organize your
                      spending.
                    </Text>
                  </View>

                  <View className="border border-gray-200 rounded-lg p-4 bg-white">
                    <Text className="font-medium mb-2">
                      Can I export my financial data?
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Yes! Visit the Reports page where you can export your data
                      in CSV or PDF format for your records.
                    </Text>
                  </View>

                  <View className="border border-gray-200 rounded-lg p-4 bg-white">
                    <Text className="font-medium mb-2">
                      How do I set up budgets?
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Go to the Budgets page to create spending limits for
                      different categories and track your progress throughout
                      the month.
                    </Text>
                  </View>
                </View>
              </View>

              <Separator />

              {/* Contact Support */}
              <View className="gap-4">
                <View className="flex-row items-center gap-2">
                  <Feather name="message-circle" size={20} color="#374151" />
                  <Text className="text-lg font-medium">Contact Support</Text>
                </View>

                <View className="flex-row gap-4 flex-wrap">
                  <View className="flex-1 min-w-[280px]">
                    <Card className="p-4">
                      <View className="flex-row items-center gap-3 mb-3">
                        <Feather name="mail" size={20} color="#2563eb" />
                        <Text className="font-medium">Email Support</Text>
                      </View>
                      <Text className="text-sm text-gray-600 mb-3">
                        Get help via email. We typically respond within 24
                        hours.
                      </Text>
                      <Button
                        variant="outline"
                        onPress={handleEmailSupport}
                        className="w-full"
                      >
                        <View className="flex-col items-center gap-2">
                          <View className="flex-row items-center gap-2">
                            <Feather
                              name="external-link"
                              size={16}
                              color="#374151"
                            />
                            <Text className="font-medium"> {email}</Text>
                          </View>
                          {/* <Text className="text-xs text-gray-600 text-center">
                            {email}
                          </Text> */}
                        </View>
                      </Button>
                    </Card>
                  </View>

                  <View className="flex-1 min-w-[280px]">
                    <Card className="p-4">
                      <View className="flex-row items-center gap-3 mb-3">
                        <Feather name="phone" size={20} color="#16a34a" />
                        <Text className="font-medium">Phone Support</Text>
                      </View>
                      <Text className="text-sm text-gray-600 mb-3">
                        Speak with our support team during business hours.
                      </Text>
                      <Button
                        variant="outline"
                        onPress={handlePhoneSupport}
                        className="w-full"
                      >
                        <View className="flex-row items-center gap-2">
                          <Feather name="phone" size={16} color="#374151" />
                          <Text className="font-medium">
                            {phoneNumber.replace("tel:", "")}
                          </Text>
                        </View>
                      </Button>
                    </Card>
                  </View>
                </View>
              </View>

              <Separator />

              {/* Resources */}
              <View className="gap-4">
                <Text className="text-lg font-medium">Resources</Text>

                <View className="gap-4">
                  <Pressable
                    onPress={() => {
                      /* TODO: Implement user guide */
                    }}
                  >
                    <View className="border border-gray-200 rounded-lg p-4 bg-white">
                      <View className="flex-col items-center gap-2">
                        <Feather name="file-text" size={24} color="#374151" />
                        <Text className="font-medium text-center">
                          User Guide
                        </Text>
                        <Text className="text-xs text-gray-600 text-center">
                          Complete documentation
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      /* TODO: Implement community forum */
                    }}
                  >
                    <View className="border border-gray-200 rounded-lg p-4 bg-white">
                      <View className="flex-col items-center gap-2">
                        <Feather
                          name="message-circle"
                          size={24}
                          color="#374151"
                        />
                        <Text className="font-medium text-center">
                          Community Forum
                        </Text>
                        <Text className="text-xs text-gray-600 text-center">
                          Connect with other users
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      /* TODO: Implement video tutorials */
                    }}
                  >
                    <View className="border border-gray-200 rounded-lg p-4 bg-white">
                      <View className="flex-col items-center gap-2">
                        <Feather name="help-circle" size={24} color="#374151" />
                        <Text className="font-medium text-center">
                          Video Tutorials
                        </Text>
                        <Text className="text-xs text-gray-600 text-center">
                          Step-by-step guides
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              </View>

              <Separator />

              {/* App Information */}
              <View className="gap-4">
                <Text className="text-lg font-medium">App Information</Text>

                <View className="flex-row gap-4 flex-wrap">
                  <View className="flex-1 min-w-[120px]">
                    <Text className="font-medium text-gray-600 text-sm">
                      Version:
                    </Text>
                    <Text className="text-sm">1.0.0</Text>
                  </View>
                  <View className="flex-1 min-w-[120px]">
                    <Text className="font-medium text-gray-600 text-sm">
                      Last Updated:
                    </Text>
                    <Text className="text-sm">August 2025</Text>
                  </View>
                  <View className="flex-1 min-w-[120px]">
                    <Text className="font-medium text-gray-600 text-sm">
                      Platform:
                    </Text>
                    <Text className="text-sm">Mobile Application</Text>
                  </View>
                  <View className="flex-1 min-w-[120px]">
                    <Text className="font-medium text-gray-600 text-sm">
                      Status:
                    </Text>
                    <Text className="text-sm text-green-600">
                      All Systems Operational
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
