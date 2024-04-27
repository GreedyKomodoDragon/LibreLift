"use client";

import AccountAlerts from "@/components/profile/AccountAlerts";
/* eslint-disable @next/next/no-img-element */
import RepoBlock from "@/components/profile/RepoBlock";
import { debounce } from "@/lib/utils";
import { GetRepos, Repo } from "@/rest/github";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/* eslint-disable react/jsx-key */
export default function Repostories() {
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
      <h3 className="ml-8 font-semibold whitespace-nowrap tracking-tight text-4xl">
        Your Open Source Repostories
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-80"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <RepoBlock isPending={isFetching} error={error} data={convertItems(data)} />
      </div>
    </div>
  );
}
