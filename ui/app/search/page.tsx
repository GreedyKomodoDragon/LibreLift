"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import SearchRow from "@/components/SearchRow";
import Searchbar from "@/components/searchbar";
import { SearchProjects } from "@/rest/search";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

/* eslint-disable @next/next/no-img-element */
export default function Search() {
  const searchParams = useSearchParams();
  const search = searchParams.get("term");

  const { isPending, error, data } = useQuery({
    refetchInterval: 0,
    queryKey: ["search-results", search],
    queryFn: () => SearchProjects(search || ""),
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Searchbar />
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

      <div className="flex flex-wrap justify-between w-full">
        {isPending && (
          <div className="flex justify-center items-center w-full">
            <LoadingSpinner size={16} />
          </div>
        )}
        {!isPending && !error && (
          <>
            {data.length !== 0 ? (
              data.map((d) => (
                // eslint-disable-next-line react/jsx-key
                <SearchRow
                  id={d.id}
                  projectName={d.name}
                  description={d.description}
                />
              ))
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mt-4">
                    No search results found
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Sorry, we could not find any results matching your search.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        {}
      </div>
    </div>
  );
}
