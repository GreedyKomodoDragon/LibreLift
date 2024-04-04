/* eslint-disable react/jsx-key */
"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import ProductGroupButton from "@/components/profile/ProductGroupButton";
import ResourcePriceBox from "@/components/resourcePriceBox";
import Searchbar from "@/components/searchbar";
import {
  RepoProduct,
  addProductToRepo,
  getRepoProducts,
} from "@/rest/products";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const [option, setOption] = useState<string>("selected");
  const [data, setData] = useState<RepoProduct[] | undefined>([]);
  const [isPending, setPending] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const reload = async () => {
    setPending(true);
    try {
      const products = await getRepoProducts(params.id);
      setData(products);
      setError(false);
    } catch (error) {
      setError(true);
    }
    setPending(false);
  };

  useEffect(() => {
    reload();
  }, []);

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
                        onAddClick={() => {
                          addProductToRepo(d.id, Number(params.id))
                            .then(() => {
                              reload();
                            })
                            .catch((error) => {
                              console.error(error);
                            });
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
      <div className="p-4">{showProducts(data)}</div>
    </div>
  );
}
