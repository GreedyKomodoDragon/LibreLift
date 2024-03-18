import RepoBlock from "@/components/profile/RepoBlock";

/* eslint-disable react/jsx-key */
export default function Repostories() {
  return (
    <div className="p-4">
      <h3 className="font-semibold whitespace-nowrap tracking-tight text-4xl">
        Your Public Repostories
        {/* Refresh Icon will go here, will need a tooltip as well */}
        <button>
          <img
            src={"/logo.svg"}
            style={{ height: 40, width: 40 }}
            alt="Github logo"
            className="mr-2"
          />
        </button>
      </h3>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search Your Repostories..."
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-64"
            />
            <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-blue-500 focus:ring-offset-blue-200 focus:ring-2 focus:border-transparent">
              Search
            </button>
          </div>

          <div className="flex items-center">
            <label className="ml-4 mr-2">Filter By:</label>
            <select
              id="sort"
              className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">All</option>
              <option value="stars">Added</option>
              <option value="updated">Not Connected</option>
            </select>
            <label className="ml-4 mr-2">Sort By:</label>
            <select
              id="sort"
              className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Stars</option>
              <option value="stars">Funding</option>
              <option value="updated">Last Changed</option>
            </select>
          </div>
        </div>
        <RepoBlock />
      </div>
    </div>
  );
}
