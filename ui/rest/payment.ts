import { useAccountStore } from "@/store/store";
import axios from "axios";

export async function CreateStripeAccount() {
  await axios.post(
    `http://127.0.0.1:8080/api/v1/payments/account/onboard`,
    {},
    {
      withCredentials: true,
    }
  );
}

export async function IsActiveSeller(): Promise<boolean> {
  const resp = await axios.get(
    `http://127.0.0.1:8080/api/v1/payments/account/active`,
    {
      withCredentials: true,
    }
  );

  return resp.data.active;
}
