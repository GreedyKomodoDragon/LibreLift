"use client";

import AccountAlerts from "@/components/profile/AccountAlerts";
/* eslint-disable @next/next/no-img-element */
import RepoBlock from "@/components/profile/RepoBlock";
import { debounce } from "@/lib/utils";
import { GetRepos, Repo } from "@/rest/github";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

/* eslint-disable react/jsx-key */
export default function Repositories() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data, fetchNextPage, isFetching, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey: ["repoData", searchTerm],
      queryFn: ({ pageParam }) => GetRepos(pageParam, searchTerm),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) {
          return null;
        }

        return pages.length + 1;
      },
    });

  const debouncedFilterItems = debounce((term: string) => {
    setSearchTerm(term);
  }, 1000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    debouncedFilterItems(term);
  };

  const convertItems = (data: InfiniteData<Repo[], unknown> | undefined) => {
    if (data === undefined || data.pages.length === 0) {
      return [];
    }

    const items: Repo[] = [];
    for (let index = 0; index < data.pages.length; index++) {
      items.push(...data.pages[index]);
    }

    return items;
  };

  useEffect(() => {
    // Event listener to check scroll position
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const bottomOffset = documentHeight - (windowHeight + scrollTop);

      // Load more items when user reaches the bottom 10px of the page
      if (bottomOffset < 10 && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [stop, isFetchingNextPage]);

  return (
    <div className="p-4 h-screen">
      <AccountAlerts />
      <div className="ml-8 font-semibold whitespace-nowrap tracking-tight text-4xl flex items-center">
        <h3>Your Repositories</h3>
      </div>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search Your Repositories..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>
          <button
            onClick={async () => {
              await queryClient.invalidateQueries({
                queryKey: ["repoData", searchTerm],
              });
            }}
            className="ml-2 bg-violet-900 text-white text-l p-1 px-2 rounded-md flex items-center"
          >
            <span className="pr-2 hidden sm:inline">Refresh</span>
            <svg
              width="20"
              height="20"
              viewBox="-1.5 -2.5 24 24"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMinYMin"
              className={`w-8 h-8 ${isFetching ? "animate-spin" : ""}`}
            >
              <path
                fill="#FFFFFF"
                d="m17.83 4.194.42-1.377a1 1 0 1 1 1.913.585l-1.17 3.825a1 1 0 0 1-1.248.664l-3.825-1.17a1 1 0 1 1 .585-1.912l1.672.511A7.381 7.381 0 0 0 3.185 6.584l-.26.633a1 1 0 1 1-1.85-.758l.26-.633A9.381 9.381 0 0 1 17.83 4.194M2.308 14.807l-.327 1.311a1 1 0 1 1-1.94-.484l.967-3.88a1 1 0 0 1 1.265-.716l3.828.954a1 1 0 0 1-.484 1.941l-1.786-.445a7.384 7.384 0 0 0 13.216-1.792 1 1 0 1 1 1.906.608 9.38 9.38 0 0 1-5.38 5.831 9.386 9.386 0 0 1-11.265-3.328"
              />
            </svg>
          </button>
        </div>
        <RepoBlock
          isPending={isFetching}
          error={error}
          data={convertItems(data)}
        />
      </div>
    </div>
  );
}
