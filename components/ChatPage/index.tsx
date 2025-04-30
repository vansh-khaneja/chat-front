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

import CategorySelector from "./CategorySelector";
import ChatMessages from "./ChatMessages";
import LoadingAnalysis from "./LoadingAnalysis";
import { ChatPageProps, ChatMessage, ApiResponse } from "./types";

export default function ChatPage({ initialChatId = null }: ChatPageProps) {
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [showLimitMessage, setShowLimitMessage] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [collectedIds, setCollectedIds] = useState<number[]>([]);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  // In your ChatPage component
const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const router = useRouter();

  const { userId } = useAuth();
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [showReferences, setShowReferences] = useState<boolean>(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoaded, isSignedIn, user } = useUser();


  // Add this function to your ChatPage component
// Add this function to your ChatPage component



const fetchChatHistory = async () => {
  if (!chatId || !userId) return;
  
  setIsHistoryLoading(true); // Show loading state
  
  try {
    const response = await axios.post(
      "https://lexscope-production.up.railway.app/get_chat_history",
      {
        auth_id: userId,
        session_id: chatId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Chat history retrieved:", response.data);
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Format the chat history into your chat log format
      const formattedHistory = formatChatHistoryToLog(response.data.data);
      
      // Only update if we don't already have messages
      if (chatLog.length === 0 && formattedHistory.length > 0) {
        setChatLog(formattedHistory);
      }
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
  } finally {
    setIsHistoryLoading(false); // Hide loading state
  }
};


const formatChatHistoryToLog = (historyData: any[]): ChatMessage[] => {
  const formattedLog: ChatMessage[] = [];
  
  // Process data in pairs (user message followed by AI response)
  for (let i = 0; i < historyData.length; i += 2) {
    const userMessage = historyData[i];
    const aiResponse = historyData[i + 1];
    
    if (userMessage && userMessage[1] === "user") {
      const chatEntry: ChatMessage = {
        question: userMessage[0],
        categories: [], // You might not have this info in history
      };
      
      // If we have a matching AI response
      if (aiResponse && aiResponse[1] === "ai") {
        chatEntry.response = {
          answer: aiResponse[0],
          metadata: [] // You might not have this info in history
        };
      }
      
      formattedLog.push(chatEntry);
    }
  }
  
  return formattedLog;
};
const saveChatMessage = async (sender: string, message: string) => {
  if (!chatId || !userId) return;
  
  try {
    const response = await axios.post(
      "https://lexscope-production.up.railway.app/add_chat_message",
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
    return response.data;
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
};
  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const extractIdsFromMetadata = (metadata: any[]): number[] => {
    if (!metadata || metadata.length === 0) return [];
    return metadata.map(item => item.id || item.file_id).filter(id => id);
  };

  const submitCollectedIds = async () => {
    if (!userId || collectedIds.length === 0) return;
    
    try {
      const response = await axios.post(
        "https://lexscope-production.up.railway.app/append_context_history", 
        { 
          auth_id: userId,
          context: collectedIds,
          chat_id: chatId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Context history updated:", response.data);
    } catch (error) {
      console.error("Error updating context history:", error);
    }
  };


// Update your existing useEffect or add a new one to load chat history
useEffect(() => {
  const loadChatData = async () => {
    // Only load chat history if:
    // 1. We have a chatId
    // 2. No messages are currently loaded
    // 3. No pending question to process
    if (
      chatId && 
      chatLog.length === 0 && 
      !sessionStorage.getItem('pendingQuestion')
    ) {
      setIsHistoryLoading(true); // Set loading state
      await fetchChatHistory();
      setIsHistoryLoading(false); // Clear loading state
    }
  };
  
  if (isLoaded && userId) {
    loadChatData();
  }
}, [chatId, isLoaded, userId, chatLog.length]);
  
  // Add this useEffect to handle the pending question when redirected from home page
// Add this useEffect to handle the pending question when redirected from home page
// Add this useEffect after your other useEffects in the ChatPage component
// Modified useEffect for handling pending questions
useEffect(() => {
  const pendingQuestion = sessionStorage.getItem('pendingQuestion');
  const pendingCategoriesJson = sessionStorage.getItem('pendingCategories');
  const shouldProcessQuestion = sessionStorage.getItem('shouldProcessQuestion');
  
  // Only process the question if the flag is set and we have a chatId
  if (pendingQuestion && chatId && shouldProcessQuestion === 'true' && chatLog.length === 0) {
    // Get any pending categories
    let pendingCategories: string[] = [];
    if (pendingCategoriesJson) {
      try {
        pendingCategories = JSON.parse(pendingCategoriesJson);
      } catch (e) {
        console.error("Error parsing pending categories:", e);
      }
    }
    
    // Set the chat log with the pending question
    setChatLog([{ 
      question: pendingQuestion,
      categories: pendingCategories,
      isLoading: true 
    }]);
    
    // Save the user's message to the chat history
    saveChatMessage("user", pendingQuestion);
    
    // Make the API call
    const fetchAnswer = async () => {
      try {
        const res = await axios.post(
          "https://lexscope-production.up.railway.app/retrieve", 
          { 
            question: pendingQuestion,
            categories: pendingCategories,
            auth_id: userId,
            chat_id: chatId
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        const processedResponse = processApiResponse(res.data);
        
        // Save the AI's response to the chat history
        await saveChatMessage("ai", processedResponse.answer);
        
        // Update chat log with the response
        setChatLog(prev => {
          const newLog = [...prev];
          const lastIndex = newLog.length - 1;
          if (lastIndex >= 0) {
            newLog[lastIndex] = { 
              question: pendingQuestion,
              categories: pendingCategories,
              response: processedResponse,
              isLoading: false,
              isTyping: true
            };
          }
          return newLog;
        });
        
        // Process metadata and update collected IDs
        if (processedResponse.metadata && processedResponse.metadata.length > 0) {
          const newIds = extractIdsFromMetadata(processedResponse.metadata);
          
          // Add new IDs to the collected IDs
          const updatedIds = [...new Set([...collectedIds, ...newIds])];
          setCollectedIds(updatedIds);
          
          // Immediately send the updated IDs to the backend if user is authenticated
          if (isLoaded && isSignedIn && userId) {
            await updateContextHistory(updatedIds);
          }
        }
        
      } catch (error) {
        console.error("Error fetching answer:", error);
        
        // Create error response
        const errorResponse: ApiResponse = {
          answer: "Sorry, I couldn't process your request. Please try again.",
          metadata: []
        };
        
        // Save the error response to chat history
        await saveChatMessage("ai", errorResponse.answer);
        
        // Update with error state
        setChatLog(prev => {
          const newLog = [...prev];
          const lastIndex = newLog.length - 1;
          if (lastIndex >= 0) {
            newLog[lastIndex] = { 
              question: pendingQuestion,
              categories: pendingCategories,
              response: errorResponse,
              isLoading: false,
              isTyping: true
            };
          }
          return newLog;
        });
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
}, [chatId, chatLog.length, userId, isLoaded, isSignedIn, collectedIds]);


const updateContextHistory = async (updatedIds: number[]) => {
  try {
    const contextResponse = await axios.post(
      "https://lexscope-production.up.railway.app/append_context_history", 
      { 
        auth_id: userId,
        context: updatedIds,
        chat_id: chatId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Context history updated:", contextResponse.data);
  } catch (error) {
    console.error("Error updating context history:", error);
  }
};

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

  // User registration effect
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      const registerUser = async () => {
        try {
          const response = await axios.post(
            "https://lexscope-production.up.railway.app/add_user",
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

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (userId) {
        try {
          const response = await axios.post(
            "https://lexscope-production.up.railway.app/get_user", 
            { auth_id: userId },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.data && response.data.data) {
            const userIsPremium = response.data.data[3] === true;
            setIsPremium(userIsPremium);
            console.log('Premium status:', userIsPremium);
          }
        } catch (error) {
          console.error("Error checking premium status:", error);
        }
      }
    };
    
    if (isLoaded && isSignedIn && userId) {
      checkPremiumStatus();
    }
  }, [isLoaded, isSignedIn, userId]);

  // Load chat history when chatId is provided
 
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

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

  // Process API response to handle both old and new formats
  const processApiResponse = (data: any): ApiResponse => {
    // If data is already in the expected format
    if (data.answer !== undefined && data.metadata !== undefined) {
      return data;
    }
    
    // If data is in the new format with success and data properties
    if (data.success && data.data) {
      return {
        answer: data.data.answer,
        metadata: data.data.metadata || []
      };
    }
    
    // Fallback for error cases
    if (data.error) {
      return {
        answer: `Error: ${data.error}`,
        metadata: []
      };
    }
    
    // Default fallback
    console.warn("Unexpected API response format:", data);
    return {
      answer: "Sorry, I couldn't process your request. Please try again.",
      metadata: []
    };
  };

 // Modified handleSubmit function to prevent double requests
const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (!question.trim()) return;
  
  const newQuestion = question;
  
  // Clear the input early
  setQuestion("");
  
  // Generate and navigate to UUID URL on first message if we don't have a chatId yet
  if (chatLog.length === 0 && !chatId) {
    // Generate UUID
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
    // Add a flag to indicate this is a pending question that should be processed after navigation
    sessionStorage.setItem('pendingQuestion', newQuestion);
    sessionStorage.setItem('pendingCategories', JSON.stringify(selectedCategories));
    sessionStorage.setItem('shouldProcessQuestion', 'true');
    
    // Navigate to the UUID page without setting loading state or updating chatLog
    // Let the new page handle the API call and UI updates
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
    const res = await axios.post(
      "https://lexscope-production.up.railway.app/retrieve", 
      { 
        question: newQuestion,
        categories: selectedCategories,
        auth_id: userId,
        chat_id: chatId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Process the response to handle different formats
    const processedResponse = processApiResponse(res.data);
    
    // Save the AI's response to the chat history
    await saveChatMessage("ai", processedResponse.answer);
    
    // Extract IDs from the metadata
    if (processedResponse.metadata && processedResponse.metadata.length > 0) {
      const newIds = extractIdsFromMetadata(processedResponse.metadata);
      
      // Add new IDs to the collected IDs
      const updatedIds = [...new Set([...collectedIds, ...newIds])];
      setCollectedIds(updatedIds);
      
      // Immediately send the updated IDs to the backend if user is authenticated
      if (isLoaded && isSignedIn && userId) {
        await updateContextHistory(updatedIds);
      }
    }
    
    // Update with processed response and begin typing animation
    setChatLog(prev => {
      const newLog = [...prev];
      const lastIndex = newLog.length - 1;
      if (lastIndex >= 0) {
        newLog[lastIndex] = { 
          question: newQuestion,
          categories: newLog[lastIndex].categories,
          response: processedResponse,
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

  const toggleReferences = () => {
    setShowReferences(!showReferences);
    setExpandedIndex(null); // Reset expanded state when toggling references
  };

  return (

<div className="flex flex-col h-[calc(100vh-64px)] bg-white">
    {/* Chat area with conditional layout */}
    <div className="flex-1 overflow-y-auto p-4 relative">
      {/* Minimalist monochrome loading animation */}
      {isHistoryLoading ? (
        <div className="h-full flex flex-col justify-center items-center">
          <div className="relative w-20 h-20 mb-6">
            {/* Outer pulsing circle */}
            <div className="absolute inset-0 rounded-full bg-gray-200 opacity-70 animate-pulse"></div>
            
            {/* Middle spinning ring */}
            <div className="absolute inset-2 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
            
            {/* Inner stable circle */}
            <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Loading text with simple animation */}
         
          
          {/* Subtle progress bar */}
         
        </div>
      ) : chatLog.length === 0 ? (
        // Empty state UI when there's no history
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
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="flex items-center gap-2">
                        <LogIn size={18} />
                        Iniciar sesión
                      </Button>
                    </SignInButton>
                  </SignedOut>
                </div>
                
                {/* Limited functionality version */}
                <div className="relative">
                  <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    {/* Input with button row above */}
                    <div className="flex items-center px-3 py-2 gap-2 border-b">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
                      >
                        <span className="text-xl">+</span>
                      </Button>
                      
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
          // Chat messages UI when history is loaded
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
          {/* Limit message - place here just above the input box */}
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
                  {isSignedIn ? (
                    <CategorySelector 
                      selectedCategories={selectedCategories}
                      toggleCategory={toggleCategory}
                    />
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
                      >
                        <span className="text-xl">+</span>
                      </Button>
                      <CategorySelector 
                        selectedCategories={selectedCategories}
                        toggleCategory={toggleCategory}
                      />
                    </>
                  )}
                  
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