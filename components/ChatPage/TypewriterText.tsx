// components/ChatPage/TypewriterText.tsx
import React, { useState, useRef, useEffect } from "react";
import { TypewriterTextProps } from "./types";

export default function TypewriterText({ content, onComplete }: TypewriterTextProps) {
  const [displayedContent, setDisplayedContent] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const contentRef = useRef<string>(content);
  const speedRef = useRef<number>(5);
  
  useEffect(() => {
    contentRef.current = content;
    setDisplayedContent("");
    setIsComplete(false);
    
    let currentLength = 0;
    
    const interval = setInterval(() => {
      if (currentLength < contentRef.current.length) {
        const nextChunk = contentRef.current.substring(
          currentLength, 
          currentLength + speedRef.current
        );
        
        setDisplayedContent(prev => prev + nextChunk);
        currentLength += speedRef.current;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, [content, onComplete]);
  
  function formatText(text: string) {
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
  
  return (
    <>
      {formatText(displayedContent)}
      {!isComplete && <span className="animate-pulse">▋</span>}
    </>
  );
}