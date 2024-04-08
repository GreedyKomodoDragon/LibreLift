/* eslint-disable react/jsx-key */
"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import ResourcePurchaseBox from "@/components/resourcePurchaseBox";
import { GetRepoMetaData } from "@/rest/github";
import { getRepoOptions } from "@/rest/products";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();

  const { isPending, error, data } = useQuery({
    refetchInterval: 0,
    queryKey: ["repoProducts", params.id],
    queryFn: () => getRepoOptions(params.id),
  });

  const meta = useQuery({
    refetchInterval: 0,
    queryKey: ['repo', params.id],
    queryFn: () => GetRepoMetaData(Number(params.id)),
  });

  return (
    <div className="p-4">
      <div className="p-4">
        {meta.isPending && (
          <div className="flex flex-wrap justify-center">
            <LoadingSpinner size={16} />
          </div>
        )}
        {!meta.isPending && meta.data && (
          <>
            <h1 className="text-4xl">{meta.data.name}</h1>
            <p className="text-lg ml-4 mt-2">
              Description: {meta.data.description || "No Description"}
            </p>
          </>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-2xl ml-4">Donation Options</h2>
        {isPending && (
          <div className="flex flex-wrap justify-center">
            <LoadingSpinner size={16} />
          </div>
        )}
        {!isPending && !error && data && (
          <div className="flex flex-wrap">
            {data.map((d, i) => (
              <div className="sm:w-1/3">
                <ResourcePurchaseBox
                  title={d.name}
                  pricing={`$${d.price / 100} (per Month)`}
                  url={d.url}
                  hasSubscription={false}
                  oneTimePayment={() => {
                    router.push(`/checkout?productID=${d.id}&repoID=${params.id}`)
                  }}
                  subscribe={() => {
                    router.push(`/checkout?productID=${d.id}&repoID=${params.id}&subscription=true`)
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
