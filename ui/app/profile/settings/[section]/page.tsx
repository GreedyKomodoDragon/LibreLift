"use client";

import Profile from "@/components/profile/settings/profile";
import Link from "next/link";

export default function settings({ params }: { params: { section: string } }) {
  return (
    <div className="flex min-h-screen mt-6">
      <div className="container grid flex-1 min-h-screen px-4 md:px-6 grid-cols-[250px_1fr] gap-6 items-start">
        <div className="flex flex-col gap-2 min-h-0 max-w-12">
          <Link
            className="inline-flex h-9 items-center font-semibold"
            href="/profile/settings/all"
          >
            Settings
          </Link>
          <div className="flex-1 grid gap-4">
            <div className="grid gap-1">
              <Link
                className="group inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                href="/profile/settings/profile"
              >
                Profile
              </Link>
              <Link
                className="group inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                href="/profile/settings/communication"
              >
                Communication
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {params.section === "all" && (
            <>
              <Link href="/profile/settings/profile">
                <div className="container py-4">
                  <h1 className="text-2xl font-semibold">Profile</h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    Remove your profile
                  </p>
                </div>
              </Link>

              <div className="border-b border-gray-200 dark:border-gray-800"></div>
              <Link href="/profile/settings/communication">
                <div className="container py-4">
                  <h1 className="text-2xl font-semibold">Communication</h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    Manage your notification preferences.
                  </p>
                </div>
              </Link>
            </>
          )}
          {params.section === "profile" && (
            <Profile />
          )}
        </div>
      </div>
    </div>
  );
}
