import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/query-keys";

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  display_name: string | null;
  initials: string | null;
  avatar: string | null;
  created_at: string;
}

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  display_name?: string;
}

// Profile data functions
async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return null;
    }

    // Get data from users table
    const { data: dbProfile, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return null;
    }

    // Merge auth data with database data
    const profile: UserProfile = {
      id: user.id,
      first_name: user.user_metadata?.first_name || dbProfile.first_name || "",
      last_name: user.user_metadata?.last_name || dbProfile.last_name || "",
      email: user.email || "",
      display_name: user.user_metadata?.display_name || null,
      initials: user.user_metadata?.initials || dbProfile.initials,
      avatar: user.user_metadata?.avatar || dbProfile.avatar,
      created_at: dbProfile.created_at,
    };

    return profile;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

async function updateUserProfile(
  profileData: UpdateProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Generate initials and display name
    const initials = `${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}`.toUpperCase();
    const display_name = profileData.display_name || `${profileData.first_name} ${profileData.last_name}`;

    // Update auth user metadata
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        display_name,
        initials,
      }
    });

    if (updateAuthError) {
      console.error('Auth update error:', updateAuthError);
      return { success: false, error: updateAuthError.message };
    }

    // Update database record
    const { error: updateDbError } = await supabase
      .from("users")
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        initials,
      })
      .eq("id", user.id);

    if (updateDbError) {
      console.error('Database update error:', updateDbError);
      return { success: false, error: updateDbError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

function validateProfileData(data: UpdateProfileData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate first name
  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push("First name is required");
  } else if (data.first_name.trim().length < 2) {
    errors.push("First name must be at least 2 characters long");
  } else if (data.first_name.trim().length > 50) {
    errors.push("First name must be less than 50 characters");
  }

  // Validate last name
  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push("Last name is required");
  } else if (data.last_name.trim().length < 2) {
    errors.push("Last name must be at least 2 characters long");
  } else if (data.last_name.trim().length > 50) {
    errors.push("Last name must be less than 50 characters");
  }

  // Validate display name (optional)
  if (data.display_name && data.display_name.trim().length > 100) {
    errors.push("Display name must be less than 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export { getUserProfile, updateUserProfile, validateProfileData };

// Legacy query keys for backwards compatibility
export const PROFILE_QUERY_KEYS = {
  userProfile: ["profile", "user"] as const,
} as const;

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Mutation hook to update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (result: { success: boolean; error?: string }) => {
      if (result.success) {
        // Invalidate user profile and auth data
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
        // Legacy key
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.userProfile });
      }
    },
    onError: (error: Error) => {
      console.error("Error updating profile:", error);
    },
  });
}
