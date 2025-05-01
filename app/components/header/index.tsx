'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { usePremium } from '@/lib/premium-context'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const { isPremium, loading } = usePremium() 
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleActivatePro = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="flex justify-between items-center p-3 shadow-md bg-white border-b border-gray-200 relative z-20">
      {/* Logo container with conditional centering for mobile */}
      <div className="flex-1 flex sm:justify-start justify-center items-center">
        {/* Logo and brand - now centered on mobile */}
        <div className="flex items-center gap-2 sm:ml-10">
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
            <h1 className="text-lg font-semibold text-black">LexScope</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Tu asistente legal con IA</p>
          </div>
        </div>
      </div>
      
      {/* Mobile menu button - positioned absolute for better layout */}
      <div className="absolute right-3 sm:hidden flex items-center h-full">
        <button 
          className="text-gray-500 focus:outline-none p-2"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Authentication Buttons - Desktop */}
      <div className="hidden sm:flex items-center gap-3">
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
      
      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-white z-10 transition-all duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} sm:hidden`}>
        <div className="flex flex-col h-full">
          {/* Mobile menu header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-2">
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
              <h1 className="text-lg font-semibold text-black">LexScope</h1>
            </div>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Mobile menu content */}
          <div className="flex-1 p-4">
            <SignedOut>
              <div className="flex flex-col gap-3">
                <SignInButton mode="modal">
                  <button 
                    className="w-full px-4 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button 
                    className="w-full px-4 py-2.5 bg-white text-black text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            
            <SignedIn>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-12 w-12"
                      }
                    }}
                  />
                  <div>
                    <div className="font-medium">{user?.fullName || 'User'}</div>
                    <div className="text-xs text-gray-500">{email}</div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-sm px-4 py-2 bg-gray-100 rounded-lg text-center">
                    Cargando...
                  </div>
                ) : isPremium ? (
                  <div className="bg-green-50 text-green-800 font-medium rounded-lg p-3 flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
                    </svg>
                    Pro Activado
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      handleActivatePro();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-blue-600 text-white font-medium rounded-lg py-3 hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Activar Pro
                  </button>
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}