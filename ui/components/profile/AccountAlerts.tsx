import { CreateStripeAccount, IsActiveSeller } from "@/rest/payment";
import EmailConfirmation from "./EmailConfirmation";
import WarningMessage from "./WarningMessage";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccountStore } from "@/store/store";

export default function AccountAlerts() {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const { isPending, error, data } = useQuery({
    refetchInterval: 0,
    queryKey: ["active"],
    queryFn: () => IsActiveSeller(),
  });

  const updateActivePayment = useAccountStore((state) => state.updateActivePayment)

  useEffect(() => {
    updateActivePayment(data || false)
  }, [data])

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
