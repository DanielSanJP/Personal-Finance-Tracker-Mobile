import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BreadcrumbsProps {
  className?: string;
}

export default function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show breadcrumbs on home page or login
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  // Map of routes to display names - exact same as nav component
  const routeMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/accounts": "Accounts",
    "/budgets": "Budgets",
    "/goals": "Goals",
    "/addtransaction": "Add",
    "/addincome": "Add",
    "/profile": "Profile",
    "/settings": "Settings",
    "/preferences": "Preferences",
    "/help": "Help & Support",
  };

  // Build breadcrumb items
  const breadcrumbItems = [];

  // Always start with Dashboard - use same path as nav
  const isDashboard = pathname === "/dashboard";
  breadcrumbItems.push({
    label: "Dashboard",
    href: "/dashboard",
    isCurrentPage: isDashboard,
  });

  // Handle special add transaction route: dashboard/transactions/add
  if (pathname === "/addtransaction") {
    breadcrumbItems.push({
      label: "Transactions",
      href: "/transactions",
      isCurrentPage: false,
    });
    breadcrumbItems.push({
      label: "Add",
      href: "/addtransaction",
      isCurrentPage: true,
    });
  }
  // Handle special add income route: dashboard/income/add
  else if (pathname === "/addincome") {
    breadcrumbItems.push({
      label: "Income",
      href: "/transactions", // Link back to transactions since there's no separate income page
      isCurrentPage: false,
    });
    breadcrumbItems.push({
      label: "Add",
      href: "/addincome",
      isCurrentPage: true,
    });
  }
  // Handle special add account route: dashboard/accounts/add
  else if (pathname === "/addaccount") {
    breadcrumbItems.push({
      label: "Accounts",
      href: "/accounts",
      isCurrentPage: false,
    });
    breadcrumbItems.push({
      label: "Add Account",
      href: "/addaccount",
      isCurrentPage: true,
    });
  }
  // Add current page if not dashboard and not special add routes
  else if (!isDashboard && routeMap[pathname]) {
    breadcrumbItems.push({
      label: routeMap[pathname],
      href: pathname,
      isCurrentPage: true,
    });
  }

  const handleNavigation = (href: string) => {
    console.log("Breadcrumb navigation to:", href);
    try {
      router.push(href as any);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {breadcrumbItems.map((item, index) => (
        <View key={item.href} style={styles.breadcrumbRow}>
          {item.isCurrentPage ? (
            <Text style={styles.currentPageText}>{item.label}</Text>
          ) : (
            <TouchableOpacity
              onPress={() => handleNavigation(item.href)}
              style={styles.linkButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.linkText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          {index < breadcrumbItems.length - 1 && (
            <Text style={styles.separator}>›</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currentPageText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#09090b", // text-foreground
  },
  linkButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linkText: {
    fontSize: 14,
    color: "#71717a", // text-muted-foreground
  },
  separator: {
    fontSize: 12,
    color: "#71717a", // text-muted-foreground
    marginHorizontal: 2,
  },
});
