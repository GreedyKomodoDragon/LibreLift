"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavigationBar() {
  const pathname = usePathname();

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
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          <Link
            className="text-[#f8f9fa] text-sm font-medium bg-blue-500 px-3 py-2 rounded-md hover:bg-blue-600 transition duration-300"
            href="/login"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
