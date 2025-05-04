// lib/chat-filter-utils.ts
import { Session, Message } from '@/components/ChatPage/types';

// Case type definition with display properties
export interface CaseTypeInfo {
  id: string;
  name: string;
  color: string;
  count?: number; // Used for displaying the count in the filter UI
}

// Define available case types with professional monochromatic styling
export const CASE_TYPES: CaseTypeInfo[] = [
  { id: 'civil', name: 'Civil', color: 'bg-gray-100 text-gray-800' },
  { id: 'penal', name: 'Penal', color: 'bg-gray-100 text-gray-800' },
  { id: 'labor', name: 'Labor', color: 'bg-gray-100 text-gray-800' },
  { id: 'constitutional', name: 'Constitucional', color: 'bg-gray-100 text-gray-800' }
];

/**
 * Extract case types from message metadata
 */
export function extractCaseTypesFromMessage(message: Message): string[] {
  if (!message.metadata) return [];
  
  const caseTypes = new Set<string>();
  
  // Get metadata array, handling different structures
  let metadataArray: any[] = [];
  
  if (Array.isArray(message.metadata.metadata)) {
    metadataArray = message.metadata.metadata;
  } else if (typeof message.metadata.metadata === 'object' && message.metadata.metadata !== null) {
    metadataArray = Object.values(message.metadata.metadata);
  }
  
  // Add case_type to set
  metadataArray.forEach(item => {
    if (item && item.case_type) {
      caseTypes.add(item.case_type.toLowerCase());
    }
  });
  
  return Array.from(caseTypes);
}

/**
 * Extract all case types from a session
 */
export function getSessionCaseTypes(session: Session): string[] {
  if (!session.messages || !Array.isArray(session.messages)) return [];
  
  const caseTypes = new Set<string>();
  
  session.messages.forEach(message => {
    const messageCaseTypes = extractCaseTypesFromMessage(message);
    messageCaseTypes.forEach(type => caseTypes.add(type));
  });
  
  return Array.from(caseTypes);
}

/**
 * Get all unique case types across all sessions with counts
 */
export function getAvailableCaseTypes(sessions: Session[]): CaseTypeInfo[] {
  // Create a map to count occurrences of each case type
  const caseTypeCounts: Map<string, number> = new Map();
  
  // Count case types across all sessions
  sessions.forEach(session => {
    const sessionCaseTypes = getSessionCaseTypes(session);
    sessionCaseTypes.forEach(type => {
      caseTypeCounts.set(type, (caseTypeCounts.get(type) || 0) + 1);
    });
  });
  
  // Create case type info objects with counts
  return CASE_TYPES.map(caseType => {
    return {
      ...caseType,
      count: caseTypeCounts.get(caseType.id) || 0
    };
  }).filter(caseType => caseType.count > 0); // Only include case types that appear in sessions
}

/**
 * Filter sessions based on selected case types
 */
export function filterSessionsByCaseTypes(sessions: Session[], filters: string[]): Session[] {
  // If no filters active, show all sessions
  if (filters.length === 0) return sessions;
  
  return sessions.filter(session => {
    const sessionCaseTypes = getSessionCaseTypes(session);
    // Return true if any of the session's case types match any of the active filters
    return sessionCaseTypes.some(type => filters.includes(type));
  });
}