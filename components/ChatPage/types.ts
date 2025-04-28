// components/ChatPage/types.ts
export interface MetadataItem {
    case_type: string;
    file_id: number;
    file_summary: string;
    file_url: string;
    score: number;
    text: string;
  }
  
  export interface ApiResponse {
    answer: string;
    metadata: MetadataItem[];
  }
  
  export interface ChatMessage {
    question: string;
    categories?: string[];
    response?: ApiResponse;
    isLoading?: boolean;
    isTyping?: boolean;
  }
  
  export interface CategorySelectorProps {
    selectedCategories: string[];
    toggleCategory: (categoryId: string) => void;
  }
  
  export interface ChatMessagesProps {
    chatLog: ChatMessage[];
    showReferences: boolean;
    toggleReferences: () => void;
    expandedIndex: number | null;
    setExpandedIndex: (index: number | null) => void;
    handleTypingComplete: (index: number) => void;
    isSignedIn: boolean;
    isPremium: boolean;
    isLoaded: boolean;
  }
  
  export interface TypewriterTextProps {
    content: string;
    onComplete?: () => void;
  }
  
  export interface ReferencesSectionProps {
    metadata: MetadataItem[];
    expandedIndex: number | null;
    setExpandedIndex: (index: number | null) => void;
    isSignedIn: boolean;
    isPremium: boolean;
    isLoaded: boolean;
  }
  
  export interface ChatPageProps {
    initialChatId?: string | null;
  }
  
  export interface CategoryButtonProps {
    id: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }