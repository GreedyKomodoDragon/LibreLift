"use client";

import SearchRow from "@/components/SearchRow";
import PageSearchBar from "@/components/pageSearchBar";
import { Document, SearchProjects } from "@/rest/search";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";

/* eslint-disable @next/next/no-img-element */
export default function Search() {
  const searchParams = useSearchParams();
  const search = searchParams.get("term");
  const [documents, setDocuments] = useState<Document[]>([]);

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

  useEffect(() => {
    setDocuments(convertItems(data));
  }, [data]);

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
        {documents.length === 0 && !isFetching && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="250"
              height="250"
              viewBox="0 0 31.576 31.576"
            >
              <path d="M16.779 23.888H6.215c-1.079 0-1.968-.844-1.968-1.923V4.446c0-1.079.889-1.928 1.968-1.928h13.677c1.08 0 1.984.849 1.984 1.928v11.917l1.231 1.383 1.257-1.407c.016-.017.03-.031.03-.048V2.57c0-1.419-1.14-2.57-2.56-2.57H4.169C2.807 0 1.73 1.104 1.73 2.466v21.44c0 1.42 1.123 2.574 2.543 2.574H15.22c.018 0 .036-.054.055-.074l1.879-2.092z" />
              <path d="M18.838 5.8H7.498a1.259 1.259 0 1 0 0 2.518h11.34a1.26 1.26 0 1 0 0-2.518m0 4.197H7.498c-.697 0-1.26.524-1.26 1.221 0 .693.563 1.221 1.26 1.221h11.34c.699 0 1.264-.528 1.264-1.221 0-.696-.565-1.221-1.264-1.221m-3.244 6.02a4.41 4.41 0 0 1 4.482-.878 1.264 1.264 0 0 0-1.238-1.02H7.498a1.259 1.259 0 1 0 0 2.518h7.527c.166-.231.356-.428.569-.62m-8.096 2.147c-.697 0-1.26.562-1.26 1.259s.563 1.259 1.26 1.259h6.864a4.5 4.5 0 0 1-.083-2.519zm18.567 6.168 1.483-1.646 1.728-1.914a2.208 2.208 0 0 0-3.278-2.955l-1.42 1.576-1.484 1.646-2.906-3.223a2.21 2.21 0 0 0-3.117-.16 2.205 2.205 0 0 0-.16 3.115l3.211 3.561-1.482 1.646-1.729 1.912a2.207 2.207 0 0 0 3.278 2.954l1.42-1.572 1.484-1.646 2.906 3.221a2.21 2.21 0 0 0 3.12.163 2.205 2.205 0 0 0 .16-3.115z" />
            </svg>
            <p className="mt-4 text-2xl">
              Oops! Looks like we couldn&apos;t find any results
            </p>
          </div>
        )}
        {documents.map((d) => (
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
