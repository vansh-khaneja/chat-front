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
import { SessionsProvider } from '@/lib/sessions-context'

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
            <SessionsProvider>
              <main className="flex flex-col min-h-screen w-full">
                <Header/>
                <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
                  <SignedIn>
                    {/* ChatSidebar is already responsive with its own mobile menu button */}
                    <ChatSidebar />
                  </SignedIn>
                  <div className="flex-1 overflow-hidden">
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