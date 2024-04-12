"use client";

import { GetPurchases } from "@/rest/products";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

interface Purchase {
  id: number;
  name: string;
  unixTS: number;
  amount: string;
  type: "one-off" | "subscription";
}

const PurchaseItem: React.FC<Purchase> = ({
  id,
  name,
  unixTS,
  amount,
  type,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 transition-transform duration-200 transform hover:scale-[1.005]">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-gray-500">Repo: {id}</p>
          <p className="text-gray-500">
            {new Date(unixTS).toLocaleDateString()}
          </p>
        </div>
        <div className="text-2xl font-semibold">{amount}</div>
      </div>
      {type === "subscription" && (
        <div className="flex justify-between w-full mt-1">
          <div></div>{" "}
          {/* This empty div helps in pushing the amount to the right */}
          <button className="bg-black rounded-md p-2 text-white text-sm font-semibold">
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
};

const PurchasesPage: React.FC = () => {
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
      return data;
    }

    return data
      .filter((purchase) => {
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
          className={`mr-4 px-4 py-2 rounded-lg ${
            filter === "all" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`mr-4 px-4 py-2 rounded-lg ${
            filter === "one-off" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("one-off")}
        >
          One-off Payments
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            filter === "subscription" ? "bg-black text-white" : "bg-gray-200"
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
              id={purchase.repoId}
              unixTS={purchase.unixTS * 1000}
              amount={`$${purchase.price / 100}`}
              type={purchase.isOneOff ? "one-off" : "subscription"}
            />
          ))}
      </div>
    </div>
  );
};

export default PurchasesPage;
