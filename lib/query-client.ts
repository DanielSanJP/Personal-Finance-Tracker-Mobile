import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized defaults for our finance app
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for financial data accuracy
        refetchOnWindowFocus: true,
        // Don't refetch on reconnect by default (we'll handle this selectively)
        refetchOnReconnect: false,
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
