'use client'

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'

// Define the session type
type Message = {
  id: number;
  content: string;
  role: string;
  timestamp: string;
}

type Session = {
  session_id: string;
  messages: Message[];
}

// Define the context type
type SessionsContextType = {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  getSessionById: (sessionId: string) => Session | undefined;
}

// Create context with default values
const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  loading: true,
  error: null,
  refreshSessions: async () => {},
  getSessionById: () => undefined
})

// Hook to use sessions context
export const useSessions = () => useContext(SessionsContext)

// Provider component
export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userId, isLoaded, isSignedIn } = useAuth()

  // Function to fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!userId || !isSignedIn) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.post(
        "https://lexscope-production.up.railway.app/user_sessions",
        { auth_id: userId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data && response.data.sessions && Array.isArray(response.data.sessions)) {
        setSessions(response.data.sessions)
        console.log("Sessions loaded successfully")
      } else {
        setSessions([])
        setError("Invalid response format")
      }
    } catch (err) {
      console.error("Error fetching sessions:", err)
      setError("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }, [userId, isSignedIn])

  // Fetch sessions when userId changes
  useEffect(() => {
    if (isLoaded && userId) {
      fetchSessions()
    }
  }, [isLoaded, userId, fetchSessions])

  // Listen for chatCreated events
  useEffect(() => {
    const handleChatCreated = () => {
      fetchSessions()
    }

    window.addEventListener('chatCreated', handleChatCreated)
    
    return () => {
      window.removeEventListener('chatCreated', handleChatCreated)
    }
  }, [fetchSessions])

  // Function to get a specific session by ID
  const getSessionById = useCallback(
    (sessionId: string): Session | undefined => {
      return sessions.find(session => session.session_id === sessionId)
    },
    [sessions]
  )

  const value = {
    sessions,
    loading,
    error,
    refreshSessions: fetchSessions,
    getSessionById
  }

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  )
}