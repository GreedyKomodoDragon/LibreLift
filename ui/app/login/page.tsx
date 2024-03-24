/* eslint-disable @next/next/no-img-element */
'use client'

import { getToken } from "@/rest/auth";

const REDIRECT_URI = 'http://127.0.0.1:3000/oauth/github/callback';

export default function Login() {
  const handleLogin = async () => {
    const CLIENT_ID = await getToken()

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user`;
  };

  return (
    <div className="flex h-screen">
      <div className="absolute top-0 left-0 p-4">
        <a href="/">
          <img src={"/logo.svg"} style={{ height: 50, width: 50 }} alt="logo" />
        </a>
      </div>
      <div className="flex-1 bg-gray-100 flex justify-center items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-16 h-16 text-blue-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
      </div>

      <div className="flex-1 bg-gray-800 text-white flex justify-center items-center">
        <div className="max-w-md w-full py-12 px-6">
          <h2 className="text-3xl font-extrabold">Sign in!</h2>
          <p className="mt-2 text-sm">
            Currently we only support Github Logins
          </p>
          <a
            onClick={handleLogin}
            className="cursor-pointer w-full mt-4 inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
          >
            <img
              src={"/github-mark.svg"}
              style={{ height: 40, width: 40 }}
              alt="Github logo"
              className="mr-2"
            />
            Sign in with GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
