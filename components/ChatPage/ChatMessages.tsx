// components/ChatPage/ChatMessages.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, LogIn } from "lucide-react";
import LoadingAnalysis from "./LoadingAnalysis";
import TypewriterText from "./TypewriterText";
import ReferencesSection from "./ReferencesSection";
import { ChatMessagesProps, MetadataItem } from "./types";

// Helper function for formatting text (used for non-animated text)
function formatMessage(text: string) {
  if (!text) return "";
  
  // Convert **text** to <strong>text</strong>
  const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert \n\n to paragraph breaks
  const paragraphs = boldFormatted.split(/\n\n+/).map((paragraph, i) => (
    <p key={i} className="mb-3">{paragraph.split('\n').map((line, j) => (
      <React.Fragment key={j}>
        {j > 0 && <br />}
        <span dangerouslySetInnerHTML={{ __html: line }} />
      </React.Fragment>
    ))}</p>
  ));
  
  return <>{paragraphs}</>;
}

// Function to sort and filter metadata items by score
function processMetadata(metadata: MetadataItem[]): MetadataItem[] {
  if (!metadata || metadata.length === 0) return [];
  
  // 1. Sort by score (descending order)
  const sortedMetadata = [...metadata].sort((a, b) => b.score - a.score);
  
  // 2. Filter out items with duplicate scores
  const uniqueScoreItems: MetadataItem[] = [];
  const seenScores = new Set<number>();
  
  for (const item of sortedMetadata) {
    // Round score to handle small floating point differences
    const roundedScore = Math.round(item.score * 1000) / 1000;
    
    if (!seenScores.has(roundedScore)) {
      seenScores.add(roundedScore);
      uniqueScoreItems.push(item);
    }
  }
  
  return uniqueScoreItems;
}

export default function ChatMessages({ 
  chatLog, 
  showReferences, 
  toggleReferences, 
  expandedIndex, 
  setExpandedIndex, 
  handleTypingComplete,
  isSignedIn,
  isPremium,
  isLoaded
}: ChatMessagesProps) {
  return (
    <div className="w-full mx-auto space-y-8 px-3 sm:px-4 md:max-w-3xl">
      {/* Show login banner for signed out users with existing messages */}
      <SignedOut>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 shadow-sm text-center mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-medium text-blue-800">Inicie sesión para obtener más personalización</h3>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" variant="outline" className="w-full sm:w-auto flex items-center gap-1 text-xs px-2 py-1 h-auto sm:h-8">
                  <LogIn size={14} />
                  Iniciar sesión
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </SignedOut>
      
      {chatLog.map((chat, i) => (
        <div key={i} className="space-y-4 sm:space-y-6">
          {/* User message - with light gray background and rounded corners */}
          <div className="flex justify-end">
            <div className="bg-gray-100 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl max-w-[90%] sm:max-w-[80%]">
              {/* Display selected categories as badges */}
              {chat.categories && chat.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {chat.categories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="text-sm sm:text-base">{chat.question}</div>
            </div>
          </div>
          
          {/* Bot message - clean, no background */}
          <div className="flex justify-start">
            <div className="max-w-[90%] sm:max-w-[80%]">
              {chat.isLoading ? (
                <div className="text-gray-600">
                  <LoadingAnalysis />
                </div>
              ) : chat.response ? (
                <>
                  <div className="text-xs text-gray-500 mb-2">
                    Razonado sobre el caso legal por un segundo 
                  </div>
                  <div className="prose prose-sm sm:prose text-gray-800 max-w-full">
                    {chat.isTyping ? (
                      <TypewriterText 
                        content={chat.response.answer} 
                        onComplete={() => handleTypingComplete(i)}
                      />
                    ) : (
                      formatMessage(chat.response.answer)
                    )}
                  </div>
                  
                  {!chat.isTyping && chat.response.metadata && chat.response.metadata.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleReferences}
                      className="text-xs mt-3 sm:mt-4 flex items-center gap-1 h-auto px-2 py-1 sm:h-8 sm:px-3"
                    >
                      {showReferences ? (
                        <>
                          <ChevronUp size={14} /> Ocultar referencias
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} /> Mostrar referencias ({processMetadata(chat.response.metadata).length})
                        </>
                      )}
                    </Button>
                  )}

                  {/* REFERENCES SECTION */}
                  {!chat.isTyping && showReferences && chat.response.metadata && chat.response.metadata.length > 0 && (
                    <ReferencesSection 
                      metadata={processMetadata(chat.response.metadata)}
                      expandedIndex={expandedIndex}
                      setExpandedIndex={setExpandedIndex}
                      isSignedIn={isSignedIn}
                      isPremium={isPremium}
                      isLoaded={isLoaded}
                    />
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}