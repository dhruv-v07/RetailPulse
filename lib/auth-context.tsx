"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  createdAt: string
  lastLoginAt: string
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    watchlist: string[]
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('Attempting to sign up with:', email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('Sign up successful:', user.uid)

      // Update the user's display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      })

      // Try to create user profile in Firestore (optional)
      try {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: {
            theme: 'dark',
            notifications: true,
            watchlist: []
          }
        }

        await setDoc(doc(db, 'users', user.uid), userProfile)
        setUserProfile(userProfile)
        console.log('User profile created in Firestore')
      } catch (firestoreError) {
        console.warn('Could not create Firestore profile, but user was created:', firestoreError)
        // User is still created in Firebase Auth, just no Firestore profile
      }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('Sign in successful:', user.uid)

      // Update last login time (only if userProfile exists)
      if (userProfile) {
        try {
          await updateUserProfile({ lastLoginAt: new Date().toISOString() })
        } catch (profileError) {
          console.warn('Could not update profile, but login was successful:', profileError)
        }
      }
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Error sending password reset email:', error)
      throw error
    }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, updates, { merge: true })
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
