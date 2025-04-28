// components/ChatPage/LoadingAnalysis.tsx
import React, { useState, useEffect } from "react";

export default function LoadingAnalysis() {
  const [dots, setDots] = useState<string>("");
  const [opacity, setOpacity] = useState<number>(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(prev => prev === 1 ? 0.4 : 1);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      className="text-sm font-medium transition-opacity duration-800"
      style={{ 
        opacity: opacity,
        color: '#606060' 
      }}
    >
      Analizando el caso{dots}
    </div>
  );
}