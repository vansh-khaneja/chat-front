'use client'

import { useState, useEffect } from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth
} from '@clerk/nextjs'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'


export default function Header() {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()
  const { user } = useUser()
  var email =user?.primaryEmailAddress?.emailAddress
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (userId) {
        try {
          setLoading(true)
          const response = await axios.post('http://localhost:5000/get_user', {
            auth_id: userId
          })
          
          // Check if the response has the expected structure with premium status
          if (response.data && response.data.data) {
            // Based on your screenshot, the premium status is at index 3 (fourth item)
            // The array looks like [userId, timestamp, "[trueit]", true, date]
            const userIsPremium = response.data.data[3] === true
            setIsPremium(userIsPremium)
            console.log('Premium status:', userIsPremium)
          }
        } catch (error) {
          console.error('Error checking premium status:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (userId) {
      checkPremiumStatus()
    }
  }, [userId])

  const handleActivatePro = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

console.log("use",user?.primaryEmailAddress?.emailAddress)
  return (
    <header className="flex justify-between items-center p-3 shadow-md bg-white border-b border-gray-200">
      {/* Logo and Brand */}
      <div className="flex items-center gap-2">
        {/* Scale icon as logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black w-5 h-5"
        >
          <path d="M8 3v2m8-2v2M8 21v-2m8 2v-2M3 8h2m-2 8h2m14-8h2m-2 8h2M3 12h18M12 3v18"/>
        </svg>
        <div>
          <h1 className="text-lg font-semibold text-black">LawBot</h1>
          <p className="text-xs text-gray-500">Tu asistente legal con IA</p>
        </div>
      </div>
      
      {/* Authentication Buttons */}
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-1.5 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition">
              Iniciar sesión
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-1.5 bg-white text-black text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition">
              Registrarse
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          {/* Premium status badge/button */}
          {loading ? (
            <div className="text-xs px-3 py-1 bg-gray-100 rounded-full">
              Cargando...
            </div>
          ) : isPremium ? (
            <div className="text-xs px-3 py-1 bg-green-100 text-green-800 font-medium rounded-full flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
              </svg>
              Pro Activado
            </div>
          ) : (
            <button 
              onClick={handleActivatePro}
              className="text-xs px-3 py-1 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Activar Pro
            </button>
          )}
          
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8"
              }
            }}
          />
        </SignedIn>
      </div>
    </header>
  )
}