'use client'

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import "./globals.css"
import Header from './components/header'
import ChatSidebar from '@/components/ChatPage/ChatSideBar'
import { PremiumProvider } from '@/lib/premium-context'
import { SessionsProvider } from '@/lib/sessions-context' // Import the new provider

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <PremiumProvider>
            <SessionsProvider> {/* Add the new provider */}
              <main className="min-h-screen">
                <Header/>
                <div className="flex h-[calc(100vh-64px)]">
                  <SignedIn>
                    <ChatSidebar />
                  </SignedIn>
                  <div className="flex-1">
                    {children}
                  </div>
                </div>
              </main>
            </SessionsProvider>
          </PremiumProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}