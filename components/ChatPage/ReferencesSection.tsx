// components/ChatPage/ReferencesSection.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { LogIn, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReferencesSectionProps } from "./types";

export default function ReferencesSection({ 
  metadata, 
  expandedIndex, 
  setExpandedIndex,
  isSignedIn,
  isPremium,
  isLoaded
}: ReferencesSectionProps) {
  return (
    <div className="mt-6 space-y-1">
      {metadata.map((item, index) => {
        // Apply locked status to references after the first one for:
        // 1. Not logged in users OR
        // 2. Logged in users who don't have premium
        const isLocked = (!isLoaded || !isSignedIn || (isSignedIn && !isPremium)) && index > 0;
        
        return (
          <React.Fragment key={index}>
            {/* Reference item with conditional styling */}
            <div className={`flex gap-3 py-3 ${isLocked ? "relative" : ""}`}>
              {/* Numbered circle */}
              <div className="flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
              </div>
              
              {/* Reference content */}
              <div className="flex-1 text-sm text-gray-800">
  <div className="flex justify-between items-start mb-2">
    <div>
      <span className="font-semibold">{item.case_type}</span>
      <span className="mx-2 text-gray-400">|</span>
      {item.date && (
        <>
          <span className="text-gray-600">{item.date}</span>
          <span className="mx-2 text-gray-400">|</span>
        </>
      )}
      <span>file-{item.file_id}</span>
    </div>
    <Badge variant="outline" className="text-xs">
      {Math.round(item.score * 100)}% coincidir
    </Badge>
  </div>
                
                {/* Content with conditional blur */}
                <p className={`text-sm text-gray-700 ${isLocked ? "blur-[2px]" : ""}`}>
                  {expandedIndex === index
                    ? item.text
                    : `${item.text.slice(0, 150)}...`}
                </p>
                
                {/* Action buttons row */}
                <div className={`flex items-center gap-4 mt-2 text-xs ${isLocked ? "blur-[2px]" : ""}`}>
                  {/* Toggle expand/collapse */}
                  <button
                    onClick={() => !isLocked && setExpandedIndex(index === expandedIndex ? null : index)}
                    className="text-blue-600 hover:underline"
                  >
                    {expandedIndex === index ? "Mostrar menos" : "Mostrar más"}
                  </button>
                  
                  {/* Document link */}
                  <a href={isLocked ? "#" : item.file_url}
                    onClick={(e) => isLocked && e.preventDefault()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>[Haga clic para ver el documento]</span>
                    <ExternalLink size={12} />
                  </a>
                  
                  {/* Summary Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-blue-600 hover:underline cursor-pointer">
                        [Ver resumen]
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Resumen del documento</DialogTitle>
                      </DialogHeader>
                      <div className="p-4">
                        <p className="text-sm text-gray-700">{item.file_summary}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {/* Login overlay for locked items */}
              {isLocked && (
                <div className="absolute inset-0 bg-red-50/50 border-2 border-red-200 rounded-lg flex items-center justify-center z-10">
                  <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-2">
                    {!isSignedIn ? (
                      <>
                        <LogIn size={18} className="text-red-500" />
                        <span className="text-sm font-medium">Inicie sesión para ver</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span className="text-sm font-medium">Activar premium para ver</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Divider between items */}
            {index < metadata.length - 1 && (
              <div className="border-t border-gray-200 w-full"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}