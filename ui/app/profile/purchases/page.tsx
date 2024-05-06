"use client";

import LoadingButton from "@/components/loadingButton";
import Toast from "@/components/toast";
import {
  CancelSubscription,
  GetPurchases,
  RenableSubscription,
  RequestRefund,
} from "@/rest/products";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { ThreeDots } from "react-loader-spinner";

function isWithinTwoWeeksFuture(unixTime: number): boolean {
  const now = Math.floor(Date.now());
  const twoWeeksInSeconds = 2 * 7 * 24 * 60 * 60; // Two weeks in seconds

  return unixTime - twoWeeksInSeconds < now;
}
interface Purchase {
  id: number;
  repoId: number;
  name: string;
  unixTS: number;
  amount: string;
  type: "one-off" | "subscription";
  status: string;
  invalidate: () => void;
}

const PurchaseItem: React.FC<Purchase> = ({
  id,
  repoId,
  name,
  unixTS,
  amount,
  type,
  status,
  invalidate,
}) => {
  const [error, setError] = useState<string>("");
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 transition-transform duration-200 transform hover:scale-[1.005]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-gray-500">Repo: {repoId}</p>
            <p className="text-gray-500">
              {new Date(unixTS).toLocaleDateString()}
            </p>
          </div>
          <div className="text-2xl font-semibold">{amount}</div>
        </div>
        {type === "one-off" &&
          status == "active" &&
          isWithinTwoWeeksFuture(unixTS) && (
            <div className="flex justify-between w-full mt-1">
              <div></div>{" "}
              <LoadingButton
                buttonColor={"red"}
                message={"Request a refund"}
                onClick={async () => {
                  try {
                    await RequestRefund(id);
                    invalidate();
                  } catch {
                    setError("failed to cancel subscription");
                  }
                }}
              />
            </div>
          )}

        {type === "one-off" && status == "pending" && (
          <div className="flex justify-between w-full mt-1">
            <div></div>{" "}
            {/* This empty div helps in pushing the amount to the right */}
            <p className="bg-green-700 p-2 text-white rounded-sm">
              Refund in progress
            </p>
          </div>
        )}

        {type === "subscription" && status == "active" && (
          <div className="flex justify-between w-full mt-1">
            <div></div>{" "}
            {/* This empty div helps in pushing the amount to the right */}
            <LoadingButton
              buttonColor={"red"}
              message={"Cancel Subscription"}
              onClick={async () => {
                try {
                  await CancelSubscription(id);
                  invalidate();
                } catch {
                  setError("failed to cancel subscription");
                }
              }}
            />
          </div>
        )}

        {type === "subscription" && status == "pending" && (
          <div className="flex justify-between w-full mt-1">
            <div></div>{" "}
            <LoadingButton
              buttonColor={"green"}
              message={"Re-enable Subscription"}
              onClick={async () => {
                try {
                  await RenableSubscription(id);
                  invalidate();
                } catch {
                  setError("failed to re-enable subscription");
                }
              }}
            />
          </div>
        )}
      </div>
      {error && (
        <Toast
          message={error}
          onClose={() => setError("")}
          position="top-middle"
        />
      )}
    </>
  );
};

const PurchasesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isPending, error, data } = useQuery({
    refetchInterval: 0,
    queryKey: ["purchases"],
    queryFn: () => GetPurchases(),
  });

  // Sample data for demonstration
  const [filter, setFilter] = useState<"all" | "one-off" | "subscription">(
    "all"
  );

  const filteredPurchases = () => {
    if (data === undefined) {
      return [];
    }

    if (filter === "all") {
      return data.filter((purchase) => {
        return purchase.status !== "refunded";
      });
    }

    return data.filter((purchase) => {
      if (purchase.status === "refunded") {
        return false;
      }

      switch (filter) {
        case "one-off":
          return purchase.isOneOff;

        case "subscription":
          return !purchase.isOneOff;
        default:
          return "";
      }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-8">My Purchases</h1>
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded-lg ${
            filter === "all" ? "bg-violet-950 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`mr-2 px-4 py-2 rounded-lg ${
            filter === "one-off" ? "bg-violet-950 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("one-off")}
        >
          One-off
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            filter === "subscription"
              ? "bg-violet-950 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setFilter("subscription")}
        >
          Subscriptions
        </button>
      </div>
      <div>
        {!isPending &&
          data !== undefined &&
          filteredPurchases().map((purchase) => (
            <PurchaseItem
              key={purchase.repoId}
              name={purchase.prodName}
              id={purchase.id}
              repoId={purchase.repoId}
              unixTS={purchase.unixTS * 1000}
              amount={`$${purchase.price / 100}`}
              type={purchase.isOneOff ? "one-off" : "subscription"}
              status={purchase.status}
              invalidate={() => {
                // TODO: Update this so it fetches only the new one, not the all the purchases
                queryClient.invalidateQueries({ queryKey: ["purchases"] });
              }}
            />
          ))}
        <div className="flex justify-center">
          <ThreeDots
            visible={isPending}
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
};

export default PurchasesPage;
