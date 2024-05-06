"use client";

import SearchRow from "@/components/SearchRow";
import PageSearchBar from "@/components/pageSearchBar";
import Searchbar from "@/components/searchbar";
import { Document, SearchProjects } from "@/rest/search";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";

/* eslint-disable @next/next/no-img-element */
export default function Search() {
  const searchParams = useSearchParams();
  const search = searchParams.get("term");

  const { data, fetchNextPage, isFetching, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey: ["search-results", search],
      queryFn: ({ pageParam }) => SearchProjects(search || "", pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) {
          return null;
        }

        return pages.length + 1;
      },
    });

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

  const convertItems = (
    data: InfiniteData<Document[], unknown> | undefined
  ) => {
    if (data === undefined || data.pages.length === 0) {
      return [];
    }

    const items: Document[] = [];
    for (let index = 0; index < data.pages.length; index++) {
      items.push(...data.pages[index]);
    }

    return items;
  };

  return (
    <div className="container mx-auto py-8">
      <PageSearchBar />
      <h1 className="text-xl my-4">Searching for: {search}</h1>
      <div className="flex flex-wrap justify-between w-full">
        {convertItems(data).map((d) => (
          // eslint-disable-next-line react/jsx-key
          <SearchRow
            id={d.id}
            projectName={d.name}
            description={d.description}
          />
        ))}
        <div className="flex justify-center w-full">
          <ThreeDots
            visible={isFetching}
            height="80"
            width="80"
            color="#4fa94d"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      </div>
    </div>
  );
}
