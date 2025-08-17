import { supabase } from './supabase'
import type { User, LoginCredentials, RegisterCredentials } from './types'

// Normalize user data to ensure consistent format
const normalizeUserData = (userData: {
  id: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  displayName?: string;
  display_name?: string;
  initials?: string;
  avatar?: string | null;
  [key: string]: unknown;
}): User => {
  const firstName = userData.firstName || userData.first_name || '';
  const lastName = userData.lastName || userData.last_name || '';
  const displayName = userData.displayName || userData.display_name || 
                     `${firstName} ${lastName}`.trim() || userData.email || 'User';
  const initials = userData.initials || 
                   `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 
                   userData.email?.[0]?.toUpperCase() || 'U';

  return {
    id: userData.id,
    first_name: firstName,
    last_name: lastName,
    email: userData.email || '',
    display_name: displayName,
    initials: initials,
    avatar: userData.avatar || null,
    // Legacy support
    firstName,
    lastName,
    displayName,
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
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          display_name: user.user_metadata?.display_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || '',
          initials: `${user.user_metadata?.first_name?.[0] || ''}${user.user_metadata?.last_name?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
        }
      } else {
        userData = normalizeUserData(profile)
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
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

// Guest account constant
export const GUEST_USER_ID = '55e3b0e6-b683-4cab-aa5b-6a5b192bde7d'

// Check if current user is guest
export const isGuestUser = (user: User | null): boolean => {
  return user?.id === GUEST_USER_ID
}
