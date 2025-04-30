// components/ChatPage/CategorySelector.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { CategorySelectorProps, CategoryButtonProps } from "./types";

function CategoryButton({ id, label, isSelected, onClick }: CategoryButtonProps) {
  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className={`rounded-full px-3 py-1 text-sm ${
        isSelected ? "bg-black hover:bg-gray-800" : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export default function CategorySelector({ selectedCategories, toggleCategory }: CategorySelectorProps) {
  return (
    <>
      <CategoryButton 
        id="penal"
        label="penal"
        isSelected={selectedCategories.includes('penal')}
        onClick={() => toggleCategory('penal')}
      />
      
      <CategoryButton 
        id="civil"
        label="civil"
        isSelected={selectedCategories.includes('civil')}
        onClick={() => toggleCategory('civil')}
      />
      <CategoryButton 
        id="labor"
        label="labor"
        isSelected={selectedCategories.includes('labor')}
        onClick={() => toggleCategory('labor')}
      />
      
      <CategoryButton 
        id="constitutional"
        label="constitutional"
        isSelected={selectedCategories.includes('constitutional')}
        onClick={() => toggleCategory('constitutional')}
      />
    </>
  );
}