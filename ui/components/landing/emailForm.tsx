"use client";

import { isValidEmail } from "@/lib/utils";
import { addEmailToWaitingList as addEmailToMailingList } from "@/rest/email";
import { useState } from "react";

export default function EmailForm() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successful, setSuccessful] = useState<boolean>(false);

  const onSubmit = async () => {
    setSuccessful(false);
    if (!isValidEmail(email)) {
      setError("Email provide is not valid");
      return;
    }

    try {
      await addEmailToMailingList(email);
      setError("");
      setSuccessful(true);
    } catch (error) {
      setError("Failed to add email, try again later");
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <label className="sr-only" htmlFor="email">
          Email
        </label>
        <input
          className="w-full border-black border-2 p-2 rounded-md"
          id="email"
          placeholder="Enter your email"
          type="email"
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
      </div>
      <button
        className="w-full bg-violet-950 rounded-md text-white py-3"
        type="submit"
        onClick={onSubmit}
      >
        Join Now
      </button>
      {error && (
        <p className="text-white bg-red-600 rounded-md p-2 mt-1">{error}</p>
      )}
      {successful && (
        <p className="text-white mt-1 bg-green-600 rounded-md p-2">
          Email has been added to mailing list, we will send you an email to
          confirm you own it!
        </p>
      )}
    </>
  );
}
