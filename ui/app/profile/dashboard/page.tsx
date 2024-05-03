"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="bg-gray-100 dark:bg-gray-950 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Funding Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">GreedyKomodoDragon/librelift</p>
      </div>
      <div className="flex items-center justify-between mb-6">
        <a
          href="https://dashboard.stripe.com/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-[#6772e5] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5469d4] focus:outline-none focus:ring-2 focus:ring-[#6772e5] focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          target="_blank" rel="noopener noreferrer"
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
            className="mr-2 h-5 w-5"
          >
            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
            <line x1="2" x2="22" y1="10" y2="10"></line>
          </svg>
          Go to Stripe Dashboard
        </a>
        <div ref={dropdownRef} className="relative">
          <button
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-10 rounded-full h-9"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen ? "true" : "false"}
            onClick={toggleDropdown}
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
              className={`h-4 w-4 ${isOpen ? "transform rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div
                className="max-h-60 overflow-y-auto py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Action
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Another action
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Something else here
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
          data-v0-t="card"
        >
          <div className="flex-col space-y-1.5 p-6 flex items-center justify-between">
            <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
              Total Monthly Revenue
            </h3>
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
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
            >
              <line x1="12" x2="12" y1="2" y2="22"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold">$45,231.89</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              +20.1% from last month
            </div>
          </div>
        </div>
        <div
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
          data-v0-t="card"
        >
          <div className="flex-col space-y-1.5 p-6 flex items-center justify-between">
            <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
              Customers
            </h3>
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
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold">+2,350</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              +180.1% from last month
            </div>
          </div>
        </div>
        <div
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
          data-v0-t="card"
        >
          <div className="flex-col space-y-1.5 p-6 flex items-center justify-between">
            <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
              Page Visits
            </h3>
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
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold">+2,350</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              +180.1% from last month
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
          data-v0-t="card"
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
              Top Selling Products
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">EC2 T3 Medium</div>
                <div className="text-2xl font-bold">1,250 sold</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">S3 1TB</div>
                <div className="text-2xl font-bold">850 sold</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">Vercel Monthly Plan</div>
                <div className="text-2xl font-bold">720 sold</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">EKS Control Plane</div>
                <div className="text-2xl font-bold">580 sold</div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
          data-v0-t="card"
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
              Top Selling Subscriptions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">EC2 T3 Medium</div>
                <div className="text-2xl font-bold">1,250 subscribers</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">S3 1TB</div>
                <div className="text-2xl font-bold">850 subscribers</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">Vercel Monthly Plan</div>
                <div className="text-2xl font-bold">720 subscribers</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm font-medium">EKS Control Plane</div>
                <div className="text-2xl font-bold">580 subscribers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
