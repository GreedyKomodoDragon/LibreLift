/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { AddRepoDialog } from "./dialog";
import { AddRepoToLibrelift } from "@/rest/repos";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";
import { useAccountStore } from "@/store/store";

type RepoRow = {
  name: string;
  description: string;
  id: number;
  added: boolean;
  star: number;
  license: string;
  isOpenSource: boolean;
};

export default function RepoRow(props: RepoRow) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const hasActive = useAccountStore((state) => state.hasActivePaymentAccount);

  const add = async () => {
    setIsPending(true);
    try {
      const ok = await AddRepoToLibrelift(props.id);
      if (ok) {
        setAdded(ok);
      }
    } catch (error) {
      console.error("Unable to add");
    }
    setIsPending(false);
  };

  return (
    <>
      <div className="w-full mb-4 zoom transition-transform duration-200 transform hover:scale-[1.005]">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">{props.name}</h3>
          <p className="text-gray-600 mb-4">{props.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stars: {props.star}</p>
              <p className="text-sm text-gray-500">
                License:{" "}
                {props.license.length == 0
                  ? "No License - Not Open Source!"
                  : props.license}
              </p>
              <p className="text-sm text-gray-500">
                Open Source: {props.isOpenSource ? "Yes" : "No"}
              </p>
            </div>
            <div>
              {isPending ? (
                <LoadingSpinner size={16} />
              ) : (props.added || added) && hasActive && props.isOpenSource ? (
                <>
                  <Link
                    href={`/profile/repositories/${props.id}/products`}
                    className="mr-2 inline-flex items-center bg-violet-900 hover:bg-violet-700 text-white py-2 px-4 rounded-lg"
                  >
                    Product List
                    <img
                      src={"/logo.svg"}
                      style={{ height: 40, width: 40 }}
                      alt="Github logo"
                      className="ml-2"
                    />
                  </Link>
                  <Link
                    href={`/profile/repositories/${props.id}/dashboard`}
                    className="inline-flex items-center bg-violet-900 hover:bg-violet-700 text-white py-2 px-4 rounded-lg"
                  >
                    To Dashboard
                    <img
                      src={"/logo.svg"}
                      style={{ height: 40, width: 40 }}
                      alt="Github logo"
                      className="ml-2"
                    />
                  </Link>
                </>
              ) : (
                <button
                  className="inline-flex items-center bg-gray-900 disabled:bg-gray-300 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-1"
                  onClick={() => setIsDialogOpen(true)}
                  disabled={!hasActive || !props.isOpenSource}
                >
                  <img
                    src={"/github-mark.svg"}
                    style={{ height: 40, width: 40 }}
                    alt="Github logo"
                    className="mr-2"
                  />
                  Import into LibreLift
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <AddRepoDialog
        repo={props.name}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={add}
      />
    </>
  );
}
