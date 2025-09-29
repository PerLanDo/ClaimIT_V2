import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database, UserRole } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: {
      full_name: string;
      role: UserRole;
      school_id_number?: string;
      department?: string;
    }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        if (isMounted) {
          setProfile(null);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    const loadUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error loading user profile:', error);

          // If user doesn't exist in public.users, try to create it from auth.users metadata
          if (error.code === 'PGRST116') {
            console.log(
              'User profile not found, attempting to create from auth metadata...'
            );
            await createUserProfileFromAuth(userId);
            return;
          }
          return;
        }

        if (isMounted) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    const createUserProfileFromAuth = async (userId: string) => {
      try {
        // Get the user's auth data
        const { data: authUser, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authUser.user) {
          console.error('Cannot get auth user data:', authError);
          return;
        }

        const metadata = authUser.user.user_metadata || {};

        console.log('Auth user metadata:', metadata);
        console.log('Auth user email:', authUser.user.email);

        // For now, let's just log the issue and let the user know they need to contact support
        console.error(
          'User profile missing - this should have been created by the database trigger'
        );
        console.log('User ID:', userId);
        console.log('Email:', authUser.user.email);

        // You can manually create the record in Supabase Dashboard for now
      } catch (error) {
        console.error('Error in createUserProfileFromAuth:', error);
      }
    };

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      full_name: string;
      role: UserRole;
      school_id_number?: string;
      department?: string;
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
          school_id_number: userData.school_id_number,
          department: userData.department,
        },
      },
    });

    if (error) {
      throw error;
    }

    // The user profile will be automatically created by the database trigger
    // No need to manually insert into the users table
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        signIn,
        signUp,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
