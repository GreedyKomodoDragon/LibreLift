"use client";

import AccountAlerts from "@/components/profile/AccountAlerts";
/* eslint-disable @next/next/no-img-element */
import RepoBlock from "@/components/profile/RepoBlock";
import { debounce } from "@/lib/utils";
import { GetRepos, Repo } from "@/rest/github";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/* eslint-disable react/jsx-key */
export default function Repostories() {
  const {
    data,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["repoData"],
    queryFn: ({ pageParam }) => GetRepos(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return pages.length + 1;
    },
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filtered, setFiltered] = useState<Repo[]>();

  const debouncedFilterItems = debounce((term: string) => {
    setSearchTerm(term);
  }, 500); // Adjust delay time as needed

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    debouncedFilterItems(term);
  };

  const filteredItems = () => {
    if (data === undefined || data.pages.length === 0) {
      return [];
    }

    const items: Repo[] = [];
    for (let index = 0; index < data.pages.length; index++) {
      items.push(...data.pages[index]);
    }

    if (searchTerm.length === 0) {
      return items;
    }

    const lowerCasedTerm = searchTerm.toLowerCase();

    return items.filter((item: { name: string }) => {
      return item.name.toLowerCase().includes(lowerCasedTerm);
    });
  };

  useEffect(() => {
    setFiltered(filteredItems());
  }, [searchTerm, data]);

  useEffect(() => {
    // Event listener to check scroll position
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const bottomOffset = documentHeight - (windowHeight + scrollTop);

      // Load more items when user reaches the bottom 20px of the page
      // Must limit spamming by only allowing three more attempts
      if (bottomOffset < 20 && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="p-4">
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

          <div className="flex items-center space-x-2">
            <label htmlFor="filter" className="text-gray-700">
              Filter By:
            </label>
            <select
              id="filter"
              className="p-2 form-select focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md shadow-sm"
            >
              <option value="all">All</option>
              <option value="added">Added</option>
              <option value="not-connected">Not Connected</option>
            </select>
            <label htmlFor="sort" className="text-gray-700">
              Sort By:
            </label>
            <select
              id="sort"
              className="p-2  form-select focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md shadow-sm"
            >
              <option value="stars">Stars</option>
              <option value="last-changed">Last Changed</option>
            </select>
          </div>
        </div>
        <RepoBlock isPending={isFetching} error={error} data={filtered || []} />
      </div>
    </div>
  );
}
