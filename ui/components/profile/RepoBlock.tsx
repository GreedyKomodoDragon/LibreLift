/* eslint-disable react/jsx-key */
"use client";

import { GetRepos } from "@/rest/github";
import { useQuery } from "@tanstack/react-query";
import RepoRow from "../RepoRow";
import LoadingSpinner from "../LoadingSpinner";

export default function RepoBlock() {
  const { isPending, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: () => GetRepos(),
  });

  return (
    <div className="flex flex-wrap justify-center">
      {isPending && (
        <div className="mt-4">
          <LoadingSpinner />
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
        data.map((d) => (
          <RepoRow name={d.name} description={d.description} />
        ))}
    </div>
  );
}
