import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, FilterIcon } from 'lucide-react';
import { CaseTypeInfo } from '@/lib/chat-filter-utils';
import { useUser, SignInButton } from '@clerk/nextjs';
import { usePremium } from '@/lib/premium-context';

// Define the props for the component
interface SidebarFilterProps {
  activeFilters: string[];
  toggleFilter: (filter: string) => void;
  clearFilters: () => void;
  isSidebarExpanded: boolean;
  availableCaseTypes: CaseTypeInfo[];
}

export default function SidebarFilter({
  activeFilters,
  toggleFilter,
  clearFilters,
  isSidebarExpanded,
  availableCaseTypes
}: SidebarFilterProps) {
  // Get user and premium status
  const { user, isSignedIn } = useUser();
  const { isPremium, loading } = usePremium();
  
  const email = user?.primaryEmailAddress?.emailAddress;
  
  const handleActivatePro = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };
  
  // Only show filter UI if sidebar is expanded
  if (!isSidebarExpanded) {
    return null;
  }
  
  // If no case types are available, don't show the filter
  if (availableCaseTypes.length === 0) {
    return null;
  }
  
  // Check if filter should be locked (user is not premium)
  const isFilterLocked = !loading && (!isSignedIn || (isSignedIn && !isPremium));
  
  return (
    <div className="relative px-3 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-xs font-medium text-gray-700">
          <FilterIcon size={14} className="mr-1.5" />
          Filtrar por tipo de caso
        </div>
        
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className={`h-6 px-1.5 text-xs text-gray-500 hover:text-gray-700 ${isFilterLocked ? 'blur-[2px]' : ''}`}
            disabled={isFilterLocked}
          >
            <XIcon size={12} className="mr-1" /> Limpiar
          </Button>
        )}
      </div>
      
      <div className={`flex flex-wrap gap-1.5 ${isFilterLocked ? 'blur-[2px]' : ''}`}>
        {availableCaseTypes.map((caseType) => {
          const isActive = activeFilters.includes(caseType.id);
          
          return (
            <button
              key={caseType.id}
              onClick={() => !isFilterLocked && toggleFilter(caseType.id)}
              disabled={isFilterLocked}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors
                ${isActive 
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {isActive && <CheckIcon size={10} />}
              {caseType.name}
              {caseType.count !== undefined && (
                <span className={`ml-1 px-1 rounded text-[10px] ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-300'
                }`}>
                  {caseType.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {activeFilters.length > 0 && (
        <div className={`mt-3 pt-2 border-t border-gray-200 flex flex-wrap gap-1.5 ${isFilterLocked ? 'blur-[2px]' : ''}`}>
          <div className="w-full text-xs text-gray-500 mb-1.5">Filtros activos:</div>
          {activeFilters.map(filter => {
            const caseType = availableCaseTypes.find(ct => ct.id === filter);
            return (
              <Badge 
                key={filter} 
                variant="outline" 
                className="text-xs bg-gray-100 border-gray-300"
              >
                {caseType?.name || filter}
                <button 
                  onClick={() => !isFilterLocked && toggleFilter(filter)}
                  disabled={isFilterLocked}
                  className="ml-1.5 hover:text-gray-900"
                >
                  <XIcon size={10} />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Premium lock overlay */}
      {isFilterLocked && (
        <div className="absolute inset-0 bg-red-50/50 border-2 border-red-200 rounded-lg flex items-center justify-center z-10">
          <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-2">
            {!isSignedIn ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
                <SignInButton mode="modal">
                  <button 
                    className="text-xs sm:text-sm font-medium text-center sm:text-left hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Inicie sesión para filtrar
                  </button>
                </SignInButton>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <button 
                  onClick={handleActivatePro}
                  className="text-xs sm:text-sm font-medium text-center sm:text-left hover:text-red-600 transition-colors cursor-pointer"
                >
                  Activar premium para filtrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}