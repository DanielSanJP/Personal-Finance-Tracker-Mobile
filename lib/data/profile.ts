import { supabase } from "../supabase";

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

/**
 * Get the current user's profile information
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      return null;
    }

    // Get data from users table
    const { data: dbProfile, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.error("Error fetching user profile from database:", dbError);
      return null;
    }

    // Merge auth data with database data (email and display_name come from auth only)
    const profile: UserProfile = {
      id: user.id,
      first_name: user.user_metadata?.first_name || dbProfile.first_name || "",
      last_name: user.user_metadata?.last_name || dbProfile.last_name || "",
      email: user.email || "", // Always from auth table
      display_name: user.user_metadata?.display_name || null, // Always from auth metadata
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

/**
 * Update the current user's profile information
 */
export async function updateUserProfile(
  profileData: UpdateProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Generate initials from first and last name
    const initials = `${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}`.toUpperCase();

    // Generate display name if not provided
    const display_name = profileData.display_name || `${profileData.first_name} ${profileData.last_name}`;

    // Update auth user metadata first
    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        display_name: display_name.trim(),
        initials,
      }
    });

    if (authUpdateError) {
      console.error("Error updating auth user metadata:", authUpdateError);
      return {
        success: false,
        error: authUpdateError.message || "Failed to update auth profile",
      };
    }

    // Also update the users table to keep it in sync (only first_name, last_name, initials)
    const updateData = {
      first_name: profileData.first_name.trim(),
      last_name: profileData.last_name.trim(),
      initials,
    };

    const { error: dbError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (dbError) {
      console.error("Error updating users table:", dbError);
      console.error("Error details:", JSON.stringify(dbError, null, 2));
      console.error("Update data:", updateData);
      // Don't return error here since auth update succeeded
      // The users table sync is secondary
      console.warn("Auth profile updated successfully, but users table sync failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Validate profile data before updating
 */
export function validateProfileData(data: UpdateProfileData): {
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
