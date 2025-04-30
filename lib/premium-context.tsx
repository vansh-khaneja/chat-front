'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'

// Define the context type
type PremiumContextType = {
  isPremium: boolean
  loading: boolean
  refreshPremiumStatus: () => Promise<void>
}

// Create context with default values
const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  loading: true,
  refreshPremiumStatus: async () => {}
})

// Hook to use premium context
export const usePremium = () => useContext(PremiumContext)

// Provider component
export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()

  // Function to check premium status
  const checkPremiumStatus = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('https://lexscope-production.up.railway.app/get_user', {
        auth_id: userId
      })
      
      // Check if the response has the expected structure
      if (response.data && response.data.user_data && response.data.user_data.length > 0) {
        const userIsPremium = response.data.user_data[0][3] === true
        setIsPremium(userIsPremium)
        console.log('Premium status loaded once:', userIsPremium)
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check premium status when userId changes
  useEffect(() => {
    checkPremiumStatus()
  }, [userId])

  // Provide a way to refresh the premium status (useful after payments)
  const refreshPremiumStatus = async () => {
    await checkPremiumStatus()
  }

  const value = {
    isPremium,
    loading,
    refreshPremiumStatus
  }

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  )
}