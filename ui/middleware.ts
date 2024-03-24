import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/profile")) {
    return;
  }

  const accessToken = request.cookies.get("librelift-token")?.value;

  if (!accessToken || !(await isLoggedInServer(accessToken))) {
    return Response.redirect(new URL("/login", request.url));
  }
}

async function isLoggedInServer(accessToken: string): Promise<boolean> {
  const res = await fetch("http://127.0.0.1:8080/api/v1/auth/login", {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", // Assuming JSON content type
    },
  });

  return res.status === 200;
}
