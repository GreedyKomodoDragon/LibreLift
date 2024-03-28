/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { AddRepoDialog } from "./dialog";
import { AddRepoToLibrelift } from "@/rest/repos";

type RepoRow = {
  name: string;
  description: string;
  id: number;
  added: boolean;
};

export default function RepoRow(props: RepoRow) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const add = async () => {
    try {
      const ok = await AddRepoToLibrelift(props.id);
      if (!ok) {
        console.log("something went wrong!");
      }
    } catch (error) {
      console.log("something went wrong with error!");
    }
  };

  return (
    <>
      <div className="w-full mb-4 zoom transition-transform duration-200 transform hover:scale-[1.005]">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">{props.name}</h3>
          <p className="text-gray-600 mb-4">{props.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stars: 1000</p>
              <p className="text-sm text-gray-500">Last Update: 1000</p>
              <p className="text-sm text-gray-500">
                Current Monthly Funding Total: $1000
              </p>
            </div>
            <div>
              {props.added ? (
                <a
                  href="#"
                  className="inline-flex items-center bg-blue-900 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  <img
                    src={"/logo.svg"}
                    style={{ height: 40, width: 40 }}
                    alt="Github logo"
                    className="mr-2"
                  />
                  Remove from LibreLift
                </a>
              ) : (
                <button
                  className="inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-1"
                  onClick={() => setIsDialogOpen(true)}
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
