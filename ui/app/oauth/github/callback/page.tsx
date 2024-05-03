"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import Cookies from "universal-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { login } from "@/rest/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Callback() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      login(code)
        .then(async (token) => {
          if (token.length === 0) {
            router.push("/login?failed=true");
            return;
          }
          
          const cookies = new Cookies(null, { path: "/" });
          cookies.set("librelift-token", token);

          await queryClient.invalidateQueries({ queryKey: ["avatar"] });

          router.push("/");
        })
        .catch(() => {
          router.push("/login?failed=true");
        });
    }
  }, []);

  return (
    <div className="justify-center items-center">
      <div className="flex mt-60 justify-center items-center">
        <LoadingSpinner />
      </div>
      <div className="p-6 max-w-sm mx-auto">
        <p className="text-center text-gray-600 mt-4 text-3xl">Logging in...</p>
        <p className="text-center text-gray-600 mt-4 text-sm">
          If this takes long than minute click <Link href="/login">here</Link>
        </p>
      </div>
    </div>
  );
}
