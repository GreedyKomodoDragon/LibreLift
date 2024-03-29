/* eslint-disable react/jsx-key */
"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import ProductGroupButton from "@/components/profile/ProductGroupButton";
import ResourcePriceBox from "@/components/resourcePriceBox";
import Searchbar from "@/components/searchbar";
import { getRepoProducts } from "@/rest/products";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const [option, setOption] = useState<string>("selected");

  const { isPending, error, data } = useQuery({
    refetchInterval: 0,
    queryKey: [`repoProducts-${params.id}`],
    queryFn: () => getRepoProducts(params.id),
  });

  const showProducts = () => {
    switch (option) {
      case "selected":
        return (
          <>
            {isPending && (
              <div className="flex flex-wrap justify-center">
                <LoadingSpinner size={16} />
              </div>
            )}
            {!isPending && !error && data && (
              <div className="flex flex-wrap">
                {data
                  .filter((d) => d.isAdded)
                  .map((d) => (
                    <div className="sm:w-1/3">
                      <ResourcePriceBox
                        title={d.name}
                        pricing={`$${d.price / 100} per Month`}
                        url={d.url}
                      />
                    </div>
                  ))}
              </div>
            )}
          </>
        );
      case "unselected":
        return (
          <>
            {isPending && (
              <div className="flex flex-wrap justify-center">
                <LoadingSpinner size={16} />
              </div>
            )}
            {!isPending && !error && data && (
              <div className="flex flex-wrap">
                {data
                  .filter((d) => !d.isAdded)
                  .map((d) => (
                    <div className="sm:w-1/3">
                      <ResourcePriceBox
                        title={d.name}
                        pricing={`$${d.price / 100} per Month`}
                        url={d.url}
                      />
                    </div>
                  ))}
              </div>
            )}
          </>
        );
      case "all":
        return (
          <>
            {isPending && (
              <div className="flex flex-wrap justify-center">
                <LoadingSpinner size={16} />
              </div>
            )}
            {!isPending && !error && data && (
              <div className="flex flex-wrap">
                {data.map((d) => (
                  <div className="sm:w-1/3">
                    <ResourcePriceBox
                      title={d.name}
                      pricing={`$${d.price / 100} per Month`}
                      url={d.url}
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
      <div className="p-4">
        <h1 className="text-4xl">Products List</h1>
        <h1 className="text-2xl ml-4">Repo: {params.id}</h1>
      </div>
      <Searchbar />
      <div className="float-right mr-8">
        <ProductGroupButton
          onChange={(value: string) => {
            setOption(value);
          }}
        />
      </div>
      <br />
      <div className="p-4">{showProducts()}</div>
    </div>
  );
}
