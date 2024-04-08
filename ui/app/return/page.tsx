"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function Return() {
  const [status, setStatus] = useState(null);
  const searchParams = useSearchParams();
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    axios
      .get(
        `http://127.0.0.1:8080/api/v1/payments/session/status?session_id=${sessionId}`,
        { withCredentials: true }
      )
      .then((resp) => {
        setStatus(resp.data.status);
        setCustomerEmail(resp.data.email);
      })
      .catch();
  }, [searchParams]);

  if (status === "open") {
    return (
      <section id="success">
        <p>
          Your payment has not seemed have been completed, wait a few moments
          and look out for a confirmation email. If you do not get an email
          confirmation please return using the button below!
        </p>
        <button>Click me</button>
        <p>
          If you are worried about your payment, please email{" "}
          <a href="mailto:orders@example.com">orders@example.com</a> and we can
          put you at ease! 
        </p>
      </section>
    );
  }

  if (status === "complete") {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to{" "}
          {customerEmail}. If you have any questions, please email{" "}
          <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    );
  }

  return <LoadingSpinner />;
}
