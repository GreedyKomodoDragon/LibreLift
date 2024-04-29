/* eslint-disable react/jsx-key */
"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import ProductGroupButton from "@/components/profile/ProductGroupButton";
import WarningMessage from "@/components/profile/WarningMessage";
import ResourcePriceBox from "@/components/resourcePriceBox";
import Searchbar from "@/components/searchbar";
import { GetRepoMetaData } from "@/rest/github";
import {
  RepoProduct,
  addProductToRepo,
  getRepoProducts,
} from "@/rest/products";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const [option, setOption] = useState<string>("selected");

  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    refetchInterval: 0,
    queryKey: ["repo-products", params.id],
    queryFn: () => getRepoProducts(params.id),
  });

  const meta = useQuery({
    refetchInterval: 0,
    queryKey: ["repo", params.id],
    queryFn: () => GetRepoMetaData(Number(params.id)),
  });

  const showProducts = (data: RepoProduct[] | undefined) => {
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
                    <div key={d.id} className="sm:w-1/3">
                      <ResourcePriceBox
                        title={d.name}
                        pricing={`$${d.price / 100} per Month`}
                        url={d.url}
                        option={true}
                        added={d.isAdded}
                        disabled={meta.data?.revokedPending}
                        onAddClick={async () => {
                          try {
                            await addProductToRepo(d.id, Number(params.id));
                            await queryClient.invalidateQueries({
                              queryKey: ["repo-products", params.id],
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
      {!meta.isPending && meta.data && meta.data.revokedPending && (
        <div className="mb-5">
          <WarningMessage message="Cannot add products to repository if your account is pending deactivation" />
        </div>
      )}
      <div className="p-4">
        <h1 className="text-4xl">
          {!meta.isPending && meta.data && meta.data.name}
        </h1>
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
      <div className="p-4">{showProducts(data)}</div>
    </div>
  );
}
