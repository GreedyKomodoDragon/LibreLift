/* eslint-disable @next/next/no-img-element */

export default function Login() {
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
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
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
            href="#"
            className="w-full mt-4 inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
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
