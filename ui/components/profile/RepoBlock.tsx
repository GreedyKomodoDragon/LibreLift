/* eslint-disable react/jsx-key */
"use client";

import { Repo } from "@/rest/github";
import RepoRow from "../RepoRow";
import LoadingSpinner from "../LoadingSpinner";

type RepoBlockProps = {
  isPending: boolean;
  error: Error | null;
  data: Repo[];
};

export default function RepoBlock(props: RepoBlockProps) {
  const { isPending, error, data } = props;

  return (
    <div className="flex flex-wrap justify-center">
      {isPending && (
        <div className="mt-4">
          <LoadingSpinner size={36} />
        </div>
      )}
      {error && (
        <div className="mt-10">
          <p className="text-3xl">
            Failed to fetch your public Repostories, try again soon!{" "}
          </p>
        </div>
      )}

      {!isPending &&
        !error &&
        data &&
        data.map((d) => <RepoRow id={d.id} name={d.name} description={d.description} />)}
    </div>
  );
}
