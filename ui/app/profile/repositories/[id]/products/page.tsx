/* eslint-disable react/jsx-key */
"use client";

import ProductGroupButton from "@/components/profile/ProductGroupButton";
import WarningMessage from "@/components/profile/WarningMessage";
import ProductSearchBar from "@/components/profile/repositories/ProductSearchBar";
import ResourcePriceBox from "@/components/resourcePriceBox";
import { debounce } from "@/lib/utils";
import { GetRepoMetaData } from "@/rest/github";
import {
  RepoProduct,
  addProductToRepo,
  getRepoProducts,
} from "@/rest/products";
import { useStore } from "@/store/store";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";

export default function Page({ params }: { params: { id: string } }) {
  const [option, setOption] = useState<string>("selected");
  const [term, setTerm] = useState<string>("");
  const updateError = useStore((state) => state.updateError);

  const queryClient = useQueryClient();

  const { data, fetchNextPage, isFetching, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey: ["repo-products", params.id, option, term],
      queryFn: ({ pageParam }) =>
        getRepoProducts(params.id, term, option, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) {
          return null;
        }

        return pages.length + 1;
      },
    });

  const debouncedSetTerms = debounce((term: string) => {
    setTerm(term);
  }, 1000);

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

  const meta = useQuery({
    refetchInterval: 0,
    queryKey: ["repo", params.id],
    queryFn: () => GetRepoMetaData(Number(params.id)),
  });

  useEffect(() => {
    if (meta.error) {
      updateError("failed to get repo information, try again later");
    }
  }, [meta.error, updateError]);

  useEffect(() => {
    if (error) {
      updateError("failed to get repo products, try again later");
    }
  }, [error, updateError]);

  const convertItems = (
    data: InfiniteData<RepoProduct[], unknown> | undefined
  ) => {
    if (data === undefined || data.pages.length === 0) {
      return [];
    }

    const items: RepoProduct[] = [];
    for (let index = 0; index < data.pages.length; index++) {
      items.push(...data.pages[index]);
    }

    return items;
  };

  const showProducts = (data: RepoProduct[] | undefined) => {
    switch (option) {
      case "selected":
        return (
          <>
            {data && data.length > 0 && (
              <div className="flex flex-wrap">
                {data.map((d) => (
                  <div className="md:w-1/3 sm:w-1/2 w-full" key={d.id}>
                    <ResourcePriceBox
                      title={d.name}
                      pricing={`$${d.price / 100} per Month`}
                      url={d.url}
                    />
                  </div>
                ))}
              </div>
            )}
            {!(data && data.length > 0) && !isFetching && (
              <div className="flex items-center justify-center w-full h-40">
                <p className="text-gray-600 text-2xl">
                  No products found. Start adding products to receive donations!
                </p>
              </div>
            )}
          </>
        );
      case "unselected":
        return (
          <>
            {data && (
              <div className="flex flex-wrap">
                {data.map((d) => (
                  <div key={d.id} className="md:w-1/3 sm:w-1/2 w-full">
                    <ResourcePriceBox
                      title={d.name}
                      pricing={`$${d.price / 100} per Month`}
                      url={d.url}
                      option={true}
                      added={false}
                      disabled={meta.data?.revokedPending}
                      onAddClick={async () => {
                        try {
                          await addProductToRepo(d.id, Number(params.id));
                          await queryClient.invalidateQueries({
                            queryKey: [
                              "repo-products",
                              params.id,
                              option,
                              term,
                            ],
                          });
                          await queryClient.invalidateQueries({
                            queryKey: [
                              "repo-products",
                              params.id,
                              "selected",
                              term,
                            ],
                          });
                        } catch (error) {
                          console.error(error);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="p-4">
      {!meta.isPending && meta.data && meta.data.revokedPending && (
        <div className="mb-5">
          <WarningMessage message="Cannot add products to repository if your account is pending deactivation" />
        </div>
      )}
      <div className="p-4">
        <h1 className="md:text-4xl sm:text-3xl text-2xl">
          {!meta.isPending && meta.data && meta.data.name}
        </h1>
      </div>
      <div className="flex flex-col items-center">
        <ProductSearchBar setTerm={debouncedSetTerms} className="mb-4" />
        <ProductGroupButton
          onChange={(value: string) => {
            setOption(value);
          }}
          className=""
        />
      </div>

      <div className="p-4">
        {/* TODO: Add an error message in here */}
        {showProducts(convertItems(data))}
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
