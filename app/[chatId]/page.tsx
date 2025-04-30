// app/[chatId]/page.tsx
'use client'

import ChatPage from '@/components/ChatPage';
import { useParams } from 'next/navigation';

export default function ChatWithId() {
  // Get chatId directly from useParams instead of passing it as a Promise
  const params = useParams();
  const chatId = params?.chatId as string;
  
  return (
    <ChatPage initialChatId={chatId} />
  );
}