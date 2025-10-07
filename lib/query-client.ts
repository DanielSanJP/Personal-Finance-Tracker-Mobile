import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized defaults for our finance app
// Following TanStack Query best practices
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        // React Query docs: "Set staleTime to avoid excessive refetches"
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times (React Query default)
        retry: 3,
        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for financial data accuracy
        refetchOnWindowFocus: true,
        // Refetch on reconnect for fresh financial data
        refetchOnReconnect: true, // Changed: Better for financial data
        // Don't refetch on mount if data is fresh (within staleTime)
        refetchOnMount: true, // Ensures fresh data on navigation
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        // Retry after 1 second
        retryDelay: 1000,
      },
    },
  });
};

// Export a singleton instance for client-side usage
let queryClient: QueryClient | undefined;

export const getQueryClient = () => {
  // Always create a new query client for React Native
  // (no server-side rendering to worry about)
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};
