import LoadingButton from "@/components/loadingButton";
import { isRevoked, revoke } from "@/rest/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThreeDots } from "react-loader-spinner";

export default function Profile() {
  const queryClient = useQueryClient();

  const { isLoading, isError, data, error } = useQuery({
    refetchInterval: 0,
    queryKey: ["revoked"],
    queryFn: () => isRevoked(),
  });

  const handleRevoke = async () => {
    try {
      await revoke();
      queryClient.invalidateQueries({ queryKey: ["revoked"] });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container py-4">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold mb-4">Profile</h1>
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Revoking GitHub Access
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
            By revoking access to GitHub, you'll deactivate your account and
            undergo a 30-day period with the following actions:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>
              Your GitHub repositories will be revoked and delisted from
              LibreLift.
            </li>
            <li>All subscriptions will be canceled.</li>
          </ul>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
            During the deactivation period, the following tasks will be
            affected:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>No one can subscribe to your GitHub repositories.</li>
            <li>
              No one can make one-off payments to your GitHub repositories.
            </li>
            <li>Current subscriptions will remain active (as a precaution).</li>
          </ul>
          {isLoading ? (
            <ThreeDots
              visible={isLoading}
              height="50"
              width="50"
              color="#4fa94d"
              radius="9"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          ) : isError ? (
            <p className="text-md text-white bg-red-700 p-2 rounded-md w-fit">
              Unable to get revoked status, try again later
            </p>
          ) : data ? (
            <LoadingButton
              buttonColor={"green"}
              message={"Re-activate your account"}
              image={
                <img
                  src="/github-mark.svg"
                  style={{ height: 24, width: 24 }}
                  alt="GitHub logo"
                  className="mr-2"
                />
              }
              onClick={handleRevoke}
            />
          ) : (
            <LoadingButton
              buttonColor={"red"}
              message={"Revoke GitHub Account Access"}
              image={
                <img
                  src="/github-mark.svg"
                  style={{ height: 24, width: 24 }}
                  alt="GitHub logo"
                  className="mr-2"
                />
              }
              onClick={handleRevoke}
            />
          )}
        </div>
      </div>
    </div>
  );
}
