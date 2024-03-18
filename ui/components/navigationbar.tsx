"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NavigationBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Unbind the event listener on cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (pathname === "/login") {
    return <></>;
  }

  return (
    <nav className="bg-black dark:bg-black w-full px-4 py-2 top-0">
      <div
        className="mx-auto flex items-center justify-start"
        style={{
          maxWidth: "1000px",
        }}
      >
        <div className="flex items-center space-x-4 mr-6">
          <Link className="text-[#f8f9fa] text-lg font-semibold" href="/">
            LibreLift
          </Link>
        </div>
        <div className="flex items-center justify-start flex-1">
          <nav className="flex items-center justify-start space-x-8">
            <Link className="text-[#f8f9fa] font-semibold" href="/pricing">
              Pricing
            </Link>
            <Link className="text-[#f8f9fa] font-semibold" href="#">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4 relative" ref={popupRef}>
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          <div className="relative">
            <button
              className="text-[#f8f9fa] text-sm font-medium bg-blue-500 px-3 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              Sign In
            </button>
            {/* Popup */}
            {isOpen && (
              <div className="absolute z-50 mt-2 w-[200px] right-0 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {/* Your profile options */}
                  <Link
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Public Repositories
                  </Link>
                  <Link
                    href="/profile/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
