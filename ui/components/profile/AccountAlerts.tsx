import { CreateStripeAccount, IsActiveSeller } from "@/rest/payment";
import EmailConfirmation from "./EmailConfirmation";
import WarningMessage from "./WarningMessage";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function AccountAlerts() {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const { isPending, error, data } = useQuery({
    refetchInterval: 0,
    queryKey: ["active"],
    queryFn: () => IsActiveSeller(),
  });

  return (
    <>
      {showConfirmation && <EmailConfirmation />}
      {!isPending && !error && !data && !showConfirmation && (
        <WarningMessage
          message="You must create a Stripe account before adding public repos to Librelift. Clicking the account creation button will resend the link."
          onDismissClick={() => {}}
          onCreateAccountClick={async () => {
            await CreateStripeAccount();
            setShowConfirmation(true);
          }}
        />
      )}
    </>
  );
}
