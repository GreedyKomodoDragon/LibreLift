"use client";

import Profile from "@/components/profile/settings/profile";
import Link from "next/link";

export default function settings() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen mt-6">
      {/* Sidebar */}
      <div className="bg-gray-100 md:min-h-screen md:w-64 px-4 md:px-6 py-6 md:py-0">
        <div className="flex flex-col md:min-h-0 max-w-12">
          <Link
            className="inline-flex h-9 items-center font-semibold"
            href="/profile/settings/all"
          >
            Settings
          </Link>
          <div className="flex-1 grid gap-4 mt-4 md:mt-6">
            <div className="grid gap-1">
              <Link
                className="group inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-gray-200 hover:text-gray-900 focus:bg-gray-200 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                href="/profile/settings/profile"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-6">
        <Profile />
      </div>
    </div>
  );
}
