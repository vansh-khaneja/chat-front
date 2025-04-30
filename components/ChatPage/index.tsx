'use client'
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useUser, useAuth } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, LogIn } from "lucide-react";
import { usePremium } from '@/lib/premium-context';
import { useSessions } from '@/lib/sessions-context'; // Import the sessions context

import CategorySelector from "./CategorySelector";
import ChatMessages from "./ChatMessages";
import LoadingAnalysis from "./LoadingAnalysis";
import { ChatPageProps, ChatMessage, ApiResponse } from "./types";

export default function ChatPage({ initialChatId = null }: ChatPageProps) {
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [showLimitMessage, setShowLimitMessage] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const router = useRouter();

  const { userId } = useAuth();
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [showReferences, setShowReferences] = useState<boolean>(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const { isPremium } = usePremium();
  
  // Use the sessions context to access session data
  const { getSessionById, refreshSessions } = useSessions();

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Save message data to cookies
  const saveMessageData = (count: number) => {
    const data = {
      count: count,
      timestamp: new Date().getTime(),
    };
    setCookie('messageData', JSON.stringify(data), 1); // Expires in 1 day
  };

  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Save chat message to backend
  const saveChatMessage = async (sender: string, message: string) => {
    if (!chatId || !userId) return;
    
    try {
      // Using the new endpoint /add_chat instead of /add_chat_message
      const response = await axios.post(
        "https://lexscope-production.up.railway.app/add_chat",
        {
          auth_id: userId,
          session_id: chatId,
          sender: sender,
          message: message
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Chat message saved:", response.data);
      
      // Refresh sessions data after adding a new message
      await refreshSessions();
      
      return response.data;
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  };

  // Format chat history to chat log - updated for new structure
  const formatChatHistoryToLog = (messages: any[]): ChatMessage[] => {
    const formattedLog: ChatMessage[] = [];
    
    // Group messages by user-ai pairs
    for (let i = 0; i < messages.length; i++) {
      const currentMessage = messages[i];
      
      if (currentMessage.role === "user") {
        // Look ahead for the next AI response
        const nextMessage = i + 1 < messages.length ? messages[i + 1] : null;
        const isAiResponse = nextMessage && nextMessage.role === "ai";
        
        const chatEntry: ChatMessage = {
          question: currentMessage.content,
          categories: [],
        };
        
        // If we have an AI response, add it
        if (isAiResponse) {
          chatEntry.response = {
            answer: nextMessage.content,
            metadata: []
          };
          i++; // Skip the next message since we've already processed it
        }
        
        formattedLog.push(chatEntry);
      }
    }
    
    return formattedLog;
  };

  // Fetch chat history using the sessions context
  const loadChatHistory = () => {
    if (!chatId) return;
    
    setIsHistoryLoading(true);
    
    try {
      // Get the session directly from context
      const session = getSessionById(chatId);
      
      if (session && session.messages && Array.isArray(session.messages)) {
        const formattedHistory = formatChatHistoryToLog(session.messages);
        
        if (chatLog.length === 0 && formattedHistory.length > 0) {
          setChatLog(formattedHistory);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Handle submission of question
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;
    
    const newQuestion = question;
    setQuestion("");
    
    // Generate and navigate to UUID URL on first message if we don't have a chatId yet
    if (chatLog.length === 0 && !chatId) {
      const newChatId = uuidv4();
      setChatId(newChatId);
      window.dispatchEvent(new Event('chatCreated'));
      
      // Update message count
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      saveMessageData(newCount);
      
      // Check limit
      if (newCount > 5 && !isSignedIn) {
        setShowLimitMessage(true);
        return;
      }
      
      // Store question and categories in sessionStorage
      sessionStorage.setItem('pendingQuestion', newQuestion);
      sessionStorage.setItem('pendingCategories', JSON.stringify(selectedCategories));
      sessionStorage.setItem('shouldProcessQuestion', 'true');
      
      router.push(`/${newChatId}`);
      return;
    }
    
    // For subsequent messages or if we already have a chatId
    const newCount = messageCount + 1;
    if (newCount > 5 && !isSignedIn) {
      setShowLimitMessage(true);
      return;
    }
    
    setChatLog(prev => [...prev, { 
      question: newQuestion,
      categories: [...selectedCategories],
      isLoading: true 
    }]);
    
    setMessageCount(newCount);
    saveMessageData(newCount);
    setLoading(true);
    
    // Save the user's message to the chat history
    await saveChatMessage("user", newQuestion);
    
    try {
      // Use the new API endpoint and request structure
      const res = await axios.post(
        "https://lexscope-production.up.railway.app/response", 
        { 
          question: newQuestion,
          case_types: selectedCategories,
          limit: 5
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Process the response
      console.log("API Response:", res.data);
      
      // Format the response to match the expected structure
      const formattedResponse: ApiResponse = {
        answer: res.data.response,
        metadata: formatMetadata(res.data.metadata)
      };
      
      // Save the AI's response to the chat history
      await saveChatMessage("ai", formattedResponse.answer);
      
      // Update chat log with the response
      setChatLog(prev => {
        const newLog = [...prev];
        const lastIndex = newLog.length - 1;
        if (lastIndex >= 0) {
          newLog[lastIndex] = { 
            question: newQuestion,
            categories: newLog[lastIndex].categories,
            response: formattedResponse,
            isLoading: false,
            isTyping: true
          };
        }
        return newLog;
      });
      
      setShowReferences(false);
    } catch (err) {
      console.error("Error fetching answer:", err);
      handleApiError(newQuestion, selectedCategories);
    } finally {
      setLoading(false);
    }
  };

  // Format metadata from the new API response
  const formatMetadata = (metadata: any): any[] => {
    if (!metadata) return [];
    
    // Transform metadata from object to array format
    const metadataArray = Object.keys(metadata).map(key => {
      const item = metadata[key];
      return {
        id: parseInt(key),
        file_id: parseInt(key),
        case_type: item.case_type || "",
        text: item.text || "",
        date: item.date || "",
        score: item.score || 0,
        file_url: item.url || "",
        file_summary: item.summary || ""
      };
    });
    
    return metadataArray;
  };

  // Handle API error
  const handleApiError = (question: string, categories: string[]) => {
    const errorResponse: ApiResponse = {
      answer: "Sorry, I couldn't process your request. Please try again.",
      metadata: []
    };
    
    setChatLog(prev => {
      const newLog = [...prev];
      const lastIndex = newLog.length - 1;
      if (lastIndex >= 0) {
        newLog[lastIndex] = { 
          question: question,
          categories: categories,
          response: errorResponse,
          isLoading: false,
          isTyping: true
        };
      }
      return newLog;
    });
  };

  // Called when typing animation completes
  const handleTypingComplete = (index: number) => {
    setChatLog(prev => {
      const newLog = [...prev];
      if (newLog[index]) {
        newLog[index] = {
          ...newLog[index],
          isTyping: false
        };
      }
      return newLog;
    });
  };

  // Toggle references section
  const toggleReferences = () => {
    setShowReferences(!showReferences);
    setExpandedIndex(null); // Reset expanded state when toggling references
  };

  // Load message data from cookies
  useEffect(() => {
    const loadMessageData = () => {
      const storedData = getCookie('messageData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Check if the stored timestamp is from today
        const today = new Date().toDateString();
        const storedDate = new Date(parsedData.timestamp).toDateString();
        
        if (today === storedDate) {
          const count = parsedData.count;
          setMessageCount(count);
          
          // Immediately show limit message if count is already ≥ 5 and user is not signed in
          if (count >= 5 && !isSignedIn) {
            setShowLimitMessage(true);
          }
        } else {
          // Reset for a new day
          setMessageCount(0);
          setShowLimitMessage(false);
        }
      }
    };
    
    loadMessageData();
  }, [isSignedIn]);

  // Register user
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      const registerUser = async () => {
        try {
          const response = await axios.post(
            "https://lexscope-production.up.railway.app/create_user",
            { auth_id: userId },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          console.log("User registration response:", response.data);
        } catch (error) {
          console.error("Error registering user:", error);
        }
      };
      
      registerUser();
    }
  }, [isLoaded, isSignedIn, userId]);

  // Load chat history when the component mounts
  useEffect(() => {
    if (chatId && chatLog.length === 0 && !sessionStorage.getItem('pendingQuestion')) {
      loadChatHistory();
    }
  }, [chatId, chatLog.length]);

  // Process pending question after navigation
  useEffect(() => {
    const pendingQuestion = sessionStorage.getItem('pendingQuestion');
    const pendingCategoriesJson = sessionStorage.getItem('pendingCategories');
    const shouldProcessQuestion = sessionStorage.getItem('shouldProcessQuestion');
    
    if (pendingQuestion && chatId && shouldProcessQuestion === 'true' && chatLog.length === 0) {
      let pendingCategories: string[] = [];
      if (pendingCategoriesJson) {
        try {
          pendingCategories = JSON.parse(pendingCategoriesJson);
        } catch (e) {
          console.error("Error parsing pending categories:", e);
        }
      }
      
      setChatLog([{ 
        question: pendingQuestion,
        categories: pendingCategories,
        isLoading: true 
      }]);
      
      // Save the user's message to the chat history
      saveChatMessage("user", pendingQuestion);
      
      const fetchAnswer = async () => {
        try {
          // NEW API ENDPOINT AND REQUEST STRUCTURE
          const res = await axios.post(
            "https://lexscope-production.up.railway.app/response", 
            { 
              question: pendingQuestion,
              case_types: pendingCategories,
              limit: 5
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Format the response to match the expected structure
          const formattedResponse: ApiResponse = {
            answer: res.data.response,
            metadata: formatMetadata(res.data.metadata)
          };
          
          // Save the AI's response to the chat history
          await saveChatMessage("ai", formattedResponse.answer);
          
          // Update chat log with the response
          setChatLog(prev => {
            const newLog = [...prev];
            const lastIndex = newLog.length - 1;
            if (lastIndex >= 0) {
              newLog[lastIndex] = { 
                question: pendingQuestion,
                categories: pendingCategories,
                response: formattedResponse,
                isLoading: false,
                isTyping: true
              };
            }
            return newLog;
          });
          
        } catch (error) {
          console.error("Error fetching answer:", error);
          handleApiError(pendingQuestion, pendingCategories);
        } finally {
          setLoading(false);
          // Clear the pending question from sessionStorage
          sessionStorage.removeItem('pendingQuestion');
          sessionStorage.removeItem('pendingCategories');
          sessionStorage.removeItem('shouldProcessQuestion');
        }
      };
      
      fetchAnswer();
    }
  }, [chatId, chatLog.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
      {/* Chat area with conditional layout */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Loading animation */}
        {isHistoryLoading ? (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-gray-200 opacity-70 animate-pulse"></div>
              <div className="absolute inset-2 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
              <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : chatLog.length === 0 ? (
          // Empty state UI
          <div className="h-full flex flex-col justify-center items-center">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">¿En qué puedo ayudar?</h2>
            </div>
              
            {/* Auth-dependent centered input */}
            <div className="w-full max-w-lg">
              <SignedIn>
                <div className="relative mb-2">
                  <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    {/* Input with button row above */}
                    <div className="flex items-center px-3 py-2 gap-2 border-b">
                      <CategorySelector 
                        selectedCategories={selectedCategories}
                        toggleCategory={toggleCategory}
                      />
                      
                      <div className="flex-1"></div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 p-0 flex items-center justify-center text-gray-500"
                      >
                        <span className="text-xl">⋯</span>
                      </Button>
                    </div>
                    
                    {/* Input field */}
                    <form onSubmit={handleSubmit} className="flex items-center px-3 py-2">
                      <Input
                        placeholder="Haga una pregunta legal..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="border-0 shadow-none focus:ring-0 flex-1"
                        disabled={loading}
                      />
                      <Button 
                        type="submit" 
                        disabled={loading}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        {loading ? "..." : <Send size={18} />}
                      </Button>
                    </form>
                  </div>
                </div>
              </SignedIn>
              
              <SignedOut>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 shadow-sm text-center mb-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Inicie sesión para una mejor experiencia</h3>
                  <p className="text-blue-600 mb-4">Obtenga respuestas personalizadas adaptadas a sus preguntas legales.</p>
                  <SignInButton mode="modal">
                    <Button className="flex items-center gap-2">
                      <LogIn size={18} />
                      Iniciar sesión
                    </Button>
                  </SignInButton>
                </div>
                
                {/* Limited functionality version */}
                <div className="relative">
                  <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    {/* Input with button row above */}
                    <div className="flex items-center px-3 py-2 gap-2 border-b">
                      <CategorySelector 
                        selectedCategories={selectedCategories}
                        toggleCategory={toggleCategory}
                      />
                      
                      <div className="flex-1"></div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 p-0 flex items-center justify-center text-gray-500"
                      >
                        <span className="text-xl">⋯</span>
                      </Button>
                    </div>
                    
                    {/* Input field */}
                    <form onSubmit={handleSubmit} className="flex items-center px-3 py-2">
                      <Input
                        placeholder="Haga una pregunta legal..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="border-0 shadow-none focus:ring-0 flex-1"
                        disabled={loading}
                      />
                      <Button 
                        type="submit" 
                        disabled={loading}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        {loading ? "..." : <Send size={18} />}
                      </Button>
                    </form>
                  </div>
                </div>
              </SignedOut>
            </div>
          </div>
        ) : (
          // Chat messages UI
          <ChatMessages 
            chatLog={chatLog}
            showReferences={showReferences}
            toggleReferences={toggleReferences}
            expandedIndex={expandedIndex}
            setExpandedIndex={setExpandedIndex}
            handleTypingComplete={handleTypingComplete}
            isSignedIn={!!isSignedIn}
            isPremium={isPremium}
            isLoaded={!!isLoaded}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area (fixed at bottom) - Only show when chat has messages */}
      {!isHistoryLoading && chatLog.length > 0 && (
        <div className="border-t bg-white p-4">
          {/* Limit message */}
          {showLimitMessage && !isSignedIn && (
            <div className="max-w-3xl mx-auto mb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm text-center">
                <h3 className="text-lg font-medium text-amber-800 mb-2">You've reached today's limit</h3>
                <p className="text-amber-700 mb-4">Sign in to continue asking questions and get unlimited access.</p>
                <SignInButton mode="modal">
                  <Button className="flex items-center gap-2">
                    <LogIn size={18} />
                    Sign in for unlimited access
                  </Button>
                </SignInButton>
              </div>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {/* Input with button row above */}
                <div className="flex items-center px-3 py-2 gap-2 border-b">
                  <CategorySelector 
                    selectedCategories={selectedCategories}
                    toggleCategory={toggleCategory}
                  />
                  
                  <div className="flex-1"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-8 w-8 p-0 flex items-center justify-center text-gray-500"
                  >
                    <span className="text-xl">⋯</span>
                  </Button>
                </div>
                
                {/* Input field */}
                <form onSubmit={handleSubmit} className="flex items-center px-3 py-2">
                  <Input
                    placeholder="Ask a legal question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="border-0 shadow-none focus:ring-0 flex-1"
                    disabled={loading}
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    {loading ? "..." : <Send size={18} />}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}