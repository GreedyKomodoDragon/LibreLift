"use client";

import { Dispatch, SetStateAction } from "react";

interface ProductSearchBarProps {
  setTerm: Dispatch<SetStateAction<string>>;
}

export default function ProductSearchBar(props: ProductSearchBarProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div>
          <input
            className="h-12 rounded-md border border-input bg-background px-3 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-lg file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1 pr-10"
            placeholder="Search for products"
            required
            onChange={(event) => props.setTerm(event.currentTarget.value)}
          />
        </div>
      </div>
    </div>
  );
}
