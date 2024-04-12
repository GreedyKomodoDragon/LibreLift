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
            <div className="container py-4">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold mb-4">Profile</h1>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Revoking GitHub Access
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                    By revoking access to GitHub, you'll deactivate your account
                    and undergo a 30-day period with the following actions:
                  </p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>
                      Your GitHub repositories will be revoked and delisted from
                      LibreLift.
                    </li>
                    <li>All subscriptions will be canceled.</li>
                  </ul>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                    During the deactivation period, the following tasks will be
                    affected:
                  </p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>No one can subscribe to your GitHub repositories.</li>
                    <li>
                      No one can make one-off payments to your GitHub
                      repositories.
                    </li>
                    <li>
                      Current subscriptions will remain active (as a
                      precaution).
                    </li>
                  </ul>
                  <button
                    className="flex items-center bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="/github-mark.svg"
                      style={{ height: 24, width: 24 }}
                      alt="GitHub logo"
                      className="mr-2"
                    />
                    Revoke GitHub Account Access
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
