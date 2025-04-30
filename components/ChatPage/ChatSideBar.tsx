'use client'
// components/ChatSidebar.tsx
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { MessageSquare, Plus } from 'lucide-react';

export default function ChatSidebar() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  
  // Extract chatId from the URL if it exists
  const activeChatId = pathname && pathname !== '/' ? pathname.substring(1) : null;

  // Function to fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!userId || !isSignedIn) {
      setIsLoading(false);
      setIsInitialLoad(false);
      return;
    }

    try {
      // Only show loading indicator on initial load when we have no sessions
      if (isInitialLoad && sessions.length === 0) {
        setIsLoading(true);
      }
      
      const response = await axios.post(
        "https://lexscope-production.up.railway.app/get_unique_session_ids",
        { auth_id: userId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [userId, isSignedIn, isInitialLoad, sessions.length]);

  // Initial fetch of sessions
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSessions();
    }
  }, [isLoaded, isSignedIn, fetchSessions]);

  // Listen for changes in the pathname to auto-update the sidebar
  useEffect(() => {
    // If we have a new chatId in the URL and it's not in our sessions list, refresh the list
    if (activeChatId && !sessions.includes(activeChatId)) {
      fetchSessions();
    }
  }, [activeChatId, sessions, fetchSessions]);

  // Expose a function for other components to trigger a refresh
  useEffect(() => {
    const handleChatCreated = () => {
      fetchSessions();
    };

    window.addEventListener('chatCreated', handleChatCreated);
    
    return () => {
      window.removeEventListener('chatCreated', handleChatCreated);
    };
  }, [fetchSessions]);

  const handleNewChat = () => {
    router.push('/');
  };

  const handleSelectChat = (sessionId: string) => {
    router.push(`/${sessionId}`);
  };

  return (
    <aside className={`h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-16'}`}>
      <div className="flex flex-col h-full">
        {/* Header with toggle */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen && <h2 className="font-medium text-gray-800">Conversations</h2>}
          <button 
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '«' : '»'}
          </button>
        </div>
        
        {/* New chat button */}
        <div className="p-3">
          <button 
            className="w-full flex items-center justify-start px-3 py-2.5 bg-gray-900 hover:bg-black text-white rounded-md transition-colors"
            onClick={handleNewChat}
          >
            <Plus size={16} className="mr-2" />
            {isSidebarOpen && <span>New Chat</span>}
          </button>
        </div>
        
        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {/* Only show loading state when there are no sessions and it's the initial load */}
          {isLoading && sessions.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-5 w-5 border-2 border-t-gray-800 border-gray-300 rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((sessionId) => (
                <button
                  key={sessionId}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    activeChatId === sessionId 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectChat(sessionId)}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="truncate text-sm">
                      {sessionId.substring(0, 10)}...
                    </span>
                  )}
                </button>
              ))}
              
              {sessions.length === 0 && !isLoading && (
                <div className="text-center py-8 px-2 text-gray-500 text-sm">
                  {isSidebarOpen && "No conversations yet. Start a new chat!"}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {isSidebarOpen && (
          <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
            © 2025 Legal Assistant
          </div>
        )}
      </div>
    </aside>
  );
}