// components/ChatPage/ChatSideBar.tsx
'use client'
import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Plus, Menu, X, Calendar } from 'lucide-react';
import { useSessions } from '@/lib/sessions-context';
import SidebarFilter from './SideBarFilter';
import { 
  getAvailableCaseTypes, 
  filterSessionsByCaseTypes
} from '@/lib/chat-filter-utils';

export default function ChatSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Use the sessions context instead of making API calls directly
  const { sessions, loading } = useSessions();
  
  // Extract chatId from the URL if it exists
  const activeChatId = pathname && pathname !== '/' ? pathname.substring(1) : null;

  // Get available case types with counts
  const availableCaseTypes = useMemo(() => {
    return getAvailableCaseTypes(sessions);
  }, [sessions]);

  // Filter sessions based on active filters
  const filteredSessions = useMemo(() => {
    return filterSessionsByCaseTypes(sessions, activeFilters);
  }, [sessions, activeFilters]);

  // Handle window resize to adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = () => {
    router.push('/');
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSelectChat = (sessionId: string) => {
    router.push(`/${sessionId}`);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle a case type filter
  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
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

  // Mobile menu button - only visible on small screens
  const MobileMenuButton = () => (
    <button 
      className="md:hidden fixed top-3 left-4 z-20 p-2 bg-white border border-gray-200 rounded-md shadow-sm"
      onClick={toggleMobileMenu}
      aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    >
      {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );

return (
  <>
    <MobileMenuButton />
    
    <aside 
      className={`flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-300
        ${isMobileMenuOpen 
          ? 'fixed inset-0 z-10 w-72 h-full' 
          : isSidebarOpen 
            ? 'hidden md:flex md:w-72 h-[calc(100vh-64px)]' 
            : 'hidden md:flex md:w-16 h-[calc(100vh-64px)]'
        }`}
    >
      {/* Top section (fixed height elements) */}
      <div className="flex-none">
        {/* Header with toggle */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {(isSidebarOpen || isMobileMenuOpen) && <h2 className="font-medium text-gray-800">Conversaciones</h2>}
          
          <div className="flex gap-2">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 md:block hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? '«' : '»'}
            </button>
            {isMobileMenuOpen && (
              <button 
                className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        
        {/* Filter section - only show if we have sessions with case types */}
        {(isSidebarOpen || isMobileMenuOpen) && availableCaseTypes.length > 0 && (
          <SidebarFilter 
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            clearFilters={clearFilters}
            isSidebarExpanded={isSidebarOpen || isMobileMenuOpen}
            availableCaseTypes={availableCaseTypes}
          />
        )}
        
        {/* New chat button */}
        <div className="p-3">
          <button 
            className="w-full flex items-center justify-start px-3 py-2.5 bg-gray-900 hover:bg-black text-white rounded-md transition-colors"
            onClick={handleNewChat}
          >
            <Plus size={16} className="mr-2" />
            {(isSidebarOpen || isMobileMenuOpen) && <span>Nuevo Chat</span>}
          </button>
        </div>
      </div>
      
      {/* Middle section (scrollable, flexible height) */}
      <div className="flex-grow overflow-y-auto min-h-0">
        <div className="px-2 py-2">
          {/* Sessions list content */}
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-1.5">
              {filteredSessions.map((session) => {
                // Get the most recent message timestamp
                const latestTimestamp = session.messages && session.messages.length > 0
                  ? session.messages[session.messages.length - 1]?.timestamp
                  : '';
                
                const isActive = session.session_id === activeChatId;
                const chatPreview = getChatPreview(session.messages);
                const formattedDate = formatTimestamp(latestTimestamp);
                
                return (
                  <button
                    key={session.session_id}
                    onClick={() => handleSelectChat(session.session_id)}
                    className={`w-full text-left p-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-gray-200 hover:bg-gray-300' 
                        : 'hover:bg-gray-200'
                    } ${!isSidebarOpen && !isMobileMenuOpen ? 'justify-center' : ''}`}
                  >
                    <div className={`flex items-start ${!isSidebarOpen && !isMobileMenuOpen ? 'justify-center' : ''}`}>
                      <div className="flex-shrink-0 mt-1">
                        <MessageSquare size={isSidebarOpen || isMobileMenuOpen ? 16 : 20} className="text-gray-600" />
                      </div>
                      
                      {(isSidebarOpen || isMobileMenuOpen) && (
                        <div className="ml-3 flex-1 overflow-hidden">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chatPreview}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar size={12} className="mr-1" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500 text-sm">
              {isSidebarOpen || isMobileMenuOpen ? "No conversations found" : ""}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom section (fixed height, always at bottom) */}
      {(isSidebarOpen || isMobileMenuOpen) && (
        <div className="flex-none p-3 border-t border-gray-200 text-xs text-gray-500 mt-auto">
          © 2025 Legal Assistant
        </div>
      )}
    </aside>
    
    {/* Overlay for mobile */}
    {isMobileMenuOpen && (
      <div 
        className="md:hidden fixed inset-0 bg-black/50 z-0"
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ width: "100%", left: "0", right: "0" }}
      />
    )}
  </>
);
}