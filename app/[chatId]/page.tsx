// app/[chatId]/page.tsx
'use client'

import ChatPage from '@/components/ChatPage';
import { use } from 'react';

export default function ChatWithId({ params }: { params: Promise<{ chatId: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  return (
    <ChatPage initialChatId={resolvedParams.chatId} />
  );
}