import { supabase } from './supabase'
import type { User, LoginCredentials, RegisterCredentials } from './types'

// Normalize user data to ensure consistent format
// Note: email and display_name should always come from auth, not database
const normalizeUserData = (userData: {
  id: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  initials?: string;
  avatar?: string | null;
  [key: string]: unknown;
}): Omit<User, 'email' | 'display_name'> => {
  const firstName = userData.firstName || userData.first_name || '';
  const lastName = userData.lastName || userData.last_name || '';
  const initials = userData.initials || 
                   `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';

  return {
    id: userData.id,
    first_name: firstName,
    last_name: lastName,
    initials: initials,
    avatar: userData.avatar || null,
    // Legacy support
    firstName,
    lastName,
  };
};

// Sign in with email and password
export const signInWithEmail = async ({ email, password }: LoginCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Sign up with email and password
export const signUpWithEmail = async ({ email, password, firstName, lastName }: RegisterCredentials) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // If user was created successfully, also create user profile
  if (data.user && data.session) {
    try {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          display_name: `${firstName} ${lastName}`.trim(),
          initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase(),
          avatar: null,
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    } catch (err) {
      console.error('Error creating user profile:', err)
    }
  }

  return data
}

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!error && user) {
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      let userData: User
      if (profileError || !profile) {
        // If no profile exists, return the auth user data
        userData = {
          id: user.id,
          email: user.email || '', // Always use email from auth table
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          display_name: user.user_metadata?.display_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || '',
          initials: `${user.user_metadata?.first_name?.[0] || ''}${user.user_metadata?.last_name?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
        }
      } else {
        // Merge auth data with profile data, always using auth for email and display_name
        userData = {
          ...normalizeUserData(profile),
          email: user.email || '', // Override with auth email
          display_name: user.user_metadata?.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || '', // Override with auth display_name
        }
      }
      
      return userData
    }

    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return session
}

// Listen for auth state changes
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((_event: any, session: any) => {
    callback(session)
  })
}

// Guest account constant
export const GUEST_USER_ID = '55e3b0e6-b683-4cab-aa5b-6a5b192bde7d'

// Check if current user is guest
export const isGuestUser = (user: User | null): boolean => {
  return user?.id === GUEST_USER_ID
}

// Sign in as guest user
export const signInAsGuest = async () => {
  console.log('🔍 Guest login attempt for mobile app');
  
  try {
    // Sign in with the actual guest account credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'guest@demo.app', // Replace with your actual guest email
      password: 'guest-password-123' // Replace with your actual guest password
    })
    
    if (error) {
      console.error('🔥 Guest login error:', error)
      throw new Error('Guest mode temporarily unavailable')
    }
    
    // Verify this is the correct guest user
    if (data.user?.id !== GUEST_USER_ID) {
      console.error('🔥 Wrong user ID for guest account')
      throw new Error('Guest account configuration error')
    }
    
    console.log('🔍 Guest login successful for mobile app');
    return data
    
  } catch (error) {
    console.error('🔥 Guest login failed:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Guest mode unavailable')
  }
}

// Check if current user is the guest user
export const isCurrentUserGuest = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id === GUEST_USER_ID
  } catch {
    return false
  }
}
