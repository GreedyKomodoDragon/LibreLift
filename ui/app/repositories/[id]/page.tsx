"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ThreeDots } from "react-loader-spinner";
import WarningMessage from "@/components/profile/WarningMessage";
import InformationBox from "@/components/repositories/informationBox";
import ResourcePurchaseBox from "@/components/resourcePurchaseBox";
import { GetRepoMetaData } from "@/rest/github";
import { getRepoOptions } from "@/rest/products";
import { useAccountStore } from "@/store/store";

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isLogged = useAccountStore((state) => state.isLoggedIn);

  const {
    data: repoOptions,
    error: repoOptionsError,
    isLoading: repoOptionsLoading,
  } = useQuery({
    refetchInterval: 0,
    queryKey: ["repoProducts", params.id],
    queryFn: () => getRepoOptions(params.id),
  });

  const { data: meta, isLoading: metaLoading } = useQuery({
    refetchInterval: 0,
    queryKey: ["repo", params.id],
    queryFn: () => GetRepoMetaData(Number(params.id)),
  });

  return (
    <div className="p-4">
      <div className="p-4">
        {metaLoading && (
          <div className="flex justify-center">
            <ThreeDots
              visible={metaLoading}
              height="80"
              width="80"
              color="#4fa94d"
              radius="9"
            />
          </div>
        )}
        {!metaLoading && meta && meta.revokedPending && (
          <div className="mb-5">
            <WarningMessage message="Owner of this repository is currently deleting their account, you cannot make any purchases" />
          </div>
        )}
        {!metaLoading && meta && (
          <>
            <h1 className="text-2xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-5xl">
              {meta.name}
            </h1>
            <p className="text-lg ml-4 mt-2">
              Description: {meta.description || "No Description"}
            </p>
          </>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-2xl ml-4">Donation Options</h2>
        {repoOptionsLoading && (
          <div className="flex justify-center">
            <ThreeDots
              visible={repoOptionsLoading}
              height="80"
              width="80"
              color="#4fa94d"
              radius="9"
            />
          </div>
        )}
        {!repoOptionsLoading && !repoOptionsError && repoOptions && (
          <>
            {!isLogged && (
              <div className="my-5">
                <InformationBox message="To contribute and support this project, please create an account first. We appreciate your willingness to help!" />
              </div>
            )}
            <div className="flex flex-wrap">
              {repoOptions.map((option, i) => (
                <div key={i} className="sm:w-1/2 lg:w-1/3 w-full">
                  <ResourcePurchaseBox
                    title={option.name}
                    pricing={`$${option.price / 100} (per Month)`}
                    url={option.url}
                    hasSubscription={false}
                    oneTimePayment={() => {
                      router.push(
                        `/checkout?productID=${option.id}&repoID=${params.id}`
                      );
                    }}
                    subscribe={() => {
                      router.push(
                        `/checkout?productID=${option.id}&repoID=${params.id}&subscription=true`
                      );
                    }}
                    disabled={!isLogged || meta?.revokedPending}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
