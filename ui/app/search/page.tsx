import SearchRow from "@/components/SearchRow";

/* eslint-disable @next/next/no-img-element */
export default function Search() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-blue-500 focus:ring-offset-blue-200 focus:ring-2 focus:border-transparent">
            Search
          </button>
        </div>

        <div className="flex items-center">
          <label className="ml-4 mr-2">Sort By:</label>
          <select
            id="sort"
            className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Name</option>
            <option value="stars">Stars</option>
            <option value="updated">Updated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap justify-between">
        <SearchRow />
        <SearchRow />
      </div>
    </div>
  );
}
