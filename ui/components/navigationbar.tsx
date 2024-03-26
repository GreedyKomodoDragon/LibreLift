/* eslint-disable @next/next/no-img-element */
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAvatarURL } from "@/rest/auth";
import LoadingSpinner from "./LoadingSpinner";

export default function NavigationBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { isPending, error, data } = useQuery({
    queryKey: ["avatar"],
    queryFn: () => getAvatarURL(),
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
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
            {/* TODO: Tidy this up  */}
            {isPending && (
              <div className="ml-2">
                <LoadingSpinner size={6} />
              </div>
            )}
            {!isPending && data && (
              <img
                style={{ height: "2rem", width: "2rem" }}
                alt="avatar"
                src={data}
                className="rounded-lg cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              />
            )}
            {!isPending && error && (
              <button
                className="text-[#f8f9fa] text-sm font-medium bg-blue-500 px-3 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                onClick={() => router.push("/login")}
              >
                Sign In
              </button>
            )}
            {isOpen && (
              <div className="absolute z-50 mt-2 w-[200px] right-0 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {/* Your profile options */}
                  <Link
                    href="/profile/repositories"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Public Repositories
                  </Link>
                  <Link
                    href="/profile/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setIsOpen(false);
                    }}
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
