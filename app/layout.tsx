// app/layout.tsx
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import "./globals.css"
import Header from './components/header'
import ChatSidebar from '@/components/ChatPage/ChatSideBar'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
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
        </body>
      </html>
    </ClerkProvider>
  )
}