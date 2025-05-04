// components/ChatPage/types.ts
export interface MetadataItem {
  id?: number;
  case_type: string;
  file_id: number;
  file_summary: string;
  file_url: string;
  score: number;
  text: string;
  date: string;
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

export interface CategoryButtonProps {
  id: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
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

// Sidebar filter interfaces
export interface SidebarFilterProps {
  activeFilters: string[];
  toggleFilter: (filter: string) => void;
  clearFilters: () => void;
  isSidebarExpanded: boolean;
}

export interface CaseTypeFilter {
  id: string;
  name: string;
  color: string;
}

// New API request interfaces for the new endpoint
export interface ResponseApiRequest {
  question: string;
  case_types: string[];
  limit: number;
}

export interface ResponseApiResponse {
  response: string;
  metadata: {
    [key: string]: {
      text: string;
      date: string;
      score: number;
      case_type: string;
      url: string;
      summary: string;
    }
  };
}

export interface Message {
  id: number;
  content: string;
  role: string;
  timestamp: string;
  metadata?: {
    metadata: MetadataItem[] | {
      [key: string]: {
        text: string;
        date: string;
        score: number;
        case_type: string;
        url: string;
        summary: string;
      }
    }
  };
}

export interface Session {
  session_id: string;
  messages: Message[];
}