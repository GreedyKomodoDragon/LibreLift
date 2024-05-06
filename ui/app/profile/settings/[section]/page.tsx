"use client";

import Profile from "@/components/profile/settings/profile";

export default function settings({ params }: { params: { section: string } }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen mt-6">
      {/* Sidebar */}
      <div className="bg-gray-100 md:min-h-screen md:w-64 px-4 md:px-6 py-6 md:py-0">
        <div className="flex flex-col md:min-h-0 max-w-12">
          <a
            className="inline-flex h-9 items-center font-semibold"
            href="/profile/settings/all"
          >
            Settings
          </a>
          <div className="flex-1 grid gap-4 mt-4 md:mt-6">
            <div className="grid gap-1">
              <a
                className="group inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-gray-200 hover:text-gray-900 focus:bg-gray-200 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                href="/profile/settings/profile"
              >
                Profile
              </a>
              <a
                className="group inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-gray-200 hover:text-gray-900 focus:bg-gray-200 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                href="/profile/settings/communication"
              >
                Communication
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-6">
        {params.section === "all" && (
          <>
            <a href="/profile/settings/profile">
              <div className="container py-4">
                <h1 className="text-2xl font-semibold">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Remove your profile
                </p>
              </div>
            </a>

            <div className="border-b border-gray-200 dark:border-gray-800"></div>
            <a href="/profile/settings/communication">
              <div className="container py-4">
                <h1 className="text-2xl font-semibold">Communication</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage your notification preferences.
                </p>
              </div>
            </a>
          </>
        )}
        {params.section === "profile" && <Profile />}
      </div>
    </div>
  );
}
