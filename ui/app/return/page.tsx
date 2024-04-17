"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import axios from "axios";
import Link from "next/link";
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
      <section className="container mx-auto py-8">
        <div className="max-w-lg mx-auto bg-white rounded-lg p-8">
          <p className="text-lg text-center mb-6">
            Your payment has not been completed yet. Please wait a few moments
            and check for a confirmation email. If you don't receive one, click
            the button below to return.
          </p>
          <button className="w-full max-w-xs mx-auto block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
            Return
          </button>
          <p className="text-center mt-6">
            If you have concerns about your payment, please email{" "}
            <a href="mailto:orders@example.com" className="text-blue-500">
              orders@example.com
            </a>{" "}
            and we'll assist you.
          </p>
        </div>
      </section>
    );
  }

  if (status === "complete") {
    return <Component />;
  }

  return <LoadingSpinner />;
}

export function Component() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg p-8">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 className="text-xl font-semibold text-green-500 dark:text-green-400 mt-4">
            Thank you for your purchase!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            You will receive an email with your order confirmation as an invoice
          </p>
        </div>
        <Link href="/">
          <button className="w-full max-w-xs mx-auto block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mt-6 transition duration-300">
            Continue shopping
          </button>
        </Link>
      </div>
    </div>
  );
}
