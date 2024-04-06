'use client'

import React, { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const stripePromise = loadStripe(
  ""
);

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchClientSecret = useCallback(async () => {
    const repoID = searchParams.get("repoID");
    if (repoID === null || repoID.length === 0) {
      router.push("/");
      return;
    }

    const productID = searchParams.get("productID");
    if (productID === null || productID.length === 0) {
      router.push("/");
      return;
    }


    // Create a Checkout Session
    const response = await axios.post(
      "http://127.0.0.1:8080/api/v1/payments/create/session",
      {
        productId: Number(productID),
        repoId: Number(repoID),
      },
      { withCredentials: true }
    );

    return response.data.clientSecret;
  }, [router, searchParams]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}