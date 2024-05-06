"use client";

import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

export default function PageSearchBar() {
  const router = useRouter();

  const [term, setTerm] = useState<string>("");

  const goSearch: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    
    if (term.length > 0) {
      router.push("/search?term=" + encodeURIComponent(term));
    }
  };

  return (
    <div className="flex">
      <div className="relative w-full md:w-auto"> {/* Adjust width based on screen size */}
        <form onSubmit={goSearch}>
          <input
            className="h-12 rounded-md border border-input bg-background px-3 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-lg file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-auto pr-10"
            placeholder="Begin your search here!"
            required
            onChange={(event) => setTerm(event.currentTarget.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center justify-center h-full whitespace-nowrap rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <span className="sr-only">Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}
