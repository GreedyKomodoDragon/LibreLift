/* eslint-disable react/jsx-key */
"use client";

import { Repo } from "@/rest/github";
import RepoRow from "../RepoRow";
import { ThreeDots } from "react-loader-spinner";

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
          <RepoRow
            id={d.id}
            name={d.name}
            description={d.description}
            added={d.added}
            star={d.stars || 0}
            license={d.license || "No License"}
          />
        ))}
    </div>
  );
}
