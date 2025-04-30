'use client'
// components/ChatPage/ChatSideBar.tsx
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Plus } from 'lucide-react';
import { useSessions } from '@/lib/sessions-context';

export default function ChatSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Use the sessions context instead of making API calls directly
  const { sessions, loading } = useSessions();
  
  // Extract chatId from the URL if it exists
  const activeChatId = pathname && pathname !== '/' ? pathname.substring(1) : null;

  const handleNewChat = () => {
    router.push('/');
  };

  const handleSelectChat = (sessionId: string) => {
    router.push(`/${sessionId}`);
  };

  // Helper function to get the first user message from the chat for preview
  const getChatPreview = (messages: any[]): string => {
    if (!messages || messages.length === 0) return "New conversation";
    
    // Find the first user message
    const userMessage = messages.find(msg => msg.role === "user");
    if (userMessage && userMessage.content) {
      // Truncate the message if it's too long
      return userMessage.content.length > 25 
        ? `${userMessage.content.substring(0, 25)}...` 
        : userMessage.content;
    }
    
    return "New conversation";
  };

  // Helper function to format the timestamp to a readable date
  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return "";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    } catch (e) {
      return "";
    }
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
          {/* Only show loading state when there are no sessions and it's loading */}
          {loading && sessions.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-5 w-5 border-2 border-t-gray-800 border-gray-300 rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => {
                const lastMessage = session.messages && session.messages.length > 0 
                  ? session.messages[session.messages.length - 1] 
                  : null;
                const timestamp = lastMessage?.timestamp || "";
                
                return (
                  <button
                    key={session.session_id}
                    className={`w-full flex items-start px-3 py-2.5 rounded-md text-left transition-colors ${
                      activeChatId === session.session_id 
                        ? 'bg-gray-200 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectChat(session.session_id)}
                  >
                    <MessageSquare size={16} className="flex-shrink-0 mt-1 mr-3" />
                    {isSidebarOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center w-full">
                          <span className="truncate text-sm font-medium">
                            {getChatPreview(session.messages)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1 whitespace-nowrap">
                            {formatTimestamp(timestamp)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 truncate block">
                          {session.session_id.substring(0, 10)}...
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
              
              {sessions.length === 0 && !loading && (
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