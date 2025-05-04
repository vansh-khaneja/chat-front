// components/ChatPage/SidebarFilter.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, FilterIcon } from 'lucide-react';
import { CaseTypeInfo } from '@/lib/chat-filter-utils';

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
  // Only show filter UI if sidebar is expanded
  if (!isSidebarExpanded) {
    return null;
  }
  
  // If no case types are available, don't show the filter
  if (availableCaseTypes.length === 0) {
    return null;
  }
  
  return (
    <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
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
            className="h-6 px-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            <XIcon size={12} className="mr-1" /> Limpiar
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {availableCaseTypes.map((caseType) => {
          const isActive = activeFilters.includes(caseType.id);
          
          return (
            <button
              key={caseType.id}
              onClick={() => toggleFilter(caseType.id)}
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
        <div className="mt-3 pt-2 border-t border-gray-200 flex flex-wrap gap-1.5">
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
                  onClick={() => toggleFilter(filter)}
                  className="ml-1.5 hover:text-gray-900"
                >
                  <XIcon size={10} />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}